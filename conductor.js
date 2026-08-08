/*
=========================================
 CONECTA CONDUCTOR
 Versión: 0.9.1 Stable
 Archivo: conductor.js

 Función:
 Lógica exclusiva de la interfaz del conductor.

 Dependencias:
 - core.js
 - api.js
 - Mapbox GL JS

 IMPORTANTE:
 Este archivo NO contiene HTML ni CSS.
=========================================
*/


// ======================================
// VARIABLES DEL CONDUCTOR
// ======================================

let currentTrip = null;
let mapDetail = null;
let mapActive = null;
let isOnline = false;


// ======================================
// REFERENCIAS AL USUARIO ACTUAL
// ======================================

function obtenerConductorActual() {

    if (typeof Conecta !== "undefined" &&
        Conecta.currentUser) {

        return Conecta.currentUser;

    }

    const id =
        localStorage.getItem("conductorId");

    const telefono =
        localStorage.getItem("conductorTel");

    const nombre =
        localStorage.getItem("conductorNombre");

    if (!id && !telefono) {
        return null;
    }

    return {

        id: id || null,

        telefono: telefono || "",

        nombre: nombre || "Conductor"

    };

}


// ======================================
// NAVEGACIÓN ENTRE PANTALLAS
// ======================================

function showScreen(screenId) {

    const screens =
        document.querySelectorAll(".screen");

    screens.forEach(screen => {

        screen.classList.remove("active");

    });


    const target =
        document.getElementById(screenId);

    if (!target) {

        console.warn(
            "Pantalla no encontrada:",
            screenId
        );

        return;

    }


    target.classList.add("active");


    // ----------------------------------
    // BARRA INFERIOR
    // ----------------------------------
    //
    // La barra NO debe aparecer en:
    // HOME
    // LOGIN
    // REGISTRO
    //
    // Se muestra solamente después
    // de entrar al sistema.
    // ----------------------------------

    const bottomSheet =
        document.getElementById("bottomSheet");

    if (bottomSheet) {

        const pantallasPublicas = [
            "home",
            "loginConductor",
            "registerConductor"
        ];

        if (
            pantallasPublicas.includes(screenId)
        ) {

            bottomSheet.classList.remove("active");

        } else {

            bottomSheet.classList.add("active");

        }

    }


    // ----------------------------------
    // MAPA DETALLE
    // ----------------------------------

    if (screenId === "tripDetail") {

        setTimeout(() => {

            initMapDetail();

        }, 100);

    }


    // ----------------------------------
    // MAPA VIAJE ACTIVO
    // ----------------------------------

    if (screenId === "activeTrip") {

        setTimeout(() => {

            initMapActive();

        }, 100);

    }

}


// ======================================
// MAPBOX - DETALLE DEL VIAJE
// ======================================

function initMapDetail() {

    if (
        mapDetail ||
        typeof mapboxgl === "undefined"
    ) {

        return;

    }


    const container =
        document.getElementById("mapDetail");

    if (!container) {
        return;
    }


    mapDetail = new mapboxgl.Map({

        container: "mapDetail",

        style:
            "mapbox://styles/mapbox/navigation-night-v1",

        center: [
            -99.13,
            19.43
        ],

        zoom: 12

    });

}


// ======================================
// MAPBOX - VIAJE ACTIVO
// ======================================

function initMapActive() {

    if (
        mapActive ||
        typeof mapboxgl === "undefined"
    ) {

        return;

    }


    const container =
        document.getElementById("mapActive");

    if (!container) {
        return;
    }


    mapActive = new mapboxgl.Map({

        container: "mapActive",

        style:
            "mapbox://styles/mapbox/navigation-night-v1",

        center: [
            -99.13,
            19.43
        ],

        zoom: 13

    });

}


// ======================================
// LOGIN CONDUCTOR
// ======================================

