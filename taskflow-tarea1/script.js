function toggleDark(){
document.documentElement.classList.toggle("dark")

const boton = document.getElementById("modoBtn")

if(document.documentElement.classList.contains("dark")){
boton.textContent="☀️"
}else{
boton.textContent="🌙"
}
}

const contenedor = document.getElementById("taskContainer")

function agregarTarea(){

const tipo = document.getElementById("tipoInput").value
const tarea = document.getElementById("tareaInput").value
const prioridad = document.getElementById("prioridadInput").value

if(!tipo || !tarea) return

let grupo = document.getElementById("grupo-"+tipo)

if(!grupo){

grupo = document.createElement("div")

grupo.id = "grupo-"+tipo

grupo.className = "bg-white/5 dark:bg-black/10 backdrop-blur-md p-4 rounded-xl shadow-lg"

grupo.innerHTML = `
<div class="flex justify-between items-center mb-2 cursor-move handle">

<div class="flex items-center gap-2 cursor-move handle group">

<span class="opacity-0 group-hover:opacity-40 transition text-sm">⋮⋮</span>

<h2 class="text-xl font-semibold tracking-wide">${tipo}</h2>

</div>

<button onclick="eliminarGrupo('${tipo}')" class="text-red-400 hover:text-red-500 transition transform hover:scale-110 hover:rotate-6">

🗑️

</button>

</div>

<ul class="space-y-2 lista"></ul>
`

contenedor.appendChild(grupo)

activarSortableLista(grupo.querySelector(".lista"))

}

const lista = grupo.querySelector(".lista")

let color=""
let borde=""

if(prioridad=="alta"){
color="bg-red-500"
borde="border-red-500"
}

if(prioridad=="media"){
color="bg-yellow-500"
borde="border-yellow-500"
}

if(prioridad=="baja"){
color="bg-green-500"
borde="border-green-500"
}

const item = document.createElement("li")

item.style.opacity="0"
item.style.transform="translateY(10px)"

item.className=`flex justify-between items-start border-l-4 ${borde} bg-white/10 dark:bg-black/10 p-3 rounded-lg backdrop-blur-md hover:bg-white/20 dark:hover:bg-black/20 transition`

item.innerHTML=`

<div class="flex items-center gap-2">

<input type="checkbox" onclick="completarTarea(this)">

<span class="flex-1 break-words">${tarea}</span>

<span class="${color} text-white px-2 rounded text-xs">${prioridad}</span>

</div>

<button onclick="this.parentElement.remove()" class="text-red-500">-</button>

`

lista.appendChild(item)

setTimeout(()=>{
item.style.opacity="1"
item.style.transform="translateY(0)"
item.style.transition="all 0.3s ease"
},10)

}

function eliminarGrupo(tipo){
document.getElementById("grupo-"+tipo).remove()
}

function crearInicial(tipo,tarea,prioridad){

let grupo = document.getElementById("grupo-"+tipo)

if(!grupo){

grupo = document.createElement("div")

grupo.id = "grupo-"+tipo

grupo.className = "bg-white/5 dark:bg-black/10 backdrop-blur-md p-4 rounded-xl shadow-lg"

grupo.innerHTML = `
<div class="flex justify-between items-center mb-2">

<div class="flex items-start gap-2 flex-1 cursor-move handle group">

<span class="opacity-0 group-hover:opacity-40 transition text-sm">⋮⋮</span>

<h2 class="text-xl font-semibold tracking-wide">${tipo}</h2>

</div>

<button onclick="eliminarGrupo('${tipo}')" class="text-red-400 hover:text-red-500 transition transform hover:scale-110 hover:rotate-6">

🗑️

</button>

</div>

<ul class="space-y-2 lista"></ul>
`

contenedor.appendChild(grupo)

activarSortableLista(grupo.querySelector(".lista"))

}

const lista = grupo.querySelector(".lista")

let color=""
let borde=""

if(prioridad=="alta"){
color="bg-red-500"
borde="border-red-500"
}

if(prioridad=="media"){
color="bg-yellow-500"
borde="border-yellow-500"
}

if(prioridad=="baja"){
color="bg-green-500"
borde="border-green-500"
}

const item=document.createElement("li")

item.className=`flex justify-between items-center border-l-4 ${borde} bg-white/10 dark:bg-black/10 p-2 rounded-lg hover:bg-white/20 transition`

item.innerHTML=`

<div class="flex items-center gap-2">

<input type="checkbox" onclick="completarTarea(this)">

<span class="flex-1 break-words">${tarea}</span>

<span class="${color} text-white px-2 rounded text-xs">${prioridad}</span>

</div>

<button onclick="this.parentElement.remove()" class="text-red-500 ml-3 hover:text-red-700 transition">−</button>
`

lista.appendChild(item)

if(!lista.classList.contains("sortable-applied")){
new Sortable(lista,{
animation:150,
ghostClass:"opacity-50",
chosenClass:"bg-indigo-200",
dragClass:"rotate-1"
})
lista.classList.add("sortable-applied")
}

}

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

}

function activarSortableLista(lista){

new Sortable(lista,{
animation:150,
ghostClass:"opacity-50",
chosenClass:"bg-indigo-200",
dragClass:"rotate-1"
})

}

window.onload=function(){

crearInicial("Compra","Verduras","baja")
crearInicial("Compra","Detergente","media")
crearInicial("Compra","Traje para fin de año","alta")

crearInicial("Ejercicio","Salir a correr 10 km","media")
crearInicial("Ejercicio","Ir al gimnasio por la mañana","alta")
crearInicial("Ejercicio","Partido de pádel el finde","baja")

crearInicial("Trabajo","Terminar el proyecto antes del viernes","alta")
crearInicial("Trabajo","Presentar el prototipo de la página","media")

new Sortable(taskContainer,{
animation:200,
ghostClass:"opacity-50",
handle:".handle",
swapThreshold:0.65
})

}