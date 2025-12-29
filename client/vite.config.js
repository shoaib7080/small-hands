import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate", // Auto-update the app when you deploy changes
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],

      devOptions: {
        enabled: true, // Generate PWA in dev mode
        type: "module", // Use ES modules for the service worker
      },

      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // Increase limit to 4MB
        navigateFallbackDenylist: [
          /^\/api\//,
          /^https:\/\/.*\.openstreetmap\.org/,
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.openstreetmap\.org\/.*/,
            handler: "NetworkOnly", // Don't cache tiles
          },
        ],
      },
      manifest: {
        name: "Small Hands Support",
        short_name: "SmallHands",
        description: "Disaster Management & NGO Support Platform",
        theme_color: "#ffffff",
        start_url: "/",
        display: "standalone", // 👈 Removes browser URL bar (looks native)
        background_color: "#ffffff",
        icons: [
          {
            src: "pwa-192x192.png", // We will create these next
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
