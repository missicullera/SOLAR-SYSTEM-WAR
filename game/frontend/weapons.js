// Sistema de armas para el juego
const WEAPONS = {
    'laser-pequeño': {
        name: 'Láser Pequeño',
        icon: '🔹',
        pattern: [[0, 0]], // Solo un cuadrado
        cost: 0,
        description: 'Ataque básico de 1 celda'
    },
    'laser-mediano': {
        name: 'Láser Mediano',
        icon: '🔷',
        pattern: [[0, 0], [1, 0], [0, 1], [1, 1]], // 2x2
        cost: 15,
        description: 'Ataque de 2×2 celdas (4 celdas)'
    },
    'laser-grande': {
        name: 'Láser Grande',
        icon: '💠',
        pattern: [
            [-1, 0], [0, -1], [0, 0], [0, 1], [1, 0]
        ], // Cruz de 5 celdas
        cost: 30,
        description: 'Ataque en cruz (5 celdas)'
    },
    'rayo-destructor': {
        name: 'Rayo Destructor',
        icon: '⚡',
        pattern: [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 0], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ], // 3x3
        cost: 50,
        description: 'Ataque masivo de 3×3 celdas (9 celdas)'
    },
    'bomba-planetaria': {
        name: 'Bomba Planetaria',
        icon: '💣',
        pattern: [
            [-2, 0], [-1, -1], [-1, 0], [-1, 1],
            [0, -2], [0, -1], [0, 0], [0, 1], [0, 2],
            [1, -1], [1, 0], [1, 1], [2, 0]
        ], // Diamante grande
        cost: 75,
        description: 'Ataque devastador en diamante (13 celdas)'
    },
    'sonda-espionaje': {
        name: 'Sonda de Espionaje',
        icon: '🛸',
        // Sector 10×10 centrado en la celda seleccionada
        pattern: (() => {
            const p = [];
            for (let dy = -4; dy <= 5; dy++)
                for (let dx = -4; dx <= 5; dx++)
                    p.push([dx, dy]);
            return p; // 100 celdas
        })(),
        cost: 60,
        spy: true,   // <-- NO ataca, solo revela
        description: 'Escanea un sector 10×10 sin atacar — muestra planetas enemigos ocultos'
    }
};

// Función para obtener el patrón de ataque aplicado a unas coordenadas
function getAttackPattern(weaponType, baseX, baseY, gridSize = 50) {
    const weapon = WEAPONS[weaponType];
    if (!weapon) return [];
    
    const cells = [];
    weapon.pattern.forEach(([dx, dy]) => {
        const x = baseX + dx;
        const y = baseY + dy;
        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
            cells.push({ x, y, index: y * gridSize + x });
        }
    });
    return cells;
}

// Función para dibujar la previsualización del arma en el canvas
function drawWeaponPreview(ctx, weaponType, mouseX, mouseY, cellSize, gridSize) {
    const weapon = WEAPONS[weaponType];
    if (!weapon) return;
    
    const gridX = Math.floor(mouseX / cellSize);
    const gridY = Math.floor(mouseY / cellSize);
    
    ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
    ctx.lineWidth = 2;
    
    weapon.pattern.forEach(([dx, dy]) => {
        const x = gridX + dx;
        const y = gridY + dy;
        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
            const cellX = x * cellSize;
            const cellY = y * cellSize;
            ctx.fillRect(cellX, cellY, cellSize, cellSize);
            ctx.strokeRect(cellX, cellY, cellSize, cellSize);
        }
    });
}
