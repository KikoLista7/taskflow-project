/**
 * Alterna el tema entre modo claro y oscuro persistiendo la preferencia en localStorage.
 * Actualiza el icono del botón según el modo activo.
 * @returns {void}
 */
function toggleDark(){
  document.documentElement.classList.toggle("dark")
  const boton = document.getElementById("modoBtn")
  if(document.documentElement.classList.contains("dark")){
    boton.textContent = "☀️"
    localStorage.setItem("modo","dark")
  }else{
    boton.textContent = "🌙"
    localStorage.setItem("modo","light")
  }
}

const taskContainer = document.getElementById("taskContainer")
let tareas = []
let ordenGrupos = []
let sortableInstances = {};

// Constantes de configuración
const PRIORIDAD_COLORES = {
  alta:  { color: "bg-red-500",    borde: "border-red-500" },
  media: { color: "bg-yellow-500", borde: "border-yellow-500" },
  baja:  { color: "bg-green-500",  borde: "border-green-500" }
};

const VALIDACION_CONFIG = {
  minLengthGrupo: 2,
  maxLengthGrupo: 50,
  minLengthTarea: 3,
  maxLengthTarea: 200,
  tiempoAnimacionError: 2500,
  tiempoAnimacionModal: 200
};

/**
 * Aplica estilos visuales de error a un elemento del formulario.
 * @param {HTMLElement} element - Elemento a marcar como error.
 * @param {boolean} mostrar - Si es true muestra el error, si es false lo oculta.
 */
function aplicarEstiloError(element, mostrar = true) {
  if (mostrar) {
    element.classList.add("ring-2", "ring-red-500", "animate-heartbeat");
  } else {
    element.classList.remove("ring-2", "ring-red-500", "animate-heartbeat");
  }
}

/**
 * Limpia los estilos de error de múltiples elementos del formulario tras un delay.
 * @param {HTMLElement[]} elements - Array de elementos a limpiar.
 * @param {number} [delay] - Retraso en milisegundos antes de limpiar.
 */
function limpiarEstilosError(elements, delay = VALIDACION_CONFIG.tiempoAnimacionError) {
  setTimeout(() => {
    elements.forEach(el => aplicarEstiloError(el, false));
  }, delay);
}

/**
 * Crea un objeto tarea normalizado listo para almacenar en memoria.
 * Genera un ID único basado en timestamp y establece la fecha de creación.
 * @param {string} tipo - Nombre del grupo o categoría de la tarea.
 * @param {string} tarea - Descripción de la tarea.
 * @param {"baja"|"media"|"alta"} prioridad - Nivel de prioridad de la tarea.
 * @param {boolean} [completada=false] - Estado inicial de completado.
 * @param {string} [descripcion=""] - Detalles adicionales de la tarea.
 * @returns {Object} Objeto con propiedades: id, tipo, tarea, prioridad, completed, createdAt, descripcion.
 */
function crearTareaObjeto(tipo, tarea, prioridad, completada = false, descripcion = ""){
  return{
    id: Date.now() + Math.random(),
    tipo: tipo,
    tarea: tarea,
    prioridad: prioridad,
    completed: completada,
    createdAt: new Date().toISOString(),
    descripcion: descripcion
  }
}

/**
 * Valida los campos del formulario principal y crea una nueva tarea.
 * Realiza validaciones de: campo vacío, longitud mínima y máxima, y duplicados.
 * Si hay errores, los anima visualmente en rojo y limpia los estilos tras el timeout.
 * @returns {void}
 */
function agregarTarea(){
  const tipo = document.getElementById("tipoInput").value.trim();
  const tarea = document.getElementById("tareaInput").value.trim();
  const prioridad = document.getElementById("prioridadInput").value;

  const tipoInput = document.getElementById("tipoInput");
  const tareaInput = document.getElementById("tareaInput");
  const prioridadInput = document.getElementById("prioridadInput");

  let hayError = false;
  const elementosConError = [];

  // Validar campo de tipo/grupo vacío
  if (!tipo) {
    aplicarEstiloError(tipoInput, true);
    hayError = true;
    elementosConError.push(tipoInput);
  } else {
    aplicarEstiloError(tipoInput, false);
  }

  // Validar campo de tarea vacío
  if (!tarea) {
    aplicarEstiloError(tareaInput, true);
    hayError = true;
    elementosConError.push(tareaInput);
  } else {
    aplicarEstiloError(tareaInput, false);
  }

  // Validar prioridad seleccionada
  if (!prioridad) {
    aplicarEstiloError(prioridadInput, true);
    hayError = true;
    elementosConError.push(prioridadInput);
  } else {
    aplicarEstiloError(prioridadInput, false);
  }

  // Validar longitud mínima de tipo
  if (tipo.length > 0 && tipo.length < VALIDACION_CONFIG.minLengthGrupo) {
    aplicarEstiloError(tipoInput, true);
    hayError = true;
    if (!elementosConError.includes(tipoInput)) elementosConError.push(tipoInput);
  }

  // Validar longitud máxima de tipo
  if (tipo.length > VALIDACION_CONFIG.maxLengthGrupo) {
    aplicarEstiloError(tipoInput, true);
    hayError = true;
    if (!elementosConError.includes(tipoInput)) elementosConError.push(tipoInput);
  }

  // Validar longitud mínima de tarea
  if (tarea.length > 0 && tarea.length < VALIDACION_CONFIG.minLengthTarea) {
    aplicarEstiloError(tareaInput, true);
    hayError = true;
    if (!elementosConError.includes(tareaInput)) elementosConError.push(tareaInput);
  }

  // Validar longitud máxima de tarea
  if (tarea.length > VALIDACION_CONFIG.maxLengthTarea) {
    aplicarEstiloError(tareaInput, true);
    hayError = true;
    if (!elementosConError.includes(tareaInput)) elementosConError.push(tareaInput);
  }

  // Validar duplicados
  const tareaDuplicada = tareas.some(t => 
    t.tipo.toLowerCase() === tipo.toLowerCase() &&
    t.tarea.toLowerCase() === tarea.toLowerCase()
  );
  if (tareaDuplicada) {
    aplicarEstiloError(tareaInput, true);
    hayError = true;
    if (!elementosConError.includes(tareaInput)) elementosConError.push(tareaInput);
  }

  if (hayError) {
    limpiarEstilosError(elementosConError);
    return;
  }

  // Crear objeto tarea
  const nuevaTarea = crearTareaObjeto(tipo, tarea, prioridad);
  tareas.push(nuevaTarea);
  
  // Renderizar en DOM
  crearTareaEnDOM(nuevaTarea);

  // Limpiar formulario
  tipoInput.value = "";
  tareaInput.value = "";
  prioridadInput.value = "";

  // Guardar cambios
  guardarTareas();
  guardarOrden();
}

