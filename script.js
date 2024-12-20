const form = document.querySelector("#mood-form");
const suggestionContainer = document.querySelector(".suggestion");
const questions = document.querySelectorAll(".question");

let responses = [];

// Manejador de eventos para cuando se haga clic en las caras
questions.forEach((question) => {
    const buttons = question.querySelectorAll("button");
    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            // Eliminar la clase 'selected' de todos los botones de la misma pregunta
            buttons.forEach((btn) => btn.classList.remove("selected"));
            // Agregar la clase 'selected' al botón clicado
            button.classList.add("selected");
        });
    });
});

// Lógica para generar la actividad cuando se envía el formulario
form.addEventListener("submit", (event) => {
    event.preventDefault();

    responses = [];
    // Recolectar las respuestas seleccionadas de cada pregunta
    questions.forEach((question) => {
        const selected = question.querySelector("button.selected");
        if (selected) {
            responses.push(selected.value);
        }
    });

    // Verificar si el usuario respondió todas las preguntas
    if (responses.length === 3) {
        generateSuggestion(responses); // Generar sugerencia basada en las respuestas
    } else {
        alert("Debes responder las tres preguntas.");
    }
});

// Función para generar la sugerencia según las respuestas
function generateSuggestion(responses) {
    const mood = responses[0]; // Estado de ánimo
    const day = responses[1];  // Descripción del día
    const energy = responses[2]; // Nivel de energía

    let suggestion = "";

    // Combinaciones de actividades basadas en las respuestas
    if (mood === "happy" && day === "happy" && energy === "happy") {
        suggestion = "Estás bien, Sigue así con las actividades que te mantienen bien.";
    } else if (mood === "happy" && day === "neutral" && energy === "neutral") {
        suggestion = "¡Es un buen momento para leer un libro o ver una película ligera!";
    } else if (mood === "neutral" && day === "neutral" && energy === "neutral") {
        suggestion = "Realiza una caminata corta o haz algunos ejercicios de estiramiento.";
    } else if (mood === "sad" && day === "sad" && energy === "sad") {
        suggestion = "Relájate con una meditación o escucha música tranquila.";
    } else if (mood === "angry" && day === "angry" && energy === "angry") {
        suggestion = "Realiza ejercicios de respiración o practica yoga para liberar tensiones.";
    } else {
        suggestion = "Intenta realizar algo que te guste y te haga sentir bien.";
    }

    // Mostrar la sugerencia en la interfaz
    suggestionContainer.innerHTML = `
        <h2>Actividad sugerida:</h2>
        <p>${suggestion}</p>
    `;
}
// Lógica para el botón "Reiniciar"
document.querySelector(".reset-button").addEventListener("click", () => {
    const buttons = document.querySelectorAll(".question button");
    buttons.forEach(button => button.classList.remove("selected"));
    suggestionContainer.innerHTML = "";
});
