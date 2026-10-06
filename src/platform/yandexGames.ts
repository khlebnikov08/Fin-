export interface YandexPlayer {
  getData: (keys?: string[]) => Promise<Record<string, unknown>>;
  setData: (data: Record<string, unknown>, flush?: boolean) => Promise<void>;
}

export interface YandexCloudSaveEnvelope {
  version: 1;
  savedAt: number;
  payload: Record<string, unknown>;
}

export interface YandexCloudSaveQueue {
  schedule: (payload: Record<string, unknown>) => void;
  flush: (flushToServer?: boolean) => Promise<void>;
}

interface YandexAdCallbacks {
  onOpen?: () => void;
  onClose?: (wasShown: boolean) => void;
  onError?: (error: unknown) => void;
}

export interface YandexGamesSDK {
  features?: {
    LoadingAPI?: {
      ready?: () => void;
    };
    GameplayAPI?: {
      start?: () => void;
      stop?: () => void;
    };
  };
  adv?: {
    showFullscreenAdv?: (options?: { callbacks?: YandexAdCallbacks }) => void;
  };
  getPlayer?: () => Promise<YandexPlayer>;
  on?: (eventName: string, listener: () => void) => (() => void) | void;
  off?: (eventName: string, listener: () => void) => void;
  EVENTS?: {
    ACCOUNT_SELECTION_DIALOG_OPENED?: string;
    ACCOUNT_SELECTION_DIALOG_CLOSED?: string;
  };
}

interface YaGamesGlobal {
  init: () => Promise<YandexGamesSDK>;
}

declare global {
  interface Window {
    YaGames?: YaGamesGlobal;
  }
}

export const IS_YANDEX_GAMES_BUILD = import.meta.env.VITE_YANDEX_GAMES === 'true';
export const YANDEX_CLOUD_SAVE_KEY = 'finlife_save_v1';
const MAX_CLOUD_SAVE_BYTES = 180 * 1024;
const CLOUD_SAVE_INTERVAL_MS = 4_000;

let sdkPromise: Promise<YandexGamesSDK | null> | null = null;
let playerPromise: Promise<YandexPlayer | null> | null = null;

function withTimeout<T>(promise: Promise<T>, milliseconds: number, label: string): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timeout = setTimeout(() => reject(new Error(`${label} timed out`)), milliseconds);
    }),
  ]).finally(() => {
    if (timeout !== undefined) clearTimeout(timeout);
  });
}