/**
 * Crea (si no existe) el grupo indicado y añade una tarea al DOM con efectos visuales.
 * Integra listeners para edición de tareas, cambio de prioridad, y gestión del textarea de descripción.
 * Desactiva drag-and-drop cuando se edita la descripción para evitar conflictos.
 * @param {Object} tareaObj - Objeto tarea con propiedades: id, tipo, tarea, prioridad, completed, descripcion.
 * @param {boolean} [animacion=true] - Si debe animarse la aparición de la tarea.
 * @returns {void}
 */
function crearTareaEnDOM(tareaObj, animacion = true) {
    const { id, tipo, tarea, prioridad, completed, descripcion } = tareaObj;

    let grupo = document.getElementById("grupo-" + tipo);

    if (!grupo) {
        grupo = document.createElement("div");
        grupo.id = "grupo-" + tipo;
        grupo.className = "bg-white/5 dark:bg-black/10 backdrop-blur-md p-4 rounded-xl shadow-lg mb-2";
        grupo.dataset.tipo = tipo;
        grupo.dataset.expanded = "true"; // Estado de expansión (solo afecta móvil visualmente)
        
        grupo.innerHTML = `
<div class="flex justify-between items-center mb-4 cursor-move handle pb-2 border-b border-white/5 dark:border-black/5">
  <div class="flex items-center gap-2 cursor-move handle group flex-1 min-w-0">
    <span class="opacity-0 group-hover:opacity-40 transition text-sm">⋮⋮</span>
    <h2 class="text-xl font-semibold tracking-wide truncate">${tipo}</h2>
    <button class="btn-editar ml-2 text-gray-400 hover:text-indigo-400 transition transform hover:scale-110 flex-shrink-0" title="Editar grupo">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </button>
  </div>
  <button class="btn-eliminar text-red-400 hover:text-red-500 transition transform hover:scale-110 hover:rotate-6 flex-shrink-0">
    🗑️
  </button>
</div>
<div class="grupo-tasks-container transition-all duration-300 overflow-hidden">
  <ul class="space-y-2 lista"></ul>
  <button class="btn-agregar-subtarea mt-3 w-full bg-white/5 hover:bg-white/10 dark:bg-black/5 dark:hover:bg-black/10 border border-white/20 hover:border-indigo-400 rounded-lg py-2 text-sm transition-all flex items-center justify-center gap-1 group">
    <span class="text-lg leading-none group-hover:scale-110 transition-transform">+</span>
    <span class="leading-none">Nueva tarea</span>
  </button>
</div>
`;
        taskContainer.appendChild(grupo);
        
        // Crear botón de toggle para móvil (siempre, pero se muestra solo en móvil)
        const btnToggleMobile = document.createElement("button");
        btnToggleMobile.className = "btn-toggle-group-mobile";
        btnToggleMobile.setAttribute("type", "button");
        btnToggleMobile.setAttribute("aria-label", `Expandir/contraer grupo ${tipo}`);
        btnToggleMobile.innerHTML = "^";
        btnToggleMobile.style.cssText = `
            display: none;
            width: 100%;
            text-align: center;
            padding: 0.25rem 0;
            margin-top: -1.2rem;
            margin-bottom: 1rem;
            background: transparent;
            border: none;
            color: rgb(156, 163, 175);
            cursor: pointer;
            font-size: 1.25rem;
            font-weight: 300;
            font-family: monospace;
            letter-spacing: 0.05em;
            transition: color 0.2s ease, background-color 0.2s ease, transform 0.3s ease;
            border-radius: 0.375rem;
        `;
        
        // Envolver grupo y botón en un contenedor para mantenerlos juntos durante drag
        const wrapper = document.createElement("div");
        wrapper.className = "grupo-wrapper";
        grupo.parentNode.insertBefore(wrapper, grupo);
        wrapper.appendChild(grupo);
        wrapper.appendChild(btnToggleMobile);
        
        const tasksContainer = grupo.querySelector(".grupo-tasks-container");
        
        // Configuración para móvil
        if (window.innerWidth < 768) {
            btnToggleMobile.style.display = "block";
            tasksContainer.style.maxHeight = "0px";
            tasksContainer.style.opacity = "0";
            tasksContainer.style.marginTop = "0";
            btnToggleMobile.style.transform = "scaleY(-1)";
            grupo.dataset.expanded = "false";
        } else {
            // En desktop: siempre visible
            tasksContainer.style.maxHeight = "none";
            tasksContainer.style.opacity = "1";
            tasksContainer.style.marginTop = "1rem";
            btnToggleMobile.style.transform = "scaleY(1)";
            grupo.dataset.expanded = "true";
        }
        
        btnToggleMobile.addEventListener("click", (e) => {
            e.preventDefault();
            const isExpanded = grupo.dataset.expanded === "true";
            
            if (isExpanded) {
                // Cerrar
                tasksContainer.style.maxHeight = "0px";
                tasksContainer.style.opacity = "0";
                tasksContainer.style.marginTop = "0";
                tasksContainer.style.marginBottom = "0";
                btnToggleMobile.style.transform = "scaleY(-1)";
                grupo.dataset.expanded = "false";
            } else {
                // Abrir
                const scrollHeight = tasksContainer.scrollHeight;
                tasksContainer.style.maxHeight = scrollHeight + "px";
                tasksContainer.style.opacity = "1";
                tasksContainer.style.marginTop = "1rem";
                tasksContainer.style.marginBottom = "1rem";
                btnToggleMobile.style.transform = "scaleY(1)";
                grupo.dataset.expanded = "true";
                
                // Recalcular después de un frame para asegurar que se mide correctamente
                requestAnimationFrame(() => {
                    const actualHeight = tasksContainer.scrollHeight;
                    if (actualHeight > scrollHeight) {
                        tasksContainer.style.maxHeight = actualHeight + "px";
                    }
                });
            }
            
            // Recalcular todos los grupos después de la transición
            setTimeout(recalcularMaxHeights, 350);
        });
        
        btnToggleMobile.addEventListener("mouseover", () => {
            btnToggleMobile.style.color = "rgb(229, 231, 235)";
            btnToggleMobile.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
        });
        
        btnToggleMobile.addEventListener("mouseout", () => {
            btnToggleMobile.style.color = "rgb(156, 163, 175)";
            btnToggleMobile.style.backgroundColor = "transparent";
        });
        
        grupo.querySelector(".btn-editar").onclick = function () { editarGrupo(tipo); };
        grupo.querySelector(".btn-eliminar").onclick = function () { confirmarEliminarGrupo(tipo); };
        
        const btnAgregar = grupo.querySelector(".btn-agregar-subtarea");
        btnAgregar.setAttribute("aria-label", "Añadir subtarea a " + tipo);
        btnAgregar.onclick = function () { agregarSubtarea(tipo); };
        activarSortableLista(grupo.querySelector(".lista"));
        mostrarMensajeVacio();
    }

    const lista = grupo.querySelector(".lista");
    const { color, borde } = PRIORIDAD_COLORES[prioridad];
    const item = document.createElement("li");
    item.className = `flex flex-col bg-white/10 dark:bg-black/10 p-3 rounded-lg backdrop-blur-md hover:bg-white/20 dark:hover:bg-black/20 transition`;
    item.dataset.id = id;
    item.dataset.tipo = tipo;
    item.dataset.tarea = tarea;
    item.dataset.prioridad = prioridad;

    if (animacion) {
        item.style.opacity = "0";
        item.style.transform = "translateY(10px)";
    }

    const contenidoPrincipal = document.createElement('div');
    contenidoPrincipal.className = `flex justify-between items-center gap-3 border-l-4 ${borde} -ml-3 pl-3`;
    contenidoPrincipal.innerHTML = `
<div class="flex items-center gap-2 flex-1 min-w-0">
<input type="checkbox" onclick="completarTarea(this)" class="cursor-pointer flex-shrink-0" ${completed ? 'checked' : ''}>
<span class="tarea-texto break-words cursor-pointer hover:bg-white/10 dark:hover:bg-black/20 hover:px-2 hover:py-1 hover:rounded transition-all ${completed ? 'line-through opacity-50' : ''}" title="Clic para ver/ocultar descripción">${tarea}</span>
</div>
<div class="flex items-center gap-2 flex-shrink-0">
<span class="prioridad-badge ${color} text-white px-2 py-0.5 rounded text-xs whitespace-nowrap cursor-pointer hover:scale-110 transition-transform" title="Clic para cambiar prioridad">${prioridad}</span>
<button onclick="confirmarEliminarTarea(this)" class="text-red-500 hover:text-red-700 transition text-lg font-bold leading-none w-6 h-6 flex items-center justify-center">−</button>
</div>
`;

    const descripcionCaja = document.createElement("div");
    descripcionCaja.className = "mt-2 hidden descripcion-caja transition-all duration-300";
    descripcionCaja.innerHTML = `<textarea class="descripcion-textarea w-full px-3 py-2 rounded-lg bg-black/10 dark:bg-white/5 border border-white/15 dark:border-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-white/60 dark:placeholder-black/50" rows="2" placeholder="Añadir detalles..."></textarea>`;

    const textarea = descripcionCaja.querySelector('.descripcion-textarea');
    textarea.value = descripcion || "";

    item.appendChild(contenidoPrincipal);
    item.appendChild(descripcionCaja);

    if (completed) {
        item.classList.add("opacity-60");
    }

    const spanTarea = item.querySelector(".tarea-texto");
    adjuntarListenersAlSpan(spanTarea, item);

    const badgePrioridad = item.querySelector(".prioridad-badge");
    badgePrioridad.addEventListener("click", function () { cambiarPrioridad(item, badgePrioridad); });
    badgePrioridad.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            cambiarPrioridad(item, badgePrioridad);
        }
    });

    const sortableLista = sortableInstances[grupo.id];

    textarea.addEventListener("focus", function() {
        if (sortableLista) {
            sortableLista.option("disabled", true);
        }
    });

    textarea.addEventListener("blur", function () {
        if (sortableLista) {
            sortableLista.option("disabled", false);
        }
        const tareaObj = tareas.find(t => t.id == id);
        if (tareaObj) {
            tareaObj.descripcion = textarea.value.trim();
            guardarTareas();
        }
    });

    textarea.addEventListener("keydown", function(event) {
        const isDesktop = !('ontouchstart' in window) && !navigator.maxTouchPoints;
        if (isDesktop && event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.blur();
            descripcionCaja.classList.add('hidden');
        }
    });

    lista.appendChild(item);
    actualizarProgreso();

    if (animacion) {
        setTimeout(() => {
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
            item.style.transition = "all 0.3s ease";
        }, 10);
    }
}

