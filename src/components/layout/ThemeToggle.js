"use client";

export function ThemeToggle({ mode, onCycle }) {
  const icons = { dark: "🌙", light: "☀️", system: "💻" };
  const labels = { dark: "Escuro", light: "Claro", system: "Sistema" };

  return (
    <button
      onClick={onCycle}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all
        bg-theme-card border border-theme text-theme-secondary hover:text-theme-primary"
      title={`Tema: ${labels[mode]}`}
    >
      <span>{icons[mode]}</span>
      <span className="hidden sm:inline">{labels[mode]}</span>
    </button>
  );
}
