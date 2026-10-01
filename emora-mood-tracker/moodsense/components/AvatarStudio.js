"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera as CameraIcon, ImageDown, Sparkles } from "lucide-react";
import { EMOTION_ORDER, emotionMeta, dominantFromScores } from "@/lib/emotions";
import { extractRig, expressionOverlay, combineRig, smoothRig, IDLE_RIG } from "@/lib/avatarMath";
import { extractVisualTracking } from "@/lib/avatarVisualTracking";
import { CHARACTERS, drawAvatar, loadAvatarImage } from "@/lib/illustratedAvatarRenderer";
import { sfx } from "@/lib/sfx";
import PhotoPopup from "@/components/PhotoPopup";

const MODEL_URL = "/models";
const TICK_MS = 100;
const SMOOTHING = 0.32;
const STALE_TO_IDLE = 5;
const IDLE_EXPR = { neutral: 1, happy: 0, sad: 0, angry: 0, fearful: 0, disgusted: 0, surprised: 0 };
const PREVIEW_EMOTIONS = ["neutral", "happy", "sad", "angry", "fearful", "disgusted", "surprised"];

function lerpExpr(current, target, factor) {
  const out = {};
  for (const key of EMOTION_ORDER) {
    const c = current[key] ?? 0;
    const t = target[key] ?? 0;
    out[key] = c + (t - c) * factor;
  }
  return out;
}

function AvatarThumbnail({ character }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const draw = () => drawAvatar(context, canvas.width, canvas.height, combineRig(IDLE_RIG, expressionOverlay(IDLE_EXPR)), character);
    loadAvatarImage(character, draw);
    draw();
  }, [character]);
  return <canvas ref={canvasRef} width={88} height={88} className="h-11 w-11" aria-hidden="true" />;
}