/**
 * Edita el nombre de un grupo de tareas en modo inline.
 * Permite renombrar el grupo con validaciones de duplicidad y longitud.
 * Desactiva el arrastre durante la edición para evitar conflictos.
 * Acepta Enter para guardar, Escape para cancelar, y blur también guarda.
 * @param {string} nombreActual - Nombre actual del grupo a editar.
 * @returns {void}
 */
function editarGrupo(nombreActual) {
  const grupo = document.getElementById("grupo-" + nombreActual);
  if (!grupo) return;

  // Desactivamos el arrastre del contenedor principal
  if (sortableInstances.taskContainer) {
      sortableInstances.taskContainer.option("disabled", true);
  }

  const h2 = grupo.querySelector("h2");
  const textoOriginal = h2.textContent;

  const input = document.createElement("input");
  input.type = "text";
  input.value = textoOriginal;
  input.className = "bg-white/20 dark:bg-black/30 border border-indigo-400 rounded px-2 py-1 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500";
  input.style.width = "200px";

  h2.replaceWith(input);
  input.focus();
  input.select();

  const finalizarEdicion = () => {
      // Reactivamos el arrastre del contenedor principal
      if (sortableInstances.taskContainer) {
          sortableInstances.taskContainer.option("disabled", false);
      }
  };

  const guardarCambios = () => {
      const nuevoNombre = input.value.trim();
      
      // Validación 1: Verificar que no esté vacío
      if (!nuevoNombre) {
          const nuevoH2 = document.createElement("h2");
          nuevoH2.className = "text-xl font-semibold tracking-wide";
          nuevoH2.textContent = textoOriginal;
          input.replaceWith(nuevoH2);
          finalizarEdicion();
          return;
      }

      // Validación 2: Verificar que sea diferente al original
      if (nuevoNombre === textoOriginal) {
          const nuevoH2 = document.createElement("h2");
          nuevoH2.className = "text-xl font-semibold tracking-wide";
          nuevoH2.textContent = textoOriginal;
          input.replaceWith(nuevoH2);
          finalizarEdicion();
          return;
      }

      // Validación 3: Verificar longitud mínima y máxima
      if (nuevoNombre.length < VALIDACION_CONFIG.minLengthGrupo) {
          alert(`El nombre debe tener al menos ${VALIDACION_CONFIG.minLengthGrupo} caracteres`);
          return;
      }

      if (nuevoNombre.length > VALIDACION_CONFIG.maxLengthGrupo) {
          alert(`El nombre no puede exceder ${VALIDACION_CONFIG.maxLengthGrupo} caracteres`);
          return;
      }

      // Si el grupo con el nuevo nombre ya existe, fusionar tareas
      const grupoExistente = document.getElementById("grupo-" + nuevoNombre);
      if (grupoExistente && grupoExistente !== grupo) {
          const tareasActuales = Array.from(grupo.querySelectorAll("li"));
          const listaExistente = grupoExistente.querySelector(".lista");

          // Mover tareas del grupo actual al existente
          tareasActuales.forEach(li => {
              li.dataset.tipo = nuevoNombre;
              listaExistente.appendChild(li);
          });

          // Actualizar tipo en array de tareas
          tareas.forEach(t => {
              if (t.tipo === nombreActual) {
                  t.tipo = nuevoNombre;
              }
          });

          grupo.remove();
          guardarTareas();
          guardarOrden();
          mostrarMensajeVacio();
          finalizarEdicion();
          return;
      }

      // Actualizar datos en memoria
      tareas.forEach(t => {
          if (t.tipo === nombreActual) {
              t.tipo = nuevoNombre;
          }
      });

      // Actualizar elemento en DOM
      grupo.id = "grupo-" + nuevoNombre;
      grupo.dataset.tipo = nuevoNombre;

      const nuevoH2 = document.createElement("h2");
      nuevoH2.className = "text-xl font-semibold tracking-wide";
      nuevoH2.textContent = nuevoNombre;
      input.replaceWith(nuevoH2);

      // Actualizar listeners de botones con nuevo nombre
      const botonEditar = grupo.querySelector(".btn-editar");
      botonEditar.onclick = function () { editarGrupo(nuevoNombre); };

      const botonEliminar = grupo.querySelector(".btn-eliminar");
      botonEliminar.onclick = function () { confirmarEliminarGrupo(nuevoNombre); };

      // Actualizar tipo en cada tarea del DOM
      grupo.querySelectorAll("li").forEach(li => {
          li.dataset.tipo = nuevoNombre;
      });

      guardarTareas();
      guardarOrden();
      finalizarEdicion();
  };

  input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
          guardarCambios();
      } else if (e.key === "Escape") {
          const nuevoH2 = document.createElement("h2");
          nuevoH2.className = "text-xl font-semibold tracking-wide";
          nuevoH2.textContent = textoOriginal;
          input.replaceWith(nuevoH2);
          finalizarEdicion();
      }
  });

  input.addEventListener("blur", guardarCambios);
}

