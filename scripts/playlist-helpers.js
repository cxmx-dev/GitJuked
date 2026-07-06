/**
 * Shared manifest/playlist helpers — loaded by index.html and tested by Node.
 */
function normalizeManifest(data) {
  const raw = data && (data.tracks || data);
  if (!Array.isArray(raw)) return [];
  return raw.map(function (t) {
    return {
      name: t.title || t.name || '',
      src: t.file || t.src || ''
    };
  }).filter(function (t) { return t.name && t.src; });
}

function buildSelectOptions(tracks) {
  return tracks.map(function (t, i) {
    return { label: t.name, value: String(i) };
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { normalizeManifest: normalizeManifest, buildSelectOptions: buildSelectOptions };
}

if (typeof window !== 'undefined') {
  window.GitJukedPlaylist = { normalizeManifest: normalizeManifest, buildSelectOptions: buildSelectOptions };
}