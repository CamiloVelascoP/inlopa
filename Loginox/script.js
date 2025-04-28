// Configuración de la API de Google Sheets
const API_KEY = 'AIzaSyDkMOuJwIlTLtKE9lB0-T6Fr3_hEyWzROA';
const SPREADSHEET_ID = '1_F0ciSwqf5e6GomeMyywCmTXi-OIaNtzPA47MHFL6_w';
const RANGE = 'Hoja 1!A:C'; // Asumiendo que el email está en la columna A, contraseña en B y nombre en C

// Verificar si estamos en la página de dashboard
if (window.location.pathname.includes('dashboard.html')) {
    // Si no hay sesión activa, redirigir al login
    if (!sessionStorage.getItem('sesionActiva')) {
        window.location.replace('index.html');
    }
}

//mi clave de api de sheets es: AIzaSyDkMOuJwIlTLtKE9lB0-T6Fr3_hEyWzROA
// Inicializar la API de Google Sheets
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(function() {
        console.log('API de Google Sheets inicializada');
    }).catch(function(error) {
        console.error('Error al inicializar la API:', error);
        showError('Error al conectar con el servidor. Por favor, intenta más tarde.');
    });
}

// Cargar la API de Google Sheets
gapi.load('client', initClient);

// Función para mostrar mensajes de error
function showError(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.style.color = '#ff4444';
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
}

// Función para mostrar mensajes de éxito
function showSuccess(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.style.color = '#4CAF50';
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
}

// Manejar el envío del formulario
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Validar que los campos no estén vacíos
    if (!email || !password) {
        showError('Por favor, completa todos los campos');
        return;
    }
    
    // Validar las credenciales contra Google Sheets
    validateCredentials(email, password);
});

// Función para validar las credenciales
async function validateCredentials(email, password) {
    try {
        // Asegurarse de que la API esté inicializada
        if (!gapi.client.sheets) {
            await new Promise((resolve) => {
                gapi.load('client', () => {
                    gapi.client.init({
                        apiKey: API_KEY,
                        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                    }).then(resolve);
                });
            });
        }

        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const values = response.result.values;

        if (!values || values.length === 0) {
            showError('No se encontraron usuarios registrados');
            return;
        }

        // Buscar el usuario y contraseña en la hoja de cálculo
        const userFound = values.find(row => 
            row[0] === email && row[1] === password
        );

        if (userFound) {
            // Establecer sesión activa y guardar datos del usuario
            sessionStorage.setItem('sesionActiva', 'true');
            sessionStorage.setItem('emailUsuario', email);
            sessionStorage.setItem('nombreUsuario', userFound[2]); // Guardar el nombre del usuario
            
            showSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
            // Redirigir al dashboard inmediatamente
            window.location.replace('dashboard.html');
        } else {
            showError('Email o contraseña incorrectos. Por favor, verifica tus credenciales.');
            // Limpiar el campo de contraseña
            document.getElementById('password').value = '';
        }
    } catch (error) {
        console.error('Error al validar credenciales:', error);
        showError('Error al conectar con el servidor. Por favor, intenta más tarde.');
    }
} 