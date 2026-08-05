import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["pwa-192x192.png", "pwa-512x512.png", "pwa-icon.svg"],
      manifest: {
        name: "Postify Blog",
        short_name: "Postify",
        description:
          "Modern blog platformu - React, Redux Toolkit ve TanStack Query ile geliştirilmiş",
        theme_color: "#007bff",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/Postify-blog/",
        start_url: "/Postify-blog/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/jsonplaceholder\.typicode\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  base: "/Postify-blog/",
  build: {
    outDir: "docs",
    assetsDir: "assets",
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('/gradflow/') || id.includes('/ogl/')) return 'gradient';
          if (id.includes('/lenis/')) return 'smooth-scroll';
          if (id.includes('/gsap/')) return 'gsap';
          if (id.includes('@tiptap') || id.includes('prosemirror')) return 'editor';
          if (
            id.includes('/react-markdown/') ||
            id.includes('/remark-') ||
            id.includes('/rehype-') ||
            id.includes('/micromark') ||
            id.includes('/mdast')
          ) return 'markdown';
          if (id.includes('/framer-motion/')) return 'motion';
          if (id.includes('/@supabase/')) return 'supabase';
          if (id.includes('/react-icons/')) return 'icons';
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/') ||
            id.includes('/use-sync-external-store/')
          ) return 'react-vendor';

          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 450,
  },
  server: {
    port: 5173,
    open: true,
  },
});
