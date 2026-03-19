## TaskFlow Backend API — documentación

### Base URL

- Desarrollo local: `http://localhost:3000`

### Endpoints principales

#### GET `/api/v1/tasks`

- **Descripción**: devuelve el listado completo de tareas.
- **Respuestas**:
  - `200 OK` — lista de tareas.
  - `500 Internal Server Error`.

**Ejemplo de response 200:**

```json
[
  {
    "id": "1710699650000",
    "tipo": "Trabajo",
    "tarea": "Terminar el proyecto antes del viernes",
    "prioridad": "alta",
    "completed": false,
    "createdAt": "2025-03-17T10:00:00.000Z",
    "descripcion": ""
  }
]
```

#### POST `/api/v1/tasks`

- **Descripción**: crea una nueva tarea.
- **Body (JSON)**:

```json
{
  "tipo": "Trabajo",
  "tarea": "Preparar la demo",
  "prioridad": "media",
  "descripcion": "Revisar slides y ejemplos"
}
```

- **Respuestas**:
  - `201 Created` — tarea creada.
  - `400 Bad Request` — cuando falta `tipo` o `tarea`.
  - `500 Internal Server Error`.

**Ejemplo de response 201:**

```json
{
  "id": "1710699700000",
  "tipo": "Trabajo",
  "tarea": "Preparar la demo",
  "prioridad": "media",
  "completed": false,
  "createdAt": "2025-03-17T10:01:40.000Z",
  "descripcion": "Revisar slides y ejemplos"
}
```

**Ejemplo de response 400:**

```json
{
  "error": "Bad request"
}
```

#### PATCH `/api/v1/tasks/:id`

- **Descripción**: actualiza campos puntuales de una tarea existente.
- **Body (JSON)** — cualquier combinación de:

```json
{
  "tarea": "Preparar la demo final",
  "completed": true
}
```

- **Respuestas**:
  - `200 OK` — tarea actualizada.
  - `400 Bad Request` — datos inválidos.
  - `404 Not Found` — id inexistente.
  - `500 Internal Server Error`.

#### DELETE `/api/v1/tasks/:id`

- **Descripción**: elimina una tarea.
- **Respuestas**:
  - `204 No Content` — eliminada correctamente.
  - `404 Not Found` — id inexistente.
  - `500 Internal Server Error`.

#### PUT `/api/v1/tasks/order`

- **Descripción**: reordena las tareas por grupos.
- **Body (JSON)**:

```json
[
  {
    "tipo": "Trabajo",
    "ids": ["1710699650000", "1710699700000"]
  },
  {
    "tipo": "Compra",
    "ids": ["1710699800000"]
  }
]
```

- **Respuestas**:
  - `200 OK` — devuelve el listado actualizado.
  - `400 Bad Request` — formato inválido.
  - `500 Internal Server Error`.

---

### Documentación interactiva (Swagger)

La API está documentada con **OpenAPI/Swagger** y se sirve mediante Swagger UI.

- **Ruta**: `GET /api-docs`
- **Contenido**: especificación `swagger.json` (`server/src/swagger.json`) con esquemas de:
  - `Task`
  - `NewTask`
  - `UpdateTask`

Puedes abrir `http://localhost:3000/api-docs` en el navegador para ver y probar los endpoints.

---

### Pruebas con Postman / Thunder Client

Recomendación de colección básica **TaskFlow API**:

- **GET** `/api/v1/tasks`
  - Espera `200`.
- **POST** `/api/v1/tasks`
  - Caso válido → `201`.
  - Caso inválido (por ejemplo, body vacío `{}` o sin `tarea`) → `400`.
- **PATCH** `/api/v1/tasks/:id`
  - Id válido → `200`.
  - Id inexistente → `404`.
- **DELETE** `/api/v1/tasks/:id`
  - Id válido → `204`.
  - Id inexistente → `404`.

Para forzar errores:

- **400 Bad Request**:
  - `POST /api/v1/tasks` con body `{}` o sin `tipo`/`tarea`.
  - `PUT /api/v1/tasks/order` con body que no sea un array.
- **404 Not Found**:
  - `DELETE /api/v1/tasks/ID_INEXISTENTE`.
  - `PATCH /api/v1/tasks/ID_INEXISTENTE`.
- **500 Internal Server Error**:
  - Simulable modificando manualmente los datos o el servicio para lanzar un error genérico (en entorno de pruebas/desarrollo).

Con Postman o Thunder Client puedes guardar estos casos como parte de una colección de regresión para comprobar rápidamente que la API responde con `200/201/204/400/404/500` según corresponda.
