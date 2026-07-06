'use strict';

const fs = require('fs');
const path = require('path');

const AUDIO_EXT = /\.(mp3|wav|ogg|m4a|aac|flac)$/i;

function scanAudioFolder(rootDir) {
  const audioRoot = path.join(rootDir, 'audio');
  if (!fs.existsSync(audioRoot)) return [];

  const results = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (AUDIO_EXT.test(entry.name)) {
        const rel = path.relative(rootDir, full).split(path.sep).join('/');
        results.push({
          title: entry.name.replace(path.extname(entry.name), '').replace(/_/g, ' '),
          file: rel
        });
      }
    }
  }

  walk(audioRoot);
  results.sort(function (a, b) { return a.file.localeCompare(b.file); });
  return results;
}

function humanizeTitle(baseName) {
  return baseName.replace(/_/g, ' ');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { scanAudioFolder: scanAudioFolder, humanizeTitle: humanizeTitle, AUDIO_EXT: AUDIO_EXT };
}