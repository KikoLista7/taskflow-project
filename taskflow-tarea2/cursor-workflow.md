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