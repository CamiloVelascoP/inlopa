// Importar configuración
import CONFIG from './config.js';

// Configuración de niveles
const NIVELES = {
    basico: {
        nombre: 'Básico',
        niveles: [
            {
                id: 'basico1',
                pares: 6,
                tiempo: 60,
                items: [
                    { pregunta: '1+1', respuesta: '2' },
                    { pregunta: '2+2', respuesta: '4' },
                    { pregunta: '3+3', respuesta: '6' }
                ]
            },
            {
                id: 'basico2',
                pares: 8,
                tiempo: 90,
                items: [
                    { pregunta: '4+4', respuesta: '8' },
                    { pregunta: '5+5', respuesta: '10' },
                    { pregunta: '6+6', respuesta: '12' },
                    { pregunta: '7+7', respuesta: '14' }
                ]
            }
        ]
    },
    medio: {
        nombre: 'Medio',
        niveles: [
            {
                id: 'medio1',
                pares: 10,
                tiempo: 120,
                items: [
                    { pregunta: '10+10', respuesta: '20' },
                    { pregunta: '20+20', respuesta: '40' },
                    { pregunta: '30+30', respuesta: '60' },
                    { pregunta: '40+40', respuesta: '80' },
                    { pregunta: '50+50', respuesta: '100' }
                ]
            },
            {
                id: 'medio2',
                pares: 12,
                tiempo: 150,
                items: [
                    { pregunta: '100+100', respuesta: '200' },
                    { pregunta: '200+200', respuesta: '400' },
                    { pregunta: '300+300', respuesta: '600' },
                    { pregunta: '400+400', respuesta: '800' },
                    { pregunta: '500+500', respuesta: '1000' },
                    { pregunta: '600+600', respuesta: '1200' }
                ]
            }
        ]
    },
    avanzado: {
        nombre: 'Avanzado',
        niveles: [
            {
                id: 'avanzado1',
                pares: 15,
                tiempo: 180,
                items: [
                    { pregunta: '1000+1000', respuesta: '2000' },
                    { pregunta: '2000+2000', respuesta: '4000' },
                    { pregunta: '3000+3000', respuesta: '6000' },
                    { pregunta: '4000+4000', respuesta: '8000' },
                    { pregunta: '5000+5000', respuesta: '10000' },
                    { pregunta: '6000+6000', respuesta: '12000' },
                    { pregunta: '7000+7000', respuesta: '14000' },
                    { pregunta: '8000+8000', respuesta: '16000' }
                ]
            },
            {
                id: 'avanzado2',
                pares: 18,
                tiempo: 210,
                items: [
                    { pregunta: '10000+10000', respuesta: '20000' },
                    { pregunta: '20000+20000', respuesta: '40000' },
                    { pregunta: '30000+30000', respuesta: '60000' },
                    { pregunta: '40000+40000', respuesta: '80000' },
                    { pregunta: '50000+50000', respuesta: '100000' },
                    { pregunta: '60000+60000', respuesta: '120000' },
                    { pregunta: '70000+70000', respuesta: '140000' },
                    { pregunta: '80000+80000', respuesta: '160000' },
                    { pregunta: '90000+90000', respuesta: '180000' }
                ]
            }
        ]
    }
};

// Variables globales del juego
let nivelActual = null;
let nivelIndex = 0;
let paresEncontrados = 0;
let tiempoRestante = 0;
let timer = null;
let cartasVolteadas = [];
let juegoActivo = false;

// Función para seleccionar nivel
function seleccionarNivel(dificultad) {
    nivelActual = NIVELES[dificultad];
    nivelIndex = 0;
    iniciarNivel();
}

