import { useState } from 'react';
import { createTask, updateTaskStatus } from '../api';

const TYPE_LABELS = {
  add_doing: 'Agregar en progreso',
  add_blocked: 'Agregar como bloqueado',
  resolve: 'Marcar como resuelto',
  block: 'Marcar como bloqueado',
};

export default function AIPreview({ actions, onApplied, onBack, onClose }) {
  const [selected, setSelected] = useState(() => actions.map(() => true));
  const [applying, setApplying] = useState(false);

  const selectedCount = selected.filter(Boolean).length;
  const allSelected = selected.every(Boolean);

  const toggleAll = () => {
    setSelected(actions.map(() => !allSelected));
  };

  const toggleOne = (index) => {
    setSelected((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const promises = actions
        .filter((_, i) => selected[i])
        .map((action) => {
          switch (action.type) {
            case 'add_doing':
              return createTask({ text: action.text, member_id: action.memberId, status: 'doing' });
            case 'add_blocked':
              return createTask({ text: action.text, member_id: action.memberId, status: 'blocked', blocker_note: action.note });
            case 'resolve':
              return updateTaskStatus(action.taskId, { status: 'resolved' });
            case 'block':
              return updateTaskStatus(action.taskId, { status: 'blocked', blocker_note: action.note });
            default:
              return Promise.resolve();
          }
        });

      await Promise.all(promises);
      onApplied();
    } catch (err) {
      console.error('Error applying actions:', err);
    } finally {
      setApplying(false);
    }
  };

  if (actions.length === 0) {
    return (
      <div>
        <div className="empty-state">No se detectaron cambios en el texto.</div>
        <div className="modal-actions">
          <button className="btn" onClick={onBack}>Volver</button>
          <button className="btn" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--gap-md)' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Se detectaron <strong style={{ color: 'var(--text-primary)' }}>{actions.length}</strong> cambios
        </p>
        <label className="ai-select-all">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="ai-action-checkbox"
            style={{ width: 14, height: 14 }}
          />
          Seleccionar todo
        </label>
      </div>

      <div className="ai-preview-list">
        {actions.map((action, i) => (
          <div className="ai-action" key={i}>
            <input
              type="checkbox"
              className="ai-action-checkbox"
              checked={selected[i]}
              onChange={() => toggleOne(i)}
            />
            <div className="ai-action-body">
              <span className={`ai-action-type ${action.type}`}>
                {TYPE_LABELS[action.type]}
              </span>
              <div className="ai-action-member">{action.memberName}</div>
              <div className="ai-action-text">{action.text}</div>
              {action.note && <div className="ai-action-note">Nota: {action.note}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="modal-actions">
        <button className="btn" onClick={onBack}>Volver</button>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleApply}
          disabled={applying || selectedCount === 0}
        >
          {applying ? 'Aplicando...' : `Aplicar ${selectedCount} cambio${selectedCount !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
}
