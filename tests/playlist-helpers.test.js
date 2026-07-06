'use strict';

const assert = require('assert');
const { normalizeManifest, buildSelectOptions } = require('../scripts/playlist-helpers.js');

function testNormalizeManifest() {
  const wrapped = normalizeManifest({
    tracks: [
      { title: 'GitJuke', file: 'audio/01_-_gitjuke_-_cxmx.wav' },
      { name: 'Alt', src: 'audio/alt.mp3' }
    ]
  });
  assert.strictEqual(wrapped.length, 2);
  assert.deepStrictEqual(wrapped[0], {
    name: 'GitJuke',
    src: 'audio/01_-_gitjuke_-_cxmx.wav'
  });
  assert.deepStrictEqual(wrapped[1], {
    name: 'Alt',
    src: 'audio/alt.mp3'
  });

  const bare = normalizeManifest([{ title: 'Solo', file: 'audio/solo.wav' }]);
  assert.strictEqual(bare.length, 1);
  assert.strictEqual(bare[0].name, 'Solo');

  assert.deepStrictEqual(normalizeManifest({ tracks: [{ title: '', file: 'x.wav' }] }), []);
  assert.deepStrictEqual(normalizeManifest(null), []);
}

function testBuildSelectOptions() {
  const tracks = [
    { name: 'GitJuke', src: 'audio/01_-_gitjuke_-_cxmx.wav' },
    { name: 'Track 2', src: 'audio/2.wav' }
  ];
  const opts = buildSelectOptions(tracks);
  assert.strictEqual(opts.length, 2);
  assert.deepStrictEqual(opts[0], { label: 'GitJuke', value: '0' });
  assert.deepStrictEqual(opts[1], { label: 'Track 2', value: '1' });
}

function testManifestMatchesAudioFolder() {
  const fs = require('fs');
  const path = require('path');
  const root = path.join(__dirname, '..');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tracks.json'), 'utf8'));
  const normalized = normalizeManifest(manifest);
  const audioFiles = fs.readdirSync(path.join(root, 'audio'))
    .filter(function (f) { return /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(f); })
    .sort();
  assert.strictEqual(normalized.length, audioFiles.length);
  normalized.forEach(function (t, i) {
    assert.strictEqual(t.src, 'audio/' + audioFiles[i]);
    assert.ok(t.name.length > 0);
  });
}

testNormalizeManifest();
testBuildSelectOptions();
testManifestMatchesAudioFolder();
console.log('playlist-helpers.test.js: all tests passed');