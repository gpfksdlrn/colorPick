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

  // BGRA → RGBA 변환
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

  // 중앙 픽셀 색상
  const center = pixels[Math.floor((size * size) / 2)];
  const hex = `#${center.r.toString(16).padStart(2, '0')}${center.g.toString(16).padStart(2, '0')}${center.b.toString(16).padStart(2, '0')}`;

  return { pixels, size, hex, center };
}

module.exports = { getColorAtCursor, getColorAt, getRegionAt };
