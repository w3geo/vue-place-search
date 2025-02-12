import vue from '@vitejs/plugin-vue';
import { dirname, resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import vuetify from 'vite-plugin-vuetify';
// @ts-expect-error
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    vue(),
    vuetify(),
    dts({ tsconfigPath: './tsconfig.app.json' }),
    peerDepsExternal(),
  ],
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'PlaceSearch',
      fileName: 'vue-place-search',
      formats: ['es'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
