import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "Blood Pressure Tracker",
        short_name: "BP Tracker",

        description: "Track blood pressure readings",

        theme_color: "#111827",

        background_color: "#111827",

        display: "standalone",

        start_url: "/",

        icons: [
          {
            purpose: "maskable",
            sizes: "1024x1024",
            src: "/BPIcon-1024.png",
            type: "image/png",
          },

          {
            purpose: "maskable",
            sizes: "512x512",
            src: "/BPIcon-512.png",
            type: "image/png",
          },

          {
            purpose: "maskable",
            sizes: "384x384",
            src: "/BPIcon-384.png",
            type: "image/png",
          },

          {
            purpose: "maskable",
            sizes: "192x192",
            src: "/BPIcon-192.png",
            type: "image/png",
          },

          {
            purpose: "maskable",
            sizes: "128x128",
            src: "/BPIcon-128.png",
            type: "image/png",
          },

          {
            purpose: "maskable",
            sizes: "96x96",
            src: "/BPIcon-96.png",
            type: "image/png",
          },

          {
            purpose: "maskable",
            sizes: "72x72",
            src: "/BPIcon-72.png",
            type: "image/png",
          },

          {
            purpose: "maskable",
            sizes: "48x48",
            src: "/BPIcon-48.png",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
