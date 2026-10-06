import { MacroNews, GameRandomEvent } from '../types/game';
import { EXPANDED_EVENTS_POOL, pickRichMacroNews } from '../data/richEventsPool';

async function requestRemote<T>(endpoint: string, params: object): Promise<T | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (error) {
    console.info('Using local game content (network/AI offline):', error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function requestAiMacroNews(params: {
  year: number;
  inflationRate: number;
  keyRate: number;
  requestedType?: 'RANDOM' | 'CRISIS' | 'BOOM' | 'STAGFLATION' | 'TECH';
  requestedDuration?: 1 | 2 | 3;
}): Promise<MacroNews> {
  if (import.meta.env.VITE_YANDEX_GAMES !== 'true') {
    const remoteNews = await requestRemote<MacroNews>('/api/generate-news', params);
    if (remoteNews?.headline) return remoteNews;
  }

  let cycleKey: string | undefined;
  if (params.requestedType === 'CRISIS') cycleKey = 'CRISIS';
  else if (params.requestedType === 'BOOM') cycleKey = 'BOOM';
  else if (params.requestedType === 'STAGFLATION') cycleKey = 'STAGFLATION';
  else if (params.requestedType === 'TECH') cycleKey = 'TECH_RALLY';

  return pickRichMacroNews(cycleKey);
}

export async function requestAiGameplayEvent(params: {
  characterName: string;
  role: string;
  year: number;
  cash: number;
  netWorth: number;
  annualSalary: number;
  joy: number;
  hasCar: boolean;
  hasApartment: boolean;
  hasBusiness: boolean;
  activeCrisisTitle?: string;
  recentEventIds?: string[];
}): Promise<GameRandomEvent> {
  if (import.meta.env.VITE_YANDEX_GAMES !== 'true') {
    const remoteEvent = await requestRemote<GameRandomEvent>('/api/generate-gameplay-event', params);
    if (remoteEvent?.title) return remoteEvent;
  }

  const recent = params.recentEventIds || [];
  let eligible = EXPANDED_EVENTS_POOL.filter((event) => {
    if (event.requiresCar && !params.hasCar) return false;
    if (event.requiresApartment && !params.hasApartment) return false;
    return !recent.includes(event.id);
  });

  if (eligible.length === 0) {
    eligible = EXPANDED_EVENTS_POOL.filter((event) => {
      if (event.requiresCar && !params.hasCar) return false;
      if (event.requiresApartment && !params.hasApartment) return false;
      return true;
    });
  }

  const picked = eligible[Math.floor(Math.random() * eligible.length)] || EXPANDED_EVENTS_POOL[0];
  return {
    ...picked,
    id: `${picked.id}_${Date.now()}`,
  };
}
