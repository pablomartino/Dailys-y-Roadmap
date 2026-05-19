const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// Members
export const getMembers = () => request('/api/members');
export const createMember = (data) =>
  request('/api/members', { method: 'POST', body: JSON.stringify(data) });
export const deleteMember = (id) =>
  request(`/api/members/${id}`, { method: 'DELETE' });

// Tasks
export const getTasks = (includeDeployed = false) =>
  request(`/api/tasks${includeDeployed ? '?include_deployed=true' : ''}`);
export const createTask = (data) =>
  request('/api/tasks', { method: 'POST', body: JSON.stringify(data) });
export const updateTaskStatus = (id, data) =>
  request(`/api/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteTask = (id) =>
  request(`/api/tasks/${id}`, { method: 'DELETE' });

// Projects
export const getProjects = () => request('/api/projects');
export const createProject = (data) =>
  request('/api/projects', { method: 'POST', body: JSON.stringify(data) });
export const updateProject = (id, data) =>
  request(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const updateProjectPriority = (id, direction) =>
  request(`/api/projects/${id}/priority`, { method: 'PATCH', body: JSON.stringify({ direction }) });
export const deleteProject = (id) =>
  request(`/api/projects/${id}`, { method: 'DELETE' });
