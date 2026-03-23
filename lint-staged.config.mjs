// lint-staged runs on every `git commit` via the Husky pre-commit hook.
// Only staged files matching each pattern are processed.
export default {
  // TypeScript / TSX — lint + format
  '**/*.{ts,tsx}': [
    'eslint --fix --max-warnings=0',
    'prettier --write',
  ],

  // JSON, YAML, Markdown — format only
  '**/*.{json,yaml,yml,md}': [
    'prettier --write',
  ],

  // CSS — format only (Tailwind classes are in TSX, not plain CSS)
  '**/*.css': [
    'prettier --write',
  ],
};
