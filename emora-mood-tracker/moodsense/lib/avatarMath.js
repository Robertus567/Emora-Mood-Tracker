// Turns face-api.js's 68-point landmark set + its 7-way expression
// classifier into a rich set of avatar "rig" parameters. Two layers:
//
// 1. Geometric layer (extractRig): literal, moment-to-moment physical
//    readings — eyelid openness (blink/squint), mouth-open amount, head
//    roll/yaw/pitch. These always track your real face 1:1.
//
// 2. Expression layer (expressionOverlay): face-api's own classifier
//    (happy/sad/angry/fearful/disgusted/surprised/neutral) mapped to a
//    *pose* — eyebrow angle, eye width, mouth curl/roundness/asymmetry —
//    blended by each category's confidence so mixed expressions fade
//    smoothly instead of popping between two hard-coded poses.
//
// combineRig() merges both into the final numbers the renderer consumes.
//
// Landmark indices follow the standard ibug 68-point scheme (same one
// dlib/face-api use):
//   0-16  jaw line        17-21 right eyebrow   22-26 left eyebrow
//   27-35 nose             36-41 right eye        42-47 left eye
//   48-67 mouth (48-59 outer, 60-67 inner)
// "right"/"left" refer to the subject's own right/left.

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// Eye aspect ratio: ~0.30 open, ~0.05 closed. eye = 6 consecutive landmarks.
function eyeAspectRatio(pts, i0) {
  const p = (k) => pts[i0 + k];
  const vertical = dist(p(1), p(5)) + dist(p(2), p(4));
  const horizontal = dist(p(0), p(3)) * 2;
  if (horizontal === 0) return 0.3;
  return vertical / horizontal;
}

