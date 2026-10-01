// The illustrations are transparent, deliberately faceless character art.
// Canvas draws the tracked face on top in each character's own proportions.
export const CHARACTERS = [
  { id: "fox", label: "Rubah" },
  { id: "cat", label: "Kucing" },
  { id: "bear", label: "Beruang" },
  { id: "bunny", label: "Kelinci" },
  { id: "robot", label: "Robot" },
  { id: "alien", label: "Alien" },
  { id: "anime", label: "Anime" },
];

const ART = {
  fox: { eyes: [365, 635, 419], size: [61, 48], nose: [500, 546], mouth: [500, 603], ink: "#453048", iris: "#b66b2c", blush: "#ee9d92", style: "fox" },
  cat: { eyes: [365, 635, 378], size: [57, 49], nose: [500, 494], mouth: [500, 546], ink: "#624344", iris: "#499ca2", blush: "#eea3ad", style: "cat" },
  bear: { eyes: [365, 635, 381], size: [53, 48], nose: [500, 556], mouth: [500, 611], ink: "#4c322d", iris: "#7a4a37", blush: "#eaa0a0", style: "bear" },
  bunny: { eyes: [365, 635, 499], size: [63, 55], nose: [500, 614], mouth: [500, 660], ink: "#755263", iris: "#9a6aab", blush: "#f2b3c5", style: "bunny" },
  robot: { eyes: [371, 629, 320], size: [67, 63], nose: null, mouth: [500, 430], ink: "#b7f3ff", iris: "#6ee5ff", blush: null, style: "robot" },
  alien: { eyes: [362, 638, 422], size: [76, 86], nose: [500, 545], mouth: [500, 585], ink: "#254f51", iris: "#48aeb4", blush: "#e4b4d5", style: "alien" },
  anime: { eyes: [392, 608, 399], size: [44, 49], nose: [500, 483], mouth: [500, 511], ink: "#76475b", iris: "#6c9cd3", blush: "#f5a5b6", style: "anime" },
};

const imageCache = new Map();
const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function loadAvatarImage(character, onLoad) {
  if (typeof window === "undefined") return null;
  const id = typeof character === "string" ? character : character.id;
  let image = imageCache.get(id);
  if (!image) {
    image = new window.Image();
    image.decoding = "async";
    image.src = `/avatars/${id}.png`;
    imageCache.set(id, image);
  }
  if (onLoad) {
    if (image.complete && image.naturalWidth) onLoad();
    else image.addEventListener("load", onLoad, { once: true });
  }
  return image;
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fillStyle = color;
  ctx.fill();
}

