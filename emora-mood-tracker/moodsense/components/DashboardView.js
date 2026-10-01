"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight, Images, Wand2 } from "lucide-react";
import { emotionMeta } from "@/lib/emotions";
import { sfx } from "@/lib/sfx";
import MoodHeroArt from "@/components/MoodHeroArt";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

function GalleryThumb({ photo, index }) {
  const meta = emotionMeta(photo.emotion);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative aspect-square rounded-xl overflow-hidden surface-interactive"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.image_data} alt={`Mood ${meta.label}`} className="h-full w-full object-cover" />
      <span className="absolute bottom-1.5 left-1.5 text-base leading-none drop-shadow">
        {meta.emoji}
      </span>
    </motion.div>
  );
}

export default function DashboardView({ photos }) {
  const hasPhotos = photos.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14 sm:py-20">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center mb-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-col justify-center"
        >
          <p className="text-[0.8rem] font-medium text-accent tracking-[0.14em] uppercase mb-4 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} />
            Deteksi ekspresi real-time
          </p>
          <h1 className="font-display text-[2.3rem] sm:text-[2.9rem] leading-[1.1] mb-5 max-w-lg">
            Kenali <span className="italic gradient-text">suasana hatimu</span>, satu tatapan
            kamera.
          </h1>
          <p className="text-soft leading-relaxed max-w-md mb-8">
            Emora membaca ekspresi wajahmu langsung lewat kamera, lalu menangkap
            momennya lengkap dengan persentase mood ke Galeri — atau ubah wajahmu jadi
            karakter animasi yang bergerak mengikuti ekspresimu secara langsung.
          </p>
          <div className="flex items-center gap-5 flex-wrap">
            <Link href="/scan" onMouseEnter={sfx.hover} onClick={sfx.click} className="btn-primary">
              Scan mood sekarang
            </Link>
            <Link
              href="/avatar"
              onMouseEnter={sfx.hover}
              onClick={sfx.click}
              className="text-sm font-medium text-soft hover:text-inherit focus-ring rounded flex items-center gap-1 link-underline"
            >
              Coba karakter avatar <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <MoodHeroArt />
        </motion.div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="surface surface-interactive rounded-2xl p-6 flex items-center gap-4"
        >
          <div className="h-11 w-11 shrink-0 rounded-full bg-grad-ember grid place-items-center shadow-ember">
            <Images className="h-5 w-5 text-ink-950" strokeWidth={2} />
          </div>
          <div>
            <p className="font-display text-lg leading-tight">Scan Mood</p>
            <p className="text-soft text-sm mt-0.5">
              Tangkap ekspresimu dan simpan ke Galeri Mood bersama.
            </p>
          </div>
        </motion.div>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.08 }}
          className="surface surface-interactive rounded-2xl p-6 flex items-center gap-4"
        >
          <div className="h-11 w-11 shrink-0 rounded-full bg-grad-ember grid place-items-center shadow-ember">
            <Wand2 className="h-5 w-5 text-ink-950" strokeWidth={2} />
          </div>
          <div>
            <p className="font-display text-lg leading-tight">Avatar</p>
            <p className="text-soft text-sm mt-0.5">
              Gerakkan karakter rubah, kucing, hingga alien dengan wajahmu.
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.16 }}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-display text-lg">Cuplikan Galeri Mood</p>
          <Link
            href="/gallery"
            onMouseEnter={sfx.hover}
            onClick={sfx.click}
            className="text-[0.8rem] text-soft hover:text-inherit focus-ring rounded link-underline"
          >
            Lihat semua
          </Link>
        </div>
        {hasPhotos ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {photos.slice(0, 6).map((p, i) => (
              <GalleryThumb key={p.id} photo={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="surface rounded-2xl p-10 text-center">
            <p className="font-display text-xl mb-2">Belum ada foto</p>
            <p className="text-soft text-sm leading-relaxed">
              Foto hasil scan mood pertama akan muncul di sini dan di Galeri Mood.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
