const { port } = require('./config/env');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'TaskFlow server running' });
});

// Documentación interactiva de la API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Montar rutas de la API
const tasksRouter = require('./routes/task.routes');
app.use('/api/v1/tasks', tasksRouter);

// Manejo global de errores (último middleware)
app.use((err, req, res, next) => {
  if (!err) return next();
  if (err.message === 'NOT_FOUND') {
    return res.status(404).json({ error: 'Not found' });
  }
  if (err.message === 'BAD_REQUEST') {
    return res.status(400).json({ error: 'Bad request' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app;
