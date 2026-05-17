import { useState } from 'react';
import BlockerModal from './BlockerModal';

export default function TaskCard({ task, onUpdateStatus, onDelete }) {
  const [showBlockerModal, setShowBlockerModal] = useState(false);

  const handleBlock = async (note) => {
    await onUpdateStatus(task.id, { status: 'blocked', blocker_note: note });
    setShowBlockerModal(false);
  };

  const handleUnblock = async () => {
    await onUpdateStatus(task.id, { status: 'doing' });
  };

  const handleResolve = async () => {
    await onUpdateStatus(task.id, { status: 'resolved' });
  };

  const handleDeploy = async () => {
    await onUpdateStatus(task.id, { status: 'deployed' });
  };

  const handleReturn = async () => {
    await onUpdateStatus(task.id, { status: 'doing' });
  };

  const handleDelete = async () => {
    await onDelete(task.id);
  };

  return (
    <>
      <div className={`task-card ${task.status === 'resolved' ? 'resolved' : ''}`}>
        <div className="task-text">{task.text}</div>

        {task.status === 'blocked' && task.blocker_note && (
          <div className="task-blocker-note">{task.blocker_note}</div>
        )}

        {task.status === 'resolved' && (
          <div className="task-resolved-badge">Resuelto · pendiente de deploy</div>
        )}

        <div className="task-actions">
          {task.status === 'doing' && (
            <>
              <button className="btn btn-red" onClick={() => setShowBlockerModal(true)}>Bloquear</button>
              <button className="btn btn-amber" onClick={handleResolve}>Resuelto</button>
            </>
          )}
          {task.status === 'resolved' && (
            <>
              <button className="btn btn-green" onClick={handleDeploy}>✓ Deployado</button>
              <button className="btn" onClick={handleReturn}>Volver</button>
            </>
          )}
          {task.status === 'blocked' && (
            <>
              <button className="btn btn-blue" onClick={handleUnblock}>Desbloquear</button>
            </>
          )}
          <button className="btn btn-danger" onClick={handleDelete}>Eliminar</button>
        </div>
      </div>

      {showBlockerModal && (
        <BlockerModal
          taskText={task.text}
          onConfirm={handleBlock}
          onCancel={() => setShowBlockerModal(false)}
        />
      )}
    </>
  );
}
