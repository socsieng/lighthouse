/**
 * @license Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const fs = require('fs');
const mkdir = fs.promises.mkdir;

const archiver = require('archiver');
const cpy = require('cpy');
const browserify = require('browserify');
const path = require('path');

const argv = process.argv.slice(2);
const browserBrand = argv[0];

const sourceName = 'popup.js';
const distName = 'popup-bundle.js';

const sourceDir = `${__dirname}/../clients/extension`;
const distDir = `${__dirname}/../dist/extension-${browserBrand}`;
const packagePath = `${distDir}/../extension-${browserBrand}-package`;

const manifestVersion = require(`${sourceDir}/manifest.json`).version;

/**
 * Browserify and minify entry point.
 */
async function buildEntryPoint() {
  const inFile = `${sourceDir}/scripts/${sourceName}`;
  const outFile = `${distDir}/scripts/${distName}`;
  const bundleStream = browserify(inFile).bundle();

  await mkdir(path.dirname(outFile), {recursive: true});
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(outFile);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);

    bundleStream.pipe(writeStream);
  });
}

/**
 * @return {Promise<void>}
 */
async function copyAssets() {
  await cpy([
    '*.html',
    'styles/**/*.css',
    'images/**/*',
    'manifest.json',
  ], distDir, {
    cwd: sourceDir,
    parents: true,
  });

  await cpy([
    `_locales/${browserBrand}/en/**`,
  ], `${distDir}/_locales/en`, {
    cwd: sourceDir,
  });
}

/**
 * Put built extension into a zip file ready for install or upload to the
 * webstore.
 * @return {Promise<void>}
 */
async function packageExtension() {
  await mkdir(packagePath, {recursive: true});

  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: {level: 9},
    });

    const outPath = `${packagePath}/lighthouse-${manifestVersion}.zip`;
    const writeStream = fs.createWriteStream(outPath);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);

    archive.pipe(writeStream);
    archive.directory(distDir, false);
    archive.finalize();
  });
}

async function run() {
  await Promise.all([
    buildEntryPoint(),
    copyAssets(),
  ]);

  await packageExtension();
}

run();
