export function Btn({ children, onClick, variant = "primary", className = "", disabled }) {
  const base = "px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40";
  const v = {
    primary: "bg-accent text-white hover:bg-accent-hover",
    secondary: "bg-theme-card text-theme-secondary hover:bg-theme-card-hover border border-theme",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${v[variant]} ${className}`}>
      {children}
    </button>
  );
}