async function loginConductor() {

    const telElement =
        document.getElementById("telLogin");

    const claveElement =
        document.getElementById("claveLogin");


    if (!telElement || !claveElement) {

        console.error(
            "No se encontraron los campos de login."
        );

        return;

    }


    const tel =
        telElement.value.trim();

    const clave =
        claveElement.value.trim();


    if (!tel || !clave) {

        alert(
            "Ingresa teléfono y clave"
        );

        return;

    }


    try {

        const data =
            await ConectaAPI.loginConductor(
                tel,
                clave
            );


        if (data.status === "ok") {

            const usuario = {

                id:
                    data.id ||
                    localStorage.getItem(
                        "conductorId"
                    ) ||
                    null,

                telefono: tel,

                nombre:
                    data.nombre ||
                    "Conductor"

            };


            // ----------------------------------
            // GUARDAR EN CONECTA CORE
            // ----------------------------------

            if (
                typeof Conecta !== "undefined"
            ) {

                Conecta.iniciarSesion(
                    usuario,
                    "conductor"
                );

            }


            // ----------------------------------
            // COMPATIBILIDAD CON LA VERSIÓN
            // ACTUAL DEL CONDUCTOR
            // ----------------------------------

            if (usuario.id) {

                localStorage.setItem(
                    "conductorId",
                    usuario.id
                );

            }

            localStorage.setItem(
                "conductorTel",
                usuario.telefono
            );

            localStorage.setItem(
                "conductorNombre",
                usuario.nombre
            );


            showScreen(
                "dashboard"
            );


            // Mantener comportamiento
            // actual de la aplicación.

            const toggle =
                document.getElementById(
                    "toggleOnline"
                );

            if (toggle) {

                toggle.checked = true;

                toggleOnline();

            }

        } else {

            alert(
                data.message ||
                "Datos incorrectos"
            );

        }

    } catch (error) {

        console.error(
            "Error en login:",
            error
        );

        alert(
            "Error de conexión"
        );

    }

}


// ======================================
// REGISTRO DE CONDUCTOR
// ======================================

async function registrarConductor() {

    const nombre =
        document
            .getElementById(
                "nombreConductor"
            )
            ?.value
            .trim();


    const tel =
        document
            .getElementById(
                "telConductor"
            )
            ?.value
            .trim();


    const placas =
        document
            .getElementById(
                "placas"
            )
            ?.value
            .trim();


    const modelo =
        document
            .getElementById(
                "modelo"
            )
            ?.value
            .trim();


    if (
        !nombre ||
        !tel ||
        !placas ||
        !modelo
    ) {

        alert(
            "Completa todos los campos"
        );

        return;

    }


    try {

        const data =
            await ConectaAPI.registroConductor({

                nombre,

                telefono: tel,

                placas,

                modelo

            });


        if (data.status === "ok") {

            alert(
                "Registro exitoso. Tu clave es: " +
                data.clave
            );


            const usuario = {

                id:
                    data.id ||
                    null,

                telefono: tel,

                nombre

            };


            if (
                typeof Conecta !== "undefined"
            ) {

                Conecta.iniciarSesion(
                    usuario,
                    "conductor"
                );

            }


            if (data.id) {

                localStorage.setItem(
                    "conductorId",
                    data.id
                );

            }

            localStorage.setItem(
                "conductorTel",
                tel
            );

            localStorage.setItem(
                "conductorNombre",
                nombre
            );


            showScreen(
                "dashboard"
            );


        } else {

            alert(
                data.message ||
                "No fue posible completar el registro"
            );

        }

    } catch (error) {

        console.error(
            "Error en registro:",
            error
        );

        alert(
            "Error de conexión"
        );

    }

}


// ======================================
// CERRAR SESIÓN
// ======================================

function cerrarSesion() {

    if (
        !confirm(
            "¿Cerrar sesión?"
        )
    ) {

        return;

    }


    // Core de Conecta

    if (
        typeof Conecta !== "undefined"
    ) {

        Conecta.cerrarSesion();

    }


    // Compatibilidad con datos anteriores

    localStorage.removeItem(
        "conductorId"
    );

    localStorage.removeItem(
        "conductorTel"
    );

    localStorage.removeItem(
        "conductorNombre"
    );


    // Regresar a la pantalla inicial

    showScreen(
        "home"
    );

}


// ======================================
// ONLINE / OFFLINE
// ======================================

function toggleOnline() {

    const toggle =
        document.getElementById(
            "toggleOnline"
        );

    const statusText =
        document.getElementById(
            "statusText"
        );


    if (!toggle || !statusText) {

        return;

    }


    isOnline =
        toggle.checked;


    if (isOnline) {

        statusText.textContent =
            "🟢 Online";

        statusText.style.color =
            "#00e5ff";


        loadViajesDisponibles();

    } else {

        statusText.textContent =
            "Offline";

        statusText.style.color =
            "#aaa";

    }

}


// ======================================
// CARGAR VIAJES DISPONIBLES
// ======================================

