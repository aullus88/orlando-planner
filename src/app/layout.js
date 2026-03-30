import "./globals.css";

export const metadata = {
  title: "Orlando 2026 — Trip Planner",
  description: "Aulus + Patrícia + Malu · 31 Mar – 10 Abr",
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
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
