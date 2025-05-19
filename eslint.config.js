import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import prettierPlugin from 'eslint-plugin-prettier'; 

export default defineConfig([
  { files: ['**/*.{js,mjs,cjs,ts}'], plugins: { js }, extends: ['js/recommended'] },
  { files: ['**/*.{js,mjs,cjs,ts}'], languageOptions: { globals: globals.node } },
    {
    files: ['**/*.{ts,js}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      globals: globals.node,
    },
    ...js.configs.recommended,
    ignores: ['**/temp.js', 'config/*', 'dist/*', 'front/*', 'node_modules/*'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: prettierPlugin, 
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      curly: 'error',
      semi: 'error',
      quotes: ['error', 'single'],
      eqeqeq: ['error', 'always'],
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  ...tseslint.configs.recommended,
]);