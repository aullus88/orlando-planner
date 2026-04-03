import "./globals.css";

export const metadata = {
  title: "Orlando 2026 — Trip Planner",
  description: "Aulus + Patrícia + Malu · 31 Mar – 10 Abr",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Orlando 26",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('orlando-theme') || 'dark';
              var d = t === 'system'
                ? window.matchMedia('(prefers-color-scheme: dark)').matches
                : t === 'dark';
              document.documentElement.classList.toggle('dark', d);
              document.documentElement.classList.toggle('light', !d);
            } catch(e){}
          })();
        `}} />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF6B3D" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Orlando 26" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
