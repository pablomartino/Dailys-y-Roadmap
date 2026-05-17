import { useState } from 'react';
import MemberRow from './MemberRow';
import AIImport from './AIImport';

export default function Board({ members, tasks, onCreateTask, onUpdateTaskStatus, onDeleteTask, onRefresh }) {
  const [showAI, setShowAI] = useState(false);

  return (
    <div className="board">
      <div className="board-header">
        <div />
        <button className="btn btn-lg btn-blue" onClick={() => setShowAI(true)} id="btn-ai-import">
          ✦ Importar con IA
        </button>
      </div>

      <div className="board-columns-header">
        <div className="column-label">&nbsp;</div>
        <div className="column-label doing">En progreso</div>
        <div className="column-label blocked">Bloqueado</div>
      </div>

      {members.length === 0 ? (
        <div className="empty-state">
          No hay miembros en el equipo. Agregá miembros desde la pestaña "Equipo".
        </div>
      ) : (
        members.map((member) => {
          const memberTasks = tasks.filter((t) => t.member_id === member.id);
          return (
            <MemberRow
              key={member.id}
              member={member}
              tasks={memberTasks}
              onCreateTask={onCreateTask}
              onUpdateTaskStatus={onUpdateTaskStatus}
              onDeleteTask={onDeleteTask}
            />
          );
        })
      )}

      {showAI && (
        <AIImport
          onClose={() => setShowAI(false)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}
