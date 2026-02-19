const SIZE = 50;
const TOTAL_CELLS = SIZE * SIZE;
const CELL_SIZE = 16;
const CANVAS_SIZE = SIZE * CELL_SIZE;

const PLANETS = [
    { 
        name: 'Júpiter', 
        size: 20, 
        color: '#FFA500',
        diameter: '142,984 km',
        temperature: '-110°C',
        composition: 'Hidrógeno, Helio',
        type: 'Gigante de Gas',
        image: 'img/planetas/jupiter.jpg'
    },
    { 
        name: 'Saturno', 
        size: 17, 
        color: '#DAA520',
        diameter: '120,536 km',
        temperature: '-140°C',
        composition: 'Hidrógeno, Helio',
        type: 'Gigante de Gas',
        image: 'img/planetas/saturno.jpg'
    },
    { 
        name: 'Neptuno', 
        size: 8, 
        color: '#1E90FF',
        diameter: '49,528 km',
        temperature: '-200°C',
        composition: 'Metano, Hidrógeno, Helio',
        type: 'Gigante de Hielo',
        image: 'img/planetas/neptuno.jpg'
    },
    { 
        name: 'Urano', 
        size: 7, 
        color: '#00CED1',
        diameter: '50,724 km',
        temperature: '-195°C',
        composition: 'Metano, Hielo',
        type: 'Gigante de Hielo',
        image: 'img/planetas/urano.jpg'
    },
    { 
        name: 'Tierra', 
        size: 3, 
        color: '#4169E1',
        diameter: '12,742 km',
        temperature: '15°C (media)',
        composition: 'Silicatos, Hierro',
        type: 'Rocoso',
        image: 'img/planetas/tierra.jpg'
    },
    { 
        name: 'Venus', 
        size: 3, 
        color: '#FFCC00',
        diameter: '12,104 km',
        temperature: '464°C',
        composition: 'Silicatos, CO₂',
        type: 'Rocoso',
        image: 'img/planetas/venus.jpg'
    },
    { 
        name: 'Marte', 
        size: 2, 
        color: '#DC143C',
        diameter: '6,779 km',
        temperature: '-65°C (media)',
        composition: 'Silicatos, Óxido de Hierro',
        type: 'Rocoso',
        image: 'img/planetas/marte.jpg'
    },
    { 
        name: 'Mercurio', 
        size: 1, 
        color: '#808080',
        diameter: '4,879 km',
        temperature: '167°C',
        composition: 'Silicatos, Hierro',
        type: 'Rocoso',
        image: 'img/planetas/mercurio.jpg'
    }
];

let playerBoard = new Array(TOTAL_CELLS).fill(0);
let enemyBoard = new Array(TOTAL_CELLS).fill(0);
let playerPlanetCenters = {};
let enemyPlanetCenters = {};

let playerCanvas, enemyCanvas;
let playerCtx, enemyCtx;
let infoText;

// Cargar imágenes de planetas
const planetImages = {};
let imagesLoaded = 0;
PLANETS.forEach(planet => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = planet.image;
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === PLANETS.length) {
            // Redibujar cuando todas las imágenes estén cargadas
            if (playerCtx && enemyCtx) {
                draw();
            }
        }
    };
    planetImages[planet.name] = img;
});

function initGame() {
    infoText = document.getElementById("info");
    playerCanvas = document.getElementById('player-canvas');
    enemyCanvas = document.getElementById('enemy-canvas');
    
    if (!playerCanvas || !enemyCanvas) {
        console.error("Canvas elements not found!");
        return;
    }
    
    playerCtx = playerCanvas.getContext('2d');
    enemyCtx = enemyCanvas.getContext('2d');
    
    enemyCanvas.addEventListener('click', (e) => handleCanvasClick(e));
    
    placePlanetsRandomly(playerBoard, "player");
    placePlanetsRandomly(enemyBoard, "enemy");
    
    console.log("Player centers:", playerPlanetCenters);
    console.log("Enemy centers:", enemyPlanetCenters);
    
    draw();
    drawPlanetsList();
}

function placePlanetsRandomly(board, type) {
    PLANETS.forEach(planet => {
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 500) {
            attempts++;
            const centerX = Math.floor(Math.random() * SIZE);
            const centerY = Math.floor(Math.random() * SIZE);
            const centerIndex = centerY * SIZE + centerX;
            
            const radius = Math.sqrt(planet.size / Math.PI);
            let canPlace = true;
            let cellsToMark = [];
            
            // Verificar si hay espacio
            for (let y = Math.max(0, centerY - Math.ceil(radius)); y <= Math.min(SIZE - 1, centerY + Math.ceil(radius)); y++) {
                for (let x = Math.max(0, centerX - Math.ceil(radius)); x <= Math.min(SIZE - 1, centerX + Math.ceil(radius)); x++) {
                    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                    if (distance <= radius) {
                        const idx = y * SIZE + x;
                        if (board[idx] === 0) {
                            cellsToMark.push(idx);
                        } else {
                            canPlace = false;
                            break;
                        }
                    }
                }
                if (!canPlace) break;
            }
            
            // Si hay espacio, marcar las celdas
            if (canPlace && cellsToMark.length > 0) {
                const cellsToPlace = Math.min(planet.size, cellsToMark.length);
                for (let i = 0; i < cellsToPlace; i++) {
                    board[cellsToMark[i]] = 1;
                }
                
                if (type === "player") {
                    playerPlanetCenters[planet.name] = centerIndex;
                } else {
                    enemyPlanetCenters[planet.name] = centerIndex;
                }
                placed = true;
            }
        }
    });
}

