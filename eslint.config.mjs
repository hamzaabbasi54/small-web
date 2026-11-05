// Flat config: one file lists which rules apply. typescript-eslint recommended
// checks TypeScript files; eslint-config-prettier turns off rules that fight Prettier.
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      'coverage/**',
      'docs/**',
      '.cursor/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [tseslint.configs.recommended],
  },
  eslintConfigPrettier,
);
