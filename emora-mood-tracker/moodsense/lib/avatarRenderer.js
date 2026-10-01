// Draws a chibi avatar on canvas, driven by the combined rig from
// lib/avatarMath.js (geometric blink/mouth-open/head-pose + expression-
// classifier-driven brow/eye/mouth pose). Pure canvas 2D, procedural —
// each character defines its own eye/brow/mouth "style" so species read as
// genuinely different characters, not just a recolored circle with ears.

export const CHARACTERS = [
  {
    id: "fox",
    label: "Rubah",
    emoji: "🦊",
    skinA: "#F6B571",
    skinB: "#E38A3E",
    cheek: "#F2A0A0",
    ear: "fox",
    eye: "almond",
    brow: "expressive",
    mouth: "muzzle",
    muzzle: "#FBE3C4",
    nose: "#3A2418",
  },
  {
    id: "cat",
    label: "Kucing",
    emoji: "🐱",
    skinA: "#EFE1CF",
    skinB: "#D9C3A6",
    cheek: "#F3A9B7",
    ear: "cat",
    eye: "slit",
    brow: "expressive",
    mouth: "default",
    whiskers: true,
    nose: "#C4432B",
  },
  {
    id: "bear",
    label: "Beruang",
    emoji: "🐻",
    skinA: "#B9895F",
    skinB: "#8E5E39",
    cheek: "#E29999",
    ear: "bear",
    eye: "round",
    brow: "expressive",
    mouth: "muzzle",
    muzzle: "#E7C9A6",
    nose: "#2A1B12",
  },
  {
    id: "bunny",
    label: "Kelinci",
    emoji: "🐰",
    skinA: "#FBF3E9",
    skinB: "#EEDFCB",
    cheek: "#F3ACC9",
    ear: "bunny",
    eye: "anime",
    brow: "expressive",
    mouth: "teeth",
    nose: "#EFA8C4",
  },
  {
    id: "robot",
    label: "Robot",
    emoji: "🤖",
    skinA: "#D7DEE8",
    skinB: "#9AA7BA",
    cheek: null,
    ear: "robot",
    eye: "visor",
    brow: "none",
    mouth: "speaker",
    accent: "#E9A544",
  },
  {
    id: "alien",
    label: "Alien",
    emoji: "👽",
    skinA: "#9BE3BE",
    skinB: "#5CB48A",
    cheek: "#C6F0D9",
    ear: "alien",
    eye: "void",
    brow: "expressive",
    mouth: "slit",
    noWrinkle: true,
  },
  {
    id: "anime",
    label: "Anime",
    emoji: "🌸",
    skinA: "#FFE7D7",
    skinB: "#F1BDAF",
    cheek: "#F28CA1",
    ear: "anime",
    eye: "anime",
    brow: "expressive",
    mouth: "anime",
    accent: "#8C64B8",
  },
];

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// ---------------------------------------------------------------------
// Ears (drawn behind the head)
// ---------------------------------------------------------------------
function drawEars(ctx, headR, character, t) {
  const sway = Math.sin(t / 900) * 0.06;
  ctx.save();
  if (character.ear === "cat" || character.ear === "fox") {
    const pointy = character.ear === "fox";
    const w = headR * (pointy ? 0.5 : 0.46);
    const h = headR * (pointy ? 0.76 : 0.62);
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
      ctx.fillStyle = pointy ? "#F8D5CC" : "#F0A9AF";
      ctx.fill();
      if (pointy) {
        ctx.beginPath();
        ctx.moveTo(-w * 0.30, -h * 0.55);
        ctx.quadraticCurveTo(-w * 0.12, -h * 0.96, dir * w * 0.1, -h);
        ctx.quadraticCurveTo(w * 0.16, -h * 0.72, w * 0.30, -h * 0.52);
        ctx.quadraticCurveTo(0, -h * 0.68, -w * 0.30, -h * 0.55);
        ctx.fillStyle = "#18223D";
        ctx.fill();
      }
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
  } else if (character.ear === "anime") {
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.moveTo(dir * headR * 0.45, -headR * 0.92);
      ctx.lineTo(dir * headR * 0.72, -headR * 1.53);
      ctx.lineTo(dir * headR * 1.02, -headR * 0.86);
      ctx.closePath();
      ctx.fillStyle = "#FFF5EE";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(dir * headR * 0.63, -headR * 1.03);
      ctx.lineTo(dir * headR * 0.72, -headR * 1.39);
      ctx.lineTo(dir * headR * 0.88, -headR * 1.01);
      ctx.closePath();
      ctx.fillStyle = "#F6B4C9";
      ctx.fill();
    });
    ctx.beginPath();
    ctx.ellipse(0, -headR * 0.02, headR * 1.06, headR * 1.20, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#ECA4C0";
    ctx.fill();
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.moveTo(dir * headR * 0.73, -headR * 0.55);
      ctx.quadraticCurveTo(dir * headR * 1.30, headR * 0.36, dir * headR * 1.16, headR * 1.80);
      ctx.quadraticCurveTo(dir * headR * 0.55, headR * 1.58, dir * headR * 0.73, -headR * 0.55);
      ctx.fillStyle = "#F5B6CE";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(dir * headR * 0.89, -headR * 0.2);
      ctx.quadraticCurveTo(dir * headR * 1.12, headR * 0.60, dir * headR * 0.99, headR * 1.53);
      ctx.strokeStyle = "#D88BAF";
      ctx.lineWidth = headR * 0.035;
      ctx.stroke();
    });
  }
  ctx.restore();
}

