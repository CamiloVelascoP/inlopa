// Importar configuración
import CONFIG from './config.js';

// Inicializar la API de Google Docs
function initClient() {
    gapi.client.init({
        apiKey: CONFIG.DOCS_API_KEY,
        discoveryDocs: ['https://docs.googleapis.com/$discovery/rest?version=v1'],
    }).then(function() {
        console.log('API de Google Docs inicializada');
        cargarMensajePersonal();
    }).catch(function(error) {
        console.error('Error al inicializar la API:', error);
        mostrarError('Error al conectar con el servidor. Por favor, intenta más tarde.');
    });
}

// Cargar la API de Google Docs
gapi.load('client', initClient);

// Función para cargar mensaje personal desde Google Docs
async function cargarMensajePersonal() {
    try {
        const response = await gapi.client.docs.documents.get({
            documentId: CONFIG.DOCS_ID
        });

        const document = response.result;
        if (!document || !document.body || !document.body.content) {
            mostrarError('No se encontró el mensaje personal.');
            return;
        }

        // Extraer el contenido del documento
        const contenido = extraerContenido(document.body.content);
        
        // Mostrar el contenido
        const mensajePersonal = document.getElementById('mensaje-personal');
        mensajePersonal.innerHTML = contenido;

    } catch (error) {
        console.error('Error al cargar mensaje personal:', error);
        mostrarError('Error al cargar el mensaje personal. Por favor, intenta más tarde.');
    }
}

// Función para extraer contenido del documento
function extraerContenido(content) {
    let texto = '';
    
    content.forEach(element => {
        if (element.paragraph) {
            element.paragraph.elements.forEach(elem => {
                if (elem.textRun) {
                    texto += elem.textRun.content;
                }
            });
            texto += '<br>';
        }
    });

    return texto;
}

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    const container = document.getElementById('mensaje-personal');
    container.innerHTML = `<div class="error-mensaje">${mensaje}</div>`;
} 