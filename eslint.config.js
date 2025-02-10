import js from '@eslint/js';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import importPlugin from 'eslint-plugin-import';
import pluginVue from 'eslint-plugin-vue';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import vuetify from 'eslint-config-vuetify';

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  ...vuetify,
  skipFormatting,
  importPlugin.flatConfigs.recommended,
  eslintPluginPrettierRecommended,
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,cjs}'],
  },
  {
    files: ['src/**/*.{js,vue}'],
    rules: {
      'import/extensions': ['error', 'always'],
    },
  },

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'off',
      'import/no-dynamic-require': 'warn',
      'import/no-unresolved': 'off',
    },
  },
];
