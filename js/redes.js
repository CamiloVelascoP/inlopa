// Importar configuración
import CONFIG from './config.js';

// Inicializar la API de Google Drive
function initClient() {
    gapi.client.init({
        apiKey: CONFIG.DRIVE_API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    }).then(function() {
        console.log('API de Google Drive inicializada');
        cargarRedes();
    }).catch(function(error) {
        console.error('Error al inicializar la API:', error);
        mostrarError('Error al conectar con el servidor. Por favor, intenta más tarde.');
    });
}

// Cargar la API de Google Drive
gapi.load('client', initClient);

// Configuración de redes sociales
const REDES = {
    // Para agregar nuevas redes, copia y pega este bloque:
    /*
    'nombre-red': {
        nombre: 'Nombre de la Red',
        url: 'https://url-de-la-red.com',
        imagen: 'ID_DE_LA_IMAGEN_EN_DRIVE'
    },
    */
};

// Función para cargar imágenes desde Google Drive
async function cargarRedes() {
    try {
        console.log('Iniciando carga de redes sociales...');
        console.log('ID de la carpeta:', CONFIG.REDES_FOLDER_ID);

        if (!CONFIG.REDES_FOLDER_ID) {
            throw new Error('ID de carpeta no configurado');
        }

        const response = await gapi.client.drive.files.list({
            q: `'${CONFIG.REDES_FOLDER_ID}' in parents and mimeType contains 'image/'`,
            fields: 'files(id, name, thumbnailLink)',
            orderBy: 'name',
            pageSize: 100,
            spaces: 'drive'
        });

        console.log('Respuesta de la API:', response);

        const files = response.result.files;
        if (!files || files.length === 0) {
            console.log('No se encontraron archivos en la carpeta');
            mostrarError('No se encontraron imágenes de redes sociales.');
            return;
        }

        console.log('Archivos encontrados:', files);

        // Crear grid de redes
        const redesContainer = document.getElementById('redes-container');
        if (!redesContainer) {
            throw new Error('Contenedor de redes no encontrado');
        }

        redesContainer.innerHTML = `
            <div class="redes-grid">
                ${files.map(file => `
                    <div class="red-item">
                        <img src="${file.thumbnailLink}" alt="${file.name}" class="red-image" loading="lazy">
                    </div>
                `).join('')}
            </div>
        `;

        // Agregar manejadores de eventos para las imágenes
        const images = redesContainer.querySelectorAll('.red-image');
        images.forEach(img => {
            img.onerror = function() {
                console.error('Error al cargar la imagen:', this.src);
                this.src = 'https://via.placeholder.com/300x200?text=Error+al+cargar+imagen';
            };
        });

    } catch (error) {
        console.error('Error detallado al cargar redes:', error);
        let mensajeError = 'Error al cargar las redes sociales. ';
        
        if (error.message.includes('ID de carpeta no configurado')) {
            mensajeError += 'Por favor, verifica la configuración.';
        } else if (error.message.includes('Contenedor de redes no encontrado')) {
            mensajeError += 'Error en la estructura de la página.';
        } else {
            mensajeError += 'Por favor, intenta más tarde.';
        }
        
        mostrarError(mensajeError);
    }
}

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    const redesContainer = document.getElementById('redes-container');
    if (redesContainer) {
        redesContainer.innerHTML = `
            <div class="error-mensaje">
                <i class="fas fa-exclamation-circle"></i>
                <p>${mensaje}</p>
            </div>
        `;
    }
} 