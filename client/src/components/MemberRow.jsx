import { useState } from 'react';
import TaskCard from './TaskCard';

function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function MemberRow({ member, tasks, onCreateTask, onUpdateTaskStatus, onDeleteTask }) {
  const [doingText, setDoingText] = useState('');
  const [blockedText, setBlockedText] = useState('');

  const doingTasks = tasks.filter((t) => t.status === 'doing' || t.status === 'resolved');
  const blockedTasks = tasks.filter((t) => t.status === 'blocked');

  const doingCount = tasks.filter((t) => t.status === 'doing').length;
  const blockedCount = blockedTasks.length;
  const resolvedCount = tasks.filter((t) => t.status === 'resolved').length;

  const handleAddDoing = async (e) => {
    if (e.key === 'Enter' && doingText.trim()) {
      await onCreateTask({ text: doingText.trim(), member_id: member.id, status: 'doing' });
      setDoingText('');
    }
  };

  const handleAddBlocked = async (e) => {
    if (e.key === 'Enter' && blockedText.trim()) {
      await onCreateTask({ text: blockedText.trim(), member_id: member.id, status: 'blocked' });
      setBlockedText('');
    }
  };

  return (
    <div className="member-row">
      {/* Member info column */}
      <div className="member-info">
        <div className={`avatar avatar-${member.color_index}`}>
          {getInitials(member.name)}
        </div>
        <div className="member-details">
          <span className="member-name">{member.name}</span>
          {member.role && <span className="member-role">{member.role}</span>}
          <div className="member-badges">
            {doingCount > 0 && <span className="count-badge doing">{doingCount} en progreso</span>}
            {blockedCount > 0 && <span className="count-badge blocked">{blockedCount} bloqueado{blockedCount > 1 ? 's' : ''}</span>}
            {resolvedCount > 0 && <span className="count-badge resolved">{resolvedCount} resuelto{resolvedCount > 1 ? 's' : ''}</span>}
          </div>
        </div>
      </div>

      {/* Doing column */}
      <div className="task-column doing">
        {doingTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdateStatus={onUpdateTaskStatus}
            onDelete={onDeleteTask}
          />
        ))}
        <input
          className="inline-input"
          placeholder="+ Agregar tarea..."
          value={doingText}
          onChange={(e) => setDoingText(e.target.value)}
          onKeyDown={handleAddDoing}
        />
      </div>

      {/* Blocked column */}
      <div className="task-column blocked">
        {blockedTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdateStatus={onUpdateTaskStatus}
            onDelete={onDeleteTask}
          />
        ))}
        <input
          className="inline-input"
          placeholder="+ Agregar bloqueo..."
          value={blockedText}
          onChange={(e) => setBlockedText(e.target.value)}
          onKeyDown={handleAddBlocked}
        />
      </div>
    </div>
  );
}
