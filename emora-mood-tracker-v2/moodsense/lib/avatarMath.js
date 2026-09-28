// Turns face-api.js's 68-point landmark set into a small number of
// normalized "rig" parameters an avatar can be driven by. Landmark indices
// follow the standard ibug 68-point scheme (same one dlib/face-api use):
//
//   0-16  jaw line        17-21 right eyebrow   22-26 left eyebrow
//   27-35 nose             36-41 right eye        42-47 left eye
//   48-67 mouth (48-59 outer, 60-67 inner)
//
// "right"/"left" below refer to the subject's own right/left, i.e. the eye
// that appears on the left side of an un-mirrored video frame.

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

// Eye aspect ratio: ~0.30 open, ~0.05 closed. eye = 6 consecutive landmarks.
function eyeAspectRatio(pts, i0) {
  const p = (k) => pts[i0 + k];
  const vertical = dist(p(1), p(5)) + dist(p(2), p(4));
  const horizontal = dist(p(0), p(3)) * 2;
  if (horizontal === 0) return 0.3;
  return vertical / horizontal;
}

// Maps an EAR value to a 0 (closed) .. 1 (open) eyelid openness.
function earToOpenness(ear) {
  const CLOSED = 0.14;
  const OPEN = 0.32;
  const v = (ear - CLOSED) / (OPEN - CLOSED);
  return Math.max(0, Math.min(1, v));
}

export function extractRig(landmarks, box) {
  const pts = landmarks.positions;

  const rightEye = pts.slice(36, 42);
  const leftEye = pts.slice(42, 48);
  const rightEAR = eyeAspectRatio(pts, 36);
  const leftEAR = eyeAspectRatio(pts, 42);

  const rightEyeCenter = midpoint(rightEye[0], rightEye[3]);
  const leftEyeCenter = midpoint(leftEye[0], leftEye[3]);
  const eyeSpan = dist(rightEyeCenter, leftEyeCenter) || 1;

  // Mouth openness: inner-lip vertical gap normalized by eye span (stable
  // across distance-from-camera, unlike raw pixel distance).
  const innerTop = midpoint(pts[62], pts[61] ?? pts[62]);
  const innerBottom = midpoint(pts[66], pts[67] ?? pts[66]);
  const mouthGap = dist(innerTop, innerBottom);
  const mouthOpen = Math.max(0, Math.min(1, (mouthGap / eyeSpan - 0.02) / 0.55));

  // Smile: mouth-corner width relative to eye span, baseline ~0.95.
  const mouthWidth = dist(pts[48], pts[54]);
  const smileRaw = mouthWidth / eyeSpan - 0.95;
  const smile = Math.max(-1, Math.min(1, smileRaw / 0.35));

  // Mouth-corner lift relative to the mouth center — positive means corners
  // are higher than center (smiling), negative means a frown.
  const mouthCenterY = midpoint(pts[51], pts[57]).y;
  const cornerY = (pts[48].y + pts[54].y) / 2;
  const cornerLift = Math.max(-1, Math.min(1, ((mouthCenterY - cornerY) / eyeSpan) * 6));

  // Eyebrow raise: distance from brow to eye center, relative to eye span.
  const rightBrowY = midpoint(pts[19], pts[20]).y;
  const leftBrowY = midpoint(pts[23], pts[24]).y;
  const browGap = (rightEyeCenter.y - rightBrowY + (leftEyeCenter.y - leftBrowY)) / 2;
  const browRaise = Math.max(-1, Math.min(1, (browGap / eyeSpan - 0.42) / 0.22));

  // Head roll (tilt): angle of the line between the two eyes.
  const roll = Math.atan2(leftEyeCenter.y - rightEyeCenter.y, leftEyeCenter.x - rightEyeCenter.x);

  // Head yaw (turn): asymmetry of the nose tip between the two jaw edges.
  const noseTip = pts[30];
  const jawLeft = pts[0];
  const jawRight = pts[16];
  const jawWidth = dist(jawLeft, jawRight) || 1;
  const yaw = Math.max(-1, Math.min(1, ((noseTip.x - (jawLeft.x + jawRight.x) / 2) / jawWidth) * 2.4));

  // Head pitch (nod): nose position relative to eye line vs. jaw, rough proxy.
  const eyeMidY = midpoint(rightEyeCenter, leftEyeCenter).y;
  const chinY = pts[8].y;
  const noseRatio = (noseTip.y - eyeMidY) / (chinY - eyeMidY || 1);
  const pitch = Math.max(-1, Math.min(1, (noseRatio - 0.42) * 2.6));

  return {
    leftEyeOpen: earToOpenness(leftEAR),
    rightEyeOpen: earToOpenness(rightEAR),
    mouthOpen,
    smile,
    cornerLift,
    browRaise,
    roll,
    yaw,
    pitch,
    faceCenter: box ? { x: box.x + box.width / 2, y: box.y + box.height / 2 } : null,
    faceSize: box ? Math.max(box.width, box.height) : null,
  };
}

export const IDLE_RIG = {
  leftEyeOpen: 1,
  rightEyeOpen: 1,
  mouthOpen: 0,
  smile: 0.15,
  cornerLift: 0.15,
  browRaise: 0,
  roll: 0,
  yaw: 0,
  pitch: 0,
  faceCenter: null,
  faceSize: null,
};

// Exponentially smooth every numeric field of `target` into `current`,
// so avatar motion stays fluid even though detections arrive in bursts.
export function smoothRig(current, target, factor) {
  const out = { ...current };
  for (const key of Object.keys(IDLE_RIG)) {
    if (key === "faceCenter" || key === "faceSize") continue;
    const c = current[key] ?? 0;
    const t = target[key] ?? 0;
    out[key] = c + (t - c) * factor;
  }
  out.faceCenter = target.faceCenter || current.faceCenter;
  out.faceSize = target.faceSize || current.faceSize;
  return out;
}
