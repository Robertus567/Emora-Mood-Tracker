"use client";

export default function PhotoPopup({ dataUrl, onClose }) {
  if (!dataUrl) return null;

  function handleSave() {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `emora-foto-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="surface rounded-3xl p-5 max-w-sm w-full animate-pop-in"
      >
        <div className="rounded-2xl overflow-hidden mb-5 surface-sunken">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt="Foto hasil jepretan" className="w-full h-auto block" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} className="btn-primary flex-1">
            Simpan ke perangkat
          </button>
          <button onClick={onClose} className="btn-secondary">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
