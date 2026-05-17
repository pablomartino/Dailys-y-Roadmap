import { useState } from 'react';

export default function BlockerModal({ taskText, onConfirm, onCancel }) {
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(note.trim() || null);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title" style={{ color: 'var(--red)' }}>Bloquear tarea</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--gap-md)' }}>
          {taskText}
        </p>
        <form onSubmit={handleSubmit}>
          <textarea
            className="modal-textarea"
            placeholder="Descripción del bloqueo (opcional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
            rows={3}
          />
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn-red">Bloquear</button>
          </div>
        </form>
      </div>
    </div>
  );
}
