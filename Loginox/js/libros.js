// Importar configuración
import CONFIG from './config.js';

// Variable global para almacenar los datos de libros
let librosData = [];

// Inicializar la API de Google Sheets
function initClient() {
    gapi.client.init({
        apiKey: CONFIG.SHEETS_API_KEY,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(function() {
        console.log('API de Google Sheets inicializada');
        cargarLibros();
    }).catch(function(error) {
        console.error('Error al inicializar la API:', error);
        mostrarError('Error al conectar con el servidor. Por favor, intenta más tarde.');
    });
}

// Cargar la API de Google Sheets
gapi.load('client', initClient);

// Función para cargar libros desde Google Sheets
async function cargarLibros() {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SHEETS_ID,
            range: CONFIG.SHEETS.LIBROS,
        });

        const values = response.result.values;
        if (!values || values.length === 0) {
            mostrarError('No se encontraron libros disponibles.');
            return;
        }

        // Almacenar los datos para búsqueda
        librosData = values;

        // Crear contenedor de lista de libros con scroll y buscador
        const librosLista = document.getElementById('libros-lista');
        librosLista.innerHTML = `
            <div class="buscador-container">
                <div class="buscador-input">
                    <i class="fas fa-search"></i>
                    <input type="text" id="buscador-libros" placeholder="Buscar por título..." onkeyup="filtrarLibros()">
                </div>
            </div>
            <div class="libros-scroll-container">
                <div class="libros-list">
                    ${renderizarLibrosLista(values)}
                </div>
            </div>
        `;

        // Mostrar el primer libro por defecto
        if (values.length > 0) {
            abrirLibro(values[0][1], values[0][0]);
        }

    } catch (error) {
        console.error('Error al cargar libros:', error);
        mostrarError('Error al cargar los libros. Por favor, verifica que la hoja de cálculo contiene la información correcta.');
    }
}

// Función para renderizar la lista de libros
function renderizarLibrosLista(datos) {
    if (!datos || !Array.isArray(datos)) {
        console.error('Datos inválidos para renderizar:', datos);
        return '';
    }

    return datos.map((row, index) => {
        if (!row || row.length < 2) {
            console.warn(`La fila ${index} no tiene suficientes elementos:`, row);
            return '';
        }

        const [titulo, link] = row;
        if (!titulo || !link) {
            console.warn(`La fila ${index} tiene elementos vacíos:`, row);
            return '';
        }

        const tituloEscapado = titulo.replace(/"/g, '&quot;');
        const linkEscapado = link.replace(/"/g, '&quot;');

        return `
            <div class="libro-item" onclick="abrirLibro('${linkEscapado}', '${tituloEscapado}')">
                <i class="fas fa-book"></i>
                <span>${tituloEscapado}</span>
            </div>
        `;
    }).join('');
}

// Función para filtrar libros
function filtrarLibros() {
    const terminoBusqueda = document.getElementById('buscador-libros').value.toLowerCase();
    console.log(`Filtrando libros con término: ${terminoBusqueda}`);
    
    const librosList = document.querySelector('.libros-list');
    if (!librosList) {
        console.error('No se encontró el contenedor de lista de libros');
        return;
    }
    
    // Filtrar los datos
    const datosFiltrados = librosData.filter(row => {
        const titulo = row[0] ? row[0].toLowerCase() : '';
        
        // Dividir el término de búsqueda en palabras individuales
        const palabrasBusqueda = terminoBusqueda.split(/\s+/).filter(palabra => palabra.length > 0);
        
        // Si no hay palabras de búsqueda, mostrar todos los resultados
        if (palabrasBusqueda.length === 0) {
            return true;
        }
        
        // Verificar si todas las palabras de búsqueda están en el título
        return palabrasBusqueda.every(palabra => titulo.includes(palabra));
    });
    
    console.log(`Datos filtrados: ${datosFiltrados.length} libros`);
    
    // Actualizar la lista con los resultados filtrados
    librosList.innerHTML = renderizarLibrosLista(datosFiltrados);
}

// Función para abrir libro en el visor
function abrirLibro(url, nombre) {
    const visor = document.getElementById('libro-visor');
    // Convertir la URL de visualización a URL de incrustación
    const embedUrl = url.replace('/view', '/preview');
    
    // Crear el contenedor del visor con título
    visor.innerHTML = `
        <div class="visor-header">
            <h3>${nombre}</h3>
        </div>
        <div class="visor-content">
            <iframe 
                src="${embedUrl}" 
                width="100%" 
                height="100%" 
                frameborder="0" 
                allowfullscreen>
            </iframe>
        </div>
    `;
}

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    const container = document.getElementById('libros-lista');
    container.innerHTML = `
        <div class="error-mensaje">
            <i class="fas fa-exclamation-circle"></i>
            <p>${mensaje}</p>
        </div>
    `;
}

// Hacer funciones disponibles globalmente
window.abrirLibro = abrirLibro;
window.filtrarLibros = filtrarLibros;
window.renderizarLibrosLista = renderizarLibrosLista; 