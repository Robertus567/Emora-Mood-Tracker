// Draws a simple chibi "VTuber" avatar on a canvas, driven entirely by the
// normalized rig parameters from lib/avatarMath.js. Pure canvas 2D, no
// external art assets — every shape is procedural so it costs nothing to
// re-skin or resize.

export const CHARACTERS = [
  { id: "fox", label: "Rubah", emoji: "🦊", skinA: "#F6B571", skinB: "#E38A3E", cheek: "#F2A0A0", ear: "fox" },
  { id: "cat", label: "Kucing", emoji: "🐱", skinA: "#EFE1CF", skinB: "#D9C3A6", cheek: "#F3A9B7", ear: "cat" },
  { id: "bear", label: "Beruang", emoji: "🐻", skinA: "#B9895F", skinB: "#8E5E39", cheek: "#E29999", ear: "bear" },
  { id: "bunny", label: "Kelinci", emoji: "🐰", skinA: "#FBF3E9", skinB: "#EEDFCB", cheek: "#F3ACC9", ear: "bunny" },
  { id: "robot", label: "Robot", emoji: "🤖", skinA: "#D7DEE8", skinB: "#9AA7BA", cheek: null, ear: "robot" },
  { id: "alien", label: "Alien", emoji: "👽", skinA: "#9BE3BE", skinB: "#5CB48A", cheek: "#C6F0D9", ear: "alien" },
];

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function drawEars(ctx, headR, character, t) {
  const sway = Math.sin(t / 900) * 0.06;
  ctx.save();
  if (character.ear === "cat" || character.ear === "fox") {
    const pointy = character.ear === "fox";
    const w = headR * (pointy ? 0.52 : 0.46);
    const h = headR * (pointy ? 0.78 : 0.62);
    [-1, 1].forEach((dir) => {
      const cx = dir * headR * 0.58;
      const baseY = -headR * 0.62;
      ctx.save();
      ctx.translate(cx, baseY);
      ctx.rotate(dir * 0.12 + sway * dir);
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.quadraticCurveTo(-w * 0.12, -h * 0.6, dir * w * 0.1, -h);
      ctx.quadraticCurveTo(w * 0.12, -h * 0.6, w / 2, 0);
      ctx.closePath();
      ctx.fillStyle = character.skinB;
      ctx.fill();
      ctx.beginPath();
      const iw = w * 0.5;
      const ih = h * 0.62;
      ctx.moveTo(-iw / 2, -h * 0.1);
      ctx.quadraticCurveTo(-iw * 0.1, -ih, dir * iw * 0.08, -h * 0.92);
      ctx.quadraticCurveTo(iw * 0.1, -ih, iw / 2, -h * 0.1);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fill();
      ctx.restore();
    });
  } else if (character.ear === "bear") {
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.arc(dir * headR * 0.66, -headR * 0.66, headR * 0.26, 0, Math.PI * 2);
      ctx.fillStyle = character.skinB;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(dir * headR * 0.66, -headR * 0.66, headR * 0.14, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fill();
    });
  } else if (character.ear === "bunny") {
    const w = headR * 0.3;
    const h = headR * 1.15;
    [-1, 1].forEach((dir) => {
      ctx.save();
      ctx.translate(dir * headR * 0.42, -headR * 0.58);
      ctx.rotate(dir * 0.1 + sway * dir * 1.4);
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.bezierCurveTo(-w / 2, -h * 0.7, -w / 2, -h, 0, -h);
      ctx.bezierCurveTo(w / 2, -h, w / 2, -h * 0.7, w / 2, 0);
      ctx.closePath();
      ctx.fillStyle = character.skinA;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 2;
      ctx.stroke();
      const iw = w * 0.42;
      ctx.beginPath();
      ctx.moveTo(-iw / 2, -h * 0.1);
      ctx.bezierCurveTo(-iw / 2, -h * 0.62, -iw / 2, -h * 0.88, 0, -h * 0.9);
      ctx.bezierCurveTo(iw / 2, -h * 0.88, iw / 2, -h * 0.62, iw / 2, -h * 0.1);
      ctx.closePath();
      ctx.fillStyle = "#EFA8C4";
      ctx.fill();
      ctx.restore();
    });
  } else if (character.ear === "robot") {
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.arc(dir * headR * 0.98, -headR * 0.05, headR * 0.16, 0, Math.PI * 2);
      ctx.fillStyle = character.skinB;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(dir * headR * 0.98, -headR * 0.05, headR * 0.07, 0, Math.PI * 2);
      const pulse = 0.5 + 0.5 * Math.sin(t / 260);
      ctx.fillStyle = `rgba(233,165,68,${0.5 + pulse * 0.5})`;
      ctx.fill();
    });
    // antenna
    ctx.beginPath();
    ctx.moveTo(0, -headR * 0.92);
    ctx.lineTo(0, -headR * 1.28);
    ctx.strokeStyle = character.skinB;
    ctx.lineWidth = headR * 0.045;
    ctx.stroke();
    const pulse = 0.5 + 0.5 * Math.sin(t / 300);
    ctx.beginPath();
    ctx.arc(0, -headR * 1.32, headR * 0.09, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(224,138,43,${0.7 + pulse * 0.3})`;
    ctx.shadowColor = "rgba(224,138,43,0.8)";
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (character.ear === "alien") {
    ctx.beginPath();
    ctx.moveTo(-headR * 0.14, -headR * 0.9);
    ctx.quadraticCurveTo(-headR * 0.4, -headR * 1.3, -headR * 0.32, -headR * 1.5);
    ctx.strokeStyle = character.skinB;
    ctx.lineWidth = headR * 0.05;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(headR * 0.14, -headR * 0.9);
    ctx.quadraticCurveTo(headR * 0.4, -headR * 1.3, headR * 0.32, -headR * 1.5);
    ctx.stroke();
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.arc(dir * headR * 0.32, -headR * 1.5, headR * 0.07, 0, Math.PI * 2);
      ctx.fillStyle = character.skinB;
      ctx.fill();
    });
  }
  ctx.restore();
}

function drawEyebrows(ctx, headR, rig) {
  const raise = clamp(rig.browRaise, -1, 1);
  const worry = clamp(-rig.cornerLift, -1, 1) * 0.5;
  ctx.strokeStyle = "rgba(30,22,14,0.78)";
  ctx.lineWidth = headR * 0.05;
  ctx.lineCap = "round";
  [-1, 1].forEach((dir) => {
    const ex = dir * headR * 0.34;
    const ey = -headR * (0.16 + raise * 0.09);
    ctx.beginPath();
    ctx.moveTo(ex - headR * 0.16, ey + worry * dir * headR * 0.05);
    ctx.quadraticCurveTo(ex, ey - headR * 0.06 - raise * headR * 0.04, ex + headR * 0.16, ey - worry * dir * headR * 0.02);
    ctx.stroke();
  });
}

function drawEyes(ctx, headR, rig) {
  const rx = headR * 0.155;
  const ry = headR * 0.185;
  const pupilR = headR * 0.07;
  const lookX = clamp(rig.yaw, -1, 1) * (rx - pupilR) * 0.7;
  const lookY = clamp(rig.pitch, -1, 1) * (ry - pupilR) * 0.5;

  [-1, 1].forEach((dir) => {
    const ex = dir * headR * 0.34;
    const ey = -headR * 0.02;
    const openness = dir === -1 ? clamp(rig.rightEyeOpen, 0.06, 1) : clamp(rig.leftEyeOpen, 0.06, 1);

    ctx.save();
    ctx.translate(ex, ey);
    ctx.scale(1, openness);

    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFDF8";
    ctx.fill();
    ctx.lineWidth = headR * 0.02;
    ctx.strokeStyle = "rgba(30,22,14,0.5)";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(lookX, lookY, pupilR, 0, Math.PI * 2);
    ctx.fillStyle = "#221812";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(lookX - pupilR * 0.35, lookY - pupilR * 0.4, pupilR * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();

    ctx.restore();
  });
}

function drawMouth(ctx, headR, rig) {
  const smile = clamp(rig.smile, -1, 1);
  const cornerLift = clamp(rig.cornerLift, -1, 1);
  const open = clamp(rig.mouthOpen, 0, 1);

  const baseY = headR * 0.42;
  const halfW = headR * (0.2 + Math.max(0, smile) * 0.08 + open * 0.02);
  const cornerYOff = -cornerLift * headR * 0.14;
  const bowDir = cornerLift >= 0 ? 1 : -1;
  const bow = headR * (0.08 + Math.abs(cornerLift) * 0.16);
  const openHalf = open * headR * 0.14;

  const cornerY = baseY + cornerYOff;
  const upperCtrlY = baseY + cornerYOff + bowDir * bow - openHalf * 0.6;
  const lowerCtrlY = baseY + cornerYOff + bowDir * bow + openHalf * 1.3 + open * headR * 0.05;

  ctx.beginPath();
  ctx.moveTo(-halfW, cornerY);
  ctx.quadraticCurveTo(0, upperCtrlY, halfW, cornerY);
  ctx.quadraticCurveTo(0, lowerCtrlY, -halfW, cornerY);
  ctx.closePath();
  ctx.fillStyle = open > 0.16 ? "rgba(94,28,28,0.88)" : "rgba(35,22,16,0.72)";
  ctx.fill();

  if (open > 0.3) {
    ctx.beginPath();
    ctx.ellipse(0, baseY + cornerYOff + openHalf * 0.55, halfW * 0.42, openHalf * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(224,120,130,0.85)";
    ctx.fill();
  }
}

export function drawAvatar(ctx, width, height, rig, character, time = 0) {
  ctx.clearRect(0, 0, width, height);
  const cx = width / 2;
  const cy = height * 0.56;
  const headR = Math.min(width, height) * 0.32;

  const roll = clamp(rig.roll || 0, -0.5, 0.5);
  const yaw = clamp(rig.yaw || 0, -1, 1);
  const pitch = clamp(rig.pitch || 0, -1, 1);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(roll);
  ctx.scale(1 - Math.abs(yaw) * 0.1, 1 - Math.abs(pitch) * 0.06);
  ctx.translate(yaw * headR * 0.16, pitch * headR * 0.1 + Math.sin(time / 1400) * headR * 0.015);

  drawEars(ctx, headR, character, time);

  // head base
  const grad = ctx.createRadialGradient(-headR * 0.3, -headR * 0.35, headR * 0.1, 0, 0, headR * 1.05);
  grad.addColorStop(0, character.skinA);
  grad.addColorStop(1, character.skinB);
  ctx.beginPath();
  ctx.arc(0, 0, headR, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  if (character.cheek) {
    const cheekOpacity = 0.35 + clamp(rig.smile, 0, 1) * 0.3;
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.ellipse(dir * headR * 0.56, headR * 0.22, headR * 0.16, headR * 0.1, 0, 0, Math.PI * 2);
      ctx.fillStyle = character.cheek;
      ctx.globalAlpha = cheekOpacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  drawEyebrows(ctx, headR, rig);
  drawEyes(ctx, headR, rig);
  drawMouth(ctx, headR, rig);

  ctx.restore();
}
