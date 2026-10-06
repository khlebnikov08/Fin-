import { build } from 'vite';

process.env.VITE_YANDEX_GAMES = 'true';
await build();
