"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera as CameraIcon, ImageDown, Sparkles } from "lucide-react";
import { EMOTION_ORDER, emotionMeta, dominantFromScores } from "@/lib/emotions";
import { extractRig, smoothRig, IDLE_RIG } from "@/lib/avatarMath";
import { drawAvatar, CHARACTERS } from "@/lib/avatarRenderer";
import PhotoPopup from "@/components/PhotoPopup";

const MODEL_URL = "/models";
const TICK_MS = 160;
const SMOOTHING = 0.32;
const STALE_TO_IDLE = 5;

export default function VtuberStudio() {
  const videoRef = useRef(null);
  const avatarCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const rafRef = useRef(null);
  const faceapiRef = useRef(null);
  const rigRef = useRef({ ...IDLE_RIG });
  const targetRigRef = useRef({ ...IDLE_RIG });
  const characterRef = useRef(CHARACTERS[0]);
  const staleRef = useRef(0);

  const [phase, setPhase] = useState("loading-models");
  const [errorMsg, setErrorMsg] = useState("");
  const [character, setCharacter] = useState(CHARACTERS[0]);
  const [live, setLive] = useState(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);

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
    if (!faceapi || !video || video.readyState < 2) return;

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
      .withFaceLandmarks(true)
      .withFaceExpressions();

    if (detection) {
      staleRef.current = 0;
      targetRigRef.current = extractRig(detection.landmarks, detection.detection.box);
      setLive(detection.expressions);
    } else {
      staleRef.current += 1;
      if (staleRef.current > STALE_TO_IDLE) {
        targetRigRef.current = { ...IDLE_RIG };
        setLive(null);
      }
    }
  }

  function renderLoop(t) {
    const canvas = avatarCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      // gentle synthetic idle sway so the avatar never looks frozen
      const idleBlend = staleRef.current > STALE_TO_IDLE ? 1 : 0;
      const breathe = idleBlend ? Math.sin(t / 1100) * 0.03 : 0;
      rigRef.current = smoothRig(rigRef.current, targetRigRef.current, SMOOTHING);
      const rig = { ...rigRef.current, pitch: rigRef.current.pitch + breathe };
      drawAvatar(ctx, canvas.width, canvas.height, rig, characterRef.current, t);
    }
    rafRef.current = requestAnimationFrame(renderLoop);
  }

  function resizeCanvas() {
    const canvas = avatarCanvasRef.current;
    const wrap = canvas?.parentElement;
    if (!canvas || !wrap) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = wrap.clientWidth * dpr;
    canvas.height = wrap.clientHeight * dpr;
    canvas.style.width = `${wrap.clientWidth}px`;
    canvas.style.height = `${wrap.clientHeight}px`;
  }

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
      rafRef.current = requestAnimationFrame(renderLoop);
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
    return () => window.removeEventListener("resize", onResize);
  }, [phase]);

  function takeAvatarSnapshot() {
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

              {/* camera PiP so you can compare your real face with the avatar */}
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
                aria-label="Ambil gambar avatar"
                title="Ambil gambar avatar"
                className="absolute bottom-4 left-4 h-11 w-11 rounded-full bg-white/90 hover:bg-white grid place-items-center active:scale-95 transition-transform duration-200 shadow-lift"
              >
                <ImageDown className="h-[18px] w-[18px] text-ink-950" strokeWidth={2} />
              </button>
            </>
          )}

          {phase === "loading-models" && (
            <div className="absolute inset-0 grid place-items-center">
              <p className="text-soft text-sm animate-pulse-soft">Menyiapkan panggung avatar…</p>
            </div>
          )}

          {phase === "ready" && (
            <div className="absolute inset-0 grid place-items-center p-8">
              <div className="text-center">
                <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-grad-ember grid place-items-center shadow-ember">
                  <CameraIcon className="h-6 w-6 text-ink-950" strokeWidth={2} />
                </div>
                <p className="text-soft text-sm mb-5 max-w-xs mx-auto">
                  Nyalakan kamera untuk menghidupkan avatarmu — mulut, mata, alis, dan
                  kemiringan kepala mengikuti ekspresi wajahmu secara langsung.
                </p>
                <button onClick={startStudio} className="btn-primary">
                  Hidupkan avatar
                </button>
              </div>
            </div>
          )}

          {phase === "error" && (
            <div className="absolute inset-0 grid place-items-center p-8">
              <div className="text-center max-w-xs">
                <p className="text-sm mb-5">{errorMsg}</p>
                <button
                  onClick={() => (faceapiRef.current ? startStudio() : window.location.reload())}
                  className="btn-secondary"
                >
                  Coba lagi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: character picker + live readout, always visible alongside the avatar */}
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
                    onClick={() => setCharacter(c)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl py-3 transition-all duration-300 ${
                      active
                        ? "bg-grad-ember shadow-ember scale-[1.03]"
                        : "surface-sunken hover:scale-[1.03]"
                    }`}
                  >
                    <span className="text-xl leading-none">{c.emoji}</span>
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
                <button onClick={takeAvatarSnapshot} className="btn-primary w-full mt-6">
                  <ImageDown className="h-3.5 w-3.5" strokeWidth={2.2} />
                  Ambil gambar avatar
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col justify-center gap-4"
              >
                <div className="flex items-start gap-2.5 rounded-xl surface-sunken px-4 py-3.5">
                  <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-[0.8rem] text-soft leading-relaxed">
                    Karakter mengikuti kedipan mata, bukaan mulut, alis, dan kemiringan
                    kepalamu secara langsung — semua diproses di perangkatmu.
                  </p>
                </div>
                <p className="text-[0.78rem] text-soft leading-relaxed">
                  Ganti karakter kapan saja, bahkan setelah kamera menyala. Gambar avatar
                  yang kamu ambil hanya tersimpan di perangkatmu, tidak diunggah.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <PhotoPopup dataUrl={photoDataUrl} onClose={() => setPhotoDataUrl(null)} />
    </div>
  );
}
