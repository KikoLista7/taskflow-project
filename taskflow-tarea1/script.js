/**
 * Alterna entre modo claro y oscuro y persiste la preferencia en localStorage.
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

// Colores asociados a cada nivel de prioridad
const PRIORIDAD_COLORES = {
  alta:  { color: "bg-red-500",    borde: "border-red-500" },
  media: { color: "bg-yellow-500", borde: "border-yellow-500" },
  baja:  { color: "bg-green-500",  borde: "border-green-500" }
}

/**
 * Crea un objeto tarea normalizado listo para almacenar.
 * @param {string} tipo - Nombre del grupo o categoría de la tarea.
 * @param {string} tarea - Descripción de la tarea.
 * @param {"baja"|"media"|"alta"} prioridad - Nivel de prioridad.
 * @param {boolean} [completada=false] - Estado inicial de completado.
 * @returns {{id:number,tipo:string,tarea:string,prioridad:string,completed:boolean,createdAt:string}}
 */
function crearTareaObjeto(tipo, tarea, prioridad, completada = false){
  return{
    id: Date.now() + Math.random(),
    tipo: tipo,
    tarea: tarea,
    prioridad: prioridad,
    completed: completada,
    createdAt: new Date().toISOString()
  }
}

/**
 * Valida los campos del formulario principal y crea una nueva tarea.
 * Incluye validaciones extra de longitud y duplicados.
 */
function agregarTarea(){
  const tipo = document.getElementById("tipoInput").value.trim()
  const tarea = document.getElementById("tareaInput").value.trim()
  const prioridad = document.getElementById("prioridadInput").value

  const tipoInput = document.getElementById("tipoInput")
  const tareaInput = document.getElementById("tareaInput")
  const prioridadInput = document.getElementById("prioridadInput")

  let hayError = false

  // Validaciones básicas de campos vacíos

  if(!tipo){
    tipoInput.classList.add("ring-2", "ring-red-500", "animate-heartbeat")
    hayError = true
  }else{
    tipoInput.classList.remove("ring-2", "ring-red-500", "animate-heartbeat")
  }

  if(!tarea){
    tareaInput.classList.add("ring-2", "ring-red-500", "animate-heartbeat")
    hayError = true
  }else{
    tareaInput.classList.remove("ring-2", "ring-red-500", "animate-heartbeat")
  }

  if(!prioridad){
    prioridadInput.classList.add("ring-2", "ring-red-500", "animate-heartbeat")
    hayError = true
  }else{
    prioridadInput.classList.remove("ring-2", "ring-red-500", "animate-heartbeat")
  }

  // Validación de longitud para evitar textos exagerados
  if(tipo.length > 50){
    hayError = true
    tipoInput.classList.add("ring-2", "ring-red-500", "animate-heartbeat")
  }
  if(tarea.length > 200){
    hayError = true
    tareaInput.classList.add("ring-2", "ring-red-500", "animate-heartbeat")
  }

  // Impedir tareas duplicadas (mismo tipo y misma descripción, sin distinguir mayúsculas/minúsculas)
  const tareaDuplicada = tareas.some(t => 
    t.tipo.toLowerCase() === tipo.toLowerCase() &&
    t.tarea.toLowerCase() === tarea.toLowerCase()
  )
  if(tareaDuplicada){
    hayError = true
    tareaInput.classList.add("ring-2", "ring-red-500", "animate-heartbeat")
  }

  if(hayError){
    setTimeout(()=>{
      tipoInput.classList.remove("ring-2", "ring-red-500", "animate-heartbeat")
      tareaInput.classList.remove("ring-2", "ring-red-500", "animate-heartbeat")
      prioridadInput.classList.remove("ring-2", "ring-red-500", "animate-heartbeat")
    },2500)
    return
  }

  crearTareaEnDOM(tipo, tarea, prioridad)

  tipoInput.value = ""
  tareaInput.value = ""
  prioridadInput.value = ""

  const nuevaTarea = crearTareaObjeto(tipo, tarea, prioridad)
  tareas.push(nuevaTarea)
  guardarTareas()
  guardarOrden()
}

/**
 * Crea (si no existe) el grupo indicado y añade una tarea al DOM.
 * @param {string} tipo - Nombre del grupo/categoría.
 * @param {string} tarea - Descripción de la tarea.
 * @param {"baja"|"media"|"alta"} prioridad - Nivel de prioridad.
 * @param {boolean} [animacion=true] - Si debe animarse la aparición.
 * @param {boolean} [completada=false] - Estado inicial de completado.
 */
