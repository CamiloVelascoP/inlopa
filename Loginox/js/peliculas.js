// Importar configuración
import CONFIG from './config.js';

// Variable global para almacenar los datos de películas
let peliculasData = [];

// Inicializar la API de Google Sheets
function initClient() {
    gapi.client.init({
        apiKey: CONFIG.SHEETS_API_KEY,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(function() {
        console.log('API de Google Sheets inicializada');
        cargarPeliculas();
    }).catch(function(error) {
        console.error('Error al inicializar la API:', error);
        mostrarError('Error al conectar con el servidor. Por favor, intenta más tarde.');
    });
}

// Cargar la API de Google Sheets
gapi.load('client', initClient);

// Función para cargar películas desde Google Sheets
async function cargarPeliculas() {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SHEETS_ID,
            range: CONFIG.SHEETS.PELICULAS, // Usar la configuración definida
        });

        const values = response.result.values;
        if (!values || values.length === 0) {
            mostrarError('No se encontraron películas disponibles.');
            return;
        }

        console.log(`Datos de películas cargados: ${values.length} filas`);

        // Almacenar los datos para búsqueda
        peliculasData = values;

        // Crear tabla de películas con buscador integrado
        const peliculasTabla = document.getElementById('peliculas-tabla');
        if (!peliculasTabla) {
            console.error('No se encontró el contenedor de películas');
            return;
        }

        peliculasTabla.innerHTML = `
            <div class="buscador-container">
                <div class="buscador-input">
                    <i class="fas fa-search"></i>
                    <input type="text" id="buscador-peliculas" placeholder="Buscar por título o descripción..." onkeyup="filtrarPeliculas()">
                </div>
            </div>
            <div class="peliculas-scroll-container">
                <div class="peliculas-list">
                    <table class="forms-table" id="tabla-peliculas">
                        <thead>
                            <tr>
                                <th>Título de la Película</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo-tabla-peliculas">
                            ${renderizarPeliculasTablaFilas(values)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error al cargar películas:', error);
        mostrarError('Error al cargar las películas. Por favor, intenta más tarde.');
    }
}

// Función para renderizar las filas de la tabla de películas
function renderizarPeliculasTablaFilas(datos) {
    console.log(`Renderizando ${datos ? datos.length : 0} filas de películas`);
    
    if (!datos || !Array.isArray(datos)) {
        console.error('Datos inválidos para renderizar:', datos);
        return '';
    }

    return datos.map(row => {
        if (!row || row.length < 2) {
            console.warn('Fila con datos incompletos:', row);
            return '';
        }

        const [titulo, descripcion] = row;
        return `
            <tr>
                <td>${titulo || ''}</td>
                <td>${descripcion || ''}</td>
            </tr>
        `;
    }).join('');
}

// Función para filtrar las películas
function filtrarPeliculas() {
    const terminoBusqueda = document.getElementById('buscador-peliculas').value.toLowerCase();
    console.log(`Filtrando películas con término: ${terminoBusqueda}`);
    
    const cuerpoTabla = document.getElementById('cuerpo-tabla-peliculas');
    if (!cuerpoTabla) {
        console.error('No se encontró el cuerpo de la tabla de películas');
        return;
    }
    
    // Filtrar los datos
    const datosFiltrados = peliculasData.filter(row => {
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
    cuerpoTabla.innerHTML = renderizarPeliculasTablaFilas(datosFiltrados);
}

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    const peliculasTabla = document.getElementById('peliculas-tabla');
    if (peliculasTabla) {
        peliculasTabla.innerHTML = `
            <div class="error-mensaje">
                <i class="fas fa-exclamation-circle"></i>
                <p>${mensaje}</p>
            </div>
        `;
    }
}

// Hacer las funciones disponibles globalmente
window.renderizarPeliculasTablaFilas = renderizarPeliculasTablaFilas;
window.filtrarPeliculas = filtrarPeliculas; 