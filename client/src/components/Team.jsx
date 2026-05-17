import { useState } from 'react';

function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Team({ members, tasks, onCreateMember, onDeleteMember }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await onCreateMember({ name: name.trim(), role: role.trim() || undefined });
      setName('');
      setRole('');
    } catch (err) {
      console.error('Error creating member:', err);
    }
  };

  const handleDelete = async (member) => {
    const memberTasks = tasks.filter((t) => t.member_id === member.id);
    const msg = memberTasks.length > 0
      ? `¿Eliminar a ${member.name}? Se eliminarán también sus ${memberTasks.length} tarea${memberTasks.length !== 1 ? 's' : ''}.`
      : `¿Eliminar a ${member.name}?`;

    if (window.confirm(msg)) {
      await onDeleteMember(member.id);
    }
  };

  return (
    <div className="team">
      <div className="team-grid">
        {members.map((member) => {
          const memberTasks = tasks.filter((t) => t.member_id === member.id);
          const doingCount = memberTasks.filter((t) => t.status === 'doing').length;
          const blockedCount = memberTasks.filter((t) => t.status === 'blocked').length;
          const resolvedCount = memberTasks.filter((t) => t.status === 'resolved').length;

          return (
            <div className="team-card" key={member.id}>
              <div className={`avatar avatar-${member.color_index}`}>
                {getInitials(member.name)}
              </div>
              <div className="team-card-body">
                <div className="member-name">{member.name}</div>
                {member.role && <div className="member-role">{member.role}</div>}
                <div className="member-badges" style={{ marginTop: 8 }}>
                  {doingCount > 0 && <span className="count-badge doing">{doingCount} en progreso</span>}
                  {blockedCount > 0 && <span className="count-badge blocked">{blockedCount} bloqueado{blockedCount > 1 ? 's' : ''}</span>}
                  {resolvedCount > 0 && <span className="count-badge resolved">{resolvedCount} resuelto{resolvedCount > 1 ? 's' : ''}</span>}
                </div>
              </div>
              <button
                className="team-card-delete"
                onClick={() => handleDelete(member)}
                title="Eliminar miembro"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {members.length === 0 && (
        <div className="empty-state" style={{ marginBottom: 'var(--gap-xl)' }}>
          No hay miembros en el equipo. Agregá el primero abajo.
        </div>
      )}

      <form className="team-form" onSubmit={handleSubmit}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label" htmlFor="member-name">Nombre</label>
          <input
            id="member-name"
            className="form-input"
            placeholder="Nombre del miembro"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label" htmlFor="member-role">Rol (opcional)</label>
          <input
            id="member-role"
            className="form-input"
            placeholder="Frontend, Backend, QA..."
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-lg">
          Agregar
        </button>
      </form>
    </div>
  );
}
