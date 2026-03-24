const fs = require('fs');
const path = require('path');
const os = require('os');

const isVercel = process.env.VERCEL === '1';
const DATA_DIR = isVercel ? os.tmpdir() : path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');

let tasks = [];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadFromDisk() {
  try {
    ensureDataDir();
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      tasks = JSON.parse(raw) || [];
    } else {
      tasks = [];
      saveToDisk();
    }
  } catch (e) {
    console.error('Error loading tasks from disk', e);
    tasks = [];
  }
}

function saveToDisk() {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving tasks to disk', e);
  }
}

// Inicializar desde disco al arrancar
loadFromDisk();

function obtenerTodas() {
  return tasks.map(t => ({ ...t }));
}

function crearTarea(data) {
  const { tipo, tarea, prioridad, descripcion = '' } = data;
  if (!tipo || !tarea) {
    throw new Error('BAD_REQUEST');
  }

  const nueva = {
    id: Date.now().toString(),
    tipo,
    tarea,
    prioridad,
    completed: false,
    createdAt: new Date().toISOString(),
    descripcion
  };

  tasks.push(nueva);
  saveToDisk();
  return { ...nueva };
}

function eliminarTarea(id) {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error('NOT_FOUND');
  }
  tasks.splice(index, 1);
  saveToDisk();
  return true;
}

function actualizarTarea(id, updates) {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) throw new Error('NOT_FOUND');
  const tarea = tasks[index];
  const allowed = ['tipo', 'tarea', 'prioridad', 'completed', 'descripcion'];
  Object.keys(updates).forEach(k => {
    if (allowed.includes(k)) tarea[k] = updates[k];
  });
  tasks[index] = tarea;
  saveToDisk();
  return { ...tarea };
}

/**
 * Reordena las tareas según la estructura de grupos proporcionada.
 * Espera un array: [{ tipo, ids: [id1, id2, ...] }, ...]
 */
function setOrder(ordenGrupos) {
  if (!Array.isArray(ordenGrupos)) {
    throw new Error('BAD_REQUEST');
  }

  const newTasks = [];
  const seen = new Set();

  for (const grupo of ordenGrupos) {
    const { tipo, ids } = grupo;
    if (!Array.isArray(ids)) continue;
    for (const id of ids) {
      const t = tasks.find(x => x.id === id);
      if (t) {
        // actualizar tipo si necesario
        t.tipo = tipo;
        newTasks.push(t);
        seen.add(id);
      }
    }
  }

  // Añadir tareas no incluidas al final
  for (const t of tasks) {
    if (!seen.has(t.id)) newTasks.push(t);
  }

  tasks = newTasks;
  saveToDisk();
  return obtenerTodas();
}

module.exports = {
  obtenerTodas,
  crearTarea,
  eliminarTarea,
  actualizarTarea,
  setOrder
};
