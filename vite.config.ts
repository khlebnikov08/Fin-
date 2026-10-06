import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const isYandexGamesBuild = process.env.VITE_YANDEX_GAMES === 'true';

const removeRemoteFontsForYandex = {
  name: 'remove-remote-fonts-for-yandex-games',
  transformIndexHtml(html: string) {
    return html.replace(
      /^[ \t]*<link\b[^>]*href="https:\/\/fonts\.(?:googleapis|gstatic)\.com[^"]*"[^>]*>\s*$/gm,
      ''
    );
  },
};

export default defineConfig(() => ({
  // A relative base lets the archive run from Yandex's hosted game path.
  base: isYandexGamesBuild ? './' : '/',
  plugins: [
    react(),
    tailwindcss(),
    ...(isYandexGamesBuild ? [removeRemoteFontsForYandex] : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, '.'),
    },
  },
  build: isYandexGamesBuild
    ? {
        outDir: 'dist-yandex',
        emptyOutDir: true,
        // public/ currently contains the website's downloadable source/build archives.
        copyPublicDir: false,
      }
    : undefined,
  server: {
    // Arena's proxied preview uses per-session *.e2b.app hostnames.
    // Permit those hosts when Vite is mounted through the Express middleware.
    allowedHosts: ['.e2b.app'],
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    hmr: process.env.DISABLE_HMR !== 'true',
    // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
}));
