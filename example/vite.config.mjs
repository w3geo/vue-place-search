import Vue from '@vitejs/plugin-vue';
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

// Utilities
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { join, resolve } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  root,
  plugins: [
    Vue({
      template: { transformAssetUrls },
    }),
    Vuetify(),
  ],
  define: { 'process.env': {} },
  resolve: {
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  server: {
    port: 3000,
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: 'modern-compiler',
      },
    },
  },
});
