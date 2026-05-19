const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT p.*, m.name as member_name, m.color_index as member_color_index
      FROM projects p
      LEFT JOIN members m ON p.member_id = m.id
      ORDER BY p.priority_order ASC, p.created_at ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error listing projects:', err.message);
    res.status(500).json({ error: 'Failed to list projects' });
  }
});

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    const { name, description, status, member_id } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const maxResult = await db.query('SELECT COALESCE(MAX(priority_order), -1) as max FROM projects');
    const nextOrder = parseInt(maxResult.rows[0].max) + 1;

    const { rows } = await db.query(
      `INSERT INTO projects (name, description, status, member_id, priority_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name.trim(), description?.trim() || null, status || 'planned', member_id || null, nextOrder]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating project:', err.message);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PATCH /api/projects/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, member_id } = req.body;

    const { rows, rowCount } = await db.query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           description = $2,
           status = COALESCE($3, status),
           member_id = $4
       WHERE id = $5
       RETURNING *`,
      [name?.trim(), description?.trim() || null, status, member_id || null, id]
    );

    if (rowCount === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating project:', err.message);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// PATCH /api/projects/:id/priority — move up or down
router.patch('/:id/priority', async (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;

    const current = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (current.rowCount === 0) return res.status(404).json({ error: 'Project not found' });

    const currentOrder = current.rows[0].priority_order;

    const adjacent = await db.query(
      direction === 'up'
        ? 'SELECT * FROM projects WHERE priority_order < $1 ORDER BY priority_order DESC LIMIT 1'
        : 'SELECT * FROM projects WHERE priority_order > $1 ORDER BY priority_order ASC LIMIT 1',
      [currentOrder]
    );

    if (adjacent.rowCount === 0) {
      const { rows } = await db.query('SELECT p.*, m.name as member_name, m.color_index as member_color_index FROM projects p LEFT JOIN members m ON p.member_id = m.id ORDER BY p.priority_order ASC');
      return res.json(rows);
    }

    const adjacentOrder = adjacent.rows[0].priority_order;
    const adjacentId = adjacent.rows[0].id;

    await db.query('UPDATE projects SET priority_order = $1 WHERE id = $2', [adjacentOrder, id]);
    await db.query('UPDATE projects SET priority_order = $1 WHERE id = $2', [currentOrder, adjacentId]);

    const { rows } = await db.query(`
      SELECT p.*, m.name as member_name, m.color_index as member_color_index
      FROM projects p
      LEFT JOIN members m ON p.member_id = m.id
      ORDER BY p.priority_order ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error updating project priority:', err.message);
    res.status(500).json({ error: 'Failed to update priority' });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await db.query('DELETE FROM projects WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting project:', err.message);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;