function loadSdkScript(): Promise<boolean> {
  if (window.YaGames) return Promise.resolve(true);

  return new Promise((resolve) => {
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => resolve(false), 10_000);
    script.src = '/sdk.js';
    script.async = true;
    script.dataset.yandexGamesSdk = 'true';
    script.onload = () => {
      window.clearTimeout(timeout);
      resolve(Boolean(window.YaGames));
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

export function initializeYandexGames(): Promise<YandexGamesSDK | null> {
  if (!IS_YANDEX_GAMES_BUILD || typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  if (!sdkPromise) {
    sdkPromise = loadSdkScript()
      .then((loaded) =>
        loaded && window.YaGames
          ? withTimeout(window.YaGames.init(), 8_000, 'Yandex Games SDK initialization')
          : null
      )
      .catch((error) => {
        console.warn('Yandex Games SDK initialization failed:', error);
        return null;
      });
  }

  return sdkPromise;
}

export function getYandexPlayer(sdk: YandexGamesSDK): Promise<YandexPlayer | null> {
  if (!sdk.getPlayer) return Promise.resolve(null);

  if (!playerPromise) {
    playerPromise = withTimeout(sdk.getPlayer(), 6_000, 'Yandex Games Player initialization').catch((error) => {
      console.warn('Yandex Games Player initialization failed:', error);
      return null;
    });
  }

  return playerPromise;
}

export async function loadYandexCloudSave(
  player: YandexPlayer
): Promise<YandexCloudSaveEnvelope | null> {
  try {
    const data = await withTimeout(
      player.getData([YANDEX_CLOUD_SAVE_KEY]),
      6_000,
      'Yandex Games cloud save read'
    );
    const value = data[YANDEX_CLOUD_SAVE_KEY];
    if (!value || typeof value !== 'object') return null;

    const envelope = value as Partial<YandexCloudSaveEnvelope>;
    if (
      envelope.version !== 1 ||
      !Number.isFinite(envelope.savedAt) ||
      !envelope.payload ||
      typeof envelope.payload !== 'object'
    ) {
      return null;
    }

    return envelope as YandexCloudSaveEnvelope;
  } catch (error) {
    console.warn('Yandex Games cloud save could not be loaded:', error);
    return null;
  }
}

function prepareCloudPayload(payload: Record<string, unknown>): Record<string, unknown> | null {
  const compact = { ...payload };
  if (Array.isArray(compact.history)) compact.history = compact.history.slice(-60);
  if (Array.isArray(compact.newsHistory)) compact.newsHistory = compact.newsHistory.slice(-25);

  const getSize = () => new TextEncoder().encode(JSON.stringify(compact)).byteLength;
  while (getSize() > MAX_CLOUD_SAVE_BYTES && Array.isArray(compact.newsHistory) && compact.newsHistory.length > 0) {
    compact.newsHistory = compact.newsHistory.slice(1);
  }
  while (getSize() > MAX_CLOUD_SAVE_BYTES && Array.isArray(compact.history) && compact.history.length > 0) {
    compact.history = compact.history.slice(1);
  }

  return getSize() <= MAX_CLOUD_SAVE_BYTES ? compact : null;
}

export function createYandexCloudSaveQueue(player: YandexPlayer): YandexCloudSaveQueue {
  let pending: YandexCloudSaveEnvelope | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let writeChain: Promise<void> = Promise.resolve();
  let lastWrittenSnapshot = '';
  let lastWrittenEnvelope: YandexCloudSaveEnvelope | null = null;
  let lastWriteWasImmediate = false;
  let inFlightEnvelope: YandexCloudSaveEnvelope | null = null;
  let inFlightWasImmediate = false;

  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const flush = async (flushToServer = false) => {
    clearTimer();
    if (!pending && flushToServer) {
      if (inFlightEnvelope && !inFlightWasImmediate) pending = inFlightEnvelope;
      else if (!inFlightEnvelope && lastWrittenEnvelope && !lastWriteWasImmediate) {
        pending = lastWrittenEnvelope;
      }
    }
    if (!pending) return writeChain;

    const envelope = pending;
    pending = null;
    const snapshot = JSON.stringify(envelope);
    if (snapshot === lastWrittenSnapshot && (!flushToServer || lastWriteWasImmediate)) return writeChain;

    inFlightEnvelope = envelope;
    inFlightWasImmediate = flushToServer;
    writeChain = writeChain
      .then(async () => {
        try {
          await player.setData({ [YANDEX_CLOUD_SAVE_KEY]: envelope }, flushToServer);
          lastWrittenSnapshot = snapshot;
          lastWrittenEnvelope = envelope;
          lastWriteWasImmediate = flushToServer;
        } catch (error) {
          console.warn('Yandex Games cloud save could not be written:', error);
          if (!pending || pending.savedAt < envelope.savedAt) pending = envelope;
        } finally {
          if (inFlightEnvelope === envelope) {
            inFlightEnvelope = null;
            inFlightWasImmediate = false;
          }
        }
      })
      .catch((error) => {
        console.warn('Yandex Games cloud save queue failed:', error);
      });

    await writeChain;
    if (pending && timer === null) {
      timer = setTimeout(() => void flush(false), CLOUD_SAVE_INTERVAL_MS);
    }
  };

  return {
    schedule(payload) {
      const compactPayload = prepareCloudPayload(payload);
      if (!compactPayload) {
        console.warn('Cloud save skipped because the game data exceeds the Yandex Games 200 KB limit.');
        return;
      }

      pending = {
        version: 1,
        savedAt: Number(payload._savedAt) || Date.now(),
        payload: compactPayload,
      };
      if (timer === null) {
        timer = setTimeout(() => void flush(false), CLOUD_SAVE_INTERVAL_MS);
      }
    },
    flush,
  };
}

export function showYandexFullscreenAd(sdk: YandexGamesSDK): Promise<boolean> {
  const showFullscreenAdv = sdk.adv?.showFullscreenAdv;
  if (!showFullscreenAdv) return Promise.resolve(false);

  return new Promise((resolve) => {
    let settled = false;
    const timeout = window.setTimeout(() => finish(false), 30_000);
    const finish = (wasShown: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      resolve(wasShown);
    };

    try {
      showFullscreenAdv({
        callbacks: {
          onClose: (wasShown) => finish(wasShown),
          onError: () => finish(false),
        },
      });
    } catch (error) {
      console.warn('Yandex Games fullscreen ad failed:', error);
      finish(false);
    }
  });
}
