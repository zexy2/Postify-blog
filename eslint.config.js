import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'docs']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // JSX-only references are not counted by core no-unused-vars without
      // eslint-plugin-react. Ignore component-style names and motion imports.
      'react-refresh/only-export-components': 'off',
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^(motion|[A-Z_])',
          argsIgnorePattern: '^[A-Z_]',
        },
      ],
    },
  },
  {
    files: ['playwright.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