// ---------------------------------------------------------------------
// Eyebrows — angled/thin/round/soft/ridge/none, all driven by
// browRaise (overall height), browInnerRaise (worry) and browAngle
// (furrow vs. droop).
// ---------------------------------------------------------------------
function drawEyebrows(ctx, headR, rig, character) {
  if (character.brow === "none") return;
  if (character.brow === "expressive" &&
      Math.abs(rig.browAngle) + Math.abs(rig.browRaise) + Math.abs(rig.browInnerRaise) < 0.22) return;

  const baseY = -headR * (0.43 + rig.browRaise * 0.1);
  const innerYOff = -rig.browInnerRaise * headR * 0.08;
  const outerYOff = rig.browAngle * headR * 0.09;

  ctx.lineCap = "round";

  if (character.brow === "ridge") {
    // Alien: barely-there ridge, same tone as the skin, just a hint of motion.
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = headR * 0.02;
    [-1, 1].forEach((dir) => {
      const ex = dir * headR * 0.32;
      ctx.beginPath();
      ctx.moveTo(ex - headR * 0.1, baseY + outerYOff * 0.4);
      ctx.quadraticCurveTo(ex, baseY - headR * 0.03 + innerYOff * 0.3, ex + headR * 0.1, baseY + innerYOff * 0.4);
      ctx.stroke();
    });
    return;
  }

  const widthK = character.brow === "round" ? 0.14 : character.brow === "soft" ? 0.12 : 0.17;
  const thickness = character.brow === "expressive" ? 0.025 : character.brow === "round" ? 0.045 : 0.033;

  ctx.strokeStyle = character.id === "fox" ? "#8C3C27" : character.id === "cat" ? "#9B684D" : "rgba(55,35,35,0.72)";
  ctx.lineWidth = headR * thickness;

  [-1, 1].forEach((dir) => {
    const ex = dir * headR * 0.34;
    const outer = { x: ex + dir * headR * widthK, y: baseY + outerYOff };
    const inner = { x: ex - dir * headR * widthK, y: baseY + innerYOff };
    ctx.beginPath();
    if (character.brow === "angled") {
      // Sharp, sleek — nearly straight with a crisp peak (fox).
      const peak = { x: ex, y: baseY - headR * 0.03 + (innerYOff + outerYOff) / 4 };
      ctx.moveTo(outer.x, outer.y);
      ctx.lineTo(peak.x, peak.y);
      ctx.lineTo(inner.x, inner.y);
    } else if (character.brow === "round") {
      ctx.moveTo(outer.x, outer.y);
      ctx.quadraticCurveTo(ex, baseY - headR * 0.07, inner.x, inner.y);
    } else if (character.brow === "soft") {
      ctx.moveTo(outer.x, outer.y);
      ctx.quadraticCurveTo(ex, baseY - headR * 0.02, inner.x, inner.y);
    } else {
      // thin (cat)
      ctx.moveTo(outer.x, outer.y);
      ctx.quadraticCurveTo(ex, baseY - headR * 0.045, inner.x, inner.y);
    }
    ctx.stroke();
  });
}

