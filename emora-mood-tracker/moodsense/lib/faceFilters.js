// Procedurally-drawn filter accessories (no image assets needed) positioned
// from the live face detection box + 68-point landmarks. Coordinates are in
// the same raw video pixel space as the detection, matching how the rest of
// the scan overlay is drawn (see components/FaceScanner.js).

export const FILTERS = [
  { id: "none", label: "Tanpa filter", emoji: "✕" },
  { id: "cat", label: "Kucing", emoji: "🐱" },
  { id: "dog", label: "Anjing", emoji: "🐶" },
  { id: "rabbit", label: "Kelinci", emoji: "🐰" },
];

function earBase(box) {
  return {
    leftX: box.x + box.width * 0.22,
    rightX: box.x + box.width * 0.78,
    baseY: box.y + box.height * 0.06,
    unit: box.width,
  };
}

function earShape(ctx, cx, baseY, w, h, dir, outer, inner) {
  const tipX = cx + dir * w * 0.18;
  const tipY = baseY - h;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, baseY);
  ctx.quadraticCurveTo(cx - w * 0.1, baseY - h * 0.55, tipX, tipY);
  ctx.quadraticCurveTo(cx + w * 0.1, baseY - h * 0.55, cx + w / 2, baseY);
  ctx.closePath();
  ctx.fillStyle = outer;
  ctx.fill();
  ctx.strokeStyle = "#8E5C50";
  ctx.lineWidth = Math.max(1.5, w * 0.035);
  ctx.stroke();

  ctx.beginPath();
  const icx = cx + dir * w * 0.03;
  ctx.moveTo(icx - w * 0.18, baseY - h * 0.12);
  ctx.quadraticCurveTo(icx, baseY - h * 0.5, tipX, tipY + h * 0.22);
  ctx.quadraticCurveTo(icx + w * 0.14, baseY - h * 0.5, icx + w * 0.18, baseY - h * 0.12);
  ctx.closePath();
  ctx.fillStyle = inner;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.22, baseY - h * 0.07);
  ctx.quadraticCurveTo(cx, baseY - h * 0.26, cx + w * 0.22, baseY - h * 0.07);
  ctx.strokeStyle = "rgba(255,247,231,0.85)";
  ctx.lineWidth = Math.max(1.5, w * 0.07);
  ctx.stroke();
}

function drawCatEars(ctx, box) {
  const { leftX, rightX, baseY, unit } = earBase(box);
  const w = unit * 0.32;
  const h = w * 1.25;
  earShape(ctx, leftX, baseY, w, h, -1, "#E7AC77", "#F4B6BC");
  earShape(ctx, rightX, baseY, w, h, 1, "#E7AC77", "#F4B6BC");
}

function drawRabbitEars(ctx, box) {
  const { leftX, rightX, baseY, unit } = earBase(box);
  const w = unit * 0.16;
  const h = unit * 0.52;
  [
    [leftX, -1],
    [rightX, 1],
  ].forEach(([cx, dir]) => {
    ctx.save();
    ctx.translate(cx, baseY);
    ctx.rotate(dir * 0.08);
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.bezierCurveTo(-w / 2, -h * 0.7, -w / 2, -h, 0, -h);
    ctx.bezierCurveTo(w / 2, -h, w / 2, -h * 0.7, w / 2, 0);
    ctx.closePath();
    ctx.fillStyle = "#F4EDE4";
    ctx.fill();
    ctx.strokeStyle = "#C9A6A9";
    ctx.lineWidth = Math.max(1.5, unit * 0.009);
    ctx.stroke();

    const iw = w * 0.45;
    ctx.beginPath();
    ctx.moveTo(-iw / 2, -h * 0.08);
    ctx.bezierCurveTo(-iw / 2, -h * 0.65, -iw / 2, -h * 0.9, 0, -h * 0.92);
    ctx.bezierCurveTo(iw / 2, -h * 0.9, iw / 2, -h * 0.65, iw / 2, -h * 0.08);
    ctx.closePath();
    ctx.fillStyle = "#EFA8C4";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-iw * 0.08, -h * 0.77);
    ctx.quadraticCurveTo(-iw * 0.20, -h * 0.54, -iw * 0.08, -h * 0.26);
    ctx.strokeStyle = "rgba(255,247,247,0.72)";
    ctx.lineWidth = Math.max(1, unit * 0.01);
    ctx.stroke();
    ctx.restore();
  });
}

function drawDogEars(ctx, box) {
  const unit = box.width;
  const topY = box.y + box.height * 0.03;
  const w = unit * 0.29;
  const h = unit * 0.43;
  [
    [box.x + unit * 0.14, -1],
    [box.x + unit * 0.86, 1],
  ].forEach(([cx, dir]) => {
    ctx.save();
    ctx.translate(cx, topY);
    ctx.rotate(dir * 0.22);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(dir * w * 0.95, h * 0.12, dir * w, h * 0.72, dir * w * 0.3, h);
    ctx.bezierCurveTo(dir * w * 0.05, h * 0.82, -dir * w * 0.08, h * 0.4, 0, 0);
    ctx.closePath();
    ctx.fillStyle = "#8F5639";
    ctx.fill();
    ctx.strokeStyle = "#52372E";
    ctx.lineWidth = Math.max(1.5, unit * 0.012);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(dir * w * 0.08, h * 0.18);
    ctx.bezierCurveTo(dir * w * 0.62, h * 0.28, dir * w * 0.66, h * 0.68, dir * w * 0.26, h * 0.85);
    ctx.bezierCurveTo(dir * w * 0.1, h * 0.7, dir * w * 0.02, h * 0.4, dir * w * 0.08, h * 0.18);
    ctx.closePath();
    ctx.fillStyle = "#DCA37D";
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(dir * w * 0.38, h * 0.45, w * 0.09, h * 0.19, dir * -0.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,231,203,0.28)";
    ctx.fill();
    ctx.restore();
  });
}

