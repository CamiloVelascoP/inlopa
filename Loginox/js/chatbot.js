// Importar configuración
import CONFIG from './config.js';

// Variable global para almacenar las respuestas del chatbot
let chatbotData = [];

// Inicializar el chatbot
async function initChatbot() {
    try {
        console.log('Inicializando chatbot...');
        await cargarRespuestasChatbot();
        configurarEventosChatbot();
        mostrarMensajeBienvenida();
    } catch (error) {
        console.error('Error al inicializar el chatbot:', error);
        mostrarError('No se pudo inicializar el chatbot. Por favor, intenta más tarde.');
    }
}

// Cargar respuestas desde Google Sheets
async function cargarRespuestasChatbot() {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SHEETS_ID,
            range: 'Chatbot!A:B'
        });

        if (response.result.values) {
            chatbotData = response.result.values.map(row => ({
                respuesta: row[0],
                preguntas: row[1] ? row[1].split(',').map(p => p.trim().toLowerCase()) : []
            }));
            console.log('Respuestas del chatbot cargadas:', chatbotData.length);
        }
    } catch (error) {
        console.error('Error al cargar respuestas del chatbot:', error);
        throw error;
    }
}

// Configurar eventos del chatbot
function configurarEventosChatbot() {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    if (!chatForm || !chatInput) {
        console.error('No se encontraron los elementos del formulario del chatbot');
        return;
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mensaje = chatInput.value.trim();
        if (!mensaje) return;

        // Mostrar mensaje del usuario
        agregarMensaje(mensaje, 'user');
        chatInput.value = '';

        // Buscar y mostrar respuesta
        const respuesta = buscarRespuesta(mensaje);
        agregarMensaje(respuesta, 'bot');
    });
}

// Buscar respuesta basada en coincidencias
function buscarRespuesta(mensaje) {
    const mensajeLower = mensaje.toLowerCase().trim();
    
    // Buscar coincidencias en las preguntas
    for (const item of chatbotData) {
        if (item.preguntas.some(pregunta => pregunta === mensajeLower)) {
            return item.respuesta;
        }
    }

    // Respuesta por defecto si no hay coincidencias
    return "Lo siento, no encontré una respuesta específica para tu pregunta. Por favor, intenta reformularla.";
}

// Agregar mensaje al chat
function agregarMensaje(texto, tipo) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) {
        console.error('No se encontró el contenedor de mensajes del chat');
        return;
    }

    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `chat-message ${tipo}-message`;
    mensajeDiv.textContent = texto;
    chatMessages.appendChild(mensajeDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Mostrar mensaje de bienvenida
function mostrarMensajeBienvenida() {
    agregarMensaje('¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?', 'bot');
}

// Mostrar mensaje de error
function mostrarError(mensaje) {
    agregarMensaje(mensaje, 'error');
}

// Hacer funciones disponibles globalmente
window.initChatbot = initChatbot; 