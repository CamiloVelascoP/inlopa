/**
 * Componente de Buscador Simple
 * Este componente permite filtrar datos en cualquier tabla o lista
 */

// Función para crear un buscador
function crearBuscadorSimple(contenedorId, tablaId, datos, columnasBusqueda) {
    console.log(`Creando buscador simple para ${contenedorId} con ${datos.length} filas de datos`);
    
    // Verificar que los elementos existan
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) {
        console.error(`No se encontró el contenedor con ID: ${contenedorId}`);
        return;
    }

    // Crear el elemento de búsqueda
    const buscadorHTML = `
        <div class="buscador-container">
            <div class="buscador-input">
                <i class="fas fa-search"></i>
                <input type="text" id="buscador-${contenedorId}" placeholder="Buscar..." onkeyup="filtrarDatosSimple('${contenedorId}', '${tablaId}', ${JSON.stringify(columnasBusqueda)})">
            </div>
        </div>
    `;

    // Insertar el buscador al principio del contenedor
    contenedor.insertAdjacentHTML('afterbegin', buscadorHTML);

    // Almacenar los datos para búsqueda
    window[`${contenedorId}Data`] = datos;
}

// Función genérica para filtrar datos
function filtrarDatosSimple(contenedorId, tablaId, columnasBusqueda) {
    console.log(`Filtrando datos para ${contenedorId}...`);
    
    const terminoBusqueda = document.getElementById(`buscador-${contenedorId}`).value.toLowerCase();
    console.log(`Término de búsqueda: ${terminoBusqueda}`);
    
    const cuerpoTabla = document.getElementById(tablaId);
    if (!cuerpoTabla) {
        console.error(`No se encontró el cuerpo de la tabla con ID: ${tablaId}`);
        return;
    }
    
    // Obtener los datos almacenados
    const datos = window[`${contenedorId}Data`];
    if (!datos) {
        console.error(`No se encontraron datos para el contenedor: ${contenedorId}`);
        return;
    }
    
    console.log(`Datos originales: ${datos.length} filas`);
    
    // Filtrar los datos
    const datosFiltrados = datos.filter(row => {
        return columnasBusqueda.some(colIndex => {
            const valor = row[colIndex] ? row[colIndex].toLowerCase() : '';
            return valor.includes(terminoBusqueda);
        });
    });
    
    console.log(`Datos filtrados: ${datosFiltrados.length} filas`);
    
    // Obtener la función de renderizado específica para este contenedor
    const renderizarFuncion = window[`renderizar${contenedorId.charAt(0).toUpperCase() + contenedorId.slice(1)}Filas`];
    
    if (typeof renderizarFuncion === 'function') {
        // Actualizar la tabla con los resultados filtrados
        cuerpoTabla.innerHTML = renderizarFuncion(datosFiltrados);
    } else {
        console.error(`No se encontró la función de renderizado para: ${contenedorId}`);
    }
}

// Exportar las funciones para que estén disponibles globalmente
window.crearBuscadorSimple = crearBuscadorSimple;
window.filtrarDatosSimple = filtrarDatosSimple; 