function crearTareaEnDOM(tipo, tarea, prioridad, animacion = true, completada = false){
  let grupo = document.getElementById("grupo-"+tipo)

  if(!grupo){
    grupo = document.createElement("div")
    grupo.id = "grupo-"+tipo
    grupo.className = "bg-white/5 dark:bg-black/10 backdrop-blur-md p-4 rounded-xl shadow-lg"
    grupo.dataset.tipo = tipo
    grupo.innerHTML = `
<div class="flex justify-between items-center mb-2 cursor-move handle">
  <div class="flex items-center gap-2 cursor-move handle group">
    <span class="opacity-0 group-hover:opacity-40 transition text-sm">⋮⋮</span>
    <h2 class="text-xl font-semibold tracking-wide">${tipo}</h2>
    <button class="btn-editar ml-2 text-gray-400 hover:text-indigo-400 transition transform hover:scale-110" title="Editar grupo">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </button>
  </div>
  <button class="btn-eliminar text-red-400 hover:text-red-500 transition transform hover:scale-110 hover:rotate-6">
    🗑️
  </button>
</div>
<ul class="space-y-2 lista"></ul>
<button class="btn-agregar-subtarea mt-3 w-full bg-white/5 hover:bg-white/10 dark:bg-black/5 dark:hover:bg-black/10 border border-white/20 hover:border-indigo-400 rounded-lg py-2 text-sm transition-all flex items-center justify-center gap-1 group">
  <span class="text-lg leading-none group-hover:scale-110 transition-transform">+</span>
  <span class="leading-none">Nueva tarea</span>
</button>
`
    taskContainer.appendChild(grupo)

    grupo.querySelector(".btn-editar").onclick = function(){ editarGrupo(tipo) }
    grupo.querySelector(".btn-eliminar").onclick = function(){ confirmarEliminarGrupo(tipo) }
    const btnAgregar = grupo.querySelector(".btn-agregar-subtarea")
    btnAgregar.setAttribute("aria-label", "Añadir subtarea a " + tipo)
    btnAgregar.onclick = function(){ agregarSubtarea(tipo) }

    activarSortableLista(grupo.querySelector(".lista"))
    mostrarMensajeVacio()
  }

  const lista = grupo.querySelector(".lista")

  const {color, borde} = PRIORIDAD_COLORES[prioridad]

  const item = document.createElement("li")
  item.className = `flex justify-between items-center gap-3 border-l-4 ${borde} bg-white/10 dark:bg-black/10 p-3 rounded-lg backdrop-blur-md hover:bg-white/20 dark:hover:bg-black/20 transition`
  item.dataset.tipo = tipo
  item.dataset.tarea = tarea
  item.dataset.prioridad = prioridad

  if(animacion){
    item.style.opacity="0"
    item.style.transform="translateY(10px)"
  }

  item.innerHTML=`
<div class="flex items-center gap-2 flex-1 min-w-0">
  <input type="checkbox" onclick="completarTarea(this)" class="cursor-pointer flex-shrink-0" ${completada ? 'checked' : ''}>
  <span class="tarea-texto break-words cursor-pointer hover:bg-white/10 dark:hover:bg-black/20 hover:px-2 hover:py-1 hover:rounded transition-all ${completada ? 'line-through opacity-50' : ''}" title="Doble clic para editar">${tarea}</span>
</div>
<div class="flex items-center gap-2 flex-shrink-0">
  <span class="prioridad-badge ${color} text-white px-2 py-0.5 rounded text-xs whitespace-nowrap cursor-pointer hover:scale-110 transition-transform" title="Clic para cambiar prioridad">${prioridad}</span>
  <button onclick="confirmarEliminarTarea(this)" class="text-red-500 hover:text-red-700 transition text-lg font-bold leading-none w-6 h-6 flex items-center justify-center">−</button>
</div>
`

  if(completada){
    item.classList.add("opacity-60")
  }

  const spanTarea = item.querySelector(".tarea-texto")
  // Accesibilidad: permitir activar edición con teclado
  spanTarea.setAttribute("role", "button")
  spanTarea.tabIndex = 0
  spanTarea.addEventListener("dblclick", function(){
    editarTarea(item, spanTarea)
  })
  spanTarea.addEventListener("keydown", function(e){
    if(e.key === "Enter" || e.key === " "){
      e.preventDefault()
      editarTarea(item, spanTarea)
    }
  })

  const badgePrioridad = item.querySelector(".prioridad-badge")
  // Accesibilidad: hacer la prioridad operable con teclado
  badgePrioridad.setAttribute("role", "button")
  badgePrioridad.tabIndex = 0
  badgePrioridad.addEventListener("click", function(){
    cambiarPrioridad(item, badgePrioridad)
  })
  badgePrioridad.addEventListener("keydown", function(e){
    if(e.key === "Enter" || e.key === " "){
      e.preventDefault()
      cambiarPrioridad(item, badgePrioridad)
    }
  })

  lista.appendChild(item)
  actualizarProgreso()

  if(animacion){
    setTimeout(()=>{
      item.style.opacity="1"
      item.style.transform="translateY(0)"
      item.style.transition="all 0.3s ease"
    },10)
  }
}