/**
 * Permite editar el texto de una tarea concreta y actualiza el almacenamiento.
 * @param {HTMLLIElement} item - Elemento de lista que representa la tarea.
 * @param {HTMLElement} spanTarea - Span que contiene el texto de la tarea.
 */

/**
 * Adjunta todos los listeners necesarios al span de texto de una tarea.
 * Incluye: clic para mostrar/ocultar descripción, doble clic para editar, y atajos de teclado.
 * @param {HTMLElement} spanTarea - El elemento span que contiene el texto de la tarea.
 * @param {HTMLLIElement} item - El elemento <li> padre que contiene la tarea.
 * @returns {void}
 */
function adjuntarListenersAlSpan(spanTarea, item) {
  // Clic para mostrar/ocultar descripción
  spanTarea.addEventListener("click", function () {
      const descripcionCaja = item.querySelector(".descripcion-caja");
      if (descripcionCaja) {
          descripcionCaja.classList.toggle("hidden");
      }
  });

  // Doble clic para editar el título
  spanTarea.addEventListener("dblclick", function () {
      editarTarea(item, spanTarea);
  });

  // Accesibilidad con teclado para editar
  spanTarea.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          editarTarea(item, spanTarea);
      }
  });
}

function editarTarea(item, spanTarea) {
  const tareaOriginal = item.dataset.tarea;
  const id = item.dataset.id;
  const grupo = item.closest('[id^="grupo-"]');
  if (!grupo) return;
  
  const groupId = grupo.id;
  const sortableLista = sortableInstances[groupId];

  // Desactivamos el arrastre de la lista actual
  if (sortableLista) {
      sortableLista.option("disabled", true);
  }

  const input = document.createElement("input");
  input.type = "text";
  input.value = spanTarea.textContent;
  input.className = "bg-white/20 dark:bg-black/30 border border-indigo-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1";

  spanTarea.replaceWith(input);
  input.focus();
  input.select();

  const restaurarSpan = (texto) => {
      const nuevoSpan = document.createElement("span");
      nuevoSpan.className = spanTarea.className;
      nuevoSpan.textContent = texto;
      nuevoSpan.title = "Clic para ver/ocultar descripción";
      
      adjuntarListenersAlSpan(nuevoSpan, item);
      
      input.replaceWith(nuevoSpan);
      
      // Reactivamos el arrastre de la lista
      if (sortableLista) {
          sortableLista.option("disabled", false);
      }
  };

  const guardarCambios = () => {
      const nuevaTareaTexto = input.value.trim();

      // Validar que no esté vacío y que sea diferente del original
      if (!nuevaTareaTexto) {
          restaurarSpan(tareaOriginal);
          return;
      }

      // Validar longitud
      if (nuevaTareaTexto.length < VALIDACION_CONFIG.minLengthTarea) {
          aplicarEstiloError(input, true);
          limpiarEstilosError([input], 1500);
          return;
      }

      if (nuevaTareaTexto.length > VALIDACION_CONFIG.maxLengthTarea) {
          aplicarEstiloError(input, true);
          limpiarEstilosError([input], 1500);
          return;
      }

      if (nuevaTareaTexto !== tareaOriginal) {
          const tareaObj = tareas.find(t => t.id == id);
          if (tareaObj) {
              tareaObj.tarea = nuevaTareaTexto;
              guardarTareas();
          }
          item.dataset.tarea = nuevaTareaTexto;
          restaurarSpan(nuevaTareaTexto);
          guardarOrden();
      } else {
          restaurarSpan(tareaOriginal);
      }
  };

  input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
          guardarCambios();
      } else if (e.key === "Escape") {
          restaurarSpan(tareaOriginal);
      }
  });

  input.addEventListener("blur", guardarCambios);
}

/**
 * Muestra u oculta el mensaje "No hay tareas" según si el contenedor está vacío.
 * El mensaje solo se muestra cuando no existen tareas en todo el tablero.
 * @returns {void}
 */
function mostrarMensajeVacio(){
  const mensaje = document.getElementById("mensajeVacio");
  if (taskContainer.children.length === 0) {
    mensaje.classList.remove("hidden");
  } else {
    mensaje.classList.add("hidden");
  }
}

/**
 * Elimina una tarea del array, DOM, y localStorage.
 * Actualiza el progreso y muestra el mensaje de contenedor vacío si es necesario.
 * @param {string} tipo - Categoría/grupo de la tarea a eliminar.
 * @param {string} tarea - Texto descriptivo de la tarea.
 * @param {HTMLLIElement} item - Elemento de lista del DOM a remover.
 * @returns {void}
 */
function eliminarTarea(tipo, tarea, item){
  tareas = tareas.filter(t => !(t.tipo === tipo && t.tarea === tarea));
  guardarTareas();
  guardarOrden();

  item.remove();
  actualizarProgreso();
  cerrarModal();
  mostrarMensajeVacio();
  recalcularMaxHeights();
}

/**
 * Elimina un grupo completo y todas sus tareas asociadas.
 * Limpia el array, DOM, localStorage, y actualiza la interfaz.
 * @param {string} tipo - Nombre del grupo a eliminar.
 * @returns {void}
 */
