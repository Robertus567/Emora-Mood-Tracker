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
    brow: "angled",
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
    brow: "thin",
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
    brow: "round",
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
    brow: "soft",
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
    brow: "ridge",
    mouth: "slit",
    noWrinkle: true,
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

// ---------------------------------------------------------------------
// Eyebrows — angled/thin/round/soft/ridge/none, all driven by
// browRaise (overall height), browInnerRaise (worry) and browAngle
// (furrow vs. droop).
// ---------------------------------------------------------------------
function drawEyebrows(ctx, headR, rig, character) {
  if (character.brow === "none") return;

  const baseY = -headR * (0.2 + rig.browRaise * 0.1);
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
  const thickness =
    character.brow === "angled" ? 0.055 : character.brow === "round" ? 0.05 : character.brow === "thin" ? 0.032 : 0.036;

  ctx.strokeStyle = "rgba(30,22,14,0.8)";
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

  const baseRX = character.eye === "anime" ? 0.185 : character.eye === "round" ? 0.135 : character.eye === "void" ? 0.21 : 0.155;
  const baseRY = character.eye === "anime" ? 0.225 : character.eye === "round" ? 0.145 : character.eye === "void" ? 0.26 : 0.185;
  const rx = headR * baseRX * rig.eyeScale;
  const ry = headR * baseRY * rig.eyeScale;
  const pupilR = headR * (character.eye === "anime" ? 0.085 : 0.07);
  const lookX = clamp(rig.yaw, -1, 1) * (rx - pupilR) * 0.6;
  const lookY = clamp(rig.pitch, -1, 1) * (ry - pupilR) * 0.45;

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

    if (character.eye === "almond") {
      // fox eyeliner flick
      ctx.beginPath();
      ctx.moveTo(rx * 0.6, -ry * 0.3);
      ctx.lineTo(rx * 1.25, -ry * 0.55);
      ctx.lineWidth = headR * 0.028;
      ctx.strokeStyle = "rgba(20,14,10,0.75)";
      ctx.lineCap = "round";
      ctx.stroke();
    }

    if (character.eye === "slit") {
      // cat: tall vertical slit pupil instead of a round one
      ctx.beginPath();
      ctx.ellipse(lookX, lookY, pupilR * 0.34, pupilR * 1.15, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#1B140E";
      ctx.fill();
    } else if (character.eye === "anime") {
      // bunny: big iris + pupil + double highlight
      ctx.beginPath();
      ctx.arc(lookX, lookY, pupilR * 1.15, 0, Math.PI * 2);
      ctx.fillStyle = "#7A4A63";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lookX, lookY, pupilR * 0.62, 0, Math.PI * 2);
      ctx.fillStyle = "#241118";
      ctx.fill();
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
function mouthGeometry(headR, rig) {
  const widen = 1 + rig.mouthWiden * 0.22 - rig.mouthTighten * 0.22;
  const halfW = headR * (0.2 + Math.max(0, rig.cornerLift) * 0.05) * widen * (1 - rig.mouthRound * 0.35);
  const cornerYOff = -rig.cornerLift * headR * 0.14;
  const bowDir = rig.cornerLift >= 0 ? 1 : -1;
  const bow = headR * (0.07 + Math.abs(rig.cornerLift) * 0.15) * (1 - rig.mouthRound * 0.6);
  const openHalf = rig.mouthOpen * headR * (0.12 + rig.mouthRound * 0.1);
  const baseY = headR * 0.4;

  const asymL = 1 - rig.mouthAsym * 0.45;
  const asymR = 1 + rig.mouthAsym * 0.45;

  const leftCornerY = baseY + cornerYOff * asymL;
  const rightCornerY = baseY + cornerYOff * asymR;
  const upperCtrlY = baseY + cornerYOff + bowDir * bow - openHalf * 0.5;
  const lowerCtrlY = baseY + cornerYOff + bowDir * bow + openHalf * 1.25 + rig.mouthOpen * headR * 0.04;

  return { halfW, leftCornerY, rightCornerY, upperCtrlY, lowerCtrlY, baseY, openHalf };
}

function drawGenericMouth(ctx, headR, rig, mouthColorOpen, mouthColorClosed) {
  const g = mouthGeometry(headR, rig);
  ctx.beginPath();
  ctx.moveTo(-g.halfW, g.leftCornerY);
  if (rig.mouthRound > 0.15) {
    ctx.quadraticCurveTo(0, g.upperCtrlY - headR * rig.mouthRound * 0.08, g.halfW, g.rightCornerY);
    ctx.quadraticCurveTo(g.halfW * 1.05, g.baseY + g.openHalf * 0.6, 0, g.lowerCtrlY + headR * rig.mouthRound * 0.05);
    ctx.quadraticCurveTo(-g.halfW * 1.05, g.baseY + g.openHalf * 0.6, -g.halfW, g.leftCornerY);
  } else {
    ctx.quadraticCurveTo(0, g.upperCtrlY, g.halfW, g.rightCornerY);
    ctx.quadraticCurveTo(0, g.lowerCtrlY, -g.halfW, g.leftCornerY);
  }
  ctx.closePath();
  ctx.fillStyle = rig.mouthOpen > 0.16 ? mouthColorOpen : mouthColorClosed;
  ctx.fill();
  return g;
}

function drawMouth(ctx, headR, rig, character) {
  if (character.mouth === "speaker") {
    const accent = character.accent || "#E9A544";
    const bars = 5;
    const spread = headR * 0.34;
    ctx.save();
    ctx.translate(0, headR * 0.42);
    ctx.rotate(rig.cornerLift * 0.12);
    for (let i = 0; i < bars; i++) {
      const t = i / (bars - 1) - 0.5;
      const x = t * spread * 2;
      const lift = (1 - Math.abs(t) * 1.4) * rig.cornerLift;
      const barH = Math.max(headR * 0.02, headR * (0.03 + rig.mouthOpen * 0.16) * (1 - Math.abs(t) * 0.5));
      ctx.beginPath();
      const w = headR * 0.05;
      const y = -lift * headR * 0.08;
      ctx.roundRect
        ? ctx.roundRect(x - w / 2, y - barH / 2, w, barH, w / 2)
        : ctx.rect(x - w / 2, y - barH / 2, w, barH);
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    return;
  }

  if (character.mouth === "slit") {
    const g = mouthGeometry(headR, { ...rig, mouthOpen: rig.mouthOpen * 0.4, cornerLift: rig.cornerLift * 0.6 });
    ctx.beginPath();
    ctx.moveTo(-g.halfW * 0.7, g.leftCornerY);
    ctx.quadraticCurveTo(0, g.upperCtrlY, g.halfW * 0.7, g.rightCornerY);
    ctx.quadraticCurveTo(0, g.lowerCtrlY, -g.halfW * 0.7, g.leftCornerY);
    ctx.closePath();
    ctx.fillStyle = "rgba(20,30,24,0.55)";
    ctx.fill();
    return;
  }

  if (character.mouth === "muzzle") {
    const muzzleW = headR * 0.62;
    const muzzleH = headR * 0.44;
    const muzzleY = headR * 0.32;
    ctx.beginPath();
    ctx.ellipse(0, muzzleY, muzzleW / 2, muzzleH / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = character.muzzle;
    ctx.fill();

    // nose
    ctx.beginPath();
    ctx.moveTo(-headR * 0.055, muzzleY - muzzleH * 0.22);
    ctx.lineTo(headR * 0.055, muzzleY - muzzleH * 0.22);
    ctx.lineTo(0, muzzleY - muzzleH * 0.02);
    ctx.closePath();
    ctx.fillStyle = character.nose;
    ctx.fill();

    ctx.save();
    ctx.translate(0, headR * 0.06);
    drawGenericMouth(ctx, headR, rig, "rgba(94,28,28,0.88)", "rgba(35,22,16,0.55)");
    ctx.restore();
    return;
  }

  if (character.mouth === "teeth") {
    const g = drawGenericMouth(ctx, headR, rig, "rgba(120,40,40,0.85)", "rgba(35,22,16,0.72)");
    if (rig.mouthOpen > 0.28) {
      const toothW = headR * 0.07;
      const toothH = headR * 0.09;
      [-1, 1].forEach((dir) => {
        ctx.beginPath();
        const x = dir * toothW * 0.65;
        ctx.rect(x - toothW / 2, g.upperCtrlY + headR * 0.02, toothW, toothH);
        ctx.fillStyle = "#FFFBF3";
        ctx.fill();
      });
    }
    return;
  }

  // default (cat)
  drawGenericMouth(ctx, headR, rig, "rgba(94,28,28,0.88)", "rgba(35,22,16,0.72)");
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

  const grad = ctx.createRadialGradient(-headR * 0.3, -headR * 0.35, headR * 0.1, 0, 0, headR * 1.05);
  grad.addColorStop(0, character.skinA);
  grad.addColorStop(1, character.skinB);
  ctx.beginPath();
  ctx.arc(0, 0, headR, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  if (character.cheek) {
    const cheekOpacity = 0.3 + clamp(rig.cheekPuff, 0, 1) * 0.35;
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.ellipse(dir * headR * 0.56, headR * 0.22, headR * 0.16, headR * 0.1, 0, 0, Math.PI * 2);
      ctx.fillStyle = character.cheek;
      ctx.globalAlpha = cheekOpacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  drawNoseWrinkle(ctx, headR, rig, character);
  drawEyebrows(ctx, headR, rig, character);
  drawEyes(ctx, headR, rig, character);
  if (character.whiskers) drawWhiskers(ctx, headR, rig);
  drawMouth(ctx, headR, rig, character);

  ctx.restore();
}