/**
 * Permite editar el nombre de un grupo y propaga los cambios a las tareas asociadas.
 * @param {string} nombreActual - Nombre actual del grupo.
 */
function editarGrupo(nombreActual){
  const grupo = document.getElementById("grupo-"+nombreActual)
  if(!grupo) return

  const h2 = grupo.querySelector("h2")
  const textoOriginal = h2.textContent

  const input = document.createElement("input")
  input.type = "text"
  input.value = textoOriginal
  input.className = "bg-white/20 dark:bg-black/30 border border-indigo-400 rounded px-2 py-1 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
  input.style.width = "200px"

  h2.replaceWith(input)
  input.focus()
  input.select()

  const guardarCambios = () => {
    const nuevoNombre = input.value.trim()
    if(nuevoNombre && nuevoNombre !== textoOriginal){

      const grupoExistente = document.getElementById("grupo-"+nuevoNombre)
      if(grupoExistente && grupoExistente !== grupo){
        const tareasActuales = Array.from(grupo.querySelectorAll("li"))
        const listaExistente = grupoExistente.querySelector(".lista")

        tareasActuales.forEach(li => {
          li.dataset.tipo = nuevoNombre
          listaExistente.appendChild(li)
        })

        tareas.forEach(t => {
          if(t.tipo === nombreActual){
            t.tipo = nuevoNombre
          }
        })

        grupo.remove()
        guardarTareas()
        guardarOrden()
        mostrarMensajeVacio()
        return
      }

      tareas.forEach(t => {
        if(t.tipo === nombreActual){
          t.tipo = nuevoNombre
        }
      })

      grupo.id = "grupo-"+nuevoNombre
      grupo.dataset.tipo = nuevoNombre

      const nuevoH2 = document.createElement("h2")
      nuevoH2.className = "text-xl font-semibold tracking-wide"
      nuevoH2.textContent = nuevoNombre
      input.replaceWith(nuevoH2)

      const botonEditar = grupo.querySelector(".btn-editar")
      botonEditar.onclick = function(){ editarGrupo(nuevoNombre) }

      const botonEliminar = grupo.querySelector(".btn-eliminar")
      botonEliminar.onclick = function(){ confirmarEliminarGrupo(nuevoNombre) }

      grupo.querySelectorAll("li").forEach(li => {
        li.dataset.tipo = nuevoNombre
      })

      guardarTareas()
      guardarOrden()
    } else {
      const nuevoH2 = document.createElement("h2")
      nuevoH2.className = "text-xl font-semibold tracking-wide"
      nuevoH2.textContent = textoOriginal
      input.replaceWith(nuevoH2)
    }
  }

  input.addEventListener("keydown", (e) => {
    if(e.key === "Enter"){
      guardarCambios()
    } else if(e.key === "Escape"){
      const nuevoH2 = document.createElement("h2")
      nuevoH2.className = "text-xl font-semibold tracking-wide"
      nuevoH2.textContent = textoOriginal
      input.replaceWith(nuevoH2)
    }
  })

  input.addEventListener("blur", guardarCambios)
}

/**
 * Permite editar el texto de una tarea concreta y actualiza el almacenamiento.
 * @param {HTMLLIElement} item - Elemento de lista que representa la tarea.
 * @param {HTMLElement} spanTarea - Span que contiene el texto de la tarea.
 */