function eliminarGrupo(tipo){
  tareas = tareas.filter(t => t.tipo !== tipo);
  guardarTareas();
  guardarOrden();

  document.getElementById("grupo-" + tipo).remove();
  actualizarProgreso();
  cerrarModal();
  mostrarMensajeVacio();
  recalcularMaxHeights();
}

/**
 * Crea y muestra un modal de confirmación genérico para acciones destructivas.
 * Aplica efecto de escala y opacidad para la animación de entrada.
 * @param {string} titulo - Título del modal de confirmación.
 * @param {string} descripcion - Mensaje descriptivo del modal.
 * @param {Function} onConfirm - Callback ejecutado al confirmar la acción.
 * @param {string} [btnConfirmText="Eliminar"] - Texto del botón de confirmación.
 * @returns {void}
 */
/**
 * Muestra un modal de confirmación con opciones personalizables.
 * Incluye animación de entrada (scale y fade in) y cierre animado.
 * @param {string} titulo - Título del modal.
 * @param {string} descripcion - Descripción o mensaje del modal.
 * @param {Function} onConfirm - Función a ejecutar si confirma.
 * @param {string} btnConfirmText - Texto del botón de confirmación (default: "Eliminar").
 * @returns {void}
 */
function mostrarModalConfirmacion(titulo, descripcion, onConfirm, btnConfirmText = "Eliminar") {
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50";
  modal.innerHTML = `
<div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl max-w-sm mx-4 transform scale-95 opacity-0 transition-all duration-200" role="dialog" aria-modal="true" aria-labelledby="modalTitulo">
  <h3 id="modalTitulo" class="text-lg font-semibold mb-3 text-gray-900 dark:text-white">${titulo}</h3>
  <p class="text-sm text-gray-600 dark:text-gray-300 mb-5">${descripcion}</p>
  <div class="flex gap-3">
    <button id="btnConfirmar" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">
      ${btnConfirmText}
    </button>
    <button id="btnCancelar" class="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-2 rounded-lg transition">
      Cancelar
    </button>
  </div>
</div>
`;

  document.body.appendChild(modal);

  // Event listeners para botones
  document.getElementById("btnConfirmar").onclick = () => {
    onConfirm();
    cerrarModal();
  };
  
  document.getElementById("btnCancelar").onclick = cerrarModal;

  // Animación de entrada (escala y opacidad)
  setTimeout(() => {
    modal.firstElementChild.classList.remove("scale-95", "opacity-0");
    modal.firstElementChild.classList.add("scale-100", "opacity-100");
  }, 10);
}

/**
 * Abre un modal de confirmación antes de eliminar una única tarea.
 * @param {HTMLButtonElement} boton - Botón que dispara la acción de eliminación.
 * @returns {void}
 */
function confirmarEliminarTarea(boton){
  const item = boton.closest("li");
  const tipo = item.dataset.tipo;
  const tarea = item.dataset.tarea;

  const titulo = "¿Está seguro de eliminar esta tarea?";
  const descripcion = "Esta acción no se puede deshacer.";
  const onConfirm = () => eliminarTarea(tipo, tarea, item);

  mostrarModalConfirmacion(titulo, descripcion, onConfirm);
}

/**
 * Abre un modal de confirmación antes de eliminar un grupo completo.
 * @param {string} tipo - Nombre del grupo a eliminar.
 * @returns {void}
 */
function confirmarEliminarGrupo(tipo){
  const titulo = "¿Está seguro de eliminar este grupo?";
  const descripcion = `Se eliminarán todas las tareas del grupo "${tipo}".`;
  const onConfirm = () => eliminarGrupo(tipo);

  mostrarModalConfirmacion(titulo, descripcion, onConfirm);
}

/**
 * Cierra el modal de confirmación actual (si existe).
 * Aplica animación de cierre antes de remover el elemento del DOM.
 * @returns {void}
 */
function cerrarModal(){
  const modal = document.querySelector(".fixed.inset-0");
  if (modal) {
    modal.firstElementChild.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      modal.remove();
    }, 200);
  }
}

/**
 * Guarda la lista completa de tareas en localStorage en formato JSON.
 * Se invoca tras cualquier cambio: crear, editar, eliminar o completar tareas.
 * @returns {void}
 */
function guardarTareas(){
  localStorage.setItem("tareas", JSON.stringify(tareas));
}

/**
 * Guarda el orden actual de grupos y tareas en localStorage.
 * Utiliza el orden visual del DOM como fuente de verdad para drag-and-drop.
 * Se invoca al finalizar operaciones de arrastre y al cambiar el orden de tareas.
 * También repara las relaciones del DOM para asegurar que los botones toggle estén con sus grupos.
 * @returns {void}
 */
function guardarOrden(){
  // Reparar relaciones grupo-botón después de drag
  const grupos = Array.from(document.querySelectorAll("[id^='grupo-']"));
  grupos.forEach(grupo => {
    const wrapper = grupo.closest(".grupo-wrapper");
    if (wrapper) {
      const btnToggle = wrapper.querySelector(".btn-toggle-group-mobile");
      if (btnToggle && btnToggle.nextElementSibling !== null && btnToggle.previousElementSibling !== grupo) {
        // El botón no está en la posición correcta, moverlo
        wrapper.appendChild(btnToggle);
      }
    }
  });
  
  const ordenGruposActual = grupos.map(g => {
    const tipo = g.dataset.tipo
    const lista = Array.from(g.querySelectorAll("li"))
    const tareasOrden = lista.map(li => ({
      tipo: li.dataset.tipo,
      tarea: li.dataset.tarea,
      prioridad: li.dataset.prioridad
    }))
    return {tipo, tareasOrden}
  })
  ordenGrupos = ordenGruposActual;
  localStorage.setItem("ordenGrupos", JSON.stringify(ordenGrupos))
}

/**
 * Reconstruye el orden de grupos y tareas a partir de los datos almacenados en localStorage.
 * Limpia el contenedor para evitar duplicados y regenera tareas desde los objetos guardados.
 * @returns {void}
 */
function cargarOrden(){
  const datos = localStorage.getItem("ordenGrupos");
  if(datos){
    ordenGrupos = JSON.parse(datos);
    // Limpiamos el contenedor para evitar duplicados al cargar
    taskContainer.innerHTML = ''; 
    ordenGrupos.forEach(grupo => {
      grupo.tareasOrden.forEach(t => {
        // Buscamos la tarea completa en nuestro array de tareas
        const tareaObj = tareas.find(tarea => tarea.tipo === t.tipo && tarea.tarea === t.tarea);
        if(tareaObj){
          // Pasamos el objeto completo
          crearTareaEnDOM(tareaObj, false);
        }
      });
    });
  }
}

/**
 * Carga el listado de tareas almacenadas en localStorage hacia la memoria (array global).
 * Si no hay datos almacenados, el array permanece vacío.
 * @returns {void}
 */
