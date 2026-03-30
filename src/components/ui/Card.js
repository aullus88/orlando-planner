export function Card({ children, className = "", border, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-4 mb-2.5 transition-all bg-theme-card border border-theme ${onClick ? "cursor-pointer hover:bg-theme-card-hover" : ""} ${className}`}
      style={border ? { border } : undefined}
    >
      {children}
    </div>
  );
}
