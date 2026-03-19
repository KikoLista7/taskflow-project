const taskService = require('../services/task.service');

async function getAll(req, res, next) {
  try {
    const tasks = taskService.obtenerTodas();
    return res.json(tasks);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const body = req.body;
    console.log('POST /api/v1/tasks body=', body);
    if (!body || !body.tipo || !body.tarea) {
      return res.status(400).json({ error: 'title required' });
    }

    const created = taskService.crearTarea(body);
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    taskService.eliminarTarea(id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const updated = taskService.actualizarTarea(id, body);
    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function setOrder(req, res, next) {
  try {
    const body = req.body;
    const updatedTasks = taskService.setOrder(body);
    return res.json(updatedTasks);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  create,
  remove
  , update, setOrder
};
