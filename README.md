## TaskFlow — Arquitectura del proyecto

TaskFlow es una aplicación sencilla para gestionar tareas pendientes (todos).  
Incluye un **frontend** moderno y un **backend** Express con API REST, ambos dentro de este mismo repositorio.

---

### 🏗 Estructura general

- `taskflow-tarea1/` — Frontend (HTML + Tailwind + JavaScript):
  - `index.html`: interfaz principal del gestor de tareas.
  - `script.js`: lógica de UI, conexión con la API y gestión de estados de carga/errores.
  - `src/api/client.js`: cliente HTTP que consume la API REST (`/api/v1/tasks`).
- `server/` — Backend Node/Express:
  - `src/index.js`: punto de entrada del servidor Express.
  - `src/routes/task.routes.js`: definición de rutas de la API.
  - `src/controllers/task.controller.js`: controladores HTTP.
  - `src/services/task.service.js`: lógica de negocio y acceso a datos (JSON en disco).
  - `src/config/env.js`: carga de configuración y puerto desde variables de entorno.
  - `src/swagger.json`: especificación OpenAPI/Swagger.
  - `data/tasks.json`: almacenamiento persistente de tareas en fichero JSON.
- `docs/backend-api.md` — documentación detallada de la API con ejemplos de request/response.

---

### 🔌 Flujo frontend ↔ backend

1. El frontend (`taskflow-tarea1/index.html`) carga `src/api/client.js`.
2. `client.js` expone `window.apiClient` con métodos:
   - `fetchTasks`, `createTask`, `updateTask`, `deleteTask`, `saveOrder`.
3. `script.js` usa esos métodos para:
   - Cargar tareas (mostrando el estado **“Cargando tareas...”** en la UI).
   - Crear, actualizar, eliminar y reordenar tareas.
   - Mostrar mensajes de error comprensibles cuando la API responde con `400`, `404` o errores de servidor.
4. El backend en `server/` recibe las peticiones en `/api/v1/tasks` y responde en JSON.

---

### 🚀 API REST — resumen rápido

Base URL en desarrollo: `http://localhost:3000`

- `GET /api/v1/tasks` — lista todas las tareas.
- `POST /api/v1/tasks` — crea una tarea.
- `PATCH /api/v1/tasks/:id` — actualiza una tarea.
- `DELETE /api/v1/tasks/:id` — elimina una tarea.
- `PUT /api/v1/tasks/order` — reordena tareas por grupos.

La documentación completa con ejemplos está en `docs/backend-api.md` y en Swagger:

- Swagger UI: `http://localhost:3000/api-docs`

---

### 📦 Puesta en marcha

#### Backend (server/)

```bash
cd server
npm install
```

Crea un fichero `.env` en `server/` basado en `.env.example`:

```env
PORT=3000
```

Lanza el servidor de desarrollo:

```bash
npm run dev
```

El backend quedará disponible en `http://localhost:3000`.

#### Frontend (taskflow-tarea1/)

No requiere build; se sirve como HTML estático:

```bash
cd taskflow-tarea1
# O bien abre index.html directamente en el navegador
```

Asegúrate de que el backend está corriendo en `http://localhost:3000` (o ajusta `BASE` en `src/api/client.js`).

---

### 🌐 Despliegue del backend en Vercel (guía)

Para desplegar la carpeta `server/` en Vercel:

1. Crea un nuevo proyecto en Vercel apuntando a este repositorio.
2. Configura como **Root Directory** la carpeta `server/`.
3. En **Environment Variables**, añade:
   - `PORT=3000` (o el puerto que vayas a usar).
4. Define el comando de build/ejecución:
   - `npm install` como instalación.
   - `npm start` como comando de producción.
5. Una vez desplegado, actualiza `BASE` en `taskflow-tarea1/src/api/client.js` para apuntar al dominio de Vercel, por ejemplo:

```js
const BASE = 'https://tu-backend-vercel.vercel.app/api/v1/tasks';
```

Con esto, el frontend quedará conectado al backend desplegado.

---

### 📚 Ejemplos de request/response

**Crear tarea (POST `/api/v1/tasks`)**

Request:

```http
POST /api/v1/tasks HTTP/1.1
Content-Type: application/json

{
  "tipo": "Trabajo",
  "tarea": "Preparar la demo",
  "prioridad": "alta"
}
```

Response 201:

```json
{
  "id": "1710699700000",
  "tipo": "Trabajo",
  "tarea": "Preparar la demo",
  "prioridad": "alta",
  "completed": false,
  "createdAt": "2025-03-17T10:01:40.000Z",
  "descripcion": ""
}
```

**Error 400 (POST con body inválido)**

```http
POST /api/v1/tasks HTTP/1.1
Content-Type: application/json

{}
```

Response 400:

```json
{
  "error": "Bad request"
}
```

Para más detalles (incluyendo ejemplos de `GET`, `PATCH`, `DELETE`, `PUT /order` y códigos `404`/`500`), consulta `docs/backend-api.md` o la documentación interactiva en `/api-docs`.

