import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LOCAL_GAMEPLAY_EVENTS,
  NEWSPAPER_CYCLES,
  pickRichMacroNews,
} from '../data/richEventsPool';

test('local Yandex content has enough distinct events and newspaper articles', () => {
  const editions = Object.values(NEWSPAPER_CYCLES);
  const articleIds = editions.flatMap((edition) => edition.articles.map((article) => article.id));
  const eventIds = LOCAL_GAMEPLAY_EVENTS.map((event) => event.id);

  assert.equal(editions.length, 10);
  assert.equal(articleIds.length, 60);
  assert.equal(new Set(articleIds).size, articleIds.length);
  assert.equal(LOCAL_GAMEPLAY_EVENTS.length, 56);
  assert.equal(new Set(eventIds).size, eventIds.length);
});

test('each local macro edition returns six complete articles and a matching cycle type', () => {
  for (const [key, edition] of Object.entries(NEWSPAPER_CYCLES)) {
    const news = pickRichMacroNews(key);

    assert.equal(news.cycleType, edition.cycleType);
    assert.equal(news.headline, edition.headline);
    assert.equal(news.articles?.length, 6);
    assert.equal(new Set(news.articles?.map((article) => article.category)).size, 6);
    assert.ok(news.articles?.every((article) => article.title.trim() && article.content.trim()));
  }
});

test('consecutive random newspaper editions do not repeat the same scenario', () => {
  const first = pickRichMacroNews();
  const second = pickRichMacroNews();

  assert.notEqual(first.headline, second.headline);
});
