(function(){
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const BASE = isLocalhost ? 'http://localhost:3000/api/v1/tasks' : '/api/v1/tasks';

  async function fetchTasks() {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return await res.json();
  }

  async function createTask(data) {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.status === 400) {
      const err = await res.json();
      const e = new Error('BAD_REQUEST');
      e.info = err;
      throw e;
    }
    if (!res.ok) throw new Error('Server error');
    return await res.json();
  }

  async function deleteTask(id) {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (res.status === 404) {
      const e = new Error('NOT_FOUND');
      throw e;
    }
    if (res.status !== 204) throw new Error('Failed to delete');
    return true;
  }

  async function updateTask(id, data) {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.status === 404) {
      const e = new Error('NOT_FOUND');
      throw e;
    }
    if (res.status === 400) {
      const err = await res.json();
      const e = new Error('BAD_REQUEST');
      e.info = err;
      throw e;
    }
    if (!res.ok) throw new Error('Server error');
    return await res.json();
  }

  async function saveOrder(order) {
    const res = await fetch(`${BASE}/order`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    if (!res.ok) throw new Error('Failed to save order');
    return await res.json();
  }

  window.apiClient = { fetchTasks, createTask, deleteTask, updateTask, saveOrder };
})();
