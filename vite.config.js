import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import removeConsole from "vite-plugin-remove-console";
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      removeConsole(),
      VitePWA({
        // 'prompt', not 'autoUpdate': this app takes payments and shows prices, so
        // assets must never swap underneath a user mid-session. A new version waits
        // until the user accepts it via the update toast (see PWAUpdatePrompt).
        registerType: 'prompt',
        includeAssets: ['icons/apple-touch-icon.png', 'icons/favicon-32.png'],
        manifest: {
          name: 'Motoka — Vehicle Registration',
          short_name: 'Motoka',
          description: 'Register and renew your vehicle documents in Nigeria.',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#F4F5FC',
          theme_color: '#2389E3',
          categories: ['travel', 'utilities'],
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
            { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // Precache the app shell. SVGs are included (~900 KB across the whole build)
          // because the brand logo is one — with it excluded the app rendered offline
          // with a broken image where the logo should be.
          globPatterns: ['**/*.{js,css,html,woff2,svg}'],

          // Raster media is NOT precached: the build ships a 14 MB PNG, a 10 MB JPG and
          // two 5 MB GIFs. Precaching those would pull ~40 MB on first visit over
          // Nigerian mobile data, which defeats the point. They stay network-loaded and
          // enter the runtime image cache below only once actually requested.
          globIgnores: ['**/*.{png,jpg,jpeg,gif,webp,mp4}'],
          // Headroom above the current ~3 MB main bundle. If this is ever lower than
          // the bundle, Workbox silently drops it from the precache and offline
          // breaks with no build error — so keep it comfortably ahead.
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,

          // SPA deep links fall back to index.html — but never for the API or assets.
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//, /^\/admin\/api\//, /\.[^/]+$/],

          // NOTHING from the API is cached. Prices, wallet balances, order status and
          // payment state must always come from the network — a stale cached price is
          // a support incident, not a performance win.
          runtimeCaching: [
            {
              urlPattern: ({ url }) => /\/api\//.test(url.pathname),
              handler: 'NetworkOnly',
            },
            {
              // Images are safe to serve stale; they are content-addressed by build hash.
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'motoka-images',
                expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
              },
            },
          ],

          cleanupOutdatedCaches: true,
        },
        devOptions: {
          // Keep the service worker out of `vite dev` — stale-SW confusion during
          // development is the classic PWA footgun. Test installs against a preview build.
          enabled: false,
        },
      }),
    ],
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    server: {
      host: true,
      port: 3001,
    },
  };
})