function stroke(ctx, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function drawEye(ctx, x, y, rx, ry, openness, gazeX, gazeY, rig, art, side) {
  const { style, ink, iris } = art;
  const open = clamp(openness * rig.eyeScale, 0, 1.3);
  const top = y - ry * Math.max(open, 0.05);
  const bottom = y + ry * Math.max(open, 0.05);

  if (open < 0.17) {
    ctx.beginPath();
    ctx.moveTo(x - rx * 0.92, y + 5);
    ctx.quadraticCurveTo(x, y + 19, x + rx * 0.92, y + 5);
    stroke(ctx, ink, style === "anime" ? 7 : 6);
    if (style === "anime" || style === "cat" || style === "bunny") {
      ctx.beginPath();
      ctx.moveTo(x + side * rx * 0.72, y + 6);
      ctx.lineTo(x + side * rx * 1.02, y + 16);
      stroke(ctx, ink, 4);
    }
    return;
  }

  ctx.save();
  ctx.beginPath();
  if (style === "fox") {
    ctx.moveTo(x - rx, y + 3);
    ctx.quadraticCurveTo(x - rx * 0.2, top - ry * 0.36, x + rx, y - 2);
    ctx.quadraticCurveTo(x + rx * 0.35, bottom + ry * 0.23, x - rx, y + 3);
  } else {
    ctx.ellipse(x, y, rx, ry * open, 0, 0, TAU);
  }
  ctx.fillStyle = style === "robot" ? "#0c294e" : "#fffaf5";
  ctx.fill();
  stroke(ctx, style === "anime" ? "#b98a9f" : ink, style === "anime" ? 3 : 4);
  ctx.clip();

  const gx = clamp(gazeX, -1, 1) * rx * 0.34;
  const gy = clamp(gazeY, -1, 1) * ry * 0.26;
  const irisR = (style === "anime" ? 0.72 : style === "alien" ? 0.65 : style === "robot" ? 0.68 : 0.62) * Math.min(rx, ry);
  if (style === "robot") {
    ctx.shadowColor = "#76ebff";
    ctx.shadowBlur = 17;
  }
  const gradient = ctx.createRadialGradient(x + gx - irisR * 0.2, y + gy - irisR * 0.3, 3, x + gx, y + gy, irisR);
  gradient.addColorStop(0, style === "alien" ? "#a1f2df" : style === "robot" ? "#d7ffff" : "#d8edff");
  gradient.addColorStop(0.45, iris);
  gradient.addColorStop(1, style === "alien" ? "#236275" : style === "robot" ? "#31acd0" : ink);
  ellipse(ctx, x + gx, y + gy + ry * 0.07, irisR, irisR * (style === "anime" ? 1.23 : 1.03), gradient);
  ctx.shadowBlur = 0;
  if (style === "cat") {
    ellipse(ctx, x + gx, y + gy + ry * 0.08, irisR * 0.22, irisR * 0.79, "#1e333a");
  } else {
    ellipse(ctx, x + gx, y + gy + ry * 0.1, irisR * 0.44, irisR * 0.58, style === "robot" ? "#247297" : style === "alien" ? "#1c4259" : "#283350");
  }
  ellipse(ctx, x + gx - irisR * 0.3, y + gy - irisR * 0.39, irisR * 0.23, irisR * 0.24, "#ffffff");
  ellipse(ctx, x + gx + irisR * 0.28, y + gy + irisR * 0.19, irisR * 0.085, irisR * 0.09, "#ffffff");
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(x - rx * 0.94, y - ry * 0.13);
  ctx.quadraticCurveTo(x, top - ry * 0.28, x + rx * 0.94, y - ry * 0.13);
  stroke(ctx, ink, style === "anime" ? 7 : 5);
  if (style === "anime" || style === "cat") {
    for (let i = 0; i < 2; i++) {
      const lx = x + side * rx * (0.68 + i * 0.16);
      ctx.beginPath();
      ctx.moveTo(lx, y - ry * 0.47);
      ctx.lineTo(lx + side * 11, y - ry * (0.75 + i * 0.09));
      stroke(ctx, ink, style === "anime" ? 5 : 4);
    }
  }
}

function drawMouth(ctx, x, y, rig, art) {
  const { style, ink } = art;
  const smile = clamp(rig.cornerLift, -1, 1);
  const surprised = rig.mouthRound > 0.52;
  const open = clamp(rig.mouthOpen + (rig.tongueOut > 0.2 ? 0.3 : 0), 0, 1);
  const width = (style === "anime" ? 27 : style === "robot" ? 57 : style === "alien" ? 49 : 45) *
    (1 + rig.mouthWiden * 0.26 - rig.mouthTighten * 0.15);
  const mouthHeight = 12 + open * (style === "anime" ? 34 : 40);
  const isOpen = open > 0.21 || smile > 0.35 || surprised;

  if (style === "robot") {
    ctx.shadowColor = "#69e8ff";
    ctx.shadowBlur = 13;
  }

  if (isOpen) {
    ctx.beginPath();
    if (surprised) {
      ctx.ellipse(x, y + 8, width * 0.54, mouthHeight + 7, 0, 0, TAU);
    } else {
      ctx.moveTo(x - width, y - 7);
      ctx.quadraticCurveTo(x, y + 5 - smile * 5, x + width, y - 7);
      ctx.quadraticCurveTo(x + width * 0.76, y + mouthHeight * 1.5, x, y + mouthHeight * 1.55);
      ctx.quadraticCurveTo(x - width * 0.76, y + mouthHeight * 1.5, x - width, y - 7);
    }
    ctx.closePath();
    ctx.fillStyle = style === "robot" ? "#12364c" : "#7c3d50";
    ctx.fill();
    stroke(ctx, ink, 4);
    ctx.shadowBlur = 0;
    if (style !== "robot" && !surprised) {
      ctx.save();
      ctx.clip();
      ctx.beginPath();
      ctx.ellipse(x, y - 2, width * 0.68, 10, 0, 0, TAU);
      ctx.fillStyle = "#fff8eb";
      ctx.fill();
      ellipse(ctx, x, y + mouthHeight * 1.42, width * 0.63, 14, "#ef8d9d");
      ctx.restore();
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(x - width, y + (smile < 0 ? 11 : 0));
    ctx.quadraticCurveTo(x, y + (smile >= 0 ? 20 * smile : -28 * Math.abs(smile)), x + width, y + (smile < 0 ? 11 : 0));
    stroke(ctx, ink, style === "anime" ? 5 : 6);
    ctx.shadowBlur = 0;
  }

  if (rig.tongueOut > 0.2 && style !== "robot") {
    const length = 21 + rig.tongueOut * 35;
    ctx.beginPath();
    ctx.moveTo(x - 18, y + 24);
    ctx.quadraticCurveTo(x - 19, y + length, x, y + length + 4);
    ctx.quadraticCurveTo(x + 19, y + length, x + 18, y + 24);
    ctx.closePath();
    ctx.fillStyle = "#f38eaa";
    ctx.fill();
    stroke(ctx, "#a65372", 3);
    ctx.beginPath();
    ctx.moveTo(x, y + length - 15);
    ctx.lineTo(x, y + length + 1);
    stroke(ctx, "#d76587", 2);
  }
}

function drawFace(ctx, rig, art) {
  const [leftX, rightX, eyeY] = art.eyes;
  const [eyeRX, eyeRY] = art.size;
  const yaw = clamp(rig.yaw, -1, 1);
  const faceShift = yaw * 18;
  const gazeX = rig.gazeX ?? 0;
  const gazeY = rig.gazeY ?? 0;
  const yShift = clamp(rig.pitch, -1, 1) * 10;
  const blushOpacity = clamp(0.14 + rig.cheekPuff * 0.15, 0.14, 0.29);

  if (art.blush) {
    ctx.save();
    ctx.globalAlpha = blushOpacity;
    for (const blushX of [leftX - 66 + faceShift, rightX + 66 + faceShift]) {
      const blushY = eyeY + 91 + yShift;
      const gradient = ctx.createRadialGradient(blushX, blushY, 4, blushX, blushY, 53);
      gradient.addColorStop(0, art.blush);
      gradient.addColorStop(1, "#ffffff00");
      ellipse(ctx, blushX, blushY, 53, 33, gradient);
    }
    ctx.restore();
  }

  drawEye(ctx, leftX + faceShift, eyeY + yShift, eyeRX, eyeRY, rig.leftEyeOpen, gazeX, gazeY, rig, art, -1);
  drawEye(ctx, rightX + faceShift, eyeY + yShift, eyeRX, eyeRY, rig.rightEyeOpen, gazeX, gazeY, rig, art, 1);

  const expression = Math.max(Math.abs(rig.browAngle), Math.abs(rig.browInnerRaise), Math.abs(rig.browRaise));
  if (expression > 0.14 && art.style !== "robot") {
    ctx.save();
    ctx.globalAlpha = Math.min(0.8, expression * 0.85);
    for (const side of [-1, 1]) {
      const bx = side < 0 ? leftX : rightX;
      const inner = side < 0 ? 1 : -1;
      const by = eyeY - eyeRY - 39 - rig.browRaise * 15;
      ctx.beginPath();
      ctx.moveTo(bx - 34 + faceShift, by + rig.browAngle * inner * 13);
      ctx.quadraticCurveTo(bx + faceShift, by - rig.browInnerRaise * 14, bx + 34 + faceShift, by - rig.browAngle * inner * 13);
      stroke(ctx, art.ink, art.style === "anime" ? 4 : 5);
    }
    ctx.restore();
  }

  if (art.nose) {
    const [nx, ny] = art.nose;
    const noseX = nx + faceShift * 0.8;
    const noseY = ny + yShift;
    if (art.style === "anime") {
      ctx.beginPath();
      ctx.moveTo(noseX + 1, noseY - 5);
      ctx.lineTo(noseX - 5, noseY + 5);
      stroke(ctx, "#dc9ba1", 3);
    } else if (art.style === "alien") {
      ellipse(ctx, noseX - 11, noseY, 3, 2.5, art.ink);
      ellipse(ctx, noseX + 11, noseY, 3, 2.5, art.ink);
    } else {
      ctx.beginPath();
      ctx.moveTo(noseX - 16, noseY - 5);
      ctx.quadraticCurveTo(noseX, noseY - 12, noseX + 16, noseY - 5);
      ctx.quadraticCurveTo(noseX + 3, noseY + 15, noseX, noseY + 15);
      ctx.quadraticCurveTo(noseX - 3, noseY + 15, noseX - 16, noseY - 5);
      ctx.fillStyle = art.style === "bunny" ? "#e995a9" : art.style === "cat" ? "#c98486" : "#65414a";
      ctx.fill();
      ellipse(ctx, noseX - 4, noseY - 6, 5, 2, "#ffffff88");
      ctx.beginPath();
      ctx.moveTo(noseX, noseY + 13);
      ctx.lineTo(noseX, noseY + 26);
      stroke(ctx, art.ink, 3);
    }
  }

  drawMouth(ctx, art.mouth[0] + faceShift, art.mouth[1] + yShift, rig, art);

  if (art.style === "cat" || art.style === "fox" || art.style === "bunny") {
    ctx.save();
    ctx.globalAlpha = 0.45;
    for (const side of [-1, 1]) {
      for (let row = 0; row < 2; row++) {
        ctx.beginPath();
        const startX = 500 + side * 65 + faceShift;
        const startY = art.nose[1] + 28 + row * 19 + yShift;
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(startX + side * 54, startY - 13 + row * 4, startX + side * 104, startY - 18 + row * 11);
        stroke(ctx, art.ink, 2.8);
      }
    }
    ctx.restore();
  }
}

export function drawAvatar(ctx, width, height, rig, character) {
  ctx.clearRect(0, 0, width, height);
  const art = ART[character?.id || "fox"];
  const image = loadAvatarImage(character);
  if (!art || !image?.complete || !image.naturalWidth) return;

  const scale = Math.min((width * 0.75) / image.naturalWidth, (height * 1.08) / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const centerX = width / 2 + clamp(rig.yaw, -1, 1) * drawWidth * 0.028;
  const top = height * 0.01;
  ctx.save();
  ctx.translate(centerX, top + drawHeight * 0.48);
  ctx.rotate(clamp(rig.roll, -0.55, 0.55) * 0.68);
  ctx.scale(1 - Math.abs(rig.yaw) * 0.055, 1);
  ctx.translate(-drawWidth / 2, -drawHeight * 0.48);
  ctx.scale(drawWidth / 1000, drawHeight / 1000);
  ctx.drawImage(image, 0, 0, 1000, 1000);
  drawFace(ctx, rig, art);
  ctx.restore();
}
