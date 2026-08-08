/*
=========================================
 CONECTA CORE
 Versión: 0.9.1 Stable
 Archivo: core.js

 Función:
 Administrar la sesión de todos los módulos
 (Pasajero, Conductor y Tablet)

=========================================
*/

const Conecta = {

    version: "0.9.1 Stable",

    currentUser: null,

    currentModule: null,

    iniciarSesion(usuario, modulo){

        this.currentUser = usuario;
        this.currentModule = modulo;

        localStorage.setItem(
            "conectaSession",
            JSON.stringify(usuario)
        );

        localStorage.setItem(
            "conectaModule",
            modulo
        );

        console.log("✅ Sesión iniciada", usuario);

    },

    cerrarSesion(){

        this.currentUser = null;
        this.currentModule = null;

        localStorage.removeItem("conectaSession");
        localStorage.removeItem("conectaModule");

        console.log("🚪 Sesión cerrada");

    },

    cargarSesion(){

        const datos =
            localStorage.getItem("conectaSession");

        const modulo =
            localStorage.getItem("conectaModule");

        if(datos){

            this.currentUser = JSON.parse(datos);
            this.currentModule = modulo;

            console.log("✅ Sesión recuperada");

            return true;

        }

        return false;

    },

    estaLogueado(){

        return this.currentUser != null;

    },

    obtenerUsuario(){

        return this.currentUser;

    },

    obtenerModulo(){

        return this.currentModule;

    }

};

window.Conecta = Conecta;
