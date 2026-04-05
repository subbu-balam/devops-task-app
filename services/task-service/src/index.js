import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

app.get('/health', (_req, res) => {
  res.json({ service: 'task-service', status: 'ok' });
});

app.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.get('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.post('/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, description = '', status = 'todo' } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, description, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.userId, title, description, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.put('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description = '', status = 'todo' } = req.body;

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, description = $2, status = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [title, description, status, req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.delete('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`task-service running on http://localhost:${PORT}`);
});
