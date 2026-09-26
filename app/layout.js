import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/fraunces/400.css";
import "@fontsource/fraunces/500.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/fraunces/500-italic.css";
import "@fontsource/fraunces/600-italic.css";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { sql, ensureSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Emora — Pelacak Suasana Hati",
  description:
    "Nyalakan kamera, Emora mengenali ekspresi wajahmu dan mencatat suasana hatimu dari waktu ke waktu.",
};

const themeInit = `
(function () {
  try {
    var saved = localStorage.getItem("emora-theme");
    var theme = saved || "dark";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

async function getRecentTicks() {
  try {
    if (!process.env.DATABASE_URL) return [];
    await ensureSchema();
    const rows = await sql`
      SELECT emotion, created_at FROM mood_entries
      ORDER BY created_at DESC LIMIT 40
    `;
    return rows.reverse().map((r) => ({ emotion: r.emotion, created_at: r.created_at }));
  } catch {
    return [];
  }
}

export default async function RootLayout({ children }) {
  const ticks = await getRecentTicks();

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="font-sans antialiased min-h-screen">
        <Navbar ticks={ticks} />
        <main>{children}</main>
      </body>
    </html>
  );
}