function drawNoseAccessory(ctx, filterId, landmarks, unit) {
  const tip = landmarks && landmarks[33];
  if (!tip) return;
  const size = Math.max(4, unit * 0.052);
  if (filterId === "cat" || filterId === "rabbit") {
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.ellipse(tip.x + dir * unit * 0.23, tip.y + unit * 0.12, unit * 0.085, unit * 0.045, 0, 0, Math.PI * 2);
      ctx.fillStyle = filterId === "cat" ? "rgba(255,176,176,0.28)" : "rgba(246,150,192,0.32)";
      ctx.fill();
    });
    ctx.beginPath();
    ctx.moveTo(tip.x - size, tip.y - size * 0.2);
    ctx.quadraticCurveTo(tip.x, tip.y - size * 0.65, tip.x + size, tip.y - size * 0.2);
    ctx.quadraticCurveTo(tip.x, tip.y + size * 1.1, tip.x - size, tip.y - size * 0.2);
    ctx.closePath();
    ctx.fillStyle = filterId === "cat" ? "#D7838A" : "#F2A9C5";
    ctx.fill();
  } else if (filterId === "dog") {
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.ellipse(tip.x + dir * size * 1.12, tip.y + size * 0.42, size * 1.15, size * 0.85, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,234,210,0.26)";
      ctx.fill();
    });
    ctx.beginPath();
    ctx.moveTo(tip.x - size * 1.12, tip.y - size * 0.24);
    ctx.quadraticCurveTo(tip.x, tip.y - size * 0.78, tip.x + size * 1.12, tip.y - size * 0.24);
    ctx.quadraticCurveTo(tip.x + size * 0.8, tip.y + size * 0.95, tip.x, tip.y + size * 0.86);
    ctx.quadraticCurveTo(tip.x - size * 0.8, tip.y + size * 0.95, tip.x - size * 1.12, tip.y - size * 0.24);
    ctx.fillStyle = "#342C30";
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(tip.x - size * 0.33, tip.y - size * 0.22, size * 0.28, size * 0.12, -0.18, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fill();
  }
}

function drawWhiskers(ctx, landmarks, unit) {
  if (!landmarks) return;
  const left = landmarks[31];
  const right = landmarks[35];
  if (!left || !right) return;
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = Math.max(1, unit * 0.008);
  [
    [left, -1],
    [right, 1],
  ].forEach(([anchor, dir]) => {
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(anchor.x, anchor.y + i * unit * 0.025);
      ctx.lineTo(anchor.x + dir * unit * 0.19, anchor.y + i * unit * 0.05);
      ctx.stroke();
    }
  });
}

// Draws the chosen accessory onto ctx. box = detection.detection.box,
// landmarksPositions = detection.landmarks.positions (array of {x,y}).
export function drawFilter(ctx, filterId, box, landmarksPositions) {
  if (!filterId || filterId === "none" || !box) return;
  const eyeA = landmarksPositions && landmarksPositions[36] && landmarksPositions[39] && {
    x: (landmarksPositions[36].x + landmarksPositions[39].x) / 2,
    y: (landmarksPositions[36].y + landmarksPositions[39].y) / 2,
  };
  const eyeB = landmarksPositions && landmarksPositions[42] && landmarksPositions[45] && {
    x: (landmarksPositions[42].x + landmarksPositions[45].x) / 2,
    y: (landmarksPositions[42].y + landmarksPositions[45].y) / 2,
  };
  if (!eyeA || !eyeB) return;
  const left = eyeA.x < eyeB.x ? eyeA : eyeB;
  const right = eyeA.x < eyeB.x ? eyeB : eyeA;
  const centerX = (left.x + right.x) / 2;
  const centerY = (left.y + right.y) / 2;
  const eyeSpan = Math.hypot(right.x - left.x, right.y - left.y);
  const jawWidth = landmarksPositions[0] && landmarksPositions[16]
    ? Math.hypot(landmarksPositions[16].x - landmarksPositions[0].x, landmarksPositions[16].y - landmarksPositions[0].y)
    : box.width;
  const unit = Math.max(eyeSpan * 1.8, Math.min(box.width * 1.1, jawWidth * 1.1));
  const angle = Math.atan2(right.y - left.y, right.x - left.x);
  const localBox = { x: -unit / 2, y: -unit * 0.36, width: unit, height: unit };
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle);
  if (filterId === "cat") {
    drawCatEars(ctx, localBox);
  } else if (filterId === "dog") {
    drawDogEars(ctx, localBox);
  } else if (filterId === "rabbit") {
    drawRabbitEars(ctx, localBox);
  }
  ctx.restore();
  if (filterId === "cat") drawWhiskers(ctx, landmarksPositions, unit);
  drawNoseAccessory(ctx, filterId, landmarksPositions, unit);
}