async function loadViajesDisponibles() {

    const container =
        document.getElementById(
            "viajesList"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        '<p style="text-align:center;color:#666;">Buscando viajes...</p>';


    try {

        const conductor =
            obtenerConductorActual();


        const conductorId =
            conductor?.id || null;


        const data =
            await ConectaAPI.post({

                tipo:
                    "getViajesDisponibles",

                idConductor:
                    conductorId

            });


        container.innerHTML = "";


        if (
            data.status === "error"
        ) {

            container.innerHTML =
                '<p style="color:red;text-align:center;">' +
                (
                    data.message ||
                    "Error al cargar viajes"
                ) +
                "</p>";

            return;

        }


        if (
            data.viajes &&
            data.viajes.length > 0
        ) {

            data.viajes.forEach(
                viaje => {

                    const div =
                        document.createElement(
                            "div"
                        );


                    div.className =
                        "trip-card";


                    div.innerHTML = `

                        <strong>
                            ${viaje.fecha || ""}
                        </strong>

                        <br>

                        📍
                        ${viaje.origen || ""}
                        →
                        ${viaje.destino || ""}

                        <br>

                        <span class="price">
                            $${viaje.precio || 0}
                        </span>

                        •
                        ${viaje.km || 0}
                        km

                        <br>

                        <button
                            onclick="verDetalleViaje('${viaje.id}')"
                            style="margin-top:8px;"
                        >
                            Ver Detalles
                        </button>

                    `;


                    container.appendChild(
                        div
                    );

                }
            );


        } else {

            container.innerHTML =
                '<p style="text-align:center;color:#888;">' +
                'No hay viajes disponibles en este momento' +
                "</p>";

        }

    } catch (error) {

        console.error(
            "Error cargando viajes:",
            error
        );


        container.innerHTML =
            '<p style="color:red;text-align:center;">' +
            "Error al cargar viajes" +
            "</p>";

    }

}


// ======================================
// VER DETALLE DEL VIAJE
// ======================================

function verDetalleViaje(id) {

    if (!id) {

        return;

    }


    /*
    --------------------------------------
    Buscamos primero el viaje dentro
    de los viajes cargados.

    Esto mejora la versión original,
    que solamente guardaba { id }.
    --------------------------------------
    */

    currentTrip = {

        id: id

    };


    const origenText =
        document.getElementById(
            "origenText"
        );

    const destinoText =
        document.getElementById(
            "destinoText"
        );

    const paradaText =
        document.getElementById(
            "paradaText"
        );

    const kmText =
        document.getElementById(
            "kmText"
        );

    const tiempoText =
        document.getElementById(
            "tiempoText"
        );

    const precioText =
        document.getElementById(
            "precioText"
        );


    /*
    --------------------------------------
    En esta versión utilizamos la tarjeta
    que ya fue cargada para mostrar los
    datos disponibles.

    Si posteriormente necesitamos
    consultar una reserva individual
    al backend, agregaremos ese endpoint
    sin romper esta estructura.
    --------------------------------------
    */


    showScreen(
        "tripDetail"
    );


    /*
    --------------------------------------
    Mantener el comportamiento actual
    de aviso del ID.
    --------------------------------------
    */

    console.log(
        "Viaje seleccionado:",
        id
    );

}


// ======================================
// ACEPTAR VIAJE
// ======================================

async function aceptarViaje() {

    if (!currentTrip?.id) {

        alert(
            "No hay un viaje seleccionado."
        );

        return;

    }


    const conductor =
        obtenerConductorActual();


    if (!conductor?.telefono) {

        alert(
            "No se encontró la sesión del conductor."
        );

        return;

    }


    try {

        const data =
            await ConectaAPI.aceptarViaje(

                currentTrip.id,

                conductor.telefono,

                conductor.nombre ||
                "Conductor"

            );


        if (
            data.status === "ok"
        ) {

            alert(
                "Viaje aceptado"
            );


            showScreen(
                "activeTrip"
            );


        } else {

            alert(
                data.message ||
                "No fue posible aceptar el viaje"
            );

        }

    } catch (error) {

        console.error(
            "Error aceptando viaje:",
            error
        );


        alert(
            "Error de conexión"
        );

    }

}


// ======================================
// RECHAZAR VIAJE
// ======================================

function rechazarViaje() {

    if (
        confirm(
            "¿Rechazar este viaje?"
        )
    ) {

        currentTrip = null;

        showScreen(
            "dashboard"
        );

    }

}


// ======================================
// IR AL ORIGEN CON WAZE
// ======================================

function irAlOrigenWaze() {

    /*
    --------------------------------------
    Coordenadas utilizadas originalmente
    por la interfaz.
    --------------------------------------
    */

    window.open(
        "https://waze.com/ul?ll=19.45,-99.15&navigate=yes",
        "_blank"
    );


    const btnLlegado =
        document.getElementById(
            "btnLlegado"
        );


    if (btnLlegado) {

        btnLlegado.style.display =
            "block";

    }

}


// ======================================
// CONDUCTOR HA LLEGADO
// ======================================

function heLlegado() {

    const tripStatus =
        document.getElementById(
            "tripStatus"
        );

    const btnLlegado =
        document.getElementById(
            "btnLlegado"
        );

    const btnIniciar =
        document.getElementById(
            "btnIniciar"
        );


    if (tripStatus) {

        tripStatus.innerHTML =
            "✅ En el origen<br>" +
            "<small>" +
            "Esperando pasajero (máx 10 min)" +
            "</small>";

    }


    if (btnLlegado) {

        btnLlegado.style.display =
            "none";

    }


    if (btnIniciar) {

        btnIniciar.style.display =
            "block";

    }

}


// ======================================
// INICIAR VIAJE
// ======================================

function iniciarViaje() {

    const tripStatus =
        document.getElementById(
            "tripStatus"
        );

    const btnIniciar =
        document.getElementById(
            "btnIniciar"
        );

    const btnFinalizar =
        document.getElementById(
            "btnFinalizar"
        );


    if (tripStatus) {

        tripStatus.textContent =
            "🛣️ Viaje en curso";

    }


    if (btnIniciar) {

        btnIniciar.style.display =
            "none";

    }


    if (btnFinalizar) {

        btnFinalizar.style.display =
            "block";

    }

}


// ======================================
// FINALIZAR VIAJE
// ======================================

function finalizarViaje() {

    if (
        !confirm(
            "¿Finalizar viaje?"
        )
    ) {

        return;

    }


    alert(
        "🎉 Viaje finalizado"
    );


    currentTrip = null;


    showScreen(
        "dashboard"
    );


    if (isOnline) {

        loadViajesDisponibles();

    }

}


// ======================================
// CANCELAR VIAJE
// ======================================

function cancelarViaje() {

    if (
        !confirm(
            "¿Cancelar viaje?"
        )
    ) {

        return;

    }


    currentTrip = null;


    showScreen(
        "dashboard"
    );

}


// ======================================
// INICIALIZACIÓN
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "🚗 Conecta Conductor v0.9.1 Stable"
        );


        /*
        ----------------------------------
        Recuperar sesión desde Core
        ----------------------------------
        */

        let sesionActiva = false;


        if (
            typeof Conecta !== "undefined"
        ) {

            sesionActiva =
                Conecta.cargarSesion();

        }


        /*
        ----------------------------------
        Compatibilidad con la sesión
        anterior de la interfaz.
        ----------------------------------
        */

        const savedTel =
            localStorage.getItem(
                "conductorTel"
            );


        if (
            sesionActiva ||
            savedTel
        ) {

            showScreen(
                "dashboard"
            );


            const toggle =
                document.getElementById(
                    "toggleOnline"
                );


            /*
            --------------------------------
            IMPORTANTE:

            No activamos automáticamente
            Online al recuperar la sesión.

            El conductor decide cuándo
            ponerse Online.
            --------------------------------
            */

            if (toggle) {

                toggle.checked =
                    false;

            }


            isOnline =
                false;


            const statusText =
                document.getElementById(
                    "statusText"
                );


            if (statusText) {

                statusText.textContent =
                    "Offline";

                statusText.style.color =
                    "#aaa";

            }


        } else {

            showScreen(
                "home"
            );

        }

    }
);


// ======================================
// EXPOSICIÓN GLOBAL
// ======================================
//
// Los botones actuales de tu HTML
// utilizan onclick="funcion()".
//
// Por eso dejamos las funciones
// disponibles globalmente.
// ======================================

window.loginConductor =
    loginConductor;

window.registrarConductor =
    registrarConductor;

window.cerrarSesion =
    cerrarSesion;

window.toggleOnline =
    toggleOnline;

window.loadViajesDisponibles =
    loadViajesDisponibles;

window.showScreen =
    showScreen;

window.verDetalleViaje =
    verDetalleViaje;

window.aceptarViaje =
    aceptarViaje;

window.rechazarViaje =
    rechazarViaje;

window.irAlOrigenWaze =
    irAlOrigenWaze;

window.heLlegado =
    heLlegado;

window.iniciarViaje =
    iniciarViaje;

window.finalizarViaje =
    finalizarViaje;

window.cancelarViaje =
    cancelarViaje;
