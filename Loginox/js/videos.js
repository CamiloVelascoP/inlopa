// Importar configuración
import CONFIG from './config.js';

// Inicializar la API de Google Drive
function initClient() {
    console.log('Iniciando cliente de Google Drive...');
    console.log('API Key:', CONFIG.DRIVE_API_KEY);
    
    gapi.load('client', function() {
        console.log('Cliente GAPI cargado');
        gapi.client.init({
            apiKey: CONFIG.DRIVE_API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        }).then(function() {
            console.log('API de Google Drive inicializada correctamente');
            cargarVideos();
        }).catch(function(error) {
            console.error('Error detallado al inicializar la API:', error);
            mostrarError('Error al conectar con el servidor. Por favor, verifica que la API key es correcta y la API está habilitada.');
        });
    });
}

// Iniciar la carga de la API
initClient();

// Configuración de categorías
const CATEGORIAS = {
    EDUCATIVOS: {
        id: CONFIG.VIDEOS_FOLDER_ID,
        subcarpeta: 'Cat 1',
        nombre: 'Educativos',
        icono: 'fas fa-graduation-cap'
    },
    ENTRETENIMIENTO: {
        id: CONFIG.VIDEOS_FOLDER_ID,
        subcarpeta: 'Cat 2',
        nombre: 'Entretenimiento',
        icono: 'fas fa-film'
    },
    TUTORIALES: {
        id: CONFIG.VIDEOS_FOLDER_ID,
        subcarpeta: 'Cat 3',
        nombre: 'Tutoriales',
        icono: 'fas fa-chalkboard-teacher'
    }
    // Para agregar una nueva categoría, copia y pega este bloque y modifica los valores:
    /*
    NUEVA_CATEGORIA: {
        id: 'ID_DE_LA_CARPETA_EN_DRIVE',
        nombre: 'Nombre de la Categoría',
        icono: 'fas fa-icono'
    },
    */
};

// Función para obtener el ID de la subcarpeta
async function obtenerSubcarpetaId(categoria) {
    try {
        console.log('Buscando subcarpeta:', categoria.subcarpeta);
        console.log('En la carpeta con ID:', categoria.id);
        
        const query = `'${categoria.id}' in parents and name = '${categoria.subcarpeta}' and mimeType = 'application/vnd.google-apps.folder'`;
        console.log('Query para buscar subcarpeta:', query);

        const response = await gapi.client.drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive'
        });

        console.log('Respuesta de búsqueda de subcarpeta:', response);

        if (response.result.files && response.result.files.length > 0) {
            console.log('Subcarpeta encontrada:', response.result.files[0]);
            return response.result.files[0].id;
        } else {
            console.log('No se encontró la subcarpeta');
            throw new Error(`No se encontró la subcarpeta ${categoria.subcarpeta}`);
        }
    } catch (error) {
        console.error('Error al obtener ID de subcarpeta:', error);
        throw error;
    }
}

// Función para cargar videos desde Google Drive
async function cargarVideos() {
    try {
        const videosContainer = document.getElementById('videos-grid');
        if (!videosContainer) {
            console.error('No se encontró el contenedor de videos');
            return;
        }

        videosContainer.innerHTML = ''; // Limpiar contenedor

        // Crear título de sección
        const tituloSeccion = document.createElement('h2');
        tituloSeccion.id = 'titulo-categoria';
        tituloSeccion.className = 'titulo-seccion';
        tituloSeccion.textContent = 'Videos Educativos';
        videosContainer.appendChild(tituloSeccion);

        // Crear botones de categorías
        const categoriasContainer = document.createElement('div');
        categoriasContainer.className = 'video-categorias';
        Object.values(CATEGORIAS).forEach(categoria => {
            const button = document.createElement('button');
            button.innerHTML = `<i class="${categoria.icono}"></i> ${categoria.nombre}`;
            button.onclick = () => cargarVideosCategoria(categoria);
            categoriasContainer.appendChild(button);
        });
        videosContainer.appendChild(categoriasContainer);

        // Crear contenedor de grid
        const gridContainer = document.createElement('div');
        gridContainer.className = 'videos-grid';
        videosContainer.appendChild(gridContainer);

        // Cargar videos de la primera categoría por defecto
        await cargarVideosCategoria(Object.values(CATEGORIAS)[0]);

    } catch (error) {
        console.error('Error al cargar videos:', error);
        mostrarError('Error al cargar los videos. Por favor, verifica que las carpetas existen y contienen videos.');
    }
}