function editarTarea(item, spanTarea){
  const tareaOriginal = item.dataset.tarea
  const tipo = item.dataset.tipo
  const prioridad = item.dataset.prioridad

  const input = document.createElement("input")
  input.type = "text"
  input.value = spanTarea.textContent
  input.className = "bg-white/20 dark:bg-black/30 border border-indigo-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"

  spanTarea.replaceWith(input)
  input.focus()
  input.select()

  const guardarCambios = () => {
    const nuevaTarea = input.value.trim()
    if(nuevaTarea && nuevaTarea !== tareaOriginal){
      const tareaObj = tareas.find(t => t.tipo === tipo && t.tarea === tareaOriginal && t.prioridad === prioridad)
      if(tareaObj){
        tareaObj.tarea = nuevaTarea
        guardarTareas()
      }

      item.dataset.tarea = nuevaTarea

      const nuevoSpan = document.createElement("span")
      nuevoSpan.className = spanTarea.className.replace('line-through opacity-50', '').trim()
      if(item.querySelector('input[type="checkbox"]').checked){
        nuevoSpan.className += ' line-through opacity-50'
      }
      nuevoSpan.textContent = nuevaTarea
      nuevoSpan.title = "Doble clic para editar ✏️"
      nuevoSpan.addEventListener("dblclick", function(){
        editarTarea(item, nuevoSpan)
      })
      input.replaceWith(nuevoSpan)

      guardarOrden()
    } else if(nuevaTarea === tareaOriginal){
      const nuevoSpan = document.createElement("span")
      nuevoSpan.className = spanTarea.className
      nuevoSpan.textContent = tareaOriginal
      nuevoSpan.title = "Doble clic para editar ✏️"
      nuevoSpan.addEventListener("dblclick", function(){
        editarTarea(item, nuevoSpan)
      })
      input.replaceWith(nuevoSpan)
    } else {
      const nuevoSpan = document.createElement("span")
      nuevoSpan.className = spanTarea.className
      nuevoSpan.textContent = tareaOriginal
      nuevoSpan.title = "Doble clic para editar ✏️"
      nuevoSpan.addEventListener("dblclick", function(){
        editarTarea(item, nuevoSpan)
      })
      input.replaceWith(nuevoSpan)
    }
  }

  input.addEventListener("keydown", (e) => {
    if(e.key === "Enter"){
      guardarCambios()
    } else if(e.key === "Escape"){
      const nuevoSpan = document.createElement("span")
      nuevoSpan.className = spanTarea.className
      nuevoSpan.textContent = tareaOriginal
      nuevoSpan.title = "Doble clic para editar ✏️"
      nuevoSpan.addEventListener("dblclick", function(){
        editarTarea(item, nuevoSpan)
      })
      input.replaceWith(nuevoSpan)
    }
  })

  input.addEventListener("blur", guardarCambios)
}

/**
 * Muestra u oculta el mensaje vacío según haya grupos de tareas en el contenedor.
 */
function mostrarMensajeVacio(){
  const mensaje = document.getElementById("mensajeVacio")
  if(taskContainer.children.length === 0){
    mensaje.classList.remove("hidden")
  }else{
    mensaje.classList.add("hidden")
  }
}

/**
 * Elimina una tarea concreta tanto del DOM como del array en memoria.
 * @param {string} tipo - Tipo/grupo de la tarea.
 * @param {string} tarea - Texto de la tarea.
 * @param {HTMLLIElement} item - Elemento de lista asociado.
 */
function eliminarTarea(tipo, tarea, item){
  tareas = tareas.filter(t => !(t.tipo === tipo && t.tarea === tarea))
  guardarTareas()
  guardarOrden()

  item.remove()
  actualizarProgreso()
  cerrarModal()
  mostrarMensajeVacio()
}

/**
 * Elimina un grupo completo y todas sus tareas asociadas.
 * @param {string} tipo - Nombre del grupo a eliminar.
 */
function eliminarGrupo(tipo){
  tareas = tareas.filter(t => t.tipo !== tipo)
  guardarTareas()
  guardarOrden()

  document.getElementById("grupo-"+tipo).remove()
  actualizarProgreso()
  cerrarModal()
  mostrarMensajeVacio()
}

/**
 * Abre un modal de confirmación para eliminar una única tarea.
 * @param {HTMLButtonElement} boton - Botón que dispara la acción.
 */
