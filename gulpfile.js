/*
 * Copyright (c) 2026 Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 */

const { src, dest } = require('gulp');

function buildIcons() {
  return src('nodes/**/*.{png,svg}').pipe(dest('dist/nodes'));
}

exports['build:icons'] = buildIcons;
