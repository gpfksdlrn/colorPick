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

module.exports = { getColorAtCursor };
