export const GAME_TRANSLATIONS = {
  ru: {
    loadingSave: 'Загружаем сохранение…',
  },
} as const;

export type GameLocale = keyof typeof GAME_TRANSLATIONS;

const DEFAULT_LOCALE: GameLocale = 'ru';
const LOCALE_BY_LANGUAGE: Record<string, GameLocale> = {
  ru: 'ru',
};

export function getGameTranslationsForYandexLanguage(language?: string) {
  const languageCode = language?.trim().toLowerCase().split(/[-_]/)[0] ?? '';
  const locale = LOCALE_BY_LANGUAGE[languageCode] ?? DEFAULT_LOCALE;

  return {
    locale,
    strings: GAME_TRANSLATIONS[locale],
  };
}
