# Emora Mood Tracker

**A bilingual web app for exploring facial expressions in real time.**

[Live demo](https://emorafacemoodtracker.vercel.app) | [App source and setup guide](emora-mood-tracker/moodsense/README.md)

Emora detects seven facial expressions from a webcam in the browser. Visitors can capture a mood snapshot, review the expression scores, and choose whether to save the photo to a shared gallery. An avatar studio maps facial movement to seven illustrated characters, with expression previews available even before turning on the camera.

## Highlights

- **Mood scan:** live expression scores, face landmarks, optional animal filters, and a camera shutter.
- **Avatar studio:** animated eyes, brows, mouth, head pose, gaze, and tongue tracking with a downloadable snapshot.
- **Shared gallery:** saved photos show expression scores and can be viewed or downloaded by visitors.
- **Indonesian and English:** the EN/ID control switches interface copy, accessibility labels, dates, metadata, and API messages. The selection persists in a cookie.
- **Light and dark themes:** a responsive interface with locally generated sound effects.

## Privacy and scope

Live webcam video and avatar tracking run in the browser. A photo is sent to Neon Postgres only when the visitor chooses **Save to Gallery**. Gallery photos are visible to anyone. This demo does not have accounts or ownership checks for deleting gallery photos, so visitors should avoid uploading sensitive images.

## Built with

Next.js 14, React 18, face-api.js, Canvas, Framer Motion, Tailwind CSS, and Neon Postgres.

## Run locally

```bash
cd emora-mood-tracker/moodsense
npm install
cp .env.example .env.local
# Set DATABASE_URL in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). See the [app README](emora-mood-tracker/moodsense/README.md) for the full setup guide and feature details.
