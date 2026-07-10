import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['eslint.config.mjs', '**/*.d.ts', '**/migrations/**', 'dist/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked, eslintPluginPrettierRecommended],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.eslint.json',
        },
      },
    },
    plugins: {
      'unused-imports': unusedImports,
      import: importPlugin,
    },
    rules: {
      // ==================== Prettier ====================
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],

      // ==================== TypeScript rules ====================
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/return-await': ['error', 'never'],
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      // Змушує писати `import type { X }` окремо від значень —
      // прибирає зайві runtime-імпорти, трохи пришвидшує компіляцію
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],

      // ==================== Межі модулів (port/adapter) ====================
      // Еквівалент "server/client boundary" з Next.js, але під нашу архітектуру:
      // фізично забороняє порушувати порт/адаптер патерн і DI-межі cache-модуля.
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              // analysis не має права знати про конкретну реалізацію google-places,
              // тільки про його інтерфейси (порт)
              target: './src/modules/analysis',
              from: './src/modules/google-places',
              except: ['./interfaces'],
              message:
                'analysis може імпортувати тільки інтерфейси (порт) з google-places, не конкретні adapters/mappers.',
            },
            {
              // google-places (і будь-хто інший) не має права імпортувати конкретну
              // реалізацію кешу напряму — тільки через CACHE_SERVICE-токен
              target: './src/modules/google-places',
              from: './src/modules/cache',
              except: ['./interfaces', './cache.constants.ts'],
              message: 'Кеш підключається лише через CACHE_SERVICE-токен, не через конкретний adapter.',
            },
          ],
        },
      ],
      // Циклічні імпорти між модулями — легко виникають при рефакторингу,
      // важко відловити руками
      'import/no-cycle': ['error', { maxDepth: 1 }],

      // ==================== Unused imports ====================
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // ==================== General rules ====================
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': ['error', { allow: ['warn'] }],
      'no-debugger': 'error',
      curly: ['error', 'all'],
      'guard-for-in': 'error',
      eqeqeq: 'off',
      'default-case': 'error',
      'no-fallthrough': 'error',
      'arrow-body-style': ['error', 'as-needed'],

      // ==================== Code quality ====================
      'no-duplicate-case': 'error',
      'no-template-curly-in-string': 'error',
      'no-this-before-super': 'error',
      'no-cond-assign': 'error',

      // ==================== Code style ====================
      'max-len': ['error', { code: 120, ignoreUrls: true, ignoreStrings: true }],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
    },
  },

  // ==================== Override for test files ====================
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
);
