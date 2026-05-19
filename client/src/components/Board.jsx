import MemberRow from './MemberRow';

export default function Board({ members, tasks, onCreateTask, onUpdateTaskStatus, onDeleteTask }) {
  return (
    <div className="board">
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
    </div>
  );
}
