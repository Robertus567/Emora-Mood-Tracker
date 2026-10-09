"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Trash2, X } from "lucide-react";
import { EMOTION_ORDER, emotionMeta } from "@/lib/emotions";
import { sfx } from "@/lib/sfx";
import { useLanguage } from "@/components/LanguageProvider";

function timeLabel(dateStr, locale) {
  const d = new Date(dateStr);
  const formatLocale = locale === "en" ? "en-US" : "id-ID";
  return {
    day: d.toLocaleDateString(formatLocale, { day: "numeric", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString(formatLocale, { hour: "2-digit", minute: "2-digit" }),
  };
}

function downloadPhoto(photo) {
  sfx.click();
  const a = document.createElement("a");
  a.href = photo.image_data;
  a.download = `emora-mood-${photo.emotion}-${photo.id}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function MoodBars({ scores }) {
  const { locale } = useLanguage();
  const sorted = [...EMOTION_ORDER].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
  return (
    <div className="flex flex-col gap-1.5">
      {sorted.slice(0, 3).map((key) => {
        const meta = emotionMeta(key, locale);
        const pct = Math.round((scores[key] || 0) * 100);
        return (
          <div key={key} className="flex items-center gap-2 text-[0.72rem]">
            <span className="w-14 shrink-0 text-soft">{meta.label}</span>
            <div className="flex-1 h-1 rounded-full surface-sunken overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, backgroundColor: meta.color }}
              />
            </div>
            <span className="w-8 shrink-0 text-right num-mono text-soft">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

function PhotoCard({ photo, index, onDeleted, onOpen }) {
  const { locale, t } = useLanguage();
  const meta = emotionMeta(photo.emotion, locale);
  const { day, time } = timeLabel(photo.created_at, locale);
  const [deleting, setDeleting] = useState(false);
  const [hidden, setHidden] = useState(false);

  async function handleDelete(e) {
    e.stopPropagation();
    if (deleting) return;
    setDeleting(true);
    sfx.delete();
    try {
      const res = await fetch(`/api/gallery/${photo.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setHidden(true);
      setTimeout(() => onDeleted(photo.id), 220);
    } catch {
      setDeleting(false);
    }
  }

  if (hidden) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ delay: Math.min(index, 10) * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="surface surface-interactive rounded-2xl overflow-hidden flex flex-col cursor-pointer"
      onClick={() => {
        sfx.click();
        onOpen(photo);
      }}
      onMouseEnter={() => sfx.hover()}
    >
      <div className="relative aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.image_data} alt={locale === "en" ? `${meta.label} mood photo` : `Foto mood ${meta.label}`} className="h-full w-full object-cover" />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/50 backdrop-blur px-2.5 py-1 rounded-full">
          <span className="text-sm leading-none">{meta.emoji}</span>
          <span className="text-white text-[0.72rem] font-medium">{meta.label}</span>
        </div>
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadPhoto(photo);
            }}
            onMouseEnter={sfx.hover}
            aria-label={t("Unduh foto")}
            title={t("Unduh foto")}
            className="h-7 w-7 grid place-items-center rounded-full bg-black/50 backdrop-blur text-white hover:bg-black/70 transition-colors"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <button
            onClick={handleDelete}
            onMouseEnter={sfx.hover}
            disabled={deleting}
            aria-label={t("Hapus foto")}
            title={t("Hapus foto")}
            className="h-7 w-7 grid place-items-center rounded-full bg-black/50 backdrop-blur text-white hover:bg-mood-anger/80 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <MoodBars scores={photo.scores} />
        <p className="text-[0.72rem] text-soft num-mono">
          {day} · {time}
        </p>
      </div>
    </motion.div>
  );
}

function Lightbox({ photo, onClose, onDeleted }) {
  const { locale, t } = useLanguage();
  if (!photo) return null;
  const meta = emotionMeta(photo.emotion, locale);
  const { day, time } = timeLabel(photo.created_at, locale);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-5"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="surface-glass rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto overflow-x-hidden shadow-glow"
      >
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.image_data} alt={locale === "en" ? `${meta.label} mood photo` : `Foto mood ${meta.label}`} className="w-full max-h-[42vh] object-contain bg-black/20" />
          <button
            onClick={() => {
              sfx.click();
              onClose();
            }}
            onMouseEnter={sfx.hover}
            className="absolute top-3 right-3 h-8 w-8 grid place-items-center rounded-full bg-black/55 text-white"
            aria-label={t("Tutup")}
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl leading-none">{meta.emoji}</span>
              <div>
                <p className="font-display text-lg leading-tight">{meta.label}</p>
                <p className="text-[0.75rem] text-soft num-mono">
                  {day} · {time}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => downloadPhoto(photo)} onMouseEnter={sfx.hover} className="btn-secondary !py-2 !px-4 text-[0.8rem]">
                <Download className="h-3.5 w-3.5" strokeWidth={2} /> {t("Unduh")}
              </button>
            </div>
          </div>
          <div className="grid gap-2">
            {EMOTION_ORDER.map((key) => {
              const m = emotionMeta(key, locale);
              const pct = Math.round((photo.scores[key] || 0) * 100);
              return (
                <div key={key} className="flex items-center gap-3 text-sm">
                  <span className="w-16 shrink-0 text-soft">{m.label}</span>
                  <div className="flex-1 h-1.5 rounded-full surface-sunken overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: m.color }} />
                  </div>
                  <span className="w-9 shrink-0 text-right num-mono text-soft text-[0.8rem]">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function GalleryView({ photos: initialPhotos }) {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState(initialPhotos);
  const [opened, setOpened] = useState(null);

  function handleDeleted(id) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setOpened((cur) => (cur && cur.id === id ? null : cur));
  }

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14 sm:py-16">
      <div className="mb-10 max-w-lg">
        <p className="text-[0.8rem] font-medium text-accent tracking-[0.06em] uppercase mb-3">
          {t("Galeri bersama")}
        </p>
        <h1 className="font-display text-[1.9rem] sm:text-[2.2rem] leading-[1.15] mb-3">
          {t("Galeri ")}<span className="text-accent">{t("mood")}</span>.
        </h1>
        <p className="text-soft leading-relaxed">
          {t("Setiap foto di sini diambil langsung dari kamera pengunjung saat scan mood, lengkap dengan persentase ekspresinya. Bisa diunduh siapa saja, dan pemiliknya bisa menghapusnya kapan pun lewat tombol di tiap foto.")}
        </p>
      </div>

      {photos.length === 0 ? (
        <div className="surface rounded-2xl p-10 text-center max-w-lg mx-auto">
          <p className="font-display text-xl mb-2">{t("Galeri masih kosong")}</p>
          <p className="text-soft text-sm leading-relaxed">
            {t("Foto hasil scan mood pertama akan muncul di sini.")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {photos.map((photo, i) => (
              <PhotoCard key={photo.id} photo={photo} index={i} onDeleted={handleDeleted} onOpen={setOpened} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {opened && <Lightbox photo={opened} onClose={() => setOpened(null)} onDeleted={handleDeleted} />}
      </AnimatePresence>
    </div>
  );
}
