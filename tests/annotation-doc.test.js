'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const docPath = path.join(root, 'docs', 'deploy-auth-annotation.md');
const imagePath = path.join(root, 'docs', 'images', 'github-auth-success.png');

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function testAnnotationDocExistsAndComplete() {
  assert.ok(fs.existsSync(docPath), 'docs/deploy-auth-annotation.md must exist');
  const doc = read(docPath);

  const regions = [
    'GitHub logo',
    'Success card',
    'checkmark',
    'Congratulations',
    "you're all set",
    'Your device is now connected',
    'Footer'
  ];
  regions.forEach(function (r) {
    assert.ok(doc.includes(r), 'missing region callout: ' + r);
  });

  const requiredStrings = [
    'auth-github',
    'cxmx-dev',
    'push-pages',
    'https://cxmx-dev.github.io/GitJuked/',
    '67F0-AE3D',
    'image-6aaaad04-1c35-4541-920a-b2814808e97e.png'
  ];
  requiredStrings.forEach(function (s) {
    assert.ok(doc.includes(s), 'missing required string: ' + s);
  });

  assert.ok(doc.includes('images/github-auth-success.png'), 'markdown must embed committed image path');
  assert.ok(doc.includes('deploy-auth-visual.html'), 'markdown must link visual annotation');
}

function testVisualAnnotationExists() {
  const visualPath = path.join(root, 'docs', 'deploy-auth-visual.html');
  assert.ok(fs.existsSync(visualPath), 'docs/deploy-auth-visual.html must exist');
  const html = read(visualPath);
  assert.ok(html.includes('pin-1') && html.includes('pin-6'), 'visual must have numbered region pins');
  assert.ok(html.includes('github-auth-success.png'), 'visual must reference committed image');
}

function testImageCommitted() {
  assert.ok(fs.existsSync(imagePath), 'docs/images/github-auth-success.png must exist');
}

function testCrossLinks() {
  const readme = read(path.join(root, 'README.md'));
  const notes = read(path.join(root, 'NOTES.md'));
  const link = 'docs/deploy-auth-annotation.md';
  assert.ok(
    readme.includes(link) || notes.includes(link),
    'README.md or NOTES.md must link to annotation doc'
  );
}

testAnnotationDocExistsAndComplete();
testVisualAnnotationExists();
testImageCommitted();
testCrossLinks();
console.log('annotation-doc.test.js: all tests passed');