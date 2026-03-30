export function Input({ label, value, onChange, type = "text", placeholder, textarea }) {
  const cls = "w-full bg-theme-input-bg border border-theme-input-border rounded-lg px-3 py-2 text-sm text-theme-primary placeholder:text-theme-muted focus:outline-none focus:border-accent/50";
  return (
    <div className="mb-3">
      {label && <label className="block text-xs font-medium text-theme-secondary mb-1">{label}</label>}
      {textarea ? (
        <textarea className={cls} value={value} onChange={onChange} placeholder={placeholder} rows={3} />
      ) : (
        <input className={cls} type={type} value={value} onChange={onChange} placeholder={placeholder} />
      )}
    </div>
  );
}