// ---------------------------------------------------------------------
// Eyes — almond/slit/round/anime/visor/void, each with its own pupil
// treatment. eyeScale = overall size (wide for surprise/fear, small for
// squint/disgust/anger); openness = literal blink from eyelid landmarks.
// ---------------------------------------------------------------------
function drawEyes(ctx, headR, rig, character) {
  if (character.eye === "visor") {
    drawVisorEyes(ctx, headR, rig, character);
    return;
  }

  const baseRX = character.id === "anime" ? 0.215 : character.eye === "anime" ? 0.19 : character.eye === "round" ? 0.15 : character.eye === "void" ? 0.21 : character.eye === "slit" ? 0.18 : 0.175;
  const baseRY = character.id === "anime" ? 0.25 : character.eye === "anime" ? 0.225 : character.eye === "round" ? 0.16 : character.eye === "void" ? 0.26 : character.eye === "slit" ? 0.21 : 0.20;
  const rx = headR * baseRX * rig.eyeScale;
  const ry = headR * baseRY * rig.eyeScale;
  const pupilR = headR * (character.eye === "anime" ? 0.085 : 0.07);
  const lookX = clamp(rig.gazeX ?? rig.yaw, -1, 1) * Math.max(rx - pupilR, headR * 0.04) * 0.9;
  const lookY = clamp(rig.gazeY ?? rig.pitch, -1, 1) * Math.max(ry - pupilR, headR * 0.04) * 0.75;

  [-1, 1].forEach((dir) => {
    const ex = dir * headR * (character.eye === "anime" ? 0.32 : 0.34);
    const ey = -headR * 0.02;
    const openness =
      dir === -1 ? clamp(rig.rightEyeOpen, 0.06, 1) : clamp(rig.leftEyeOpen, 0.06, 1);

    ctx.save();
    ctx.translate(ex, ey);
    ctx.scale(1, openness);

    if (character.eye === "void") {
      // Alien: near-solid black teardrop, minimal white.
      ctx.beginPath();
      ctx.moveTo(0, -ry);
      ctx.bezierCurveTo(rx, -ry * 0.6, rx * 0.9, ry * 0.7, 0, ry);
      ctx.bezierCurveTo(-rx * 0.9, ry * 0.7, -rx, -ry * 0.6, 0, -ry);
      ctx.closePath();
      ctx.fillStyle = "#0C0C10";
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(lookX * 0.7, lookY * 0.7, pupilR * 0.9, pupilR * 1.25, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#4CE5C1";
      ctx.globalAlpha = 0.5;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.ellipse(lookX * 0.5 - rx * 0.25, lookY * 0.5 - ry * 0.35, pupilR * 0.4, pupilR * 0.55, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.beginPath();
    if (character.eye === "almond") {
      ctx.moveTo(-rx, 0);
      ctx.quadraticCurveTo(-rx * 0.3, -ry * 1.05, rx, -ry * 0.15);
      ctx.quadraticCurveTo(rx * 0.4, ry * 0.85, -rx, 0);
    } else {
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    }
    ctx.fillStyle = character.eye === "anime" ? "#FFFFFF" : "#FFFDF8";
    ctx.fill();
    ctx.lineWidth = headR * 0.02;
    ctx.strokeStyle = "rgba(30,22,14,0.5)";
    ctx.stroke();

    if (character.eye === "almond" || character.eye === "slit" || character.id === "anime") {
      // Outer lashes follow each eye's own outer corner.
      ctx.beginPath();
      ctx.moveTo(dir * rx * 0.96, -ry * 0.10);
      ctx.quadraticCurveTo(dir * rx * 1.12, -ry * 0.20, dir * rx * 1.22, -ry * 0.37);
      ctx.lineWidth = headR * 0.016;
      ctx.strokeStyle = "rgba(20,14,10,0.75)";
      ctx.lineCap = "round";
      ctx.stroke();
    }
    if (character.id === "anime") {
      ctx.beginPath();
      ctx.moveTo(-rx * 0.92, -ry * 0.25);
      ctx.quadraticCurveTo(0, -ry * 1.28, rx * 0.92, -ry * 0.25);
      ctx.strokeStyle = "#4A3853";
      ctx.lineWidth = headR * 0.032;
      ctx.stroke();
    }

    if (character.eye === "slit") {
      // cat: tall vertical slit pupil instead of a round one
      ctx.beginPath();
      ctx.ellipse(lookX, lookY, pupilR * 1.12, pupilR * 1.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#59AFC6";
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(lookX, lookY, pupilR * 0.34, pupilR * 1.15, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#1B140E";
      ctx.fill();
    } else if (character.eye === "anime") {
      // bunny: big iris + pupil + double highlight
      ctx.beginPath();
      ctx.arc(lookX, lookY, pupilR * 1.15, 0, Math.PI * 2);
      ctx.fillStyle = character.id === "anime" ? "#4A96D1" : "#AD6698";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lookX, lookY, pupilR * 0.62, 0, Math.PI * 2);
      ctx.fillStyle = character.id === "anime" ? "#202C5B" : "#241118";
      ctx.fill();
      if (character.id === "anime") {
        ctx.beginPath();
        ctx.ellipse(lookX, lookY + pupilR * 0.57, pupilR * 0.65, pupilR * 0.29, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#A0E6F4";
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(lookX - pupilR * 0.5, lookY - pupilR * 0.6, pupilR * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lookX + pupilR * 0.35, lookY + pupilR * 0.3, pupilR * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fill();
      ctx.restore();
      return;
    } else {
      ctx.beginPath();
      ctx.arc(lookX, lookY, pupilR * 1.28, 0, Math.PI * 2);
      ctx.fillStyle = character.id === "fox" ? "#EFCB54" : "#8B593D";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lookX, lookY, pupilR, 0, Math.PI * 2);
      ctx.fillStyle = "#221812";
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(lookX - pupilR * 0.35, lookY - pupilR * 0.4, pupilR * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();

    ctx.restore();
  });
}

function drawVisorEyes(ctx, headR, rig, character) {
  const accent = character.accent || "#E9A544";
  const w = headR * 0.26 * rig.eyeScale;
  const h = headR * 0.16 * rig.eyeScale;
  const lookX = clamp(rig.yaw, -1, 1) * headR * 0.05;

  [-1, 1].forEach((dir) => {
    const ex = dir * headR * 0.34 + lookX;
    const ey = -headR * 0.02;
    const openness = dir === -1 ? clamp(rig.rightEyeOpen, 0.08, 1) : clamp(rig.leftEyeOpen, 0.08, 1);

    ctx.save();
    ctx.translate(ex, ey);
    const r = h * 0.3;
    const hh = Math.max(h * 0.16, h * openness);
    ctx.beginPath();
    ctx.moveTo(-w / 2 + r, -hh / 2);
    ctx.arcTo(w / 2, -hh / 2, w / 2, hh / 2, r);
    ctx.arcTo(w / 2, hh / 2, -w / 2, hh / 2, r);
    ctx.arcTo(-w / 2, hh / 2, -w / 2, -hh / 2, r);
    ctx.arcTo(-w / 2, -hh / 2, w / 2, -hh / 2, r);
    ctx.closePath();
    ctx.fillStyle = "rgba(20,22,26,0.55)";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-w / 2 + r, -hh / 2 + hh * 0.15);
    ctx.arcTo(w / 2 - 1, -hh / 2 + hh * 0.15, w / 2 - 1, hh / 2 - hh * 0.15, r * 0.8);
    ctx.arcTo(w / 2 - 1, hh / 2 - hh * 0.15, -w / 2 + r, hh / 2 - hh * 0.15, r * 0.8);
    ctx.arcTo(-w / 2 + 1, hh / 2 - hh * 0.15, -w / 2 + 1, -hh / 2 + hh * 0.15, r * 0.8);
    ctx.closePath();
    ctx.fillStyle = accent;
    ctx.shadowColor = accent;
    ctx.shadowBlur = openness > 0.3 ? headR * 0.1 : 0;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  });
}

// ---------------------------------------------------------------------
// Mouth — default/muzzle/teeth/speaker/slit, all reacting to open amount,
// corner lift, roundness (surprise "O"), asymmetry (disgust sneer) and
// tighten (anger).
// ---------------------------------------------------------------------
function drawCharacterMouth(ctx, headR, rig, character) {
  const r = headR;
  const id = character.id;
  const smile = clamp(rig.cornerLift || 0, -1, 1);
  const open = clamp(rig.mouthOpen || 0, 0, 1);
  const round = clamp(rig.mouthRound || 0, 0, 1);
  const tongue = clamp(rig.tongueOut || 0, 0, 1);
  const y = r * (id === "alien" ? 0.48 : id === "anime" ? 0.43 : 0.52);

  if (id === "fox" || id === "cat" || id === "bear") {
    // The muzzle is two overlapping cheeks, rather than a single flat oval.
    const cream = id === "fox" ? "#FFF1DE" : id === "cat" ? "#FFF8F0" : "#F6DCC0";
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.ellipse(dir * r * 0.14, r * 0.35, r * (id === "bear" ? 0.31 : 0.29), r * 0.25, dir * -0.16, 0, Math.PI * 2);
      ctx.fillStyle = cream;
      ctx.fill();
    });
    if (id === "fox") {
      [-1, 1].forEach((dir) => {
        ctx.beginPath();
        ctx.moveTo(dir * r * 0.2, r * 0.27);
        ctx.lineTo(dir * r * 0.57, r * 0.21);
        ctx.lineTo(dir * r * 0.42, r * 0.47);
        ctx.closePath();
        ctx.fillStyle = cream;
        ctx.fill();
      });
    }
  }

  if (id === "robot") {
    ctx.beginPath();
    ctx.roundRect(-r * 0.39, y - r * 0.19, r * 0.78, r * 0.46, r * 0.12);
    ctx.fillStyle = "#23334E";
    ctx.fill();
    ctx.strokeStyle = "#8399AF";
    ctx.lineWidth = r * 0.025;
    ctx.stroke();
  }

  if (id === "fox" || id === "cat" || id === "bear" || id === "bunny") {
    ctx.beginPath();
    if (id === "bear") {
      ctx.ellipse(0, r * 0.29, r * 0.105, r * 0.075, 0, 0, Math.PI * 2);
    } else {
      ctx.moveTo(-r * 0.085, r * 0.28);
      ctx.quadraticCurveTo(0, r * 0.23, r * 0.085, r * 0.28);
      ctx.quadraticCurveTo(0, r * 0.41, -r * 0.085, r * 0.28);
    }
    ctx.fillStyle = id === "bunny" ? "#EFA4AF" : id === "cat" ? "#D9818A" : "#3C2630";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, r * 0.36);
    ctx.lineTo(0, r * 0.43);
    ctx.strokeStyle = id === "robot" ? "#fff" : "#704847";
    ctx.lineWidth = r * 0.024;
    ctx.stroke();
  }

  ctx.save();
  if (id === "robot") ctx.strokeStyle = "#71F5E1";
  else if (id === "alien") ctx.strokeStyle = "#125B53";
  else ctx.strokeStyle = "#713A42";
  ctx.lineWidth = r * (id === "robot" ? 0.052 : 0.044);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (round > 0.48) {
    const radiusX = r * (0.075 + open * 0.03);
    const radiusY = r * (0.065 + Math.max(open, round * 0.48) * 0.17);
    ctx.beginPath();
    ctx.ellipse(0, y + r * 0.11, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fillStyle = id === "robot" ? "#112A3D" : "#632F48";
    ctx.fill();
    ctx.stroke();
    if (tongue > 0.2 && id !== "robot") {
      ctx.beginPath();
      ctx.ellipse(0, y + r * 0.15 + tongue * r * 0.11, radiusX * 0.9, r * 0.07 + tongue * r * 0.04, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#F2859B";
      ctx.fill();
    }
  } else if (id === "cat" && open < 0.12 && smile < 0.35) {
    const w = r * 0.2;
    ctx.beginPath();
    ctx.moveTo(-w, y - smile * r * 0.11);
    ctx.quadraticCurveTo(-w * 0.55, y + r * 0.12, 0, y + r * 0.015);
    ctx.quadraticCurveTo(w * 0.55, y + r * 0.12, w, y - smile * r * 0.11);
    ctx.stroke();
  } else {
    const halfW = r * (id === "anime" ? 0.145 : id === "bear" ? 0.20 : id === "robot" ? 0.20 : 0.22) * (1 + Math.max(smile, 0) * 0.2 + (rig.mouthWiden || 0) * 0.13);
    const cornerY = y - smile * r * 0.13;
    const centerY = y + smile * r * 0.13;
    const gap = Math.max(r * 0.025, open * r * (id === "anime" ? 0.19 : 0.28) + Math.max(smile, 0) * r * (id === "anime" ? 0.035 : 0.07));
    const asym = clamp(rig.mouthAsym || 0, -1, 1) * r * 0.075;
    ctx.beginPath();
    ctx.moveTo(-halfW, cornerY + asym);
    ctx.quadraticCurveTo(0, centerY - gap * 0.22, halfW, cornerY - asym);
    ctx.quadraticCurveTo(halfW * 0.88, centerY + gap * 0.75, 0, centerY + gap);
    ctx.quadraticCurveTo(-halfW * 0.88, centerY + gap * 0.75, -halfW, cornerY + asym);
    ctx.closePath();
    ctx.fillStyle = id === "robot" ? "#10263B" : id === "alien" ? "#27645A" : id === "anime" ? "#9A536A" : "#713442";
    ctx.fill();
    ctx.stroke();
    if (smile > 0.32 && open > 0.11 && id !== "alien" && id !== "robot") {
      ctx.beginPath();
      ctx.ellipse(0, centerY + gap * 0.30, halfW * 0.6, Math.max(r * 0.018, gap * 0.19), 0, 0, Math.PI);
      ctx.fillStyle = "#FFF8EC";
      ctx.fill();
    }
    if (tongue > 0.2 && id !== "robot") {
      ctx.beginPath();
      ctx.ellipse(0, centerY + gap * 0.83 + tongue * r * 0.09, halfW * 0.44, r * 0.075 + tongue * r * 0.045, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#F2859B";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, centerY + gap * 0.9);
      ctx.lineTo(0, centerY + gap * 0.9 + tongue * r * 0.09);
      ctx.strokeStyle = "#CF5D77";
      ctx.lineWidth = r * 0.016;
      ctx.stroke();
    }
  }

  if (id === "bunny" && open > 0.12) {
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.roundRect(dir * r * 0.058 - r * 0.045, y + r * 0.035, r * 0.09, r * 0.09, r * 0.018);
      ctx.fillStyle = "#FFFDF6";
      ctx.fill();
    });
  }
  ctx.restore();
}

function drawMouth(ctx, headR, rig, character) {
  drawCharacterMouth(ctx, headR, rig, character);
}

function drawWhiskers(ctx, headR, rig) {
  ctx.strokeStyle = "rgba(30,22,14,0.35)";
  ctx.lineWidth = headR * 0.012;
  ctx.lineCap = "round";
  [-1, 1].forEach((dir) => {
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      const originY = headR * 0.32 + i * headR * 0.05;
      ctx.moveTo(dir * headR * 0.28, originY);
      ctx.lineTo(dir * headR * (0.62 + rig.mouthWiden * 0.05), originY + i * headR * 0.02);
      ctx.stroke();
    }
  });
}

function drawNoseWrinkle(ctx, headR, rig, character) {
  if (character.noWrinkle || rig.noseWrinkle < 0.18) return;
  ctx.strokeStyle = `rgba(30,22,14,${clamp(rig.noseWrinkle, 0, 0.6)})`;
  ctx.lineWidth = headR * 0.018;
  ctx.lineCap = "round";
  [0, 1].forEach((i) => {
    ctx.beginPath();
    const y = -headR * (0.03 - i * 0.05);
    ctx.moveTo(-headR * 0.1, y);
    ctx.quadraticCurveTo(0, y - headR * 0.02, headR * 0.1, y);
    ctx.stroke();
  });
}

function drawBody(ctx, r, character) {
  const id = character.id;
  const color = {
    fox: "#21334D", cat: "#F7EFE8", bear: "#BA6D65", bunny: "#D981A9",
    robot: "#889DB8", alien: "#806FC0", anime: "#25283D",
  }[id];
  ctx.beginPath();
  ctx.moveTo(-r * 0.58, r * 0.88);
  ctx.bezierCurveTo(-r * 1.0, r * 0.93, -r * 1.2, r * 1.46, -r * 1.12, r * 1.78);
  ctx.lineTo(r * 1.12, r * 1.78);
  ctx.bezierCurveTo(r * 1.2, r * 1.46, r * 1.0, r * 0.93, r * 0.58, r * 0.88);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "rgba(35,28,39,0.36)";
  ctx.lineWidth = r * 0.03;
  ctx.stroke();
  if (id === "fox") {
    ctx.beginPath();
    ctx.moveTo(-r * 0.35, r * 0.94);
    ctx.lineTo(0, r * 1.38);
    ctx.lineTo(r * 0.35, r * 0.94);
    ctx.fillStyle = "#F7D9AE";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, r * 1.39, r * 0.085, 0, Math.PI * 2);
    ctx.fillStyle = "#EAA85B";
    ctx.fill();
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.moveTo(dir * r * 0.38, r * 0.96);
      ctx.lineTo(dir * r * 0.17, r * 1.24);
      ctx.lineTo(dir * r * 0.36, r * 1.43);
      ctx.strokeStyle = "#738AA8";
      ctx.lineWidth = r * 0.04;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(dir * r * 0.72, r * 1.04);
      ctx.quadraticCurveTo(dir * r * 0.85, r * 1.24, dir * r * 0.88, r * 1.52);
      ctx.strokeStyle = "#15243C";
      ctx.lineWidth = r * 0.035;
      ctx.stroke();
    });
  } else if (id === "cat") {
    ctx.beginPath();
    ctx.moveTo(-r * 0.52, r * 1.03);
    ctx.quadraticCurveTo(0, r * 1.61, r * 0.52, r * 1.03);
    ctx.fillStyle = "#FFF9EF";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, r * 1.23, r * 0.09, 0, Math.PI * 2);
    ctx.fillStyle = "#4DA3B3";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.18, r * 1.25);
    ctx.lineTo(0, r * 1.38);
    ctx.lineTo(r * 0.18, r * 1.25);
    ctx.strokeStyle = "#4DA3B3";
    ctx.lineWidth = r * 0.04;
    ctx.stroke();
  } else if (id === "bear") {
    ctx.beginPath();
    ctx.moveTo(-r * 0.35, r * 0.96);
    ctx.lineTo(0, r * 1.24);
    ctx.lineTo(r * 0.35, r * 0.96);
    ctx.fillStyle = "#F8E5D0";
    ctx.fill();
    [1.28, 1.52].forEach((y) => {
      ctx.beginPath();
      ctx.arc(0, r * y, r * 0.04, 0, Math.PI * 2);
      ctx.fillStyle = "#784B42";
      ctx.fill();
    });
  } else if (id === "bunny") {
    ctx.beginPath();
    ctx.roundRect(-r * 0.38, r * 1.12, r * 0.76, r * 0.60, r * 0.12);
    ctx.fillStyle = "#FFF5F0";
    ctx.fill();
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.moveTo(dir * r * 0.32, r * 0.96);
      ctx.lineTo(dir * r * 0.32, r * 1.42);
      ctx.strokeStyle = "#FFF5F0";
      ctx.lineWidth = r * 0.08;
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.arc(0, r * 1.3, r * 0.085, 0, Math.PI * 2);
    ctx.fillStyle = "#E9A5C2";
    ctx.fill();
  } else if (id === "robot") {
    ctx.beginPath();
    ctx.roundRect(-r * 0.34, r * 1.11, r * 0.68, r * 0.36, r * 0.09);
    ctx.fillStyle = "#25354D";
    ctx.fill();
    [-1, 0, 1].forEach((i) => {
      ctx.beginPath();
      ctx.arc(i * r * 0.19, r * 1.29, r * 0.055, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? "#F4B85B" : "#6DE8D5";
      ctx.fill();
    });
  } else if (id === "alien") {
    ctx.beginPath();
    ctx.ellipse(0, r * 1.05, r * 0.45, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#E7E1FF";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, r * 1.35, r * 0.11, 0, Math.PI * 2);
    ctx.fillStyle = "#75F5D1";
    ctx.fill();
  } else if (id === "anime") {
    ctx.beginPath();
    ctx.moveTo(-r * 0.64, r * 0.97);
    ctx.quadraticCurveTo(-r * 0.43, r * 1.44, 0, r * 1.53);
    ctx.quadraticCurveTo(r * 0.43, r * 1.44, r * 0.64, r * 0.97);
    ctx.lineTo(r * 0.30, r * 0.97);
    ctx.lineTo(0, r * 1.26);
    ctx.lineTo(-r * 0.30, r * 0.97);
    ctx.closePath();
    ctx.fillStyle = "#FFF7F8";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.22, r * 1.12);
    ctx.lineTo(0, r * 1.29);
    ctx.lineTo(r * 0.22, r * 1.12);
    ctx.quadraticCurveTo(0, r * 1.48, -r * 0.22, r * 1.12);
    ctx.fillStyle = "#D992B6";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, r * 1.24, r * 0.06, 0, Math.PI * 2);
    ctx.fillStyle = "#F3D7A2";
    ctx.fill();
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.moveTo(dir * r * 0.36, r * 1.04);
      ctx.quadraticCurveTo(dir * r * 0.64, r * 1.34, dir * r * 0.52, r * 1.66);
      ctx.strokeStyle = "#FFF7F8";
      ctx.lineWidth = r * 0.06;
      ctx.stroke();
    });
  }
}

