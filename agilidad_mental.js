// ===== CONFIGURACIÓN =====
const CLAVE = "agilidadMental";                          // clave con la que se guarda en localStorage
const DURACION = 20;                                     // segundos que dura cada partida
const TAMANOS = { facil: 90, normal: 64, dificil: 44 }; // diámetro del botón objetivo en píxeles
// ===== ESTADO DEL JUEGO =====
// "partida" guarda los clics y el tiempo restante; vale null cuando no hay una partida en curso
let estado = { nombre: "", nivel: "normal", record: 0, historial: [], partida: null };
let reloj = null; // aquí se guarda el temporizador para poder detenerlo
const $ = (id) => document.getElementById(id); // atajo para buscar elementos por id
// ===== LOCALSTORAGE =====
// Guarda el estado completo como texto JSON
function guardar() { localStorage.setItem(CLAVE, JSON.stringify(estado)); }
// Recupera el estado guardado (si existe) al abrir o refrescar la página
function cargar() { const g = localStorage.getItem(CLAVE); if (g) estado = JSON.parse(g); }
// ===== PANTALLAS =====
// Muestra la pantalla del juego o la del nombre
function mostrar(juego) { $("pantalla-juego").classList.toggle("oculto", !juego); $("pantalla-inicio").classList.toggle("oculto", juego); }
// Valida el nombre, guarda los datos y entra al juego
function entrar() {
    const nombre = $("campo-nombre").value.trim();
    $("error-nombre").classList.toggle("oculto", nombre !== "");
    if (nombre === "") return;
    estado.nombre = nombre; estado.nivel = $("campo-nivel").value;
    guardar(); prepararJuego();
}
// Deja la pantalla del juego lista según haya o no una partida guardada
function prepararJuego() {
    mostrar(true); pintarMarcadores(); pintarHistorial();
    $("objetivo").classList.add("oculto"); $("btn-pausa").classList.add("oculto");
    $("btn-iniciar").classList.remove("oculto");
    $("btn-iniciar").textContent = estado.partida ? "Continuar" : "Iniciar";
    $("mensaje").textContent = estado.partida ? "Partida en pausa. Pulsa Continuar." : "Pulsa Iniciar y haz clic en el botón rosado.";
}
// ===== MARCADORES E HISTORIAL =====
// Actualiza jugador, tiempo, clics y récord en pantalla
function pintarMarcadores() {
    const p = estado.partida;
    $("jugador").textContent = estado.nombre; $("record").textContent = estado.record;
    $("tiempo").textContent = p ? p.restante : DURACION; $("puntos").textContent = p ? p.puntos : 0;
}
// Dibuja la lista con las últimas 5 partidas
function pintarHistorial() {
    $("historial").innerHTML = "";
    estado.historial.forEach((h) => {
        const li = document.createElement("li");
        li.textContent = h.puntos + " clics - nivel " + h.nivel + " - " + h.fecha;
        $("historial").appendChild(li);
    });
}
// ===== JUEGO =====
// Coloca el botón objetivo en un lugar al azar dentro de la arena
function mover() {
    const arena = $("arena"), o = $("objetivo"), t = TAMANOS[estado.nivel];
    o.style.width = o.style.height = t + "px";
    o.style.left = Math.random() * (arena.clientWidth - t) + "px"; o.style.top = Math.random() * (arena.clientHeight - t) + "px";
}
// Empieza una partida nueva o continúa la que estaba en pausa
function iniciar() {
    if (reloj) return; // evita iniciar dos relojes a la vez
    if (!estado.partida) estado.partida = { puntos: 0, restante: DURACION };
    $("mensaje").textContent = "";
    $("objetivo").classList.remove("oculto"); $("btn-iniciar").classList.add("oculto");
    $("btn-pausa").classList.remove("oculto");
    mover(); pintarMarcadores(); guardar();
    reloj = setInterval(tick, 1000); // ejecuta tick() cada segundo
}
// Resta un segundo y termina la partida cuando llega a cero
function tick() {
    estado.partida.restante--; guardar(); pintarMarcadores();
    if (estado.partida.restante <= 0) terminar();
}
// Cada clic acertado suma un punto y mueve el botón
function acertar() { estado.partida.puntos++; guardar(); pintarMarcadores(); mover(); }
// Detiene el tiempo y guarda la partida para continuar después
function pausar() { clearInterval(reloj); reloj = null; guardar(); prepararJuego(); }
// Termina la partida: calcula récord, guarda en el historial y muestra el resultado
function terminar() {
    clearInterval(reloj); reloj = null;
    const puntos = estado.partida.puntos, nuevoRecord = puntos > estado.record;
    if (nuevoRecord) estado.record = puntos;
    estado.historial.unshift({ puntos: puntos, nivel: estado.nivel, fecha: new Date().toLocaleDateString("es-CO") });
    estado.historial = estado.historial.slice(0, 5);
    estado.partida = null; guardar(); prepararJuego();
    $("btn-iniciar").textContent = "Jugar otra vez";
    $("mensaje").textContent = "¡Tiempo! Hiciste " + puntos + " clics." + (nuevoRecord ? " ¡Nuevo récord!" : "");
}
// ===== OTRAS ACCIONES =====
// Vuelve a la pantalla del nombre y descarta la partida en curso
function salir() {
    clearInterval(reloj); reloj = null;
    estado.partida = null; estado.nombre = ""; guardar();
    $("campo-nombre").value = ""; mostrar(false);
}
// Borra el récord y el historial
function borrar() { estado.record = 0; estado.historial = []; guardar(); pintarMarcadores(); pintarHistorial(); }
// ===== EVENTOS =====
$("btn-comenzar").addEventListener("click", entrar);
$("btn-iniciar").addEventListener("click", iniciar);
$("btn-pausa").addEventListener("click", pausar);
$("btn-salir").addEventListener("click", salir);
$("btn-borrar").addEventListener("click", borrar);
$("objetivo").addEventListener("click", acertar);
// Permite entrar con la tecla Enter en el campo de nombre
$("campo-nombre").addEventListener("keydown", (e) => e.key === "Enter" && entrar());
// ===== ARRANQUE =====
// Al cargar la página se recupera lo guardado y se muestra la pantalla correcta
cargar();
$("campo-nombre").value = estado.nombre;
$("campo-nivel").value = estado.nivel;
if (estado.nombre) prepararJuego(); else mostrar(false);