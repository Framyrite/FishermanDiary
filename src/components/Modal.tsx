import type { ReactNode } from "react";

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="btn secondary small" onClick={onClose} type="button">
            Закрыть
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