function drawHeadShape(ctx, r, character) {
  const id = character.id;
  const grad = ctx.createLinearGradient(-r * 0.45, -r, r * 0.6, r);
  grad.addColorStop(0, character.skinA);
  grad.addColorStop(1, character.skinB);
  ctx.beginPath();
  if (id === "fox") {
    ctx.moveTo(0, -r * 1.03);
    ctx.bezierCurveTo(r * 0.53, -r * 1.05, r * 0.94, -r * 0.66, r * 0.95, -r * 0.10);
    ctx.lineTo(r * 1.14, r * 0.23);
    ctx.lineTo(r * 0.87, r * 0.28);
    ctx.lineTo(r * 1.00, r * 0.39);
    ctx.bezierCurveTo(r * 0.73, r * 0.73, r * 0.35, r * 0.84, 0, r * 0.82);
    ctx.bezierCurveTo(-r * 0.35, r * 0.84, -r * 0.73, r * 0.73, -r * 1.00, r * 0.39);
    ctx.lineTo(-r * 0.87, r * 0.28);
    ctx.lineTo(-r * 1.14, r * 0.23);
    ctx.lineTo(-r * 0.95, -r * 0.10);
    ctx.bezierCurveTo(-r * 0.94, -r * 0.66, -r * 0.53, -r * 1.05, 0, -r * 1.03);
  } else if (id === "cat") {
    ctx.moveTo(0, -r * 0.98);
    ctx.bezierCurveTo(r * 0.66, -r * 1.02, r * 1.02, -r * 0.52, r * 0.94, r * 0.12);
    ctx.lineTo(r * 1.06, r * 0.34);
    ctx.lineTo(r * 0.91, r * 0.39);
    ctx.bezierCurveTo(r * 0.82, r * 0.70, r * 0.39, r * 0.83, 0, r * 0.81);
    ctx.bezierCurveTo(-r * 0.39, r * 0.83, -r * 0.82, r * 0.70, -r * 0.91, r * 0.39);
    ctx.lineTo(-r * 1.06, r * 0.34);
    ctx.lineTo(-r * 0.94, r * 0.12);
    ctx.bezierCurveTo(-r * 1.02, -r * 0.52, -r * 0.66, -r * 1.02, 0, -r * 0.98);
  } else if (id === "robot") {
    ctx.roundRect(-r * 0.94, -r * 0.93, r * 1.88, r * 1.76, r * 0.33);
  } else if (id === "alien") {
    ctx.moveTo(0, -r * 1.06);
    ctx.bezierCurveTo(r * 0.86, -r * 1.12, r * 1.20, -r * 0.52, r * 0.91, r * 0.21);
    ctx.bezierCurveTo(r * 0.70, r * 0.69, r * 0.35, r * 0.86, 0, r * 0.89);
    ctx.bezierCurveTo(-r * 0.35, r * 0.86, -r * 0.70, r * 0.69, -r * 0.91, r * 0.21);
    ctx.bezierCurveTo(-r * 1.20, -r * 0.52, -r * 0.86, -r * 1.12, 0, -r * 1.06);
  } else if (id === "anime") {
    ctx.moveTo(0, -r * 0.98);
    ctx.bezierCurveTo(r * 0.74, -r * 1.03, r * 0.93, -r * 0.36, r * 0.84, r * 0.34);
    ctx.bezierCurveTo(r * 0.70, r * 0.65, r * 0.25, r * 0.82, 0, r * 0.84);
    ctx.bezierCurveTo(-r * 0.25, r * 0.82, -r * 0.70, r * 0.65, -r * 0.84, r * 0.34);
    ctx.bezierCurveTo(-r * 0.93, -r * 0.36, -r * 0.74, -r * 1.03, 0, -r * 0.98);
  } else {
    ctx.ellipse(0, -r * 0.09, id === "bear" ? r * 0.96 : r * 0.87, r * 0.89, 0, 0, Math.PI * 2);
  }
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = id === "robot" ? "#63758E" : "rgba(90,51,43,0.46)";
  ctx.lineWidth = r * 0.027;
  ctx.stroke();
}