function confirmarEliminarTarea(boton){
  const modal = document.createElement("div")
  modal.className = "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
  modal.innerHTML = `
<div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl max-w-sm mx-4 transform scale-95 opacity-0 transition-all duration-200" role="dialog" aria-modal="true" aria-labelledby="tituloEliminarTarea">
  <h3 id="tituloEliminarTarea" class="text-lg font-semibold mb-3 text-gray-900 dark:text-white">¿Está seguro de eliminar esta tarea?</h3>
  <p class="text-sm text-gray-600 dark:text-gray-300 mb-5">Esta acción no se puede deshacer.</p>
  <div class="flex gap-3">
    <button id="btnEliminarTarea" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">
      Eliminar
    </button>
    <button onclick="cerrarModal()" class="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-2 rounded-lg transición">
      Cancelar
    </button>
  </div>
</div>
`
  document.body.appendChild(modal)

  const item = boton.closest("li")
  const tipo = item.dataset.tipo
  const tarea = item.dataset.tarea

  document.getElementById("btnEliminarTarea").onclick = function(){
    eliminarTarea(tipo, tarea, item)
  }

  setTimeout(()=>{
    modal.firstElementChild.classList.remove("scale-95", "opacity-0")
    modal.firstElementChild.classList.add("scale-100", "opacity-100")
  },10)
}

/**
 * Abre un modal de confirmación para eliminar todas las tareas de un grupo.
 * @param {string} tipo - Nombre del grupo a eliminar.
 */
function confirmarEliminarGrupo(tipo){
  const modal = document.createElement("div")
  modal.className = "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
  modal.innerHTML = `
<div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl max-w-sm mx-4 transform scale-95 opacity-0 transición-all duration-200" role="dialog" aria-modal="true" aria-labelledby="tituloEliminarGrupo">
  <h3 id="tituloEliminarGrupo" class="text-lg font-semibold mb-3 text-gray-900 dark:text-white">¿Está seguro de eliminar este grupo?</h3>
  <p class="text-sm text-gray-600 dark:text-gray-300 mb-5">Se eliminarán todas las tareas del grupo "${tipo}".</p>
  <div class="flex gap-3">
    <button onclick="eliminarGrupo('${tipo}')" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">
      Eliminar
    </button>
    <button onclick="cerrarModal()" class="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-2 rounded-lg transition">
      Cancelar
    </button>
  </div>
</div>
`
  document.body.appendChild(modal)
  modal.dataset.tipo = tipo

  setTimeout(()=>{
    modal.firstElementChild.classList.remove("scale-95", "opacity-0")
    modal.firstElementChild.classList.add("scale-100", "opacity-100")
  },10)
}

/**
 * Cierra (si existe) el modal de confirmación actual.
 */
function cerrarModal(){
  const modal = document.querySelector(".fixed.inset-0")
  if(modal){
    modal.firstElementChild.classList.add("scale-95", "opacity-0")
    setTimeout(()=>{
      modal.remove()
    },200)
  }
}

/**
 * Guarda el array de tareas en localStorage.
 */
function guardarTareas(){
  localStorage.setItem("tareas", JSON.stringify(tareas))
}

/**
 * Guarda el orden actual de grupos y tareas dentro de cada grupo en localStorage.
 */
function guardarOrden(){
  const grupos = Array.from(document.querySelectorAll("[id^='grupo-']"))
  ordenGrupos = grupos.map(g => {
    const tipo = g.dataset.tipo
    const lista = Array.from(g.querySelectorAll("li"))
    const tareasOrden = lista.map(li => ({
      tipo: li.dataset.tipo,
      tarea: li.dataset.tarea,
      prioridad: li.dataset.prioridad
    }))
    return {tipo, tareasOrden}
  })
  localStorage.setItem("ordenGrupos", JSON.stringify(ordenGrupos))
}

/**
 * Reconstruye el orden de grupos y tareas a partir de los datos almacenados.
 */
function cargarOrden(){
  const datos = localStorage.getItem("ordenGrupos")
  if(datos){
    ordenGrupos = JSON.parse(datos)
    ordenGrupos.forEach(grupo => {
      grupo.tareasOrden.forEach(t => {
        const tareaObj = tareas.find(tarea => tarea.tipo === t.tipo && tarea.tarea === t.tarea)
        if(tareaObj){
          crearTareaEnDOM(t.tipo, t.tarea, t.prioridad, false, tareaObj.completed)
        }
      })
    })
  }
}

