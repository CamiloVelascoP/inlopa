// Importar configuración
import CONFIG from './config.js';

// Verificar sesión activa
if (!sessionStorage.getItem('sesionActiva')) {
    window.location.replace('index.html');
}

// Inicializar la API de Google Sheets
function initClient() {
    console.log('Inicializando cliente de Google Sheets...');
    gapi.client.init({
        apiKey: CONFIG.SHEETS_API_KEY,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(function() {
        console.log('API de Google Sheets inicializada');
        cargarMensajeBienvenida();
        cargarMensajeMB();
    }).catch(function(error) {
        console.error('Error al inicializar la API:', error);
    });
}

// Cargar la API de Google Sheets
gapi.load('client', initClient);

// Función para cargar el mensaje de bienvenida
async function cargarMensajeBienvenida() {
    try {
        console.log('Cargando mensaje de bienvenida...');
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SHEETS_ID,
            range: 'Mensaje Bienvenida!A:A'
        });

        const values = response.result.values;
        if (values && values.length > 0) {
            const mensajeBienvenida = document.getElementById('mensaje-bienvenida');
            mensajeBienvenida.innerHTML = values[0][0]; // Tomar el primer mensaje de la columna A
            console.log('Mensaje de bienvenida cargado:', values[0][0]);
        }
    } catch (error) {
        console.error('Error al cargar el mensaje de bienvenida:', error);
    }
}

// Función para cargar el mensaje desde la hoja MB
async function cargarMensajeMB() {
    try {
        console.log('Cargando mensaje desde la hoja MB...');
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SHEETS_ID,
            range: 'MB!A:A'
        });

        const values = response.result.values;
        if (values && values.length > 0) {
            const mensajeMB = document.getElementById('mensaje-bienvenida');
            mensajeMB.innerHTML += '<br>' + values[0][0]; // Agregar el texto de MB debajo del mensaje de bienvenida
            console.log('Mensaje de MB cargado:', values[0][0]);
        }
    } catch (error) {
        console.error('Error al cargar el mensaje de MB:', error);
    }
}

// Mostrar nombre del usuario y manejar navegación
document.addEventListener('DOMContentLoaded', async function() {
    // Mostrar nombre del usuario
    const nombreUsuario = sessionStorage.getItem('nombreUsuario');
    if (nombreUsuario) {
        document.getElementById('nombreUsuario').textContent = nombreUsuario;
    }

    // Mostrar la sección de bienvenida por defecto
    mostrarSeccion('bienvenida');

    // Manejar navegación del menú
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            mostrarSeccion(targetId);
        });
    });
});

// Función para mostrar sección
function mostrarSeccion(seccionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(seccion => {
        seccion.style.display = 'none';
    });
    
    // Mostrar la sección seleccionada
    const seccionSeleccionada = document.getElementById(seccionId);
    if (seccionSeleccionada) {
        seccionSeleccionada.style.display = 'block';
        
        // Animar el título de la sección
        const tituloSeccion = seccionSeleccionada.querySelector('h2');
        if (tituloSeccion) {
            tituloSeccion.classList.add('titulo-seccion');
            tituloSeccion.style.opacity = '0';
            tituloSeccion.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                tituloSeccion.style.opacity = '1';
                tituloSeccion.style.transform = 'translateY(0)';
            }, 300);
        }

        // Inicializar chatbot si se muestra su sección
        if (seccionId === 'chatbot' && typeof window.initChatbot === 'function') {
            try {
                window.initChatbot();
            } catch (error) {
                console.error('Error al inicializar el chatbot:', error);
            }
        }
    }
}

// Función para cerrar sesión
function cerrarSesion(event) {
    event.preventDefault();
    sessionStorage.clear();
    localStorage.clear();
    window.location.replace('index.html');
}

// Prevenir navegación hacia atrás
window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
    window.history.pushState(null, null, window.location.href);
};

// Hacer funciones disponibles globalmente
window.mostrarSeccion = mostrarSeccion;
window.cerrarSesion = cerrarSesion; 