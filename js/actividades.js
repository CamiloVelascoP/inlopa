// Importar configuración
import CONFIG from './config.js';

// Variable global para almacenar los datos de actividades
let actividadesData = [];

// Inicializar la API de Google Sheets
function initClient() {
    console.log('Inicializando cliente de Google Sheets para actividades...');
    gapi.client.init({
        apiKey: CONFIG.SHEETS_API_KEY,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(function() {
        console.log('API de Google Sheets inicializada para actividades');
        cargarActividades();
    }).catch(function(error) {
        console.error('Error al inicializar la API para actividades:', error);
        mostrarError('Error al conectar con el servidor. Por favor, intenta más tarde.');
    });
}

// Cargar la API de Google Sheets
console.log('Cargando API de Google Sheets para actividades...');
gapi.load('client', initClient);

// Función para cargar actividades desde Google Sheets
async function cargarActividades() {
    try {
        console.log('Cargando actividades desde Google Sheets...');
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SHEETS_ID,
            range: CONFIG.SHEETS.ACTIVIDADES,
        });

        const values = response.result.values;
        console.log('Datos recibidos:', values);
        
        if (!values || values.length === 0) {
            mostrarError('No se encontraron actividades disponibles.');
            return;
        }

        // Almacenar los datos para búsqueda
        actividadesData = values;

        // Crear contenedor de lista de actividades con scroll y buscador
        const actividadesLista = document.getElementById('actividades-lista');
        if (!actividadesLista) {
            console.error('No se encontró el contenedor de actividades-lista');
            return;
        }
        
        console.log('Creando lista de actividades...');
        actividadesLista.innerHTML = `
            <div class="buscador-container">
                <div class="buscador-input">
                    <i class="fas fa-search"></i>
                    <input type="text" id="buscador-actividades" placeholder="Buscar por título..." onkeyup="filtrarActividades()">
                </div>
            </div>
            <div class="libros-scroll-container">
                <div class="libros-list">
                    ${renderizarActividadesLista(values)}
                </div>
            </div>
        `;

        // Mostrar la primera actividad por defecto
        if (values.length > 0 && values[0].length >= 2) {
            console.log('Mostrando primera actividad:', values[0][0], values[0][1]);
            abrirActividad(values[0][1], values[0][0]);
        }

    } catch (error) {
        console.error('Error al cargar actividades:', error);
        mostrarError('Error al cargar las actividades. Por favor, verifica que la hoja de cálculo contiene la información correcta.');
    }
}

// Función para renderizar la lista de actividades
function renderizarActividadesLista(datos) {
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

        console.log(`Actividad ${index}: ${tituloEscapado} - ${linkEscapado}`);
        return `
            <div class="libro-item" onclick="abrirActividad('${linkEscapado}', '${tituloEscapado}')">
                <i class="fas fa-file-pdf"></i>
                <span>${tituloEscapado}</span>
            </div>
        `;
    }).join('');
}

// Función para filtrar actividades
function filtrarActividades() {
    const terminoBusqueda = document.getElementById('buscador-actividades').value.toLowerCase();
    console.log(`Filtrando actividades con término: ${terminoBusqueda}`);
    
    const actividadesList = document.querySelector('#actividades-lista .libros-list');
    if (!actividadesList) {
        console.error('No se encontró el contenedor de lista de actividades');
        return;
    }
    
    // Filtrar los datos
    const datosFiltrados = actividadesData.filter(row => {
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
    
    console.log(`Datos filtrados: ${datosFiltrados.length} actividades`);
    
    // Actualizar la lista con los resultados filtrados
    actividadesList.innerHTML = renderizarActividadesLista(datosFiltrados);
}

// Función para abrir una actividad
function abrirActividad(url, titulo) {
    console.log('Abriendo actividad:', titulo, url);
    
    // Verificar si la URL es de Google Drive
    if (url.includes('drive.google.com')) {
        // Convertir la URL de visualización a URL de incrustación
        const embedUrl = url.replace('/view', '/preview');
        
        // Crear el contenedor del visor con título
        const visor = document.getElementById('actividad-visor');
        visor.innerHTML = `
            <div class="visor-header">
                <h3>${titulo}</h3>
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
    } else {
        // Si no es una URL de Google Drive, intentar extraer el ID del archivo
        const match = url.match(/\/file\/d\/([^\/]+)/);
        if (match) {
            const fileId = match[1];
            const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
            
            // Crear el contenedor del visor con título
            const visor = document.getElementById('actividad-visor');
            visor.innerHTML = `
                <div class="visor-header">
                    <h3>${titulo}</h3>
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
        } else {
            console.error('URL no válida:', url);
            mostrarError('Error al abrir la actividad. La URL no es válida.');
        }
    }
}

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    const container = document.getElementById('actividades-lista');
    container.innerHTML = `
        <div class="error-mensaje">
            <i class="fas fa-exclamation-circle"></i>
            <p>${mensaje}</p>
        </div>
    `;
}

// Hacer funciones disponibles globalmente
window.abrirActividad = abrirActividad;
window.filtrarActividades = filtrarActividades;
window.renderizarActividadesLista = renderizarActividadesLista; 