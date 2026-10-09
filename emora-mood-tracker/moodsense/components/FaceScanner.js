"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, CheckCircle2, RotateCcw, Upload, Images } from "lucide-react";
import { EMOTION_ORDER, emotionMeta, dominantFromScores } from "@/lib/emotions";
import { FILTERS, drawFilter } from "@/lib/faceFilters";
import { sfx } from "@/lib/sfx";
import { useLanguage } from "@/components/LanguageProvider";

const MODEL_URL = "/models";
const TICK_MS = 120;
const UPLOAD_MAX_WIDTH = 640;
const UPLOAD_QUALITY = 0.78;

function ExpressionLegend() {
  const { locale, t } = useLanguage();
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[0.75rem] text-soft uppercase tracking-[0.06em] font-medium">
        {t("Emora bisa mengenali")}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {EMOTION_ORDER.map((key) => {
          const meta = emotionMeta(key, locale);
          return (
            <div
              key={key}
              className="flex items-center gap-2 surface-sunken rounded-xl px-3 py-2.5"
            >
              <span className="text-base leading-none">{meta.emoji}</span>
              <span className="text-[0.8rem] font-medium truncate">{meta.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function downscaleForUpload(sourceCanvas) {
  const scale = Math.min(1, UPLOAD_MAX_WIDTH / sourceCanvas.width);
  const w = Math.round(sourceCanvas.width * scale);
  const h = Math.round(sourceCanvas.height * scale);
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  out.getContext("2d").drawImage(sourceCanvas, 0, 0, w, h);
  return out.toDataURL("image/jpeg", UPLOAD_QUALITY);
}

export default function FaceScanner() {
  const { locale, t } = useLanguage();
  const router = useRouter();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const faceapiRef = useRef(null);
  const liveRef = useRef(null);
  const latestDetectionRef = useRef(null);
  const filterRef = useRef("none");
  const detectingRef = useRef(false);

  const [phase, setPhase] = useState("loading-models");
  const [errorMsg, setErrorMsg] = useState("");
  const [live, setLive] = useState(null);
  const [staleTicks, setStaleTicks] = useState(0);
  const [result, setResult] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [filter, setFilter] = useState("none");
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

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

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  function drawOverlay(detection) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!detection) return;
    const box = detection.detection.box;
    const { emotion } = dominantFromScores(detection.expressions);
    const color = emotionMeta(emotion, locale).color;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    const r = 14;
    const { x, y, width: w, height: h } = box;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = color;
    for (const pt of detection.landmarks.positions) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (filterRef.current !== "none") {
      drawFilter(ctx, filterRef.current, box, detection.landmarks.positions);
    }
  }

  async function detectTick() {
    const faceapi = faceapiRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!faceapi || !video || !canvas || video.readyState < 2 || detectingRef.current) return;
    detectingRef.current = true;
    try {

    const dims = { width: video.videoWidth, height: video.videoHeight };
    if (canvas.width !== dims.width) canvas.width = dims.width;
    if (canvas.height !== dims.height) canvas.height = dims.height;

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
      .withFaceLandmarks(true)
      .withFaceExpressions();

    if (detection) {
      setStaleTicks(0);
      liveRef.current = detection.expressions;
      latestDetectionRef.current = detection;
      setLive(detection.expressions);
      drawOverlay(detection);
    } else {
      setStaleTicks((n) => n + 1);
      latestDetectionRef.current = null;
      drawOverlay(null);
    }
    } catch {
      // Keep the camera active if an individual frame cannot be analyzed.
    } finally {
      detectingRef.current = false;
    }
  }

  async function startCamera() {
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
      setPhase("scanning");
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

  function captureShutter() {
    const scores = liveRef.current;
    const video = videoRef.current;
    if (!scores || !video || video.readyState < 2) return;

    sfx.shutter();
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 260);

    const { emotion, confidence } = dominantFromScores(scores);

    // Full-resolution mirrored still, with any active filter baked in.
    const still = document.createElement("canvas");
    still.width = video.videoWidth;
    still.height = video.videoHeight;
    const sctx = still.getContext("2d");
    sctx.translate(still.width, 0);
    sctx.scale(-1, 1);
    sctx.drawImage(video, 0, 0, still.width, still.height);
    sctx.setTransform(1, 0, 0, 1, 0, 0);

    const detection = latestDetectionRef.current;
    if (detection && filterRef.current !== "none") {
      // landmarks are in natural (unmirrored) space; flip them to match.
      const mirroredBox = {
        x: still.width - detection.detection.box.x - detection.detection.box.width,
        y: detection.detection.box.y,
        width: detection.detection.box.width,
        height: detection.detection.box.height,
      };
      const mirroredPts = detection.landmarks.positions.map((p) => ({
        x: still.width - p.x,
        y: p.y,
      }));
      drawFilter(sctx, filterRef.current, mirroredBox, mirroredPts);
    }

    stopCamera();
    setCapturedPhoto(still.toDataURL("image/png"));
    setResult({ emotion, confidence, scores });
    setPhase("captured");
  }

  function scanAgain() {
    sfx.click();
    setResult(null);
    setCapturedPhoto(null);
    setSaveError("");
    setLive(null);
    setStaleTicks(0);
    setPhase("ready");
  }

  async function handleSaveToGallery() {
    if (!result || !capturedPhoto) return;
    setSaving(true);
    setSaveError("");
    try {
      const still = document.createElement("canvas");
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = capturedPhoto;
      });
      still.width = img.width;
      still.height = img.height;
      still.getContext("2d").drawImage(img, 0, 0);
      const uploadData = downscaleForUpload(still);

      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: uploadData,
          emotion: result.emotion,
          confidence: result.confidence,
          scores: result.scores,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Gagal menyimpan.");
      }
      sfx.success();
      router.refresh();
      setPhase("saved");
    } catch (err) {
      sfx.error();
      setSaveError(err.message || "Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rise-in h-full flex flex-col lg:flex-row gap-5 lg:min-h-0">
      {/* LEFT: camera viewport */}
      <div className="lg:flex-[1.35] flex flex-col min-h-0">
        <div className="surface rounded-3xl relative overflow-hidden flex-1 min-h-[300px] aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto">
          <video
            ref={videoRef}
            muted
            playsInline
            className={`absolute inset-0 h-full w-full object-cover [transform:scaleX(-1)] ${
              phase === "scanning" ? "block" : "hidden"
            }`}
          />
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 h-full w-full object-cover [transform:scaleX(-1)] ${
              phase === "scanning" ? "block" : "hidden"
            }`}
          />

          {(phase === "captured" || phase === "saved") && capturedPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={capturedPhoto}
              alt={t("Hasil tangkapan")}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {phase === "scanning" && (
            <>
              <span className="bracket bracket-tl text-white/70" />
              <span className="bracket bracket-tr text-white/70" />
              <span className="bracket bracket-bl text-white/70" />
              <span className="bracket bracket-br text-white/70" />
              <div className="scan-line text-white/60 animate-sweep" />

              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/45 backdrop-blur px-1.5 py-1.5 rounded-full">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      sfx.click();
                      setFilter(f.id);
                    }}
                    onMouseEnter={sfx.hover}
                    aria-label={t(f.label)}
                    aria-pressed={filter === f.id}
                    title={t(f.label)}
                    className={`h-8 w-8 grid place-items-center rounded-full text-base transition-all duration-300 ${
                      filter === f.id ? "bg-white/90 scale-105" : "hover:bg-white/15"
                    }`}
                  >
                    {f.emoji}
                  </button>
                ))}
              </div>

              {staleTicks > 4 && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/55 text-white text-[0.8rem] whitespace-nowrap">
                  {t("Posisikan wajahmu di tengah bingkai")}
                </div>
              )}

              <button
                onClick={captureShutter}
                onMouseEnter={sfx.hover}
                disabled={!live}
                aria-label={t("Tangkap mood")}
                title={t("Tangkap mood")}
                className="absolute bottom-5 left-1/2 -translate-x-1/2 h-16 w-16 rounded-full bg-white/90 hover:bg-white ring-4 ring-white/30 active:scale-90 transition-transform duration-150 disabled:opacity-40 grid place-items-center"
              >
                <span className="h-12 w-12 rounded-full border-2 border-ink-950/20" />
              </button>

              {showFlash && (
                <div className="absolute inset-0 bg-white animate-flash pointer-events-none" />
              )}
            </>
          )}

          {phase === "loading-models" && (
            <div className="absolute inset-0 grid place-items-center">
              <p className="text-soft text-sm animate-pulse-soft">{t("Menyiapkan model deteksi…")}</p>
            </div>
          )}

          {phase === "ready" && (
            <div className="absolute inset-0 grid place-items-center p-8 bg-grad-ember-soft">
              <div className="text-center">
                <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-grad-ember grid place-items-center shadow-ember">
                  <Camera className="h-6 w-6 text-ink-950" strokeWidth={2} />
                </div>
                <p className="text-soft text-sm mb-5 max-w-xs mx-auto">
                  {t("Nyalakan kamera, posisikan wajahmu di tengah, lalu tekan tombol rana untuk menangkap momen dan mood-mu.")}
                </p>
                <button onClick={() => { sfx.click(); startCamera(); }} onMouseEnter={sfx.hover} className="btn-primary">
                  {t("Mulai kamera")}
                </button>
              </div>
            </div>
          )}

          {phase === "error" && (
            <div className="absolute inset-0 grid place-items-center p-8">
              <div className="text-center max-w-xs">
                <p className="text-sm mb-5">{t(errorMsg)}</p>
                <button
                  onClick={() => {
                    sfx.click();
                    faceapiRef.current ? startCamera() : window.location.reload();
                  }}
                  onMouseEnter={sfx.hover}
                  className="btn-secondary"
                >
                  {t("Coba lagi")}
                </button>
              </div>
            </div>
          )}

          {phase === "saved" && result && (
            <div className="absolute inset-0 grid place-items-center bg-black/55 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                className="text-center text-white px-8"
              >
                <p className="text-4xl mb-3">{emotionMeta(result.emotion, locale).emoji}</p>
                <p className="font-display text-xl mb-1">{t("Tersimpan ke Galeri Mood")}</p>
                <p className="text-white/75 text-sm mb-6">
                  {emotionMeta(result.emotion, locale).label} · {t("baru saja")}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={scanAgain} onMouseEnter={sfx.hover} className="btn-secondary !border-white/30 !text-white">
                    {t("Scan lagi")}
                  </button>
                  <a href="/gallery" onMouseEnter={sfx.hover} onClick={sfx.click} className="btn-primary !text-ink-950">
                    <Images className="h-3.5 w-3.5" strokeWidth={2.2} /> {t("Lihat galeri")}
                  </a>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: live readout / result — always visible next to the camera */}
      <div className="lg:flex-1 lg:max-w-sm flex flex-col min-h-0">
        <div className="surface rounded-2xl p-6 flex-1 lg:overflow-y-auto flex flex-col">
          <AnimatePresence mode="wait">
            {(phase === "loading-models" || phase === "ready" || phase === "error") && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col justify-center gap-8"
              >
                <ExpressionLegend />
                <div className="rounded-xl surface-sunken px-4 py-3.5">
                  <p className="text-[0.78rem] text-soft leading-relaxed">
                    {t("Hasil scan-mu bisa kamu simpan ke Galeri Mood bersama, bisa dilihat dan diunduh siapa saja, dan bisa kamu hapus lagi kapan pun dari foto itu sendiri.")}
                  </p>
                </div>
              </motion.div>
            )}

            {phase === "scanning" && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[0.75rem] text-soft uppercase tracking-[0.06em] font-medium">
                    {t("Deteksi langsung")}
                  </p>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ember-500 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-ember-500" />
                  </span>
                </div>
                <p className="text-[0.75rem] text-soft mb-5">
                  {t("Pilih filter seru di atas kamera, lalu tekan tombol rana besar untuk menangkap mood-mu.")}
                </p>
                <div className="grid gap-2.5 flex-1">
                  {EMOTION_ORDER.map((key) => {
                    const meta = emotionMeta(key, locale);
                    const val = live ? live[key] || 0 : 0;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-[0.78rem] text-soft w-16 shrink-0">{meta.label}</span>
                        <div className="flex-1 h-1.5 rounded-full surface-sunken overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-150"
                            style={{ width: `${Math.round(val * 100)}%`, backgroundColor: meta.color }}
                          />
                        </div>
                        <span className="text-[0.75rem] text-soft num-mono w-9 text-right">
                          {Math.round(val * 100)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {phase === "captured" && result && (
              <motion.div
                key="captured"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col"
              >
                <div className="flex items-start gap-4 mb-5">
                  <span className="text-3xl">{emotionMeta(result.emotion, locale).emoji}</span>
                  <div>
                    <p className="font-display text-xl leading-tight">
                      {emotionMeta(result.emotion, locale).label}
                    </p>
                    <p className="text-soft text-sm mt-1">
                      {t("Kepercayaan deteksi")} {Math.round(result.confidence * 100)}%
                    </p>
                  </div>
                </div>

                <p className="text-[0.75rem] text-soft uppercase tracking-[0.06em] font-medium mb-2.5">
                  {t("Rincian mood")}
                </p>
                <div className="grid gap-2 mb-5">
                  {EMOTION_ORDER.map((key) => {
                    const meta = emotionMeta(key, locale);
                    const pct = Math.round((result.scores[key] || 0) * 100);
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-[0.75rem] text-soft w-16 shrink-0">{meta.label}</span>
                        <div className="flex-1 h-1.5 rounded-full surface-sunken overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: meta.color }}
                          />
                        </div>
                        <span className="text-[0.72rem] text-soft num-mono w-8 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>

                {saveError && <p className="text-[0.8rem] text-mood-anger mb-3">{t(saveError)}</p>}

                <div className="mt-auto flex items-center gap-3">
                  <button
                    onClick={handleSaveToGallery}
                    onMouseEnter={sfx.hover}
                    disabled={saving}
                    className="btn-primary flex-1 disabled:opacity-60"
                  >
                    {saving ? (
                      t("Menyimpan…")
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" strokeWidth={2.2} /> {t("Simpan ke Galeri")}
                      </>
                    )}
                  </button>
                  <button
                    onClick={scanAgain}
                    onMouseEnter={sfx.hover}
                    className="btn-ghost-icon border hairline h-11 w-11 shrink-0"
                    disabled={saving}
                    aria-label={t("Buang & scan ulang")}
                    title={t("Buang & scan ulang")}
                  >
                    <RotateCcw className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              </motion.div>
            )}

            {phase === "saved" && result && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col justify-center items-center text-center gap-3"
              >
                <CheckCircle2 className="h-9 w-9 text-ember-500" strokeWidth={1.8} />
                <p className="font-display text-lg">{t("Tersimpan ke Galeri Mood")}</p>
                <p className="text-soft text-sm">
                  {emotionMeta(result.emotion, locale).label} · {t("bisa dilihat semua orang di Galeri.")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
