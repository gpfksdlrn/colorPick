const { nativeImage, screen } = require('electron');
const screenshot = require('screenshot-desktop');
const { execFile } = require('child_process');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');

// mousemove마다 새로 캡처하기엔 비용이 커서(200ms대) 이 주기 동안은 캐시된 이미지를 재사용한다.
const CAPTURE_INTERVAL = 450; // ms — 실기기 테스트 후 조정 예정

// 디스플레이별 ColorSync 프로파일(P3 등) 때문에 raw 픽셀이 CSS의 sRGB 값과 어긋난다 — sips로 sRGB에 매칭시켜 보정.
const SRGB_PROFILE_MAC = '/System/Library/ColorSync/Profiles/sRGB Profile.icc';

function matchToSrgb(filePath) {
  return new Promise((resolve, reject) => {
    execFile('sips', ['--matchTo', SRGB_PROFILE_MAC, filePath], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// screenshot-desktop의 screenshot()은 호출마다 system_profiler로 유효성 검사를 해서 느리다 —
// screencapture -D로 직접 캡처해 우회하고, listDisplays()는 디스플레이 매핑에만 캐시해서 쓴다.
function macScreenCapture(screenIndex, outPath) {
  return new Promise((resolve, reject) => {
    execFile(
      'screencapture',
      ['-x', '-t', 'png', '-D', String(screenIndex + 1), outPath],
      (err) => {
        if (err) reject(err);
        else resolve();
      },
    );
  });
}

// mac의 sips에 대응 — 모니터별 ICC 프로파일을 GetICMProfile로 찾아 sRGB로 매칭시킨다(resources/win-color-correct.ps1).
// 미검증 상태라 실패 시 보정 없이 원본 캡처로 폴백한다.
const WIN_COLOR_SCRIPT = path.join(__dirname, '..', 'resources', 'win-color-correct.ps1');

function winMatchToSrgb(inputPath, outputPath, deviceName) {
  return new Promise((resolve, reject) => {
    execFile(
      'powershell.exe',
      [
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        WIN_COLOR_SCRIPT,
        '-InputPath',
        inputPath,
        '-OutputPath',
        outputPath,
        '-DeviceName',
        deviceName,
      ],
      (err) => {
        if (err) reject(err);
        else resolve();
      },
    );
  });
}

async function captureBuffer(screenIndex, deviceName) {
  if (process.platform === 'win32') {
    const rawBuffer = await screenshot({ screen: screenIndex, format: 'png' });
    if (!deviceName) return rawBuffer;

    const tmpIn = path.join(os.tmpdir(), `colorpick-${process.pid}-${screenIndex}-in.png`);
    const tmpOut = path.join(os.tmpdir(), `colorpick-${process.pid}-${screenIndex}-out.png`);
    try {
      await fs.writeFile(tmpIn, rawBuffer);
      await winMatchToSrgb(tmpIn, tmpOut, deviceName);
      return await fs.readFile(tmpOut);
    } catch (err) {
      console.error('winMatchToSrgb 실패, 보정 없이 원본 사용:', err.message);
      return rawBuffer;
    } finally {
      fs.unlink(tmpIn).catch(() => {});
      fs.unlink(tmpOut).catch(() => {});
    }
  }

  const tmpPath = path.join(
    os.tmpdir(),
    `colorpick-${process.pid}-${screenIndex}-${Date.now()}.png`,
  );
  try {
    await macScreenCapture(screenIndex, tmpPath);
    await matchToSrgb(tmpPath);
    return await fs.readFile(tmpPath);
  } finally {
    fs.unlink(tmpPath).catch(() => {});
  }
}

const captureCache = new Map(); // electron display.id -> { time, pending, promise }

let displayMap = null; // electron display.id -> screenshot-desktop screen index
let displayMapTime = 0;
const DISPLAY_MAP_TTL = 10_000; // 모니터 연결 변경 대비 주기적 재계산

async function buildDisplayMap() {
  const electronDisplays = screen.getAllDisplays();
  const shotDisplays = await screenshot.listDisplays();
  const map = new Map();

  if (process.platform === 'win32') {
    // win32는 listDisplays()가 left/top/width/height를 주므로 좌표로 정확히 매칭 가능.
    electronDisplays.forEach((d) => {
      let bestIdx = 0;
      let bestScore = Infinity;
      shotDisplays.forEach((s, idx) => {
        const score =
          Math.abs(d.bounds.x - s.left) +
          Math.abs(d.bounds.y - s.top) +
          Math.abs(d.bounds.width - s.width) +
          Math.abs(d.bounds.height - s.height);
        if (score < bestScore) {
          bestScore = score;
          bestIdx = idx;
        }
      });
      map.set(d.id, { index: bestIdx, name: shotDisplays[bestIdx]?.name });
    });
  } else {
    // mac listDisplays()는 좌표 정보가 없어 primary만 확실히 매칭되고, 나머지는 bounds.x 순서로 best-effort 매칭.
    const primaryElectron = screen.getPrimaryDisplay();
    const primaryShotIdx = shotDisplays.findIndex((s) => s.primary);
    map.set(primaryElectron.id, { index: primaryShotIdx >= 0 ? primaryShotIdx : 0 });

    const otherElectron = electronDisplays
      .filter((d) => d.id !== primaryElectron.id)
      .sort((a, b) => a.bounds.x - b.bounds.x);
    const otherShotIdx = shotDisplays
      .map((_, idx) => idx)
      .filter((idx) => idx !== primaryShotIdx);

    otherElectron.forEach((d, i) => {
      map.set(d.id, { index: otherShotIdx[i] ?? 0 });
    });
  }

  return map;
}

async function getDisplayMap() {
  const now = Date.now();
  if (displayMap && now - displayMapTime < DISPLAY_MAP_TTL) return displayMap;

  displayMap = await buildDisplayMap();
  displayMapTime = now;
  return displayMap;
}

function refreshDisplay(display) {
  const existing = captureCache.get(display.id);
  if (existing?.pending) return existing.promise;

  const entry = {
    time: Date.now(),
    pending: true,
    image: existing?.image ?? null,
    promise: null,
  };
  entry.promise = (async () => {
    try {
      const map = await getDisplayMap();
      const { index: screenIndex, name: deviceName } = map.get(display.id) ?? { index: 0 };
      const buffer = await captureBuffer(screenIndex, deviceName);
      entry.image = nativeImage.createFromBuffer(buffer);
      entry.time = Date.now();
      return entry.image;
    } finally {
      entry.pending = false;
    }
  })();

  captureCache.set(display.id, entry);
  return entry.promise;
}

// stale-while-revalidate: 캐시가 있으면 즉시 반환하고 새 캡처는 백그라운드에서 갱신 — mousemove가 캡처 끝날 때까지 멈추지 않게.
function captureDisplay(display) {
  const now = Date.now();
  const cached = captureCache.get(display.id);

  if (!cached?.image) {
    return refreshDisplay(display);
  }

  if (!cached.pending && now - cached.time >= CAPTURE_INTERVAL) {
    refreshDisplay(display).catch(() => {});
  }

  return Promise.resolve(cached.image);
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
  const display = screen.getDisplayNearestPoint({ x, y });
  const scaleFactor = display.scaleFactor;

  let image;
  try {
    image = await captureDisplay(display);
  } catch {
    return null;
  }
  if (!image) return null;

  const imgSize = image.getSize();
  if (!imgSize.width || !imgSize.height) return null;

  const half = Math.floor(size / 2);
  const px = Math.min(
    Math.max(Math.floor((x - display.bounds.x) * scaleFactor), half),
    imgSize.width - half - 1,
  );
  const py = Math.min(
    Math.max(Math.floor((y - display.bounds.y) * scaleFactor), half),
    imgSize.height - half - 1,
  );

  const region = image.crop({
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
