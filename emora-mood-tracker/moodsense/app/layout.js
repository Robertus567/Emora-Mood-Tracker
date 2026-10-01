import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/fraunces/400.css";
import "@fontsource/fraunces/500.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/fraunces/500-italic.css";
import "@fontsource/fraunces/600-italic.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SfxInit from "@/components/SfxInit";

export const metadata = {
  title: "Emora — Pelacak Suasana Hati",
  description:
    "Nyalakan kamera, Emora mengenali ekspresi wajahmu, menghidupkan avatar karaktermu, dan menyimpan momennya ke Galeri Mood.",
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

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="font-sans antialiased min-h-screen overflow-x-hidden">
        <div
          className="glow-orb"
          style={{
            width: 560,
            height: 560,
            top: -220,
            left: "50%",
            transform: "translateX(-60%)",
            background:
              "radial-gradient(circle, rgb(var(--accent) / 0.16) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div
          className="glow-orb"
          style={{
            width: 420,
            height: 420,
            top: 260,
            right: "-10%",
            background: "radial-gradient(circle, rgba(209,86,143,0.12) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <SfxInit />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
