import test from 'node:test';
import assert from 'node:assert/strict';
import { getGameTranslationsForYandexLanguage } from '../i18n';

test('Yandex language detection selects the matching supported language', () => {
  assert.deepEqual(getGameTranslationsForYandexLanguage('ru'), {
    locale: 'ru',
    strings: { loadingSave: 'Загружаем сохранение…' },
  });
  assert.equal(getGameTranslationsForYandexLanguage('ru-RU').locale, 'ru');
});

test('unsupported or unavailable Yandex languages safely fall back to Russian', () => {
  assert.equal(getGameTranslationsForYandexLanguage('en').locale, 'ru');
  assert.equal(getGameTranslationsForYandexLanguage(undefined).locale, 'ru');
  assert.equal(getGameTranslationsForYandexLanguage('').locale, 'ru');
});
