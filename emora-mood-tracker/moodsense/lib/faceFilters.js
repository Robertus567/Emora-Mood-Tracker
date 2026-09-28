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

  ctx.beginPath();
  const icx = cx + dir * w * 0.03;
  ctx.moveTo(icx - w * 0.18, baseY - h * 0.12);
  ctx.quadraticCurveTo(icx, baseY - h * 0.5, tipX, tipY + h * 0.22);
  ctx.quadraticCurveTo(icx + w * 0.14, baseY - h * 0.5, icx + w * 0.18, baseY - h * 0.12);
  ctx.closePath();
  ctx.fillStyle = inner;
  ctx.fill();
}

function drawCatEars(ctx, box) {
  const { leftX, rightX, baseY, unit } = earBase(box);
  const w = unit * 0.32;
  const h = w * 1.25;
  earShape(ctx, leftX, baseY, w, h, -1, "#C98A54", "#F3C9C9");
  earShape(ctx, rightX, baseY, w, h, 1, "#C98A54", "#F3C9C9");
}

function drawRabbitEars(ctx, box) {
  const { leftX, rightX, baseY, unit } = earBase(box);
  const w = unit * 0.16;
  const h = unit * 0.62;
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

    const iw = w * 0.45;
    ctx.beginPath();
    ctx.moveTo(-iw / 2, -h * 0.08);
    ctx.bezierCurveTo(-iw / 2, -h * 0.65, -iw / 2, -h * 0.9, 0, -h * 0.92);
    ctx.bezierCurveTo(iw / 2, -h * 0.9, iw / 2, -h * 0.65, iw / 2, -h * 0.08);
    ctx.closePath();
    ctx.fillStyle = "#EFA8C4";
    ctx.fill();
    ctx.restore();
  });
}

function drawDogEars(ctx, box) {
  const { leftX, rightX, baseY, unit } = earBase(box);
  const w = unit * 0.26;
  const h = unit * 0.5;
  [
    [leftX, -1],
    [rightX, 1],
  ].forEach(([cx, dir]) => {
    ctx.save();
    ctx.translate(cx, baseY - h * 0.15);
    ctx.rotate(dir * 0.35);
    ctx.beginPath();
    ctx.ellipse(0, h * 0.35, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#8B5E3C";
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, h * 0.35, w / 2.8, h / 2.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#C99775";
    ctx.fill();
    ctx.restore();
  });
}

function drawNoseAccessory(ctx, filterId, landmarks) {
  const tip = landmarks && landmarks[33];
  if (!tip) return;
  if (filterId === "cat" || filterId === "rabbit") {
    ctx.beginPath();
    ctx.moveTo(tip.x - 5, tip.y);
    ctx.lineTo(tip.x + 5, tip.y);
    ctx.lineTo(tip.x, tip.y + 5);
    ctx.closePath();
    ctx.fillStyle = filterId === "cat" ? "#C4432B" : "#EFA8C4";
    ctx.fill();
  } else if (filterId === "dog") {
    ctx.beginPath();
    ctx.ellipse(tip.x, tip.y + 2, 6, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#20211f";
    ctx.fill();
  }
}

function drawWhiskers(ctx, landmarks) {
  if (!landmarks) return;
  const left = landmarks[31];
  const right = landmarks[35];
  if (!left || !right) return;
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 1.4;
  [
    [left, -1],
    [right, 1],
  ].forEach(([anchor, dir]) => {
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(anchor.x, anchor.y + i * 4);
      ctx.lineTo(anchor.x + dir * 34, anchor.y + i * 9);
      ctx.stroke();
    }
  });
}

// Draws the chosen accessory onto ctx. box = detection.detection.box,
// landmarksPositions = detection.landmarks.positions (array of {x,y}).
export function drawFilter(ctx, filterId, box, landmarksPositions) {
  if (!filterId || filterId === "none" || !box) return;
  if (filterId === "cat") {
    drawCatEars(ctx, box);
    drawWhiskers(ctx, landmarksPositions);
  } else if (filterId === "dog") {
    drawDogEars(ctx, box);
  } else if (filterId === "rabbit") {
    drawRabbitEars(ctx, box);
  }
  drawNoseAccessory(ctx, filterId, landmarksPositions);
}