function drawHeadDetails(ctx, r, character) {
  const id = character.id;
  if (id === "fox") {
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.moveTo(dir * r * 0.87, r * 0.12);
      ctx.lineTo(dir * r * 0.48, r * 0.24);
      ctx.lineTo(dir * r * 0.76, r * 0.30);
      ctx.lineTo(dir * r * 0.48, r * 0.42);
      ctx.lineTo(dir * r * 0.78, r * 0.51);
      ctx.quadraticCurveTo(dir * r * 0.35, r * 0.77, dir * r * 0.20, r * 0.44);
      ctx.fillStyle = "#FFF0E8";
      ctx.fill();
    });
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.92);
    ctx.quadraticCurveTo(r * 0.10, -r * 0.48, 0, -r * 0.22);
    ctx.quadraticCurveTo(-r * 0.10, -r * 0.48, 0, -r * 0.92);
    ctx.fillStyle = "#D7653C";
    ctx.fill();
  } else if (id === "cat") {
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.85);
    ctx.bezierCurveTo(r * 0.24, -r * 0.46, r * 0.16, r * 0.12, 0, r * 0.48);
    ctx.bezierCurveTo(-r * 0.16, r * 0.12, -r * 0.24, -r * 0.46, 0, -r * 0.85);
    ctx.fillStyle = "#FFF9F0";
    ctx.fill();
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.moveTo(dir * r * 0.29, -r * 0.82);
      ctx.quadraticCurveTo(dir * r * 0.42, -r * 0.59, dir * r * 0.33, -r * 0.48);
      ctx.quadraticCurveTo(dir * r * 0.38, -r * 0.72, dir * r * 0.29, -r * 0.82);
      ctx.fillStyle = "#D88755";
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(dir * r * 0.67, r * 0.28, r * 0.20, r * 0.31, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#FFF6ED";
      ctx.fill();
    });
  } else if (id === "bear") {
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.61, r * 0.42, r * 0.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,221,185,0.17)";
    ctx.fill();
  } else if (id === "robot") {
    ctx.beginPath();
    ctx.roundRect(-r * 0.79, -r * 0.68, r * 1.58, r * 1.20, r * 0.20);
    ctx.fillStyle = "#25384F";
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(-r * 0.70, -r * 0.58, r * 1.40, r * 1.02, r * 0.16);
    ctx.fillStyle = "#344C65";
    ctx.fill();
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.arc(dir * r * 0.72, r * 0.70, r * 0.055, 0, Math.PI * 2);
      ctx.fillStyle = "#F2B660";
      ctx.fill();
    });
  } else if (id === "alien") {
    [-1, 0, 1].forEach((i) => {
      ctx.beginPath();
      ctx.arc(i * r * 0.18, -r * 0.65 - (i === 0 ? r * 0.07 : 0), r * 0.055, 0, Math.PI * 2);
      ctx.fillStyle = "#D9FFE3";
      ctx.fill();
    });
  } else if (id === "anime") {
    ctx.beginPath();
    ctx.moveTo(-r * 0.92, -r * 0.20);
    ctx.bezierCurveTo(-r * 1.10, -r * 0.92, -r * 0.42, -r * 1.24, 0, -r * 1.13);
    ctx.bezierCurveTo(r * 0.58, -r * 1.25, r * 1.14, -r * 0.82, r * 0.93, -r * 0.20);
    ctx.lineTo(r * 0.72, -r * 0.56);
    ctx.quadraticCurveTo(r * 0.54, -r * 0.36, r * 0.34, -r * 0.38);
    ctx.lineTo(r * 0.22, -r * 0.31);
    ctx.quadraticCurveTo(r * 0.07, -r * 0.52, -r * 0.02, -r * 0.43);
    ctx.lineTo(-r * 0.27, -r * 0.27);
    ctx.quadraticCurveTo(-r * 0.45, -r * 0.33, -r * 0.54, -r * 0.54);
    ctx.closePath();
    ctx.fillStyle = "#F6BDD0";
    ctx.fill();
    [-0.48, -0.19, 0.13, 0.45].forEach((x, index) => {
      ctx.beginPath();
      ctx.moveTo(x * r, -r * 0.99);
      ctx.quadraticCurveTo((x + (index % 2 ? 0.08 : -0.05)) * r, -r * 0.65, (x - 0.04) * r, -r * 0.38);
      ctx.strokeStyle = "#E59EBC";
      ctx.lineWidth = r * 0.028;
      ctx.stroke();
    });
    // Dark maid headband with a scalloped ivory trim.
    ctx.beginPath();
    ctx.moveTo(-r * 0.66, -r * 0.91);
    ctx.quadraticCurveTo(0, -r * 1.28, r * 0.66, -r * 0.91);
    ctx.strokeStyle = "#303248";
    ctx.lineWidth = r * 0.12;
    ctx.stroke();
    [-3, -2, -1, 0, 1, 2, 3].forEach((i) => {
      ctx.beginPath();
      ctx.arc(i * r * 0.16, -r * (1.12 - Math.abs(i) * 0.035), r * 0.06, 0, Math.PI * 2);
      ctx.fillStyle = "#FFF7F4";
      ctx.fill();
    });
    ctx.beginPath();
    ctx.arc(r * 0.77, -r * 0.77, r * 0.10, 0, Math.PI * 2);
    ctx.fillStyle = "#2F3047";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.77, -r * 0.77, r * 0.043, 0, Math.PI * 2);
    ctx.fillStyle = "#E9C486";
    ctx.fill();
  }
}