function cargarTareas(){
  const datos = localStorage.getItem("tareas");
  if (datos) {
    tareas = JSON.parse(datos);
  }
}

/**
 * Crea un conjunto de 8 tareas de ejemplo para demostración en primera carga.
 * Solo se ejecuta si no existe información previa en localStorage.
 * Incluye tareas de categorías: Compra, Ejercicio, Trabajo.
 * @returns {void}
 */
function cargarTareasIniciales(){
  const tareasIniciales = [
    crearTareaObjeto("Compra", "Verduras", "baja"),
    crearTareaObjeto("Compra", "Detergente", "media"),
    crearTareaObjeto("Compra", "Traje para fin de año", "alta"),
    crearTareaObjeto("Ejercicio", "Salir a correr 10 km", "media"),
    crearTareaObjeto("Ejercicio", "Ir al gimnasio por la mañana", "alta"),
    crearTareaObjeto("Ejercicio", "Partido de pádel el finde", "baja"),
    crearTareaObjeto("Trabajo", "Terminar el proyecto antes del viernes", "alta"),
    crearTareaObjeto("Trabajo", "Presentar el prototipo de la página", "media")
  ];

  tareas.push(...tareasIniciales);

  tareasIniciales.forEach(tarea => {
    crearTareaEnDOM(tarea, false);
  });

  guardarTareas();
  guardarOrden();
}

/**
 * Normaliza un texto eliminando acentos y espacios en blanco, convirtiéndolo a minúsculas.
 * Utilizado para búsquedas insensibles a mayúsculas, minúsculas y acentos.
 * @param {string} texto - Texto a normalizar.
 * @returns {string} Texto normalizado sin acentos y en minúsculas.
 */
function normalizarTexto(texto) {
    if (!texto) return "";
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Filtra visualmente las tareas del tablero según un texto de búsqueda ingresado.
 * La búsqueda ignora mayúsculas, minúsculas y acentos para mayor flexibilidad.
 * Solo oculta tareas que NO coinciden; no elimina elementos del DOM.
 * @param {string} texto - Texto a buscar dentro del contenido de cada tarea.
 * @returns {void}
 */
/**
 * Filtra las tareas mostradas según un término de búsqueda.
 * Normaliza tanto el término como el texto de las tareas (sin acentos) para una búsqueda flexible.
 * Las tareas que coincidan se muestran, las demás se ocultan.
 * @param {string} texto - Término de búsqueda a filtrar.
 * @returns {void}
 */
function buscar(texto) {
    const todasLasTareas = document.querySelectorAll("li");
    // Normalizamos el término de búsqueda una sola vez fuera del bucle para mejor performance
    const textoNormalizado = normalizarTexto(texto);

    todasLasTareas.forEach(tareaElement => {
        // Normalizamos el contenido visible de la tarea
        const contenidoNormalizado = normalizarTexto(tareaElement.innerText);
        
        // Mostramos u ocultamos según coincidencia
        tareaElement.style.display = contenidoNormalizado.includes(textoNormalizado) ? "flex" : "none";
    });
}

/**
 * Alterna el estado de completado de todas las tareas simultáneamente.
 * Si todas están completadas, las marca como pendientes. Si alguna está pendiente, completa todas.
 * Útil para operaciones rápidas de marcado en lote.
 * @returns {void}
 */
function completarTodas(){
  const checks = document.querySelectorAll("input[type='checkbox']");
  const total = checks.length;
  const completadas = document.querySelectorAll("input:checked").length;

  checks.forEach(checkbox => {
    if (completadas === total) {
      // Si todas están completadas, desmarcar todas
      if (checkbox.checked) {
        checkbox.click();
      }
    } else {
      // Si alguna está pendiente, marcar todas
      if (!checkbox.checked) {
        checkbox.click();
      }
    }
  });
}

/**
 * Marca una tarea como completada o pendiente tras interacción del usuario.
 * Actualiza visualmente el DOM, el array de tareas, y la barra de progreso.
 * Incluye animación de escala para retroalimentación visual.
 * @param {HTMLInputElement} checkbox - Input checkbox asociado a la tarea.
 * @returns {void}
 */
function completarTarea(checkbox){
  const tarea = checkbox.closest("li");
  const texto = checkbox.nextElementSibling;

  // Actualizar estilos visuales
  texto.classList.toggle("line-through");
  texto.classList.toggle("opacity-50");
  tarea.classList.toggle("opacity-60");
  tarea.classList.add("scale-95");

  // Animación de escala
  setTimeout(() => {
    tarea.classList.remove("scale-95");
  }, 150);

  // Actualizar en el array de datos
  const tipo = tarea.dataset.tipo;
  const tareaTexto = tarea.dataset.tarea;
  const tareaObj = tareas.find(t => t.tipo === tipo && t.tarea === tareaTexto);
  
  if (tareaObj) {
    tareaObj.completed = checkbox.checked;
    guardarTareas();
  }

  actualizarProgreso();
  recalcularMaxHeights();
}

/**
 * Actualiza la barra de progreso y el porcentaje visible en la interfaz.
 * Calcula el porcentaje de tareas completadas y aplica gradientes de color dinámicos.
 * Gradientes: rojo (0-33%), amarillo (33-66%), verde (66-99%), verde oscuro (100%).
 * Actualiza también los atributos ARIA para accesibilidad.
 * @returns {void}
 */
function actualizarProgreso(){
  const total = document.querySelectorAll("li").length;
  const completadas = document.querySelectorAll("input:checked").length;

  const barra = document.getElementById("barraProgreso");
  const texto = document.getElementById("progresoTexto");
  const progressContainer = document.querySelector('[role="progressbar"]');

  // Manejo del caso vacío
  if (total === 0) {
    barra.style.width = "0%";
    barra.style.background = "linear-gradient(90deg, #a855f7, #ec4899)";
    texto.textContent = "0%";
    if (progressContainer) {
      progressContainer.setAttribute("aria-valuenow", "0");
      progressContainer.setAttribute("aria-valuetext", "0% completado");
    }
    return;
  }

  // Calcular porcentaje
  const porcentaje = Math.round((completadas / total) * 100);
  barra.style.width = porcentaje + "%";

  // Aplicar gradiente según progreso
  if (porcentaje < 33) {
    barra.style.background = "linear-gradient(90deg, #ef4444, #f97316)";
  } else if (porcentaje < 66) {
    barra.style.background = "linear-gradient(90deg, #f59e0b, #eab308)";
  } else if (porcentaje < 100) {
    barra.style.background = "linear-gradient(90deg, #84cc16, #22c55e)";
  } else {
    barra.style.background = "linear-gradient(90deg, #10b981, #059669)";
  }

  // Actualizar texto y atributos ARIA
  texto.textContent = porcentaje + "%";
  if (progressContainer) {
    progressContainer.setAttribute("aria-valuenow", String(porcentaje));
    progressContainer.setAttribute("aria-valuetext", porcentaje + "% completado");
  }
}

/**
 * Activa la funcionalidad de arrastrar y soltar (drag-and-drop) sobre una lista de tareas.
 * Configura la animación, clases CSS para retroalimentación visual, y guardado automático al finalizar el drag.
 * @param {HTMLElement} lista - Elemento UL que contendrá las tareas arrastrables.
 * @returns {void}
 */
function activarSortableLista(lista) {
    const grupo = lista.closest('[id^="grupo-"]');
    if (!grupo) return;

    const groupId = grupo.id;
    const sortable = new Sortable(lista, {
        animation: 150,
        ghostClass: "opacity-50",
        chosenClass: "bg-indigo-200",
        dragClass: "rotate-1",
        onEnd: guardarOrden
    });
    
    sortableInstances[groupId] = sortable;
}

function agregarSubtarea(tipo) {
  const grupo = document.getElementById("grupo-" + tipo);
  const botonAgregar = grupo.querySelector(".btn-agregar-subtarea");

  const inputContainer = document.createElement("div");
  inputContainer.className = "mt-2 flex gap-2 overflow-visible";
  inputContainer.innerHTML = `
<input type="text" placeholder="Nueva tarea..." class="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
<button class="btn-guardar-subtarea bg-indigo-500 hover:bg-indigo-600 px-3 rounded-lg transition">✓</button>
<button class="btn-cancelar-subtarea bg-red-500 hover:bg-red-600 px-3 rounded-lg transition">✕</button>
`;

  botonAgregar.replaceWith(inputContainer);
  const input = inputContainer.querySelector("input");
  input.focus();

  const guardarSubtarea = () => {
      const textoSubtarea = input.value.trim();
      const elementosConError = [];
      let hayError = false;

      // Validar campo vacío
      if (!textoSubtarea) {
          aplicarEstiloError(input, true);
          hayError = true;
          elementosConError.push(input);
      }

      // Validar longitud mínima
      if (textoSubtarea.length > 0 && textoSubtarea.length < VALIDACION_CONFIG.minLengthTarea) {
          aplicarEstiloError(input, true);
          hayError = true;
          if (!elementosConError.includes(input)) elementosConError.push(input);
      }

      // Validar longitud máxima
      if (textoSubtarea.length > VALIDACION_CONFIG.maxLengthTarea) {
          aplicarEstiloError(input, true);
          hayError = true;
          if (!elementosConError.includes(input)) elementosConError.push(input);
      }

      // Validar duplicados
      const existeDuplicada = tareas.some(t =>
          t.tipo.toLowerCase() === tipo.toLowerCase() &&
          t.tarea.toLowerCase() === textoSubtarea.toLowerCase()
      );
      if (existeDuplicada) {
          aplicarEstiloError(input, true);
          hayError = true;
          if (!elementosConError.includes(input)) elementosConError.push(input);
      }

      if (hayError) {
          limpiarEstilosError(elementosConError, 1500);
          return;
      }

      // Crear y guardar tarea
      const nuevaTarea = crearTareaObjeto(tipo, textoSubtarea, "baja");
      tareas.push(nuevaTarea);
      crearTareaEnDOM(nuevaTarea);
      guardarTareas();
      guardarOrden();
      
      // Restaurar el botón
      const nuevoBoton = crearBotonAgregarSubtarea(tipo);
      inputContainer.replaceWith(nuevoBoton);
      
      // Recalcular maxHeight después de que el DOM se actualice
      setTimeout(() => {
        recalcularMaxHeights();
      }, 50);
  };

  const cancelar = () => {
      const nuevoBoton = crearBotonAgregarSubtarea(tipo);
      inputContainer.replaceWith(nuevoBoton);
  };

  inputContainer.querySelector(".btn-guardar-subtarea").onclick = guardarSubtarea;
  inputContainer.querySelector(".btn-cancelar-subtarea").onclick = cancelar;

  input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
          guardarSubtarea();
      } else if (e.key === "Escape") {
          cancelar();
      }
  });
  
  input.addEventListener("blur", (e) => {
      if (!e.relatedTarget || (!e.relatedTarget.matches('.btn-guardar-subtarea') && !e.relatedTarget.matches('.btn-cancelar-subtarea'))) {
          setTimeout(cancelar, 100);
      }
  });
}

