const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/members — list all members
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM members ORDER BY created_at ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error listing members:', err.message);
    res.status(500).json({ error: 'Failed to list members' });
  }
});

// POST /api/members — create a member
router.post('/', async (req, res) => {
  try {
    const { name, role } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Auto-assign color_index (0-5 cycling)
    const countResult = await db.query('SELECT COUNT(*) FROM members');
    const colorIndex = parseInt(countResult.rows[0].count) % 6;

    const { rows } = await db.query(
      `INSERT INTO members (name, role, color_index)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), role?.trim() || null, colorIndex]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating member:', err.message);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// DELETE /api/members/:id — delete a member and their tasks
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { rowCount } = await db.query(
      'DELETE FROM members WHERE id = $1',
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Tasks are cascade-deleted via FK constraint
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting member:', err.message);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

module.exports = router;
