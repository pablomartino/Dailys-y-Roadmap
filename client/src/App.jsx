import { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import Team from './components/Team';
import Roadmap from './components/Roadmap';
import { getMembers, getTasks, createMember, deleteMember, createTask, updateTaskStatus, deleteTask, getProjects, createProject, updateProject, updateProjectPriority, deleteProject } from './api';

function getSpanishDate() {
  const now = new Date();
  return now.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function App() {
  const [activeTab, setActiveTab] = useState('board');
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [m, t, p] = await Promise.all([getMembers(), getTasks(), getProjects()]);
      setMembers(m);
      setTasks(t);
      setProjects(p);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Member actions
  const handleCreateMember = async (data) => {
    const member = await createMember(data);
    setMembers((prev) => [...prev, member]);
    return member;
  };

  const handleDeleteMember = async (id) => {
    await deleteMember(id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setTasks((prev) => prev.filter((t) => t.member_id !== id));
  };

  // Task actions
  const handleCreateTask = async (data) => {
    const task = await createTask(data);
    setTasks((prev) => [...prev, task]);
    return task;
  };

  const handleUpdateTaskStatus = async (id, data) => {
    const updated = await updateTaskStatus(id, data);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? updated : t)).filter((t) => t.status !== 'deployed')
    );
    return updated;
  };

  const handleDeleteTask = async (id) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Project actions
  const handleCreateProject = async (data) => {
    const project = await createProject(data);
    setProjects((prev) => [...prev, project]);
  };

  const handleUpdateProject = async (id, data) => {
    const updated = await updateProject(id, data);
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...updated, member_name: data.member_name, member_color_index: data.member_color_index } : p)));
    await getProjects().then(setProjects);
  };

  const handleUpdatePriority = async (id, direction) => {
    const updated = await updateProjectPriority(id, direction);
    setProjects(updated);
  };

  const handleDeleteProject = async (id) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const blockedCount = tasks.filter((t) => t.status === 'blocked').length;

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <span className="loading-text">Cargando dailyboard...</span>
      </div>
    );
  }

  return (
    <>
      <header className="header">
        <div className="header-left">
          <span className="logo">dailyboard</span>
          <nav className="tabs">
            <button
              id="tab-board"
              className={`tab ${activeTab === 'board' ? 'active' : ''}`}
              onClick={() => setActiveTab('board')}
            >
              Tablero
              {blockedCount > 0 && <span className="tab-badge" />}
            </button>
            <button
              id="tab-team"
              className={`tab ${activeTab === 'team' ? 'active' : ''}`}
              onClick={() => setActiveTab('team')}
            >
              Equipo
            </button>
            <button
              id="tab-roadmap"
              className={`tab ${activeTab === 'roadmap' ? 'active' : ''}`}
              onClick={() => setActiveTab('roadmap')}
            >
              Roadmap
            </button>
          </nav>
        </div>
        <span className="header-date">{getSpanishDate()}</span>
      </header>

      {activeTab === 'board' && (
        <Board
          members={members}
          tasks={tasks}
          onCreateTask={handleCreateTask}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onDeleteTask={handleDeleteTask}
        />
      )}
      {activeTab === 'team' && (
        <Team
          members={members}
          tasks={tasks}
          onCreateMember={handleCreateMember}
          onDeleteMember={handleDeleteMember}
        />
      )}
      {activeTab === 'roadmap' && (
        <Roadmap
          projects={projects}
          members={members}
          onCreateProject={handleCreateProject}
          onUpdateProject={handleUpdateProject}
          onUpdatePriority={handleUpdatePriority}
          onDeleteProject={handleDeleteProject}
        />
      )}
    </>
  );
}
