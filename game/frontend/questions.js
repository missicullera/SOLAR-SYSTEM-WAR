// Base de datos de preguntas para el juego
let QUESTIONS = [
    // Ciencias
    {
        category: 'Ciencias',
        question: '¿Cuál es el planeta más grande del sistema solar?',
        options: ['Tierra', 'Júpiter', 'Saturno', 'Neptuno'],
        correct: 1
    },
    {
        category: 'Ciencias',
        question: '¿Qué gas respiramos principalmente del aire?',
        options: ['Oxígeno', 'Hidrógeno', 'Nitrógeno', 'CO2'],
        correct: 2
    },
    {
        category: 'Ciencias',
        question: '¿A qué velocidad viaja la luz?',
        options: ['100.000 km/s', '200.000 km/s', '300.000 km/s', '400.000 km/s'],
        correct: 2
    },
    {
        category: 'Ciencias',
        question: '¿Cuántos planetas tiene el sistema solar?',
        options: ['7', '8', '9', '10'],
        correct: 1
    },
    {
        category: 'Ciencias',
        question: '¿Qué es H2O?',
        options: ['Oxígeno', 'Agua', 'Hidrógeno', 'Helio'],
        correct: 1
    },
    
    // Matemáticas
    {
        category: 'Matemáticas',
        question: '¿Cuánto es 7 × 8?',
        options: ['54', '56', '58', '60'],
        correct: 1
    },
    {
        category: 'Matemáticas',
        question: '¿Cuál es el resultado de 144 ÷ 12?',
        options: ['10', '11', '12', '13'],
        correct: 2
    },
    {
        category: 'Matemáticas',
        question: '¿Cuántos grados tiene un triángulo?',
        options: ['90°', '180°', '270°', '360°'],
        correct: 1
    },
    {
        category: 'Matemáticas',
        question: '¿Qué es π (pi) aproximadamente?',
        options: ['2.14', '3.14', '4.14', '5.14'],
        correct: 1
    },
    {
        category: 'Matemáticas',
        question: '¿Cuál es la raíz cuadrada de 64?',
        options: ['6', '7', '8', '9'],
        correct: 2
    },
    
    // Geografía
    {
        category: 'Geografía',
        question: '¿Cuál es la capital de España?',
        options: ['Barcelona', 'Madrid', 'Valencia', 'Sevilla'],
        correct: 1
    },
    {
        category: 'Geografía',
        question: '¿Cuál es el río más largo del mundo?',
        options: ['Nilo', 'Amazonas', 'Yangtsé', 'Misisipi'],
        correct: 1
    },
    {
        category: 'Geografía',
        question: '¿En qué continente está Egipto?',
        options: ['Asia', 'Europa', 'África', 'América'],
        correct: 2
    },
    {
        category: 'Geografía',
        question: '¿Cuál es el océano más grande?',
        options: ['Atlántico', 'Índico', 'Ártico', 'Pacífico'],
        correct: 3
    },
    {
        category: 'Geografía',
        question: '¿Cuántos continentes hay?',
        options: ['5', '6', '7', '8'],
        correct: 2
    },
    
    // Historia
    {
        category: 'Historia',
        question: '¿En qué año se descubrió América?',
        options: ['1492', '1500', '1482', '1502'],
        correct: 0
    },
    {
        category: 'Historia',
        question: '¿Quién pintó la Mona Lisa?',
        options: ['Picasso', 'Van Gogh', 'Da Vinci', 'Dalí'],
        correct: 2
    },
    {
        category: 'Historia',
        question: '¿En qué año llegó el hombre a la Luna?',
        options: ['1965', '1967', '1969', '1971'],
        correct: 2
    },
    {
        category: 'Historia',
        question: '¿Qué civilización construyó las pirámides de Egipto?',
        options: ['Romanos', 'Griegos', 'Egipcios', 'Mayas'],
        correct: 2
    },
    {
        category: 'Historia',
        question: '¿Quién fue el primer presidente de Estados Unidos?',
        options: ['Jefferson', 'Washington', 'Lincoln', 'Roosevelt'],
        correct: 1
    },
    
    // Cultura General
    {
        category: 'Cultura',
        question: '¿Cuántos colores tiene el arcoíris?',
        options: ['5', '6', '7', '8'],
        correct: 2
    },
    {
        category: 'Cultura',
        question: '¿Cuántos días tiene un año bisiesto?',
        options: ['364', '365', '366', '367'],
        correct: 2
    },
    {
        category: 'Cultura',
        question: '¿Cuál es el idioma más hablado del mundo?',
        options: ['Inglés', 'Chino mandarín', 'Español', 'Hindi'],
        correct: 1
    },
    {
        category: 'Cultura',
        question: '¿Cuántas cuerdas tiene una guitarra española?',
        options: ['4', '5', '6', '7'],
        correct: 2
    },
    {
        category: 'Cultura',
        question: '¿En qué país se inventó el papel?',
        options: ['Japón', 'China', 'India', 'Egipto'],
        correct: 1
    }
];

// Función para obtener una pregunta aleatoria
function getRandomQuestion() {
    const index = Math.floor(Math.random() * QUESTIONS.length);
    return { ...QUESTIONS[index], index };
}

// Función para obtener una pregunta que no se haya usado
function getNewQuestion(usedIndices = []) {
    const availableQuestions = QUESTIONS.filter((_, idx) => !usedIndices.includes(idx));
    if (availableQuestions.length === 0) return getRandomQuestion(); // Si se acabaron, repetir
    
    const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    const index = QUESTIONS.indexOf(question);
    return { ...question, index };
}

// Si el profesor subió una batería personalizada, sustituir las preguntas por defecto
(function loadCustomQuestions() {
    try {
        const stored = localStorage.getItem('custom_questions');
        if (stored) {
            const custom = JSON.parse(stored);
            if (Array.isArray(custom) && custom.length > 0) {
                QUESTIONS = custom;
            }
        }
    } catch (e) {
        console.warn('No se pudieron cargar las preguntas personalizadas:', e);
    }
})();