function draw() {
    drawBoard(playerCtx, playerBoard, playerPlanetCenters);
    drawBoard(enemyCtx, enemyBoard, enemyPlanetCenters);
}

function drawBoard(ctx, board, planetCenters) {
    // Limpiar
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Grid
    ctx.strokeStyle = '#1a3a3a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= SIZE; i++) {
        const pos = i * CELL_SIZE;
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, CANVAS_SIZE);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(CANVAS_SIZE, pos);
        ctx.stroke();
    }
    
    // Planetas
    PLANETS.forEach(planet => {
        const centerIndex = planetCenters[planet.name];
        if (centerIndex !== undefined && board[centerIndex] === 1) {
            const centerX = (centerIndex % SIZE) * CELL_SIZE + CELL_SIZE / 2;
            const centerY = Math.floor(centerIndex / SIZE) * CELL_SIZE + CELL_SIZE / 2;
            const radius = Math.sqrt(planet.size / Math.PI) * CELL_SIZE;
            
            // Círculo con fondo de color
            ctx.fillStyle = planet.color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Dibujar imagen del planeta si está cargada
            const img = planetImages[planet.name];
            if (img && img.complete && img.naturalWidth > 0) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(img, centerX - radius, centerY - radius, radius * 2, radius * 2);
                ctx.restore();
            }
            
            // Borde
            ctx.strokeStyle = '#00ffcc';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Nombre
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(planet.name, centerX, centerY + radius + 8);
        }
    });
    
    // Impactos y fallos
    for (let i = 0; i < TOTAL_CELLS; i++) {
        if (board[i] === 3) {
            const x = (i % SIZE) * CELL_SIZE;
            const y = Math.floor(i / SIZE) * CELL_SIZE;
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        } else if (board[i] === 2) {
            const x = (i % SIZE) * CELL_SIZE;
            const y = Math.floor(i / SIZE) * CELL_SIZE;
            ctx.fillStyle = 'rgba(100, 100, 255, 0.5)';
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        }
    }
}

function handleCanvasClick(e) {
    const rect = enemyCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    
    if (col < 0 || col >= SIZE || row < 0 || row >= SIZE) return;
    
    const index = row * SIZE + col;
    
    if (enemyBoard[index] === 2 || enemyBoard[index] === 3) return;
    
    if (enemyBoard[index] === 1) {
        enemyBoard[index] = 3;
        infoText.innerText = "¡IMPACTO! Has dado a un planeta enemigo.";
        checkWin(enemyBoard, "¡VICTORIA GALÁCTICA!");
    } else {
        enemyBoard[index] = 2;
        infoText.innerText = "Agua... Solo vacío espacial.";
    }
    
    draw();
    setTimeout(computerTurn, 500);
}

function computerTurn() {
    let index;
    do {
        index = Math.floor(Math.random() * TOTAL_CELLS);
    } while (playerBoard[index] === 2 || playerBoard[index] === 3);
    
    if (playerBoard[index] === 1) {
        playerBoard[index] = 3;
        infoText.innerText = "¡GOLPE! El enemigo ha impactado uno de tus planetas.";
        checkWin(playerBoard, "¡DERROTA! Tu sistema solar ha sido destruido.");
    } else {
        playerBoard[index] = 2;
        infoText.innerText = "El enemigo falló el disparo.";
    }
    
    draw();
}

function checkWin(board, msg) {
    if (!board.includes(1)) {
        setTimeout(() => {
            alert(msg);
            location.reload();
        }, 100);
    }
}

function drawPlanetsList() {
    const listContainer = document.getElementById('planets-info');
    listContainer.innerHTML = '';
    
    PLANETS.forEach(planet => {
        const div = document.createElement('div');
        div.className = 'planet-item';
        div.style.backgroundColor = planet.color;
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <img src="${planet.image}" alt="${planet.name}" style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid #00ffcc; object-fit: cover;">
                <div style="color: #000; text-shadow: 1px 1px 2px rgba(255,255,255,0.5); font-weight: bold; font-size: 1.1em;">
                    ${planet.name}
                </div>
            </div>
            <div style="color: #000; font-size: 0.85em; line-height: 1.5;">
                <strong>Tamaño:</strong> ${planet.size} celdas<br>
                <strong>Diámetro:</strong> ${planet.diameter}<br>
                <strong>Temperatura:</strong> ${planet.temperature}<br>
                <strong>Tipo:</strong> ${planet.type}<br>
                <strong>Composición:</strong> ${planet.composition}
            </div>
        `;
        listContainer.appendChild(div);
    });
}

document.addEventListener('DOMContentLoaded', initGame);
