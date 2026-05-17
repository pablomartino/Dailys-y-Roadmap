const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/tasks — list tasks (excludes deployed by default)
router.get('/', async (req, res) => {
  try {
    const includeDeployed = req.query.include_deployed === 'true';

    let query = 'SELECT * FROM tasks';
    if (!includeDeployed) {
      query += " WHERE status != 'deployed'";
    }
    query += ' ORDER BY created_at ASC';

    const { rows } = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error listing tasks:', err.message);
    res.status(500).json({ error: 'Failed to list tasks' });
  }
});

// POST /api/tasks — create a task
router.post('/', async (req, res) => {
  try {
    const { text, member_id, status } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Task text is required' });
    }

    const validStatuses = ['doing', 'blocked', 'resolved', 'deployed'];
    const taskStatus = validStatuses.includes(status) ? status : 'doing';

    const { rows } = await db.query(
      `INSERT INTO tasks (text, member_id, status, blocker_note)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        text.trim(),
        member_id || null,
        taskStatus,
        req.body.blocker_note?.trim() || null,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating task:', err.message);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /api/tasks/:id/status — update task status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, blocker_note } = req.body;

    const validStatuses = ['doing', 'blocked', 'resolved', 'deployed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Build dynamic update
    let resolvedAt = null;
    let deployedAt = null;
    let blockerNote = null;

    if (status === 'resolved') {
      resolvedAt = new Date().toISOString();
    } else if (status === 'deployed') {
      deployedAt = new Date().toISOString();
    }

    if (status === 'blocked') {
      blockerNote = blocker_note?.trim() || null;
    }

    const { rows, rowCount } = await db.query(
      `UPDATE tasks
       SET status = $1,
           blocker_note = $2,
           resolved_at = COALESCE($3::timestamptz, resolved_at),
           deployed_at = COALESCE($4::timestamptz, deployed_at)
       WHERE id = $5
       RETURNING *`,
      [status, blockerNote, resolvedAt, deployedAt, id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating task status:', err.message);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

// DELETE /api/tasks/:id — delete a task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { rowCount } = await db.query(
      'DELETE FROM tasks WHERE id = $1',
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting task:', err.message);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