function crearBotonAgregarSubtarea(tipo) {
  const boton = document.createElement("button");
  boton.className = "btn-agregar-subtarea mt-3 w-full bg-white/5 hover:bg-white/10 dark:bg-black/5 dark:hover:bg-black/10 border border-white/20 hover:border-indigo-400 rounded-lg py-2 text-sm transition-all flex items-center justify-center gap-1 group";
  boton.setAttribute("aria-label", `Añadir tarea a ${tipo}`);
  boton.innerHTML = `
<span class="text-lg leading-none group-hover:scale-110 transition-transform">+</span>
<span class="leading-none">Nueva tarea</span>
`;
  boton.onclick = () => agregarSubtarea(tipo);
  return boton;
}

/**
 * Cambia cíclicamente el nivel de prioridad de una tarea: baja → media → alta → baja.
 * Actualiza el DOM, el array de tareas, y persiste los cambios en localStorage.
 * @param {HTMLLIElement} item - Elemento de lista que representa la tarea.
 * @param {HTMLElement} badge - Elemento visual (badge) que muestra la prioridad.
 * @returns {void}
 */
function cambiarPrioridad(item, badge) {
  const prioridadActual = item.dataset.prioridad;
  const id = item.dataset.id;

  const rotacion = {
      "baja": "media",
      "media": "alta",
      "alta": "baja"
  };

  const nuevaPrioridad = rotacion[prioridadActual];
  const { color: nuevoColor, borde: nuevoBorde } = PRIORIDAD_COLORES[nuevaPrioridad];
  const { borde: bordeActual } = PRIORIDAD_COLORES[prioridadActual];

  // Actualizar dataset del item
  item.dataset.prioridad = nuevaPrioridad;

  // Actualizar apariencia del badge
  badge.className = `prioridad-badge ${nuevoColor} text-white px-2 py-0.5 rounded text-xs whitespace-nowrap cursor-pointer hover:scale-110 transition-transform`;
  badge.textContent = nuevaPrioridad;

  // Actualizar borde del contenedor principal
  const contenidoPrincipal = item.querySelector('.flex.justify-between.items-center');
  if (contenidoPrincipal) {
      contenidoPrincipal.classList.remove(bordeActual);
      contenidoPrincipal.classList.add(nuevoBorde);
  }

  // Actualizar en el array y persistir
  const tareaObj = tareas.find(t => t.id == id);
  if (tareaObj) {
      tareaObj.prioridad = nuevaPrioridad;
      guardarTareas();
      guardarOrden();
  }
  
  recalcularMaxHeights();
}

/**
 * Inicializa el modo oscuro/claro desde localStorage.
 * @returns {void}
 */