/**
 * Carga el listado de tareas almacenadas en localStorage en memoria.
 */
function cargarTareas(){
  const datos = localStorage.getItem("tareas")
  if(datos){
    tareas = JSON.parse(datos)
  }
}

/**
 * Crea un juego inicial de tareas de ejemplo cuando no existe información previa.
 */
function cargarTareasIniciales(){
  const tarea1 = crearTareaObjeto("Compra", "Verduras", "baja")
  const tarea2 = crearTareaObjeto("Compra", "Detergente", "media")
  const tarea3 = crearTareaObjeto("Compra", "Traje para fin de año", "alta")
  const tarea4 = crearTareaObjeto("Ejercicio", "Salir a correr 10 km", "media")
  const tarea5 = crearTareaObjeto("Ejercicio", "Ir al gimnasio por la mañana", "alta")
  const tarea6 = crearTareaObjeto("Ejercicio", "Partido de pádel el finde", "baja")
  const tarea7 = crearTareaObjeto("Trabajo", "Terminar el proyecto antes del viernes", "alta")
  const tarea8 = crearTareaObjeto("Trabajo", "Presentar el prototipo de la página", "media")

  tareas.push(tarea1, tarea2, tarea3, tarea4, tarea5, tarea6, tarea7, tarea8)

  crearTareaEnDOM("Compra", "Verduras", "baja", false)
  crearTareaEnDOM("Compra", "Detergente", "media", false)
  crearTareaEnDOM("Compra", "Traje para fin de año", "alta", false)
  crearTareaEnDOM("Ejercicio", "Salir a correr 10 km", "media", false)
  crearTareaEnDOM("Ejercicio", "Ir al gimnasio por la mañana", "alta", false)
  crearTareaEnDOM("Ejercicio", "Partido de pádel el finde", "baja", false)
  crearTareaEnDOM("Trabajo", "Terminar el proyecto antes del viernes", "alta", false)
  crearTareaEnDOM("Trabajo", "Presentar el prototipo de la página", "media", false)

  guardarTareas()
  guardarOrden()
}

/**
 * Filtra visualmente las tareas del tablero a partir de un texto de búsqueda.
 * @param {string} texto - Texto a buscar dentro del contenido de cada tarea.
 */
function buscar(texto){
  const tareas = document.querySelectorAll("li")
  tareas.forEach(t=>{
    const contenido = t.innerText.toLowerCase()
    t.style.display = contenido.includes(texto.toLowerCase()) ? "flex" : "none"
  })
}

/**
 * Marca o desmarca todas las tareas a la vez según el estado actual.
 */
function completarTodas(){
  const checks = document.querySelectorAll("input[type='checkbox']")
  const total = checks.length
  const completadas = document.querySelectorAll("input:checked").length

  checks.forEach(c=>{
    if(completadas === total){
      if(c.checked) c.click()
    }else{
      if(!c.checked) c.click()
    }
  })
}

/**
 * Marca una tarea como completada o pendiente y actualiza la barra de progreso.
 * @param {HTMLInputElement} checkbox - Checkbox asociado a la tarea.
 */
function completarTarea(checkbox){
  const tarea = checkbox.closest("li")
  const texto = checkbox.nextElementSibling

  texto.classList.toggle("line-through")
  texto.classList.toggle("opacity-50")
  tarea.classList.toggle("opacity-60")
  tarea.classList.add("scale-95")

  setTimeout(()=>{
    tarea.classList.remove("scale-95")
  },150)

  const tipo = tarea.dataset.tipo
  const tareaTexto = tarea.dataset.tarea
  const tareaObj = tareas.find(t => t.tipo === tipo && t.tarea === tareaTexto)
  if(tareaObj){
    tareaObj.completed = checkbox.checked
    guardarTareas()
  }

  actualizarProgreso()
}

/**
 * Actualiza la barra y el texto de progreso general de tareas completadas.
 */
