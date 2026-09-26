"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EMOTION_ORDER, emotionMeta, dominantFromScores } from "@/lib/emotions";
import { FILTERS, drawFilter } from "@/lib/faceFilters";
import PhotoPopup from "@/components/PhotoPopup";

const MODEL_URL = "/models";
const TICK_MS = 220;

export default function FaceScanner() {
  const router = useRouter();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const faceapiRef = useRef(null);
  const liveRef = useRef(null);
  const latestDetectionRef = useRef(null);
  const filterRef = useRef("none");

  const [phase, setPhase] = useState("loading-models");
  const [errorMsg, setErrorMsg] = useState("");
  const [live, setLive] = useState(null);
  const [staleTicks, setStaleTicks] = useState(0);
  const [result, setResult] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [filter, setFilter] = useState("none");
  const [showFlash, setShowFlash] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  // Load face-api.js + models once, client-side only.
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
      } catch (err) {
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

  function drawOverlay(detection, dims) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!detection) return;
    const box = detection.detection.box;
    const { emotion } = dominantFromScores(detection.expressions);
    const color = emotionMeta(emotion).color;

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
    if (!faceapi || !video || !canvas || video.readyState < 2) return;

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
      drawOverlay(detection, dims);
    } else {
      setStaleTicks((n) => n + 1);
      latestDetectionRef.current = null;
      drawOverlay(null, dims);
    }
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    const temp = document.createElement("canvas");
    temp.width = video.videoWidth;
    temp.height = video.videoHeight;
    const ctx = temp.getContext("2d");
    // Mirror so the saved file matches what the person sees on screen.
    ctx.translate(temp.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, temp.width, temp.height);

    const detection = latestDetectionRef.current;
    if (detection && filterRef.current !== "none") {
      drawFilter(ctx, filterRef.current, detection.detection.box, detection.landmarks.positions);
    }

    setPhotoDataUrl(temp.toDataURL("image/png"));
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 350);
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

  function captureNow() {
    const scores = liveRef.current;
    if (!scores) return;
    const { emotion, confidence } = dominantFromScores(scores);

    // Freeze the current frame onto the canvas so it stays visible after
    // the camera is released.
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    stopCamera();
    setResult({ emotion, confidence, scores });
    setPhase("captured");
  }

  function scanAgain() {
    setResult(null);
    setNote("");
    setSaveError("");
    setLive(null);
    setStaleTicks(0);
    setPhase("ready");
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emotion: result.emotion,
          confidence: result.confidence,
          scores: result.scores,
          note: note.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Gagal menyimpan.");
      }
      router.refresh();
      setPhase("saved");
    } catch (err) {
      setSaveError(err.message || "Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  const quote = useMemo(() => {
    if (!result) return "";
    const pool = emotionMeta(result.emotion).quotes;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [result]);

  return (
    <div className="rise-in">
      <div className="surface rounded-3xl relative overflow-hidden aspect-[4/3] sm:aspect-[16/10]">
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
            phase === "scanning" || phase === "captured" || phase === "saved" ? "block" : "hidden"
          }`}
        />

        {(phase === "scanning") && (
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
                  onClick={() => setFilter(f.id)}
                  aria-label={f.label}
                  aria-pressed={filter === f.id}
                  title={f.label}
                  className={`h-8 w-8 grid place-items-center rounded-full text-base transition-colors ${
                    filter === f.id ? "bg-white/90" : "hover:bg-white/15"
                  }`}
                >
                  {f.emoji}
                </button>
              ))}
            </div>

            {staleTicks > 4 && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/55 text-white text-[0.8rem] whitespace-nowrap">
                Posisikan wajahmu di tengah bingkai
              </div>
            )}

            <button
              onClick={takePhoto}
              aria-label="Ambil foto"
              title="Ambil foto"
              className="absolute bottom-5 left-1/2 -translate-x-1/2 h-14 w-14 rounded-full bg-white/90 hover:bg-white ring-4 ring-white/30 active:scale-95 transition-transform"
            />

            {showFlash && (
              <div className="absolute inset-0 bg-white animate-flash pointer-events-none" />
            )}
          </>
        )}

        {phase === "loading-models" && (
          <div className="absolute inset-0 grid place-items-center">
            <p className="text-soft text-sm animate-pulse-soft">Menyiapkan model deteksi…</p>
          </div>
        )}

        {phase === "ready" && (
          <div className="absolute inset-0 grid place-items-center p-8">
            <div className="text-center">
              <p className="text-soft text-sm mb-5 max-w-xs mx-auto">
                Kamera belum menyala. Wajahmu tidak direkam maupun disimpan — hanya hasil
                deteksi ekspresinya.
              </p>
              <button onClick={startCamera} className="btn-primary">
                Mulai kamera
              </button>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="absolute inset-0 grid place-items-center p-8">
            <div className="text-center max-w-xs">
              <p className="text-sm mb-5">{errorMsg}</p>
              <button
                onClick={() => (faceapiRef.current ? startCamera() : window.location.reload())}
                className="btn-secondary"
              >
                Coba lagi
              </button>
            </div>
          </div>
        )}

        {phase === "saved" && result && (
          <div className="absolute inset-0 grid place-items-center bg-black/45">
            <div className="text-center text-white px-8">
              <p className="text-4xl mb-3">{emotionMeta(result.emotion).emoji}</p>
              <p className="font-display text-xl mb-1">Tersimpan ke log</p>
              <p className="text-white/75 text-sm mb-6">
                {emotionMeta(result.emotion).label} · baru saja
              </p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={scanAgain} className="btn-secondary !border-white/30 !text-white">
                  Scan lagi
                </button>
                <a href="/history" className="btn-primary !bg-white !text-ink-950">
                  Lihat riwayat
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {phase === "scanning" && (
        <div className="mt-6 surface rounded-2xl p-6">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[0.8rem] text-soft">Deteksi langsung</p>
            <button
              onClick={captureNow}
              disabled={!live}
              className="btn-primary !py-2.5 !px-5 disabled:opacity-40"
            >
              Tangkap mood ini
            </button>
          </div>
          <p className="text-[0.75rem] text-soft mb-4">
            Tombol bundar putih di kamera untuk foto seru dengan filter — terpisah dari log mood.
          </p>
          <div className="grid gap-2.5">
            {EMOTION_ORDER.map((key) => {
              const meta = emotionMeta(key);
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
                  <span className="text-[0.75rem] text-soft w-9 text-right">
                    {Math.round(val * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {phase === "captured" && result && (
        <div className="mt-6 surface rounded-2xl p-6 sm:p-7">
          <div className="flex items-start gap-4 mb-5">
            <span className="text-3xl">{emotionMeta(result.emotion).emoji}</span>
            <div>
              <p className="font-display text-xl leading-tight">
                {emotionMeta(result.emotion).label}
              </p>
              <p className="text-soft text-sm mt-1">
                Kepercayaan deteksi {Math.round(result.confidence * 100)}% · {quote}
              </p>
            </div>
          </div>

          <label className="block text-[0.8rem] text-soft mb-2" htmlFor="note">
            Catatan singkat (opsional)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Apa yang bikin kamu merasa begini?"
            rows={2}
            maxLength={280}
            className="w-full rounded-xl surface-sunken px-4 py-3 text-sm resize-none focus-ring outline-none mb-5"
          />

          {saveError && <p className="text-[0.8rem] text-mood-anger mb-4">{saveError}</p>}

          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? "Menyimpan…" : "Simpan ke log"}
            </button>
            <button onClick={scanAgain} className="btn-secondary" disabled={saving}>
              Scan ulang
            </button>
          </div>
        </div>
      )}

      <PhotoPopup dataUrl={photoDataUrl} onClose={() => setPhotoDataUrl(null)} />
    </div>
  );
}