// Función para iniciar nivel
function iniciarNivel() {
    if (!nivelActual || nivelIndex >= nivelActual.niveles.length) {
        mostrarMensajeFinal();
        return;
    }

    const nivel = nivelActual.niveles[nivelIndex];
    paresEncontrados = 0;
    tiempoRestante = nivel.tiempo;
    juegoActivo = true;
    cartasVolteadas = [];

    // Limpiar contenedor
    const container = document.getElementById('juego-container');
    container.innerHTML = '';

    // Crear elementos del juego
    const header = document.createElement('div');
    header.className = 'juego-header';
    header.innerHTML = `
        <h3>Nivel ${nivelIndex + 1} - ${nivelActual.nombre}</h3>
        <div class="juego-info">
            <span>Tiempo: <span id="tiempo">${tiempoRestante}</span>s</span>
            <span>Pares: <span id="pares">0/${nivel.pares}</span></span>
        </div>
    `;
    container.appendChild(header);

    // Crear grid de cartas
    const grid = document.createElement('div');
    grid.className = 'juego-grid';
    grid.style.gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(nivel.pares * 2))}, 1fr)`;

    // Crear cartas
    const items = [...nivel.items, ...nivel.items];
    const itemsMezclados = mezclarArray(items);

    itemsMezclados.forEach((item, index) => {
        const carta = document.createElement('div');
        carta.className = 'carta';
        carta.dataset.index = index;
        carta.dataset.pregunta = item.pregunta;
        carta.dataset.respuesta = item.respuesta;
        carta.innerHTML = '<div class="carta-contenido">?</div>';
        carta.addEventListener('click', () => voltearCarta(carta));
        grid.appendChild(carta);
    });

    container.appendChild(grid);

    // Iniciar temporizador
    iniciarTemporizador();
}

// Función para mezclar array
function mezclarArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Función para voltear carta
function voltearCarta(carta) {
    if (!juegoActivo || cartasVolteadas.length >= 2 || carta.classList.contains('encontrada')) {
        return;
    }

    carta.classList.add('volteada');
    carta.querySelector('.carta-contenido').textContent = carta.dataset.pregunta;
    cartasVolteadas.push(carta);

    if (cartasVolteadas.length === 2) {
        verificarPareja();
    }
}

// Función para verificar pareja
function verificarPareja() {
    const [carta1, carta2] = cartasVolteadas;
    const sonPareja = carta1.dataset.respuesta === carta2.dataset.respuesta;

    if (sonPareja) {
        carta1.classList.add('encontrada');
        carta2.classList.add('encontrada');
        paresEncontrados++;
        document.getElementById('pares').textContent = `${paresEncontrados}/${nivelActual.niveles[nivelIndex].pares}`;

        if (paresEncontrados === nivelActual.niveles[nivelIndex].pares) {
            finalizarNivel();
        }
    } else {
        setTimeout(() => {
            carta1.classList.remove('volteada');
            carta2.classList.remove('volteada');
            carta1.querySelector('.carta-contenido').textContent = '?';
            carta2.querySelector('.carta-contenido').textContent = '?';
        }, 1000);
    }

    cartasVolteadas = [];
}

// Función para iniciar temporizador
function iniciarTemporizador() {
    if (timer) clearInterval(timer);
    
    timer = setInterval(() => {
        tiempoRestante--;
        document.getElementById('tiempo').textContent = tiempoRestante;

        if (tiempoRestante <= 0) {
            finalizarNivel();
        }
    }, 1000);
}

// Función para finalizar nivel
function finalizarNivel() {
    juegoActivo = false;
    clearInterval(timer);

    const mensaje = paresEncontrados === nivelActual.niveles[nivelIndex].pares
        ? '¡Felicidades! Has completado el nivel.'
        : '¡Tiempo agotado!';

    const boton = document.createElement('button');
    boton.textContent = 'Siguiente Nivel';
    boton.onclick = () => {
        nivelIndex++;
        iniciarNivel();
    };

    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = 'mensaje-nivel';
    mensajeDiv.innerHTML = `
        <p>${mensaje}</p>
        <p>Pares encontrados: ${paresEncontrados}/${nivelActual.niveles[nivelIndex].pares}</p>
    `;
    mensajeDiv.appendChild(boton);

    document.getElementById('juego-container').appendChild(mensajeDiv);
}

// Función para mostrar mensaje final
function mostrarMensajeFinal() {
    const container = document.getElementById('juego-container');
    container.innerHTML = `
        <div class="mensaje-final">
            <h3>¡Has completado todos los niveles!</h3>
            <p>Puntuación final: ${paresEncontrados}/${nivelActual.niveles[nivelIndex].pares}</p>
            <p>${paresEncontrados > nivelActual.niveles[nivelIndex].pares / 2 
                ? '¡Felicidades! Has superado la mitad de los niveles.' 
                : 'Puedes esforzarte más para mejorar tu puntuación.'}</p>
            <button onclick="seleccionarNivel('basico')">Jugar de nuevo</button>
        </div>
    `;
} 