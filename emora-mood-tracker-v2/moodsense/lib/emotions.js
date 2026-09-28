// Central source of truth for how each face-api.js expression is presented
// across the app: label, color, emoji, and the short affirmations shown
// right after a scan. Colors reference the `mood` palette in tailwind.config.js.

export const EMOTION_ORDER = [
  "happy",
  "neutral",
  "sad",
  "angry",
  "surprised",
  "fearful",
  "disgusted",
];

export const EMOTIONS = {
  happy: {
    label: "Senang",
    emoji: "😄",
    color: "#E8A93B",
    var: "mood-joy",
    quotes: [
      "Simpan rasa ini. Kamu berhak merasa sebaik ini.",
      "Senyum tadi jujur — bagus untuk diingat lagi nanti.",
      "Energi baik begini layak dirayakan, sekecil apa pun sebabnya.",
    ],
  },
  neutral: {
    label: "Biasa",
    emoji: "😐",
    color: "#7A88A6",
    var: "mood-calm",
    quotes: [
      "Tenang itu bukan kosong — ini titik seimbang yang sehat.",
      "Tidak semua hari harus ramai. Hari datar juga valid.",
      "Stabil begini adalah fondasi yang baik untuk besok.",
    ],
  },
  sad: {
    label: "Sedih",
    emoji: "😢",
    color: "#4C6FA8",
    var: "mood-sad",
    quotes: [
      "Boleh sedih dulu. Tidak perlu buru-buru baik-baik saja.",
      "Rasa ini sementara, meski terasa berat sekarang.",
      "Mencatat ini sudah langkah yang berani.",
    ],
  },
  angry: {
    label: "Marah",
    emoji: "😠",
    color: "#C4432B",
    var: "mood-anger",
    quotes: [
      "Tarik napas panjang. Rasa ini valid, cara meresponnya bisa dipilih.",
      "Marah sering menandakan ada batas yang perlu dijaga.",
      "Beri jeda sebelum membalas apa pun sekarang.",
    ],
  },
  surprised: {
    label: "Terkejut",
    emoji: "😲",
    color: "#C94F92",
    var: "mood-surprise",
    quotes: [
      "Sesuatu di luar dugaan barusan? Catat konteksnya di catatan.",
      "Kejutan kecil begini bikin hari terasa hidup.",
    ],
  },
  fearful: {
    label: "Takut",
    emoji: "😨",
    color: "#7A63B8",
    var: "mood-fear",
    quotes: [
      "Cemas boleh muncul. Kamu tidak harus menghadapinya sendirian.",
      "Satu tarikan napas dalam dulu, baru lanjut langkah berikutnya.",
    ],
  },
  disgusted: {
    label: "Jijik",
    emoji: "🤢",
    color: "#4F8763",
    var: "mood-disgust",
    quotes: [
      "Reaksi ini biasanya sinyal — ada sesuatu yang tidak sesuai denganmu.",
    ],
  },
};

export function emotionMeta(key) {
  return EMOTIONS[key] || EMOTIONS.neutral;
}

// Given a face-api.js expressions object { happy: 0.1, sad: 0.8, ... }
// return the dominant emotion key and its confidence.
export function dominantFromScores(scores) {
  let bestKey = "neutral";
  let bestVal = -1;
  for (const key of Object.keys(scores)) {
    if (scores[key] > bestVal) {
      bestVal = scores[key];
      bestKey = key;
    }
  }
  return { emotion: bestKey, confidence: bestVal };
}
