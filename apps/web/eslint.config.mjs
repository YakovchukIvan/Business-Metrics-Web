import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import tanstackQueryPlugin from '@tanstack/eslint-plugin-query';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['.next/**', 'dist/**', 'eslint.config.mjs', 'next.config.ts', 'tailwind.config.ts', 'components/ui/**', 'next-env.d.ts'],
    // Зверни увагу: ми ігноруємо components/ui, бо shadcn/ui генерує код,
    // який часто не проходить строгий лінтер (наприклад, any або unused vars)
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked, eslintPluginPrettierRecommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly', // Для Next.js
      },
      sourceType: 'module',
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    plugins: {
      'unused-imports': unusedImports,
      import: importPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@next/next': nextPlugin,
      '@tanstack/query': tanstackQueryPlugin,
    },
    rules: {
      // Підключаємо правила React, Next.js та TanStack Query
      ...reactHooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...tanstackQueryPlugin.configs.recommended.rules,

      // ==================== Prettier ====================
      'prettier/prettier': ['error', { endOfLine: 'auto' }],

      // ==================== TypeScript rules ====================
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/return-await': ['error', 'never'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],

      // ==================== Межі фронтенд-модулів ====================
      // Реалізація архітектурного правила з README:
      // ui/ не залежить від layout/ або analysis/
      // layout/ не залежить від analysis/
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/components/ui',
              from: ['./src/components/analysis', './src/components/layout', './src/app', './src/lib/api'],
              message: 'UI-компоненти (shadcn) мають бути максимально "тупими" і не можуть імпортувати бізнес-логіку.',
            },
            {
              target: './src/components/layout',
              from: ['./src/components/analysis'],
              message: 'Layout не може залежати від feature-компонентів.',
            },
          ],
        },
      ],
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

      // ==================== General & React specifics ====================
      'react/react-in-jsx-scope': 'off', // Не потрібно в Next.js
      'react/prop-types': 'off', // Ми використовуємо TS
      'no-console': ['error', { allow: ['warn', 'error'] }], // error дозволено для перехоплення фатальних збоїв
      'arrow-body-style': ['error', 'as-needed'],
    },
  },
);
