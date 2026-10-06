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

let sdkPromise: Promise<YandexGamesSDK | null> | null = null;

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
      .then((loaded) => (loaded && window.YaGames ? window.YaGames.init() : null))
      .catch((error) => {
        console.warn('Yandex Games SDK initialization failed:', error);
        return null;
      });
  }

  return sdkPromise;
}
