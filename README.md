# Loginox - Sistema de Autenticación con Google Sheets

Este proyecto implementa un sistema de inicio de sesión que utiliza Google Sheets como base de datos para almacenar y validar credenciales de usuario.

## Características

- Autenticación de usuarios mediante email y contraseña
- Integración con Google Sheets como backend
- Validación en tiempo real de credenciales
- Interfaz de usuario intuitiva
- Mensajes de retroalimentación para el usuario

## Requisitos Previos

- Una cuenta de Google con acceso a Google Sheets API
- API Key de Google Cloud Platform
- ID de una hoja de cálculo de Google Sheets
- Navegador web moderno con JavaScript habilitado

## Configuración

1. Crear un proyecto en Google Cloud Platform
2. Habilitar la API de Google Sheets
3. Crear credenciales (API Key)
4. Crear una hoja de cálculo en Google Sheets
5. Configurar las siguientes variables en `script.js`:
   ```javascript
   const API_KEY = 'TU_API_KEY';
   const SPREADSHEET_ID = 'TU_SPREADSHEET_ID';
   const RANGE = 'Hoja1!A:B';
   ```

## Estructura de la Hoja de Cálculo

La hoja de cálculo debe tener la siguiente estructura:
- Columna A: Dirección de email
- Columna B: Contraseña

## Instalación

1. Clonar o descargar este repositorio
2. Abrir el archivo `index.html` en un navegador web
3. Asegurarse de que la API de Google Sheets esté correctamente configurada

## Uso

1. Ingresar el email en el campo correspondiente
2. Ingresar la contraseña
3. Hacer clic en el botón de inicio de sesión
4. El sistema validará las credenciales contra la hoja de cálculo
5. Se mostrará un mensaje de éxito o error según corresponda

## Seguridad

- Las contraseñas se almacenan en texto plano en la hoja de cálculo
- Se recomienda implementar hash de contraseñas para mayor seguridad
- La API Key debe mantenerse segura y no compartirse públicamente

## Limitaciones

- Requiere conexión a internet
- Depende de la disponibilidad de la API de Google Sheets
- No implementa recuperación de contraseña
- No implementa registro de nuevos usuarios

## Solución de Problemas

Si encuentras errores:
1. Verifica que la API Key sea válida
2. Confirma que el ID de la hoja de cálculo sea correcto
3. Asegúrate de que la hoja de cálculo tenga el formato correcto
4. Revisa la consola del navegador para mensajes de error

## Contribuciones

Las contribuciones son bienvenidas. Por favor, asegúrate de:
1. Hacer fork del repositorio
2. Crear una rama para tu característica
3. Enviar un pull request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles. 