function actualizarProgreso(){
  const total = document.querySelectorAll("li").length
  const completadas = document.querySelectorAll("input:checked").length

  if(total === 0){
    const barra = document.getElementById("barraProgreso")
    barra.style.width = "0%"
    barra.style.background = "linear-gradient(90deg, #a855f7, #ec4899)"
    const texto = document.getElementById("progresoTexto")
    texto.textContent = "0%"
    const progressContainer = document.querySelector('[role="progressbar"]')
    if(progressContainer){
      progressContainer.setAttribute("aria-valuenow", "0")
      progressContainer.setAttribute("aria-valuetext", "0% completado")
    }
    return
  }

  const porcentaje = Math.round((completadas / total) * 100)
  const barra = document.getElementById("barraProgreso")

  barra.style.width = porcentaje + "%"

  if(porcentaje < 33){
    barra.style.background = "linear-gradient(90deg, #ef4444, #f97316)"
  }else if(porcentaje < 66){
    barra.style.background = "linear-gradient(90deg, #f59e0b, #eab308)"
  }else if(porcentaje < 100){
    barra.style.background = "linear-gradient(90deg, #84cc16, #22c55e)"
  }else{
    barra.style.background = "linear-gradient(90deg, #10b981, #059669)"
  }

  const texto = document.getElementById("progresoTexto")
  texto.textContent = porcentaje + "%"
  const progressContainer = document.querySelector('[role="progressbar"]')
  if(progressContainer){
    progressContainer.setAttribute("aria-valuenow", String(porcentaje))
    progressContainer.setAttribute("aria-valuetext", porcentaje + "% completado")
  }
}

/**
 * Activa la funcionalidad de arrastrar y soltar sobre una lista dada.
 * @param {HTMLElement} lista - Lista UL que contendrá tareas arrastrables.
 */
function activarSortableLista(lista){
  new Sortable(lista,{
    animation:150,
    ghostClass:"opacity-50",
    chosenClass:"bg-indigo-200",
    dragClass:"rotate-1",
    onEnd: guardarOrden
  })
}

/**
 * Muestra controles en línea para añadir una nueva subtarea a un grupo existente.
 * @param {string} tipo - Nombre del grupo al que se añade la subtarea.
 */
function agregarSubtarea(tipo){
  const grupo = document.getElementById("grupo-"+tipo)
  const lista = grupo.querySelector(".lista")
  const botonAgregar = grupo.querySelector(".btn-agregar-subtarea")

  const inputContainer = document.createElement("div")
  inputContainer.className = "mt-2 flex gap-2"
  inputContainer.innerHTML = `
<input type="text" placeholder="Nueva subtarea..." class="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
<button class="btn-guardar-subtarea bg-indigo-500 hover:bg-indigo-600 px-3 rounded-lg transition">✓</button>
<button class="btn-cancelar-subtarea bg-red-500 hover:bg-red-600 px-3 rounded-lg transition">✕</button>
`

  botonAgregar.replaceWith(inputContainer)
  const input = inputContainer.querySelector("input")
  input.focus()

  const guardarSubtarea = () => {
    const textoSubtarea = input.value.trim()
    if(textoSubtarea){
      // Evitar subtareas duplicadas dentro del mismo grupo
      const existeDuplicada = tareas.some(t => 
        t.tipo.toLowerCase() === tipo.toLowerCase() &&
        t.tarea.toLowerCase() === textoSubtarea.toLowerCase()
      )
      if(existeDuplicada){
        input.classList.add("ring-2","ring-red-500","animate-heartbeat")
        setTimeout(() => {
          input.classList.remove("ring-2","ring-red-500","animate-heartbeat")
        }, 2000)
        return
      }
      const nuevaTarea = crearTareaObjeto(tipo, textoSubtarea, "baja")
      tareas.push(nuevaTarea)
      crearTareaEnDOM(tipo, textoSubtarea, "baja")
      guardarTareas()
      guardarOrden()
    }
    const nuevoBoton = crearBotonAgregarSubtarea(tipo)
    inputContainer.replaceWith(nuevoBoton)
  }

  const cancelar = () => {
    const nuevoBoton = crearBotonAgregarSubtarea(tipo)
    inputContainer.replaceWith(nuevoBoton)
  }

  inputContainer.querySelector(".btn-guardar-subtarea").onclick = guardarSubtarea
  inputContainer.querySelector(".btn-cancelar-subtarea").onclick = cancelar

  input.addEventListener("keydown", (e) => {
    if(e.key === "Enter"){
      guardarSubtarea()
    } else if(e.key === "Escape"){
      cancelar()
    }
  })

  input.addEventListener("blur", () => {
    setTimeout(cancelar, 200)
  })
}

