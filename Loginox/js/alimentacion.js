// Importar configuración
import CONFIG from './config.js';

// Inicializar la API de Google Drive
function initClient() {
    gapi.client.init({
        apiKey: CONFIG.DRIVE_API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    }).then(function() {
        console.log('API de Google Drive inicializada');
        cargarImagenes();
    }).catch(function(error) {
        console.error('Error al inicializar la API:', error);
        mostrarError('Error al conectar con el servidor. Por favor, intenta más tarde.');
    });
}

// Cargar la API de Google Drive
gapi.load('client', initClient);

// Variables para el carrusel
let imagenes = [];
let indiceActual = 0;
let intervalo = null;

// Función para cargar imágenes desde Google Drive
async function cargarImagenes() {
    try {
        const response = await gapi.client.drive.files.list({
            q: `'${CONFIG.ALIMENTACION_FOLDER_ID}' in parents and mimeType contains 'image/'`,
            fields: 'files(id, name, webContentLink, thumbnailLink)',
            spaces: 'drive'
        });

        const files = response.result.files;
        if (!files || files.length === 0) {
            mostrarError('No se encontraron imágenes disponibles.');
            return;
        }

        imagenes = files;
        crearCarrusel();

    } catch (error) {
        console.error('Error al cargar imágenes:', error);
        mostrarError('Error al cargar las imágenes. Por favor, intenta más tarde.');
    }
}

// Función para crear el carrusel
function crearCarrusel() {
    const carrusel = document.getElementById('carrusel-imagenes');
    carrusel.innerHTML = `
        <div class="carrusel-container">
            <button class="carrusel-btn prev" onclick="cambiarImagen(-1)">❮</button>
            <div class="carrusel-imagen">
                <img id="imagen-actual" src="" alt="Imagen de alimentación saludable">
            </div>
            <button class="carrusel-btn next" onclick="cambiarImagen(1)">❯</button>
            <div class="carrusel-indicadores">
                ${imagenes.map((_, index) => `
                    <span class="indicador ${index === 0 ? 'activo' : ''}" 
                          onclick="irAImagen(${index})"></span>
                `).join('')}
            </div>
        </div>
    `;

    mostrarImagen(0);
    iniciarAutoplay();
}

// Función para mostrar imagen
function mostrarImagen(index) {
    if (index < 0) index = imagenes.length - 1;
    if (index >= imagenes.length) index = 0;
    
    indiceActual = index;
    const imagen = document.getElementById('imagen-actual');
    imagen.src = imagenes[index].webContentLink;
    
    // Actualizar indicadores
    document.querySelectorAll('.indicador').forEach((ind, i) => {
        ind.classList.toggle('activo', i === index);
    });
}

// Función para cambiar imagen
function cambiarImagen(direccion) {
    mostrarImagen(indiceActual + direccion);
    reiniciarAutoplay();
}

// Función para ir a una imagen específica
function irAImagen(index) {
    mostrarImagen(index);
    reiniciarAutoplay();
}

// Función para iniciar autoplay
function iniciarAutoplay() {
    if (intervalo) clearInterval(intervalo);
    intervalo = setInterval(() => cambiarImagen(1), 5000); // Cambiar cada 5 segundos
}

// Función para reiniciar autoplay
function reiniciarAutoplay() {
    iniciarAutoplay();
}

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    const container = document.getElementById('carrusel-imagenes');
    container.innerHTML = `<div class="error-mensaje">${mensaje}</div>`;
}

// Exportar funciones necesarias
window.cambiarImagen = cambiarImagen;
window.irAImagen = irAImagen; 