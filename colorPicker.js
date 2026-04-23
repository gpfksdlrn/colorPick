const { desktopCapturer, screen } = require('electron');

async function getColorAtCursor() {
  const point = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(point);
  const scaleFactor = display.scaleFactor;

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: display.size.width * scaleFactor,
      height: display.size.height * scaleFactor,
    },
  });

  const source =
    sources.find((s) => s.display_id === String(display.id)) ?? sources[0];
  const thumbnail = source.thumbnail;
  const thumbSize = thumbnail.getSize();

  const x = Math.min(
    Math.floor((point.x - display.bounds.x) * scaleFactor),
    thumbSize.width - 1,
  );
  const y = Math.min(
    Math.floor((point.y - display.bounds.y) * scaleFactor),
    thumbSize.height - 1,
  );

  const buffer = thumbnail.crop({ x, y, width: 1, height: 1 }).toBitmap();
  if (!buffer || buffer.length < 3) return null;

  const [b, g, r] = buffer;
  return {
    r,
    g,
    b,
    hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
  };
}

async function getColorAt(x, y) {
  const point = { x, y };
  const display = screen.getDisplayNearestPoint(point);
  const scaleFactor = display.scaleFactor;

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: display.size.width * scaleFactor,
      height: display.size.height * scaleFactor,
    },
  });

  const source =
    sources.find((s) => s.display_id === String(display.id)) ?? sources[0];
  const thumbnail = source.thumbnail;
  const thumbSize = thumbnail.getSize();

  const px = Math.min(
    Math.floor((x - display.bounds.x) * scaleFactor),
    thumbSize.width - 1,
  );
  const py = Math.min(
    Math.floor((y - display.bounds.y) * scaleFactor),
    thumbSize.height - 1,
  );

  const buffer = thumbnail
    .crop({ x: px, y: py, width: 1, height: 1 })
    .toBitmap();
  if (!buffer || buffer.length < 3) return null;

  const [b, g, r] = buffer;
  return {
    r,
    g,
    b,
    hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
  };
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

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: display.size.width * scaleFactor,
      height: display.size.height * scaleFactor,
    },
  });

  const source =
    sources.find((s) => s.display_id === String(display.id)) ?? sources[0];
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

  const pixels = [];
  for (let i = 0; i < size * size; i++) {
    const idx = i * 4;
    pixels.push({
      r: bitmap[idx + 2],
      g: bitmap[idx + 1],
      b: bitmap[idx + 0],
    });
  }

  const center = pixels[Math.floor((size * size) / 2)];
  const hex = `#${center.r.toString(16).padStart(2, '0')}${center.g.toString(16).padStart(2, '0')}${center.b.toString(16).padStart(2, '0')}`;
  const hsl = rgbToHsl(center.r, center.g, center.b);

  return {
    pixels,
    size,
    hex,
    rgb: { r: center.r, g: center.g, b: center.b },
    hsl,
  };
}

module.exports = { getColorAtCursor, getColorAt, getRegionAt };
