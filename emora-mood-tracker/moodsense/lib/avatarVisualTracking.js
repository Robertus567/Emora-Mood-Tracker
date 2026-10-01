// The 68 face-api landmarks outline the eyes and lips, but do not include
// iris or tongue points. Sample only those tiny camera regions to estimate
// their movement without uploading frames or loading another model.

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function sampleRegion(video, points, canvas, padding = 0.12) {
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const width = maxX - minX;
  const height = maxY - minY;
  if (width < 8 || height < 3 || !video.videoWidth || !video.videoHeight) return null;

  const sx = clamp(minX - width * padding, 0, video.videoWidth - 1);
  const sy = clamp(minY - height * padding, 0, video.videoHeight - 1);
  const sw = Math.min(video.videoWidth - sx, width * (1 + padding * 2));
  const sh = Math.min(video.videoHeight - sy, height * (1 + padding * 2));
  const targetWidth = 40;
  const targetHeight = Math.max(12, Math.round(targetWidth * sh / sw));
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(video, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
  return context.getImageData(0, 0, targetWidth, targetHeight);
}

function eyeGaze(pixels) {
  if (!pixels) return null;
  const { data, width, height } = pixels;
  let sumX = 0;
  let sumY = 0;
  let total = 0;
  let samples = 0;
  // Ignore the borders and upper lash line. Favor a coherent dark iris
  // near the middle of the visible eye over isolated eyelashes.
  for (let y = Math.floor(height * 0.31); y < height * 0.83; y++) {
    for (let x = Math.floor(width * 0.17); x < width * 0.83; x++) {
      const index = (y * width + x) * 4;
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const brightness = red * 0.3 + green * 0.59 + blue * 0.11;
      const darkness = clamp((125 - brightness) / 95, 0, 1);
      const horizontalCenterWeight = 1 - Math.abs(x / width - 0.5) * 0.35;
      const weight = darkness * darkness * horizontalCenterWeight;
      sumX += x * weight;
      sumY += y * weight;
      total += weight;
      samples++;
    }
  }
  if (total < samples * 0.035) return null;
  return {
    x: clamp(((sumX / total) / width - 0.5) * 3.0, -1, 1),
    y: clamp(((sumY / total) / height - 0.55) * 3.4, -1, 1),
  };
}

function tonguePresence(pixels) {
  if (!pixels) return 0;
  const { data, width, height } = pixels;
  let pink = 0;
  let count = 0;
  for (let y = Math.floor(height * 0.46); y < height * 0.87; y++) {
    for (let x = Math.floor(width * 0.27); x < width * 0.73; x++) {
      const index = (y * width + x) * 4;
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      if (red > 82 && red > green * 1.26 && red > blue * 1.12 && green > blue * 0.72) pink++;
      count++;
    }
  }
  return clamp((pink / Math.max(count, 1) - 0.18) * 3.5, 0, 1);
}

export function extractVisualTracking(video, landmarks, mouthOpen, canvas) {
  try {
    const points = landmarks.positions;
    const eyeA = eyeGaze(sampleRegion(video, points.slice(36, 42), canvas, 0.04));
    const eyeB = eyeGaze(sampleRegion(video, points.slice(42, 48), canvas, 0.04));
    const gaze = eyeA && eyeB
      ? { x: (eyeA.x + eyeB.x) / 2, y: (eyeA.y + eyeB.y) / 2 }
      : eyeA || eyeB;
    const tongueOut = mouthOpen > 0.18
      ? tonguePresence(sampleRegion(video, points.slice(60, 68), canvas, 0.15))
      : 0;
    return { gazeX: gaze?.x ?? null, gazeY: gaze?.y ?? null, tongueOut };
  } catch {
    // Camera frames can briefly become unavailable when the tab sleeps.
    return { gazeX: null, gazeY: null, tongueOut: 0 };
  }
}
