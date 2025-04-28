// Importar configuración
import CONFIG from './config.js';

// Inicializar la API de Google Sheets
function initClient() {
    gapi.client.init({
        apiKey: CONFIG.SHEETS_API_KEY,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(function() {
        console.log('API de Google Sheets inicializada');
        cargarFormularios();
    }).catch(function(error) {
        console.error('Error al inicializar la API:', error);
        mostrarError('Error al conectar con el servidor. Por favor, intenta más tarde.');
    });
}

// Cargar la API de Google Sheets
gapi.load('client', initClient);

// Función para cargar formularios desde Google Sheets
async function cargarFormularios() {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SHEETS_ID,
            range: 'Forms!A:B', // Columna A: nombre, Columna B: link
        });

        const values = response.result.values;
        if (!values || values.length === 0) {
            mostrarError('No se encontraron formularios disponibles.');
            return;
        }

        // Crear tabla de formularios
        const formulariosLista = document.getElementById('formularios-lista');
        if (!formulariosLista) {
            console.error('No se encontró el contenedor de formularios');
            return;
        }

        formulariosLista.innerHTML = `
            <table class="forms-table">
                <thead>
                    <tr>
                        <th>Nombre del Formulario</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    ${values.map(row => {
                        const [nombre, link] = row;
                        return `
                            <tr>
                                <td>${nombre}</td>
                                <td><a href="${link}" target="_blank">Abrir formulario</a></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error al cargar formularios:', error);
        mostrarError('Error al cargar los formularios. Por favor, intenta más tarde.');
    }
}

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    const formulariosLista = document.getElementById('formularios-lista');
    if (formulariosLista) {
        formulariosLista.innerHTML = `
            <div class="error-mensaje">
                <i class="fas fa-exclamation-circle"></i>
                <p>${mensaje}</p>
            </div>
        `;
    }
} 