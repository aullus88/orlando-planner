export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-theme-modal w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto border border-theme"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-theme-modal px-5 py-4 border-b border-theme-light flex justify-between items-center z-10">
          <h3 className="text-base font-bold text-theme-primary">{title}</h3>
          <button onClick={onClose} className="text-theme-muted hover:text-theme-primary text-xl leading-none">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
