/*
 * Copyright (c) 2026 Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['eslint-plugin-n8n-nodes-base'],
  extends: ['plugin:n8n-nodes-base/community'],
  ignorePatterns: ['node_modules/**', 'dist/**'],
};
