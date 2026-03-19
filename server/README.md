# TaskFlow Server

Arrancar el servidor (desarrollo):

```
cd server
npm install
npm run dev
```

Variables de entorno:

- `PORT` (ej: `3000`) — puerto donde escucha la API.

Rutas principales (ejemplos curl):

- `GET /api/v1/tasks` — listar tareas.
- `POST /api/v1/tasks` — crear tarea. Body JSON: `{ "tipo":"Compra", "tarea":"Leche", "prioridad":"baja" }`.
- `DELETE /api/v1/tasks/:id` — eliminar tarea por id.

Comportamiento de errores:

- Si falta `PORT` al arrancar, el servidor fallará y mostrará un error.
- Errores semánticos: `BAD_REQUEST` → 400, `NOT_FOUND` → 404.
- Errores no controlados → 500 con mensaje genérico `Error interno del servidor`.
