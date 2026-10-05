import { MacroNews, GameRandomEvent } from '../types/game';
import { EXPANDED_EVENTS_POOL, pickRichMacroNews } from '../data/richEventsPool';

export async function requestAiMacroNews(params: {
  year: number;
  inflationRate: number;
  keyRate: number;
  requestedType?: 'RANDOM' | 'CRISIS' | 'BOOM' | 'STAGFLATION' | 'TECH';
  requestedDuration?: 1 | 2 | 3;
}): Promise<MacroNews> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5 sec fast timeout

    const response = await fetch('/api/generate-news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.headline) {
        return data;
      }
    }
  } catch (err) {
    // Fast graceful fallback
    console.info('Using local economic engine (network/AI offline):', err);
  }

  // Use rich 6-article macro newspaper edition
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
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s fast timeout

    const response = await fetch('/api/generate-gameplay-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.title) {
        return data;
      }
    }
  } catch (err) {
    console.info('Using local event engine (network/AI offline):', err);
  }

  // Filter procedural events based on assets & recent history (anti-repetition!)
  const recent = params.recentEventIds || [];
  let eligible = EXPANDED_EVENTS_POOL.filter((ev) => {
    if (ev.requiresCar && !params.hasCar) return false;
    if (ev.requiresApartment && !params.hasApartment) return false;
    if (recent.includes(ev.id)) return false;
    return true;
  });

  if (eligible.length === 0) {
    eligible = EXPANDED_EVENTS_POOL.filter((ev) => {
      if (ev.requiresCar && !params.hasCar) return false;
      if (ev.requiresApartment && !params.hasApartment) return false;
      return true;
    });
  }

  const picked = eligible[Math.floor(Math.random() * eligible.length)] || EXPANDED_EVENTS_POOL[0];
  return {
    ...picked,
    id: `${picked.id}_${Date.now()}`,
  };
}