export function drawAvatar(ctx, width, height, rig, character, time = 0) {
  ctx.clearRect(0, 0, width, height);
  const cx = width / 2;
  const cy = height * 0.47;
  const headR = Math.min(width * 0.32, height * 0.25);

  const roll = clamp(rig.roll || 0, -0.5, 0.5);
  const yaw = clamp(rig.yaw || 0, -1, 1);
  const pitch = clamp(rig.pitch || 0, -1, 1);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(roll);
  drawBody(ctx, headR, character);
  ctx.scale(1 - Math.abs(yaw) * 0.09, 1 - Math.abs(pitch) * 0.04);
  ctx.translate(yaw * headR * 0.14, pitch * headR * 0.09 + Math.sin(time / 1400) * headR * 0.012);

  drawEars(ctx, headR, character, time);
  drawHeadShape(ctx, headR, character);
  drawHeadDetails(ctx, headR, character);

  if (character.cheek) {
    const cheekOpacity = (character.id === "anime" ? 0.22 : 0.3) + clamp(rig.cheekPuff, 0, 1) * 0.32;
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.ellipse(dir * headR * 0.56, headR * 0.22, headR * (character.id === "anime" ? 0.12 : 0.16), headR * (character.id === "anime" ? 0.065 : 0.1), 0, 0, Math.PI * 2);
      ctx.fillStyle = character.cheek;
      ctx.globalAlpha = cheekOpacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  drawNoseWrinkle(ctx, headR, rig, character);
  ctx.save();
  ctx.translate(yaw * headR * 0.075, pitch * headR * 0.035);
  drawEyebrows(ctx, headR, rig, character);
  drawEyes(ctx, headR, rig, character);
  if (character.whiskers) drawWhiskers(ctx, headR, rig);
  drawMouth(ctx, headR, rig, character);
  ctx.restore();

  ctx.restore();
}
