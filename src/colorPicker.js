const { desktopCapturer, screen } = require('electron');

const sourceCache = new Map();
const CACHE_TTL = 50;

async function getSources(display) {
  const now = Date.now();
  const cached = sourceCache.get(display.id);
  if (cached && now - cached.time < CACHE_TTL) return cached.sources;

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: display.size.width * display.scaleFactor,
      height: display.size.height * display.scaleFactor,
    },
  });

  sourceCache.set(display.id, { sources, time: now });
  return sources;
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

async function getRegionAt(x, y, size = 11) {
  const point = { x, y };
  const display = screen.getDisplayNearestPoint(point);
  const scaleFactor = display.scaleFactor;

  const sources = await getSources(display);
  const source =
    sources.find((s) => s.display_id === String(display.id)) ?? sources[0];
  if (!source) return null;

  const thumbnail = source.thumbnail;
  const thumbSize = thumbnail.getSize();

  const half = Math.floor(size / 2);
  const px = Math.min(
    Math.max(Math.floor((x - display.bounds.x) * scaleFactor), half),
    thumbSize.width - half - 1,
  );
  const py = Math.min(
    Math.max(Math.floor((y - display.bounds.y) * scaleFactor), half),
    thumbSize.height - half - 1,
  );

  const region = thumbnail.crop({
    x: px - half,
    y: py - half,
    width: size,
    height: size,
  });
  const bitmap = region.toBitmap();
  if (!bitmap || bitmap.length < size * size * 4) return null;

  const centerIdx = Math.floor((size * size) / 2) * 4;
  const r = bitmap[centerIdx + 2];
  const g = bitmap[centerIdx + 1];
  const b = bitmap[centerIdx];
  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

  return {
    bitmap,
    size,
    hex,
    rgb: { r, g, b },
    hsl: rgbToHsl(r, g, b),
  };
}

module.exports = { getRegionAt };
