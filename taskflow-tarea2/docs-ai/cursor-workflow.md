# Atajos de teclado en Cursor

## Autocompletado y sugerencias
- `Tab` - Aceptar sugerencia de autocompletado

## Edición con IA
- `Ctrl + K` / `Cmd + K` - Edición inline (modificar código seleccionado)

## Composer (múltiples archivos)
- `Ctrl + Shift + I` / `Cmd + Shift + I` - Abrir Composer

## Paleta de comandos
- `Ctrl + Shift + P` / `Cmd + Shift + P` - Abrir Command Palette

## Chat con IA
- `Ctrl + L` / `Cmd + L` - Abrir chat lateral con IA

## Otros útiles
- `Ctrl + ,` / `Cmd + ,` - Configuración
- `Ctrl + Shift + X` / `Cmd + Shift + X` - Extensiones

# Ejemplos de mejora de código

## Metadatos de la página:
Añadió una meta descripción y actualizó el título a "TaskFlow - Gestor de tareas" para mejor SEO y contexto

## Accesibilidad ARIA:
Marcó header como role="banner", main como role="main", el aside con aria-label, el contenedor de tareas con aria-label y el mensaje vacío/progreso con aria-live="polite" para que lectores de pantalla reaccionen a los cambios.

## Formularios más accesibles:
 Añadió label ocultos (class="sr-only") para los inputs de tipo, descripción, prioridad y búsqueda, manteniendo el diseño pero mejorando la experiencia para lectores de pantalla.

## Botones más robustos:
Agregó type="button" a los botones que usan onclick (modoBtn, toggleSidebar, agregarTarea, completarTodas) para evitar comportamientos de envío de formulario inesperados.

## Interacciones accesibles con teclado:
- A la descripción de la tarea (.tarea-texto) le añadió role="button" y tabIndex=0, y ahora también se puede editar con Enter o barra espaciadora (además del doble clic).

- A la “badge” de prioridad (.prioridad-badge) le añadió role="button" y tabIndex=0, y ahora se puede cambiar la prioridad con Enter o barra espaciadora, no solo con clic.

## Barra de progreso sincronizada con ARIA:
En actualizarProgreso() ahora, además de actualizar el ancho y el color de barraProgreso y el texto de progresoTexto, se actualizan aria-valuenow y aria-valuetext del contenedor con role="progressbar", de forma coherente con el porcentaje mostrado ("0% completado", "35% completado", etc.).

# Instalación de un servidor MCP
Para este proyecto se instaló el servidor MCP filesystem, que permite a la IA leer archivos del proyecto.

- Paso 1

En la terminal se ejecutó:

npm install -g @modelcontextprotocol/server-filesystem

- Paso 2

Se añadió la configuración en:

.cursor/mcp.json

{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-filesystem",
        "./"
      ]
    }
  }
}

- Paso 3

Después de guardar la configuración se reinició Cursor para que detectara el servidor MCP

# ¿En qué casos es útil MCP en proyectos reales?

1. Análisis automático de proyectos grandes

En pryectos con muchos archivos, MCP permite que la IA analice todo el repositorio automáticamente.

2. Generación de documentación

La IA puede leer todos los archivos y generar documentación completa del proyecto.

3. Refactorización de código

La IA puede modificar múltiples archivos manteniendo coherencia en todo el sistema.

4. Integración con herramientas externas

MCP permite conectar la IA con:

 - repositorios Git
 - APIs
 - bases de datos
 - sistemas de despliegue

5. Asistencia avanzada en desarrollo

Permite que la IA entienda todo el contexto del proyecto, lo que mejora mucha la calidad de las respuestas.