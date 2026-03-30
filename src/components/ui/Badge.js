export function Badge({ children, color = "#38BDF8" }) {
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: color + "20", color }}
    >
      {children}
    </span>
  );
}
