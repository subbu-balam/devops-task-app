import React, { useEffect, useMemo, useState } from 'react';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5001';
const TASK_API_URL = import.meta.env.VITE_TASK_API_URL || 'http://localhost:5002';

const emptyTask = { title: '', description: '', status: 'todo' };

export default function App() {
  const [mode, setMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isAuthenticated = useMemo(() => Boolean(token && user), [token, user]);

  useEffect(() => {
    if (!token) return;

    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  async function verifyToken() {
    try {
      const response = await fetch(`${AUTH_API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Session expired. Please log in again.');
      const data = await response.json();
      setUser({ id: data.user.userId, email: data.user.email });
      setError('');
    } catch (err) {
      logout();
      setError(err.message);
    }
  }

  async function fetchTasks() {
    try {
      const response = await fetch(`${TASK_API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch tasks.');
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    const payload =
      mode === 'login'
        ? { email: authForm.email, password: authForm.password }
        : authForm;

    try {
      const response = await fetch(`${AUTH_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Authentication failed.');

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user || { id: data.userId, email: authForm.email, name: authForm.name });
      setAuthForm({ name: '', email: '', password: '' });
      setMessage(mode === 'login' ? 'Logged in successfully.' : 'Registered successfully.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleTaskSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const url = editingTaskId ? `${TASK_API_URL}/tasks/${editingTaskId}` : `${TASK_API_URL}/tasks`;
      const method = editingTaskId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskForm),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save task.');

      setTaskForm(emptyTask);
      setEditingTaskId(null);
      setMessage(editingTaskId ? 'Task updated successfully.' : 'Task created successfully.');
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(task) {
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title,
      description: task.description,
      status: task.status,
    });
  }

  function cancelEdit() {
    setEditingTaskId(null);
    setTaskForm(emptyTask);
  }

  async function deleteTask(id) {
    try {
      const response = await fetch(`${TASK_API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete task.');
      setMessage('Task deleted successfully.');
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setTasks([]);
    setTaskForm(emptyTask);
    setEditingTaskId(null);
    setMode('login');
  }

  return (
    <div className="page">
      <div className="container">
        <header className="hero">
          <div>
            <h1>DevOps Task App</h1>
            <p>Simple auth + CRUD app built as the application layer for your DevOps project.</p>
          </div>
          {isAuthenticated && (
            <button className="secondary" onClick={logout}>Logout</button>
          )}
        </header>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        {!isAuthenticated ? (
          <section className="card auth-card">
            <div className="tabs">
              <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
              <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
            </div>

            <form onSubmit={handleAuthSubmit} className="form">
              {mode === 'register' && (
                <label>
                  Name
                  <input
                    type="text"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    required
                  />
                </label>
              )}

              <label>
                Email
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  required
                />
              </label>

              <button type="submit">
                {mode === 'login' ? 'Login' : 'Create account'}
              </button>
            </form>
          </section>
        ) : (
          <main className="dashboard">
            <section className="card">
              <h2>{editingTaskId ? 'Edit task' : 'Create task'}</h2>
              <form onSubmit={handleTaskSubmit} className="form">
                <label>
                  Title
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    required
                  />
                </label>

                <label>
                  Description
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    rows="4"
                  />
                </label>

                <label>
                  Status
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  >
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                </label>

                <div className="actions">
                  <button type="submit">{editingTaskId ? 'Update task' : 'Create task'}</button>
                  {editingTaskId && (
                    <button type="button" className="secondary" onClick={cancelEdit}>Cancel</button>
                  )}
                </div>
              </form>
            </section>

            <section className="card">
              <h2>Your tasks</h2>
              {tasks.length === 0 ? (
                <p className="muted">No tasks yet. Create your first one.</p>
              ) : (
                <div className="task-list">
                  {tasks.map((task) => (
                    <article key={task.id} className="task-item">
                      <div>
                        <h3>{task.title}</h3>
                        <p>{task.description || 'No description'}</p>
                        <span className={`status ${task.status}`}>{task.status.replace('_', ' ')}</span>
                      </div>
                      <div className="task-actions">
                        <button className="secondary" onClick={() => startEdit(task)}>Edit</button>
                        <button className="danger" onClick={() => deleteTask(task.id)}>Delete</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </main>
        )}
      </div>
    </div>
  );
}
