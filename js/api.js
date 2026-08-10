/*
=========================================
 CONECTA API
 Versión: 0.9.1 Stable
 Archivo: api.js

 Función:
 Comunicación con Apps Script
=========================================
*/

const API_URL = "https://script.google.com/macros/s/AKfycbxjszK1c_tq1Ijpxdgyxz7LMWqlmFYKJUQK-3aC-wjqSInqMbEXqGtWyfr0AuzJP-MnCw/exec";

const ConectaAPI = {

    async post(data){

        try{

            const response = await fetch(API_URL,{
                method:"POST",
                body:JSON.stringify(data)
            });

            return await response.json();

        }catch(error){

            console.error("Error API:",error);

            return{
                status:"error",
                message:error.toString()
            };

        }

    },

    // ============================
    // PASAJEROS
    // ============================

    registroPasajero(nombre,telefono){

        return this.post({
            tipo:"registro",
            nombre,
            telefono
        });

    },

    loginPasajero(telefono,clave){

        return this.post({
            tipo:"login",
            telefono,
            clave
        });

    },

    crearReserva(datos){

        return this.post({
            tipo:"reserva",
            ...datos
        });

    },

    // ============================
    // CONDUCTORES
    // ============================

    registroConductor(datos){

        return this.post({
            tipo:"registroConductor",
            ...datos
        });

    },

    loginConductor(telefono,clave){

        return this.post({
            tipo:"loginConductor",
            telefono,
            clave
        });

    },

    obtenerViajes(){

        return this.post({
            tipo:"getViajesDisponibles"
        });

    },

    aceptarViaje(viajeId,conductorTel,conductorNombre){

        return this.post({

            tipo:"aceptarViaje",

            viajeId,

            conductorTel,

            conductorNombre

        });

    }

};

window.ConectaAPI = ConectaAPI;
