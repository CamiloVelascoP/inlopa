// Importar configuración
import CONFIG from './config.js';

// Variable global para almacenar los datos de música
let musicaData = [];

// Inicializar la API de Google Sheets
function initClient() {
    gapi.client.init({
        apiKey: CONFIG.SHEETS_API_KEY,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(function() {
        console.log('API de Google Sheets inicializada');
        cargarMusica();
    }).catch(function(error) {
        console.error('Error al inicializar la API:', error);
        mostrarError('Error al conectar con el servidor. Por favor, intenta más tarde.');
    });
}

// Cargar la API de Google Sheets
gapi.load('client', initClient);

// Función para cargar música desde Google Sheets
async function cargarMusica() {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SHEETS_ID,
            range: CONFIG.SHEETS.MUSICA,
        });

        const values = response.result.values;
        if (!values || values.length === 0) {
            mostrarError('No se encontraron canciones disponibles.');
            return;
        }

        console.log(`Datos de música cargados: ${values.length} filas`);

        // Almacenar los datos para búsqueda
        musicaData = values;

        // Crear tabla de música con buscador integrado
        const musicaTabla = document.getElementById('musica-tabla');
        if (!musicaTabla) {
            console.error('No se encontró el contenedor de música');
            return;
        }

        musicaTabla.innerHTML = `
            <div class="buscador-container">
                <div class="buscador-input">
                    <i class="fas fa-search"></i>
                    <input type="text" id="buscador-musica" placeholder="Buscar por título o descripción..." onkeyup="filtrarMusica()">
                </div>
            </div>
            <div class="musica-scroll-container">
                <div class="musica-list">
                    <table class="musica-table" id="tabla-musica">
                        <thead>
                            <tr>
                                <th>Título de la Canción</th>
                                <th>Descripción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo-tabla-musica">
                            ${renderizarMusicaTablaFilas(values)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error al cargar música:', error);
        mostrarError('Error al cargar la música. Por favor, intenta más tarde.');
    }
}

// Función para renderizar las filas de la tabla de música
function renderizarMusicaTablaFilas(datos) {
    console.log(`Renderizando ${datos ? datos.length : 0} filas de música`);
    
    if (!datos || !Array.isArray(datos)) {
        console.error('Datos inválidos para renderizar:', datos);
        return '';
    }

    return datos.map(row => {
        if (!row || row.length < 3) {
            console.warn('Fila con datos incompletos:', row);
            return '';
        }

        const [titulo, descripcion, link] = row;
        return `
            <tr>
                <td>${titulo || ''}</td>
                <td>${descripcion || ''}</td>
                <td>
                    ${link ? `
                        <a href="${link}" target="_blank" class="btn-reproducir">
                            <i class="fas fa-play"></i> Reproducir
                        </a>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

// Función para filtrar la música
function filtrarMusica() {
    const terminoBusqueda = document.getElementById('buscador-musica').value.toLowerCase();
    console.log(`Filtrando música con término: ${terminoBusqueda}`);
    
    const cuerpoTabla = document.getElementById('cuerpo-tabla-musica');
    if (!cuerpoTabla) {
        console.error('No se encontró el cuerpo de la tabla de música');
        return;
    }
    
    // Filtrar los datos
    const datosFiltrados = musicaData.filter(row => {
        const titulo = row[0] ? row[0].toLowerCase() : '';
        const descripcion = row[1] ? row[1].toLowerCase() : '';
        
        // Dividir el término de búsqueda en palabras individuales
        const palabrasBusqueda = terminoBusqueda.split(/\s+/).filter(palabra => palabra.length > 0);
        
        // Si no hay palabras de búsqueda, mostrar todos los resultados
        if (palabrasBusqueda.length === 0) {
            return true;
        }
        
        // Verificar si todas las palabras de búsqueda están en el título o la descripción
        return palabrasBusqueda.every(palabra => 
            titulo.includes(palabra) || descripcion.includes(palabra)
        );
    });
    
    console.log(`Datos filtrados: ${datosFiltrados.length} filas`);
    
    // Actualizar la tabla con los resultados filtrados
    cuerpoTabla.innerHTML = renderizarMusicaTablaFilas(datosFiltrados);
}

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    const musicaTabla = document.getElementById('musica-tabla');
    if (musicaTabla) {
        musicaTabla.innerHTML = `
            <div class="error-mensaje">
                <i class="fas fa-exclamation-circle"></i>
                <p>${mensaje}</p>
            </div>
        `;
    }
}

// Hacer las funciones disponibles globalmente
window.renderizarMusicaTablaFilas = renderizarMusicaTablaFilas;
window.filtrarMusica = filtrarMusica; 