/**
 * Crea un nuevo botón "Añadir subtarea" para un grupo dado.
 * @param {string} tipo - Nombre del grupo.
 * @returns {HTMLButtonElement} Botón configurado para añadir subtareas.
 */
function crearBotonAgregarSubtarea(tipo){
  const boton = document.createElement("button")
  boton.className = "btn-agregar-subtarea mt-3 w-full bg-white/5 hover:bg-white/10 dark:bg-black/5 dark:hover:bg-black/10 border border-white/20 hover:border-indigo-400 rounded-lg py-2 text-sm transición-all flex items-center justify-center gap-1 group"
  boton.setAttribute("aria-label", "Añadir subtarea a " + tipo)
  boton.innerHTML = `
<span class="text-lg leading-none group-hover:scale-110 transition-transform">+</span>
<span class="leading-none">Añadir subtarea</span>
`
  boton.onclick = function(){ agregarSubtarea(tipo) }
  return boton
}

/**
 * Cambia cíclicamente el nivel de prioridad de una tarea (baja → media → alta → baja).
 * @param {HTMLLIElement} item - Elemento de lista de la tarea.
 * @param {HTMLElement} badge - Elemento visual que muestra la prioridad.
 */
function cambiarPrioridad(item, badge){
  const prioridadActual = item.dataset.prioridad
  const tipo = item.dataset.tipo
  const tarea = item.dataset.tarea

  const rotacion = {
    "baja": "media",
    "media": "alta",
    "alta": "baja"
  }

  const nuevaPrioridad = rotacion[prioridadActual]

  item.dataset.prioridad = nuevaPrioridad

  badge.className = `prioridad-badge ${PRIORIDAD_COLORES[nuevaPrioridad].color} text-white px-2 py-0.5 rounded text-xs whitespace-nowrap cursor-pointer hover:scale-110 transition-transform`
  badge.textContent = nuevaPrioridad

  item.className = `flex justify-between items-center gap-3 border-l-4 ${PRIORIDAD_COLORES[nuevaPrioridad].borde} bg-white/10 dark:bg-black/10 p-3 rounded-lg backdrop-blur-md hover:bg-white/20 dark:hover:bg-black/20 transition`
  if(item.classList.contains("opacity-60")){
    item.classList.add("opacity-60")
  }

  const tareaObj = tareas.find(t => t.tipo === tipo && t.tarea === tarea)
  if(tareaObj){
    tareaObj.prioridad = nuevaPrioridad
    guardarTareas()
    guardarOrden()
  }
}

/**
 * Punto de entrada de la aplicación. Restaura modo, tareas, orden y listeners de interfaz.
 */
window.onload = function(){
  if(localStorage.getItem("modo") === "dark"){
    document.documentElement.classList.add("dark")
    modoBtn.textContent = "☀️"
  }

  cargarTareas()

  const hayOrden = localStorage.getItem("ordenGrupos")
  if(hayOrden){
    cargarOrden()
  }else{
    cargarTareasIniciales()
  }

  new Sortable(taskContainer,{
    animation:200,
    ghostClass:"opacity-50",
    handle:".handle",
    swapThreshold:0.65,
    onEnd: guardarOrden
  })

  // Toggle del sidebar en móvil con animación
  const toggleBtn = document.getElementById("toggleSidebar")
  const sidebarContent = document.getElementById("sidebarContent")
  const iconoToggle = document.getElementById("iconoToggle")

  if(toggleBtn){
    toggleBtn.addEventListener("click", function(){
      if(sidebarContent.style.maxHeight && sidebarContent.style.maxHeight !== "0px"){
        // Cerrar
        sidebarContent.style.maxHeight = "0px"
        sidebarContent.style.opacity = "0"
        sidebarContent.style.paddingTop = "0"
        sidebarContent.style.paddingBottom = "0"
        iconoToggle.style.transform = "rotate(0deg)"
      } else {
        // Abrir
        sidebarContent.style.maxHeight = sidebarContent.scrollHeight + "px"
        sidebarContent.style.opacity = "1"
        sidebarContent.style.paddingTop = "1.25rem"
        sidebarContent.style.paddingBottom = "1.25rem"
        iconoToggle.style.transform = "rotate(180deg)"
      }
    })
  }
}