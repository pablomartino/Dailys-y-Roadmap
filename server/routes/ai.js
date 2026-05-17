const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const db = require('../db');

// POST /api/ai/extract — analyze daily standup text with AI
router.post('/extract', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    // 1. Get current active tasks and members from DB
    const [tasksResult, membersResult] = await Promise.all([
      db.query("SELECT * FROM tasks WHERE status IN ('doing', 'blocked', 'resolved') ORDER BY created_at ASC"),
      db.query('SELECT * FROM members ORDER BY created_at ASC'),
    ]);

    const tasks = tasksResult.rows;
    const members = membersResult.rows;

    // 2. Build context string for the AI
    const memberTaskMap = {};
    members.forEach(m => { memberTaskMap[m.id] = { name: m.name, tasks: [] }; });
    tasks.forEach(t => {
      if (t.member_id && memberTaskMap[t.member_id]) {
        memberTaskMap[t.member_id].tasks.push(t);
      }
    });

    let contextLines = [];
    Object.values(memberTaskMap).forEach(({ name, tasks: memberTasks }) => {
      if (memberTasks.length > 0) {
        const taskStrings = memberTasks.map(t =>
          `[id:${t.id}] "${t.text}" (${t.status}${t.blocker_note ? ` — blocker: ${t.blocker_note}` : ''})`
        );
        contextLines.push(`${name}: ${taskStrings.join(', ')}`);
      } else {
        contextLines.push(`${name}: (sin tareas activas)`);
      }
    });

    const context = contextLines.join('\n');

    // 3. Call Anthropic API
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const systemPrompt = `Analizá este texto de daily standup.
Tenés acceso a las tareas actuales del board en el contexto.
Para cada persona mencionada, determiná:
- add_doing: tareas NUEVAS en progreso (no existen en el board)
- add_blocked: bloqueos NUEVOS
- resolve: ids de tareas existentes que se completaron
- block: ids de tareas existentes que se bloquearon, con nota

Respondé SOLO con JSON sin backticks:
{"persons":[{"name":"","add_doing":[],"add_blocked":[],"resolve":[],"block":[{"id":"","note":""}]}]}`;

    const userMessage = `CONTEXTO DEL BOARD ACTUAL:\n${context}\n\nTEXTO DE LA DAILY:\n${text}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    // 4. Parse AI response
    const responseText = message.content[0].text.trim();
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse AI response:', responseText);
      return res.status(500).json({ error: 'Failed to parse AI response', raw: responseText });
    }

    // 5. Map names to member IDs and build actions array
    const actions = [];

    for (const person of (parsed.persons || [])) {
      // Partial case-insensitive name match
      const matchedMember = members.find(m =>
        m.name.toLowerCase().includes(person.name.toLowerCase()) ||
        person.name.toLowerCase().includes(m.name.toLowerCase())
      );

      const memberId = matchedMember?.id || null;
      const memberName = matchedMember?.name || person.name;

      // New doing tasks
      for (const taskText of (person.add_doing || [])) {
        actions.push({
          type: 'add_doing',
          memberId,
          memberName,
          text: taskText,
        });
      }

      // New blocked tasks
      for (const taskText of (person.add_blocked || [])) {
        actions.push({
          type: 'add_blocked',
          memberId,
          memberName,
          text: taskText,
        });
      }

      // Resolve existing tasks
      for (const taskId of (person.resolve || [])) {
        const task = tasks.find(t => t.id === taskId);
        actions.push({
          type: 'resolve',
          memberId,
          memberName,
          taskId,
          text: task?.text || '(tarea desconocida)',
        });
      }

      // Block existing tasks
      for (const block of (person.block || [])) {
        const task = tasks.find(t => t.id === block.id);
        actions.push({
          type: 'block',
          memberId,
          memberName,
          taskId: block.id,
          text: task?.text || '(tarea desconocida)',
          note: block.note || null,
        });
      }
    }

    res.json({ actions });
  } catch (err) {
    console.error('Error in AI extract:', err.message);
    res.status(500).json({ error: 'AI extraction failed', details: err.message });
  }
});

module.exports = router;
