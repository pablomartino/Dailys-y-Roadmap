import { useState } from 'react';

const STATUS_LABELS = {
  planned: 'Planeado',
  in_progress: 'En progreso',
  done: 'Finalizado',
};

const STATUS_CLASS = {
  planned: 'blue',
  in_progress: 'amber',
  done: 'green',
};

function getInitials(name) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function ProjectForm({ form, setForm, members, onSubmit, onCancel, submitLabel }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="project-form-fields">
        <input
          className="form-input"
          placeholder="Nombre del proyecto"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          autoFocus
          required
        />
        <input
          className="form-input"
          placeholder="Descripción (opcional)"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <select
          className="form-input form-select"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="planned">Planeado</option>
          <option value="in_progress">En progreso</option>
          <option value="done">Finalizado</option>
        </select>
        <select
          className="form-input form-select"
          value={form.member_id}
          onChange={(e) => setForm((f) => ({ ...f, member_id: e.target.value }))}
        >
          <option value="">Sin responsable</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
      <div className="project-form-actions">
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}

const EMPTY_FORM = { name: '', description: '', status: 'planned', member_id: '' };

export default function Roadmap({ projects, members, onCreateProject, onUpdateProject, onUpdatePriority, onDeleteProject }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const resetForm = () => setForm(EMPTY_FORM);

  const handleCreate = async (e) => {
    e.preventDefault();
    await onCreateProject({ ...form, member_id: form.member_id || null });
    resetForm();
    setShowForm(false);
  };

  const handleStartEdit = (project) => {
    setEditingId(project.id);
    setForm({
      name: project.name,
      description: project.description || '',
      status: project.status,
      member_id: project.member_id || '',
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await onUpdateProject(editingId, { ...form, member_id: form.member_id || null });
    setEditingId(null);
    resetForm();
  };

  const handleDelete = async (project) => {
    if (window.confirm(`¿Eliminar "${project.name}"?`)) {
      await onDeleteProject(project.id);
    }
  };

  return (
    <div className="roadmap">
      <div className="roadmap-header">
        <h2 className="roadmap-title">Roadmap</h2>
        {!showForm && (
          <button className="btn btn-primary btn-lg" onClick={() => setShowForm(true)}>
            + Agregar proyecto
          </button>
        )}
      </div>

      {showForm && (
        <div className="project-form">
          <ProjectForm
            form={form}
            setForm={setForm}
            members={members}
            onSubmit={handleCreate}
            onCancel={() => { setShowForm(false); resetForm(); }}
            submitLabel="Agregar"
          />
        </div>
      )}

      {projects.length === 0 && !showForm ? (
        <div className="empty-state">No hay proyectos en el roadmap. Agregá el primero.</div>
      ) : (
        <div className="project-list">
          {projects.map((project, index) => (
            <div className="project-card" key={project.id}>
              {editingId === project.id ? (
                <div style={{ flex: 1 }}>
                  <ProjectForm
                    form={form}
                    setForm={setForm}
                    members={members}
                    onSubmit={handleUpdate}
                    onCancel={() => { setEditingId(null); resetForm(); }}
                    submitLabel="Guardar"
                  />
                </div>
              ) : (
                <>
                  <div className="project-priority-controls">
                    <button
                      className="priority-btn"
                      onClick={() => onUpdatePriority(project.id, 'up')}
                      disabled={index === 0}
                      title="Subir prioridad"
                    >↑</button>
                    <span className="priority-number">{index + 1}</span>
                    <button
                      className="priority-btn"
                      onClick={() => onUpdatePriority(project.id, 'down')}
                      disabled={index === projects.length - 1}
                      title="Bajar prioridad"
                    >↓</button>
                  </div>

                  <div className="project-body">
                    <div className="project-name">{project.name}</div>
                    {project.description && (
                      <div className="project-description">{project.description}</div>
                    )}
                    {project.member_id && (
                      <div className="project-member">
                        <div
                          className={`avatar avatar-${project.member_color_index}`}
                          style={{ width: 20, height: 20, minWidth: 20, fontSize: '0.6rem' }}
                        >
                          {getInitials(project.member_name)}
                        </div>
                        <span className="project-member-name">{project.member_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="project-right">
                    <span className={`project-status status-${STATUS_CLASS[project.status]}`}>
                      {STATUS_LABELS[project.status]}
                    </span>
                    <div className="project-actions">
                      <button className="btn" onClick={() => handleStartEdit(project)}>Editar</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(project)}>Eliminar</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