export default function AvatarStudio() {
  const videoRef = useRef(null);
  const avatarCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const rafRef = useRef(null);
  const faceapiRef = useRef(null);
  const visualCanvasRef = useRef(null);
  const detectingRef = useRef(false);
  const rigRef = useRef({ ...IDLE_RIG });
  const targetRigRef = useRef({ ...IDLE_RIG });
  const exprRef = useRef({ ...IDLE_EXPR });
  const targetExprRef = useRef({ ...IDLE_EXPR });
  const characterRef = useRef(CHARACTERS[0]);
  const staleRef = useRef(0);

  const [phase, setPhase] = useState("loading-models");
  const [errorMsg, setErrorMsg] = useState("");
  const [character, setCharacter] = useState(CHARACTERS[0]);
  const [live, setLive] = useState(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [previewEmotion, setPreviewEmotion] = useState("happy");
  const [previewWink, setPreviewWink] = useState(false);
  const [previewTongue, setPreviewTongue] = useState(false);

  useEffect(() => {
    if (phase === "live") return;
    targetExprRef.current = { ...IDLE_EXPR, neutral: previewEmotion === "neutral" ? 1 : 0, [previewEmotion]: 1 };
    targetRigRef.current = {
      ...IDLE_RIG,
      leftEyeOpen: previewWink ? 0.05 : 1,
      tongueOut: previewTongue ? 1 : 0,
      mouthOpen: previewTongue ? 0.65 : 0,
    };
  }, [phase, previewEmotion, previewWink, previewTongue]);

  useEffect(() => {
    characterRef.current = character;
  }, [character]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const faceapi = await import("face-api.js");
        faceapiRef.current = faceapi;
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]);
        if (!cancelled) setPhase("ready");
      } catch {
        if (!cancelled) {
          setErrorMsg("Model deteksi gagal dimuat. Muat ulang halaman untuk mencoba lagi.");
          setPhase("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stopAll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => stopAll, [stopAll]);

  async function detectTick() {
    const faceapi = faceapiRef.current;
    const video = videoRef.current;
    if (!faceapi || !video || video.readyState < 2 || detectingRef.current) return;
    detectingRef.current = true;
    try {
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
      .withFaceLandmarks(true)
      .withFaceExpressions();

    if (detection) {
      staleRef.current = 0;
      const geometricRig = extractRig(detection.landmarks, detection.detection.box);
      visualCanvasRef.current ||= document.createElement("canvas");
      const visual = extractVisualTracking(video, detection.landmarks, geometricRig.mouthOpen, visualCanvasRef.current);
      targetRigRef.current = {
        ...geometricRig,
        gazeX: visual.gazeX ?? geometricRig.gazeX,
        gazeY: visual.gazeY ?? geometricRig.gazeY,
        tongueOut: visual.tongueOut,
      };
      targetExprRef.current = detection.expressions;
      setLive(detection.expressions);
    } else {
      staleRef.current += 1;
      if (staleRef.current > STALE_TO_IDLE) {
        targetRigRef.current = { ...IDLE_RIG };
        targetExprRef.current = { ...IDLE_EXPR };
        setLive(null);
      }
    }
    } catch {
      // A dropped webcam frame should not stop the animation or camera.
    } finally {
      detectingRef.current = false;
    }
  }

  const renderLoop = useCallback(function frame(t) {
    const canvas = avatarCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const breathe = Math.sin(t / 1100) * 0.018;

      rigRef.current = smoothRig(rigRef.current, targetRigRef.current, SMOOTHING);
      exprRef.current = lerpExpr(exprRef.current, targetExprRef.current, SMOOTHING);

      const overlay = expressionOverlay(exprRef.current);
      const combined = combineRig({ ...rigRef.current, pitch: rigRef.current.pitch + breathe }, overlay);
      drawAvatar(ctx, canvas.width, canvas.height, combined, characterRef.current, t);
    }
    rafRef.current = requestAnimationFrame(frame);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = avatarCanvasRef.current;
    const wrap = canvas?.parentElement;
    if (!canvas || !wrap) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = wrap.clientWidth * dpr;
    canvas.height = wrap.clientHeight * dpr;
    canvas.style.width = `${wrap.clientWidth}px`;
    canvas.style.height = `${wrap.clientHeight}px`;
  }, []);

  useEffect(() => {
    resizeCanvas();
    const wrap = avatarCanvasRef.current?.parentElement;
    const observer = wrap && typeof ResizeObserver !== "undefined" ? new ResizeObserver(resizeCanvas) : null;
    if (wrap && observer) observer.observe(wrap);
    rafRef.current = requestAnimationFrame(renderLoop);
    return () => observer?.disconnect();
  }, [renderLoop, resizeCanvas]);

  async function startStudio() {
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      resizeCanvas();
      setPhase("live");
      intervalRef.current = setInterval(detectTick, TICK_MS);
    } catch (err) {
      const denied = err && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");
      setErrorMsg(
        denied
          ? "Akses kamera ditolak. Izinkan akses kamera di pengaturan browser untuk melanjutkan."
          : "Kamera tidak dapat diakses. Pastikan tidak sedang dipakai aplikasi lain."
      );
      setPhase("error");
    }
  }

  useEffect(() => {
    function onResize() {
      if (phase === "live") resizeCanvas();
    }
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [phase, resizeCanvas]);

  function takeAvatarSnapshot() {
    sfx.shutter();
    const canvas = avatarCanvasRef.current;
    if (!canvas) return;
    setPhotoDataUrl(canvas.toDataURL("image/png"));
  }

  const dominant = live ? dominantFromScores(live) : null;

  return (
    <div className="rise-in h-full flex flex-col lg:flex-row gap-5 lg:min-h-0">
      {/* LEFT: avatar stage */}
      <div className="lg:flex-[1.35] flex flex-col min-h-0">
        <div className="surface rounded-3xl relative overflow-hidden flex-1 min-h-[320px] aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto bg-grad-ember-soft">
          <video ref={videoRef} muted playsInline className="hidden" />

          <canvas ref={avatarCanvasRef} className="absolute inset-0 h-full w-full" />

          {phase === "live" && (
            <>
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ember-400 opacity-70" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-ember-400" />
                </span>
                <span className="text-white text-[0.75rem] font-medium">
                  {dominant ? emotionMeta(dominant.emotion).label : "Menyesuaikan…"}
                </span>
              </div>

              <div className="absolute bottom-4 right-4 h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden ring-2 ring-white/40 shadow-lift">
                <video
                  autoPlay
                  muted
                  playsInline
                  ref={(el) => {
                    if (el && streamRef.current && el.srcObject !== streamRef.current) {
                      el.srcObject = streamRef.current;
                    }
                  }}
                  className="h-full w-full object-cover [transform:scaleX(-1)]"
                />
              </div>

              <button
                onClick={takeAvatarSnapshot}
                onMouseEnter={sfx.hover}
                aria-label="Ambil gambar avatar"
                title="Ambil gambar avatar"
                className="absolute bottom-4 left-4 h-11 w-11 rounded-full bg-white/90 hover:bg-white grid place-items-center active:scale-95 transition-transform duration-200 shadow-lift"
              >
                <ImageDown className="h-[18px] w-[18px] text-ink-950" strokeWidth={2} />
              </button>
            </>
          )}

          {phase === "loading-models" && (
            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-white text-xs animate-pulse-soft whitespace-nowrap">
              Menyiapkan kamera…
            </p>
          )}

          {phase === "ready" && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
              <button onClick={startStudio} onMouseEnter={sfx.hover} className="btn-primary whitespace-nowrap">
                <CameraIcon className="h-4 w-4" /> Nyalakan kamera
              </button>
            </div>
          )}

          {phase === "error" && (
            <div className="absolute inset-0 grid place-items-center p-8">
              <div className="text-center max-w-xs">
                <p className="text-sm mb-5">{errorMsg}</p>
                <button
                  onClick={() => {
                    sfx.click();
                    faceapiRef.current ? startStudio() : window.location.reload();
                  }}
                  onMouseEnter={sfx.hover}
                  className="btn-secondary"
                >
                  Coba lagi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: character picker + live readout */}
      <div className="lg:flex-1 lg:max-w-sm flex flex-col min-h-0">
        <div className="surface rounded-2xl p-6 flex-1 lg:overflow-y-auto flex flex-col gap-6">
          <div>
            <p className="text-[0.75rem] text-soft uppercase tracking-[0.12em] font-medium mb-3">
              Pilih karakter
            </p>
            <div className="grid grid-cols-3 gap-2">
              {CHARACTERS.map((c) => {
                const active = character.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      sfx.click();
                      setCharacter(c);
                    }}
                    onMouseEnter={sfx.hover}
                    aria-label={`Pilih karakter ${c.label}`}
                    aria-pressed={active}
                    className={`flex flex-col items-center gap-1 rounded-xl py-2 transition-all duration-300 ${
                      active
                        ? "bg-grad-ember shadow-ember scale-[1.03]"
                        : "surface-sunken hover:scale-[1.03]"
                    }`}
                  >
                    <AvatarThumbnail character={c} />
                    <span className={`text-[0.7rem] font-medium ${active ? "text-ink-950" : ""}`}>
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {phase === "live" ? (
              <motion.div
                key="live"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col"
              >
                <p className="text-[0.75rem] text-soft uppercase tracking-[0.12em] font-medium mb-3">
                  Ekspresi terdeteksi
                </p>
                <div className="grid gap-2.5">
                  {EMOTION_ORDER.map((key) => {
                    const meta = emotionMeta(key);
                    const val = live ? live[key] || 0 : 0;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-[0.75rem] text-soft w-16 shrink-0">{meta.label}</span>
                        <div className="flex-1 h-1.5 rounded-full surface-sunken overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-150"
                            style={{ width: `${Math.round(val * 100)}%`, backgroundColor: meta.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={takeAvatarSnapshot}
                  onMouseEnter={sfx.hover}
                  className="btn-primary w-full mt-6"
                >
                  <ImageDown className="h-3.5 w-3.5" strokeWidth={2.2} />
                  Ambil gambar karakter
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-2 rounded-xl surface-sunken px-3 py-2.5"
              >
                <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-[0.75rem] text-soft leading-relaxed">
                  Pilih ekspresi di bawah untuk melihat gerak karakter, lalu nyalakan kamera untuk mengikuti wajahmu.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {phase !== "live" && (
            <div className="border-t hairline pt-4">
              <p className="text-[0.75rem] text-soft uppercase tracking-[0.12em] font-medium mb-3">
                Coba ekspresi karakter
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {PREVIEW_EMOTIONS.map((key) => (
                  <button
                    key={key}
                    onClick={() => setPreviewEmotion(key)}
                    aria-pressed={previewEmotion === key}
                    className={`rounded-lg px-1 py-2 text-[0.7rem] transition-colors ${previewEmotion === key ? "bg-grad-ember text-ink-950 font-semibold" : "surface-sunken hover:opacity-75"}`}
                  >
                    {emotionMeta(key).label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => setPreviewWink((value) => !value)} aria-pressed={previewWink}
                  className={`rounded-lg px-3 py-2 text-xs ${previewWink ? "bg-grad-ember text-ink-950" : "surface-sunken"}`}>
                  Kedip
                </button>
                <button onClick={() => setPreviewTongue((value) => !value)} aria-pressed={previewTongue}
                  className={`rounded-lg px-3 py-2 text-xs ${previewTongue ? "bg-grad-ember text-ink-950" : "surface-sunken"}`}>
                  Melet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <PhotoPopup dataUrl={photoDataUrl} onClose={() => setPhotoDataUrl(null)} />
    </div>
  );
}
