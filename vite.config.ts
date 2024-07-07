import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import compression from "vite-plugin-compression2";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/projects/openomf/cards/",
  plugins: [
    vue(),
    compression({
      include: /\.(html|xml|css|json|js|mjs|svg|map)$/,
      threshold: 1500,
    }),
  ],
  esbuild: {
    pure: ["console.debug", "console.log"],
  },
  build: {
    sourcemap: true,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