// Función para cargar videos de una categoría específica
async function cargarVideosCategoria(categoria) {
    try {
        console.log('Cargando videos de la categoría:', categoria.nombre);
        console.log('ID de la carpeta principal:', categoria.id);
        console.log('Subcarpeta:', categoria.subcarpeta);
        
        // Actualizar título de la categoría con animación
        const tituloSeccion = document.getElementById('titulo-categoria');
        if (tituloSeccion) {
            tituloSeccion.style.opacity = '0';
            tituloSeccion.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                tituloSeccion.textContent = `Videos ${categoria.nombre}`;
                tituloSeccion.style.opacity = '1';
                tituloSeccion.style.transform = 'translateY(0)';
            }, 300);
        }

        // Actualizar estado activo de los botones
        const botones = document.querySelectorAll('.video-categorias button');
        botones.forEach(btn => {
            if (btn.textContent.includes(categoria.nombre)) {
                btn.classList.add('activo');
            } else {
                btn.classList.remove('activo');
            }
        });

        const gridContainer = document.querySelector('.videos-grid');
        if (!gridContainer) {
            console.error('No se encontró el contenedor de grid');
            return;
        }
        
        // Limpiar grid y mensajes de error anteriores
        gridContainer.innerHTML = '';
        
        // Obtener el ID de la subcarpeta
        const subcarpetaId = await obtenerSubcarpetaId(categoria);
        console.log('ID de la subcarpeta:', subcarpetaId);

        const query = `'${subcarpetaId}' in parents and (mimeType contains 'video/')`;
        console.log('Query de búsqueda de videos:', query);

        try {
            const response = await gapi.client.drive.files.list({
                q: query,
                fields: 'files(id, name, thumbnailLink, webViewLink, webContentLink)',
                spaces: 'drive'
            });

            console.log('Respuesta de la API:', response);

            const videos = response.result.files;
            if (!videos || videos.length === 0) {
                console.log('No se encontraron videos en la subcarpeta');
                mostrarError(`No se encontraron videos en la categoría ${categoria.nombre}. Verifica que la subcarpeta ${categoria.subcarpeta} contiene archivos de video.`);
                return;
            }

            console.log('Videos encontrados:', videos.length);
            console.log('Detalles de los videos:', videos);

            // Crear grid de videos
            videos.forEach(video => {
                console.log('Procesando video:', video.name);
                const videoItem = document.createElement('div');
                videoItem.className = 'video-item';
                videoItem.innerHTML = `
                    <div class="video-thumbnail">
                        <img src="${video.thumbnailLink}" alt="${video.name}">
                        <button class="play-button" onclick="reproducirVideo('${video.webViewLink}', '${video.name}')">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                    <div class="video-info">
                        <h3>${video.name}</h3>
                    </div>
                `;
                gridContainer.appendChild(videoItem);
            });

        } catch (apiError) {
            console.error('Error detallado de la API:', apiError);
            mostrarError(`Error al acceder a la API de Google Drive: ${apiError.message}`);
        }

    } catch (error) {
        console.error('Error general al cargar videos:', error);
        mostrarError(`Error al cargar los videos de ${categoria.nombre}: ${error.message}`);
    }
}

// Función para reproducir video en modal
function reproducirVideo(url, nombre) {
    // Convertir la URL de visualización a URL de incrustación
    const embedUrl = url.replace('/view', '/preview');
    
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="video-modal-content">
            <div class="video-modal-header">
                <h3>${nombre}</h3>
                <button class="close-button" onclick="this.closest('.video-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="video-container">
                <iframe 
                    src="${embedUrl}" 
                    width="100%" 
                    height="450" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    const gridContainer = document.querySelector('.videos-grid');
    if (!gridContainer) {
        console.error('No se encontró el contenedor de grid para mostrar el error');
        return;
    }
    
    // Limpiar mensajes de error anteriores
    const erroresAnteriores = gridContainer.querySelectorAll('.error-mensaje');
    erroresAnteriores.forEach(error => error.remove());
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-mensaje';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>${mensaje}</p>
    `;
    gridContainer.appendChild(errorDiv);
}

// Hacer funciones disponibles globalmente
window.cargarVideosCategoria = cargarVideosCategoria;
window.reproducirVideo = reproducirVideo; 