function earToOpenness(ear) {
  const CLOSED = 0.14;
  const OPEN = 0.32;
  return clamp((ear - CLOSED) / (OPEN - CLOSED), 0, 1);
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

  const innerTop = midpoint(pts[62], pts[61] ?? pts[62]);
  const innerBottom = midpoint(pts[66], pts[67] ?? pts[66]);
  const mouthGap = dist(innerTop, innerBottom);
  const mouthOpen = clamp((mouthGap / eyeSpan - 0.02) / 0.55, 0, 1);

  const mouthWidth = dist(pts[48], pts[54]);
  const smile = clamp((mouthWidth / eyeSpan - 0.95) / 0.35, -1, 1);

  const mouthCenterY = midpoint(pts[51], pts[57]).y;
  const cornerY = (pts[48].y + pts[54].y) / 2;
  const cornerLift = clamp(((mouthCenterY - cornerY) / eyeSpan) * 6, -1, 1);

  const rightBrowY = midpoint(pts[19], pts[20]).y;
  const leftBrowY = midpoint(pts[23], pts[24]).y;
  const browGap = (rightEyeCenter.y - rightBrowY + (leftEyeCenter.y - leftBrowY)) / 2;
  const browRaise = clamp((browGap / eyeSpan - 0.42) / 0.22, -1, 1);

  const roll = Math.atan2(leftEyeCenter.y - rightEyeCenter.y, leftEyeCenter.x - rightEyeCenter.x);

  const noseTip = pts[30];
  const jawLeft = pts[0];
  const jawRight = pts[16];
  const jawWidth = dist(jawLeft, jawRight) || 1;
  const yaw = clamp(((noseTip.x - (jawLeft.x + jawRight.x) / 2) / jawWidth) * 2.4, -1, 1);

  const eyeMidY = midpoint(rightEyeCenter, leftEyeCenter).y;
  const chinY = pts[8].y;
  const noseRatio = (noseTip.y - eyeMidY) / (chinY - eyeMidY || 1);
  const pitch = clamp((noseRatio - 0.42) * 2.6, -1, 1);

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

// ---------------------------------------------------------------------
// Expression -> pose targets. Each field is the FULL-STRENGTH value that
// category contributes at score = 1.0; expressionOverlay() sums
// score * target across all 7 categories for a soft blend.
// ---------------------------------------------------------------------
const EMPTY_OVERLAY = {
  browRaise: 0,
  browInnerRaise: 0,
  browAngle: 0,
  eyeWide: 0,
  eyeSquint: 0,
  mouthCornerLift: 0,
  mouthTighten: 0,
  mouthWiden: 0,
  mouthRound: 0,
  mouthAsym: 0,
  mouthOpenBoost: 0,
  noseWrinkle: 0,
  cheekPuff: 0,
};

const EXPR_TARGETS = {
  neutral: { ...EMPTY_OVERLAY },
  happy: {
    ...EMPTY_OVERLAY,
    mouthCornerLift: 0.95,
    mouthWiden: 0.55,
    eyeSquint: 0.32,
    cheekPuff: 0.7,
    browRaise: 0.05,
  },
  sad: {
    ...EMPTY_OVERLAY,
    mouthCornerLift: -0.85,
    browInnerRaise: 0.65,
    browAngle: 0.35,
    eyeSquint: 0.12,
    mouthWiden: -0.25,
  },
  angry: {
    ...EMPTY_OVERLAY,
    browAngle: -0.95,
    browRaise: -0.25,
    eyeSquint: 0.55,
    mouthCornerLift: -0.45,
    mouthTighten: 0.65,
    mouthWiden: -0.15,
  },
  fearful: {
    ...EMPTY_OVERLAY,
    browRaise: 0.75,
    browInnerRaise: 0.5,
    eyeWide: 0.75,
    mouthCornerLift: -0.2,
    mouthWiden: 0.35,
    mouthOpenBoost: 0.2,
  },
  disgusted: {
    ...EMPTY_OVERLAY,
    mouthAsym: 0.85,
    mouthCornerLift: -0.3,
    noseWrinkle: 0.75,
    eyeSquint: 0.45,
    browAngle: -0.35,
    browRaise: -0.15,
  },
  surprised: {
    ...EMPTY_OVERLAY,
    browRaise: 1,
    eyeWide: 0.9,
    mouthOpenBoost: 0.55,
    mouthRound: 0.85,
    mouthWiden: -0.1,
  },
};

// expressions: face-api's FaceExpressions-like object, e.g.
// { neutral, happy, sad, angry, fearful, disgusted, surprised }
export function expressionOverlay(expressions) {
  const out = { ...EMPTY_OVERLAY };
  if (!expressions) return out;
  for (const key of Object.keys(EXPR_TARGETS)) {
    const score = expressions[key] || 0;
    if (score <= 0) continue;
    const target = EXPR_TARGETS[key];
    for (const field of Object.keys(EMPTY_OVERLAY)) {
      out[field] += score * target[field];
    }
  }
  return out;
}

// Merge the literal geometric rig with the expression-driven pose overlay
// into the final numbers the renderer draws. Blink/mouth-open/head-pose
// stay mostly literal (so lip-sync feels accurate); eyebrows, eye
// size/squint, and mouth shape lean on the expression classifier so
// disgust/surprise/fear/anger read clearly, not just happy/sad.
export function combineRig(rig, overlay) {
  return {
    leftEyeOpen: rig.leftEyeOpen,
    rightEyeOpen: rig.rightEyeOpen,
    eyeScale: clamp(1 + overlay.eyeWide * 0.3 - overlay.eyeSquint * 0.28, 0.72, 1.32),
    browRaise: clamp(rig.browRaise * 0.35 + overlay.browRaise * 0.8, -1, 1.2),
    browInnerRaise: clamp(overlay.browInnerRaise, -1, 1),
    browAngle: clamp(overlay.browAngle, -1, 1),
    mouthOpen: clamp(rig.mouthOpen + overlay.mouthOpenBoost * 0.5, 0, 1),
    cornerLift: clamp(rig.cornerLift * 0.45 + overlay.mouthCornerLift * 0.75, -1, 1),
    mouthTighten: clamp(overlay.mouthTighten, 0, 1),
    mouthWiden: clamp(overlay.mouthWiden, -1, 1),
    mouthRound: clamp(overlay.mouthRound, 0, 1),
    mouthAsym: clamp(overlay.mouthAsym, -1, 1),
    noseWrinkle: clamp(overlay.noseWrinkle, 0, 1),
    cheekPuff: clamp(Math.max(overlay.cheekPuff, Math.max(0, rig.cornerLift) * 0.4), 0, 1),
    roll: rig.roll,
    yaw: rig.yaw,
    pitch: rig.pitch,
  };
}