function inicializarModo() {
  if (localStorage.getItem("modo") === "dark") {
    document.documentElement.classList.add("dark");
    document.getElementById("modoBtn").textContent = "☀️";
  }
}

/**
 * Carga las tareas desde localStorage o inicializa con tareas de demo.
 * @returns {void}
 */
function inicializarTareas() {
  const tareasGuardadas = localStorage.getItem("tareas");
  
  if (tareasGuardadas === null) {
    cargarTareasIniciales();
  } else {
    cargarTareas();
    cargarOrden();
  }
  
  mostrarMensajeVacio();
}

/**
 * Inicializa la funcionalidad drag-and-drop del contenedor principal de tareas.
 * También repara las relaciones del DOM después de cada movimiento.
 * @returns {void}
 */
function inicializarDragAndDrop() {
  const mainSortable = new Sortable(taskContainer, {
    animation: 200,
    ghostClass: "opacity-50",
    handle: ".handle",
    swapThreshold: 0.65,
    onEnd: () => {
      guardarOrden();
      // Reparar posiciones de botones después del drag
      setTimeout(() => {
        const grupos = document.querySelectorAll("[id^='grupo-']");
        grupos.forEach(grupo => {
          const wrapper = grupo.closest(".grupo-wrapper");
          if (wrapper) {
            const btnToggle = wrapper.querySelector(".btn-toggle-group-mobile");
            if (btnToggle) {
              // Asegurar que el botón está último en el wrapper
              wrapper.appendChild(btnToggle);
            }
          }
        });
      }, 50);
    }
  });
  
  sortableInstances['taskContainer'] = mainSortable;
}

/**
 * Inicializa el toggle colapsable del sidebar en dispositivos móviles.
 * Gestiona la animación de apertura y cierre con transiciones suaves.
 * También ajusta la visualización del buscador para dar más espacio cuando el sidebar está abierto.
 * @returns {void}
 */
function inicializarToggleSidebar() {
  const toggleBtn = document.getElementById("toggleSidebar");
  if (!toggleBtn) return;
  
  const sidebarContent = document.getElementById("sidebarContent");
  const iconoToggle = document.getElementById("iconoToggle");
  const searchSection = document.getElementById("searchSection");
  
  toggleBtn.addEventListener("click", () => {
    const isOpen = sidebarContent.style.maxHeight && sidebarContent.style.maxHeight !== "0px";
    
    if (isOpen) {
      // Cerrar sidebar
      sidebarContent.style.maxHeight = "0px";
      sidebarContent.style.opacity = "0";
      iconoToggle.style.transform = "rotate(0deg)";
      // Mostrar buscador normalmente
      if (searchSection) {
        searchSection.style.display = "block";
        searchSection.style.opacity = "1";
        searchSection.style.maxHeight = "none";
      }
    } else {
      // Abrir sidebar
      sidebarContent.style.maxHeight = sidebarContent.scrollHeight + "px";
      sidebarContent.style.opacity = "1";
      iconoToggle.style.transform = "rotate(180deg)";
      // Comprimir buscador en móvil cuando abre sidebar - usar display en lugar de margin
      if (searchSection && window.innerWidth < 768) {
        searchSection.style.display = "none";
      }
    }
  });
}

/**
 * Recalcula el maxHeight de todos los grupos expandidos en móvil.
 * Útil cuando el contenido cambia dinámicamente (agregar/eliminar tareas).
 * SEGURIDAD: Asegura que scrollHeight sea válido antes de asignar.
 * @returns {void}
 */
function recalcularMaxHeights() {
  if (window.innerWidth >= 768) return; // Solo en móvil
  
  const grupos = document.querySelectorAll("[id^='grupo-']");
  grupos.forEach(grupo => {
    const tasksContainer = grupo.querySelector(".grupo-tasks-container");
    if (!tasksContainer) return;
    
    if (grupo.dataset.expanded === "true") {
      // Usar requestAnimationFrame para asegurar que el navegador ha pintado
      requestAnimationFrame(() => {
        const currentHeight = tasksContainer.scrollHeight;
        // Validación: asegurar que scrollHeight sea válido
        if (currentHeight > 0) {
          tasksContainer.style.maxHeight = currentHeight + "px";
        }
      });
    }
  });
}

/**
 * Punto de entrada principal de la aplicación.
 * Inicializa todos los componentes: modo oscuro, tareas, drag-and-drop, y UI interactiva.
 * @returns {void}
 */
function inicializarManejadorRedimensionamiento() {
  // Prevenir múltiples listeners con debounce
  let resizeTimeout = null;
  
  window.addEventListener("resize", () => {
    // Debounce: no procesar más de una vez cada 250ms
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    
    resizeTimeout = setTimeout(() => {
      const isMobile = window.innerWidth < 768;
      const grupos = document.querySelectorAll("[id^='grupo-']");
      const sidebarContent = document.getElementById("sidebarContent");
      const searchSection = document.getElementById("searchSection");
      const toggleSidebar = document.getElementById("toggleSidebar");
      
      grupos.forEach(grupo => {
        const wrapper = grupo.closest(".grupo-wrapper");
        const btnToggle = wrapper?.querySelector(".btn-toggle-group-mobile");
        const tasksContainer = grupo.querySelector(".grupo-tasks-container");
        
        if (!btnToggle || !tasksContainer) return;
        
        if (isMobile) {
          // En móvil: mostrar botón, mantener estado actual
          btnToggle.style.display = "block";
        } else {
          // En desktop: ocultar botón y expandir contenedor
          btnToggle.style.display = "none";
          tasksContainer.style.maxHeight = "none";
          tasksContainer.style.opacity = "1";
          tasksContainer.style.marginTop = "1rem";
          btnToggle.style.transform = "scaleY(1)";
          grupo.dataset.expanded = "true";
        }
      });
      
      // Resetear estado del sidebar y searchSection al cambiar entre breakpoints
      if (!isMobile) {
        // En desktop: mostrar todo normalmente
        if (sidebarContent) {
          sidebarContent.style.maxHeight = "none";
          sidebarContent.style.opacity = "1";
        }
        if (searchSection) {
          searchSection.style.display = "block";
          searchSection.style.opacity = "1";
        }
        if (toggleSidebar) {
          const iconoToggle = document.getElementById("iconoToggle");
          if (iconoToggle) iconoToggle.style.transform = "rotate(0deg)";
        }
      } else {
        // En móvil: resetear sidebar a estado cerrado si es necesario
        if (sidebarContent && sidebarContent.style.maxHeight !== "0px") {
          sidebarContent.style.maxHeight = "0px";
          sidebarContent.style.opacity = "0";
        }
      }
    }, 250);
  });
}

window.onload = function() {
  inicializarModo();
  inicializarTareas();
  inicializarDragAndDrop();
  inicializarToggleSidebar();
  inicializarManejadorRedimensionamiento();
};