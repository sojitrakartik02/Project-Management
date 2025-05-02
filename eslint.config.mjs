import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import airbnb from 'eslint-config-airbnb-base';

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      parser,
      globals: { ...globals.node },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier,
    },
    extends: [
      pluginJs.configs.recommended,
      ...tseslint.configs.recommended,
      airbnb,
      'plugin:prettier/recommended',
    ],
    rules: {
      'prettier/prettier': 'error',
      'no-console': 'warn',
      'import/prefer-default-export': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
    },
  },
];
