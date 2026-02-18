# Sistema de Preguntas y Armas - SOLAR SYSTEM WAR

## ✅ Archivos Completados

1. **questions.js** - 25 preguntas de conocimiento
2. **weapons.js** - 5 armas con diferentes patrones
3. **game-state.js** - Sistema de Materia Oscura y armas
4. **equipo1.html** - COMPLETADO con:
   - Modal de preguntas
   - Tienda de armas
   - Display de Materia Oscura
   - Sistema de ataque con armas

## 🔨 Pendiente para equipo2.html

Agregar antes del cierre `</body>`:

```html
    <!-- Modal de Pregunta -->
    <div id="question-modal" class="modal">
        <div class="modal-content">
            <h2>📚 Pregunta de Conocimiento</h2>
            <div class="question-category" id="question-category">Categoría</div>
            <div class="question-text" id="question-text">¿Pregunta?</div>
            <div class="options" id="options-container"></div>
            <div id="question-result" style="margin-top: 20px; font-size: 1.2em; text-align: center;"></div>
        </div>
    </div>

    <!-- Modal de Tienda -->
    <div id="shop-modal" class="modal">
        <div class="modal-content">
            <h2>🛒 Tienda de Armas Espaciales</h2>
            <div class="dark-matter-display">
                ⚛️ Materia Oscura disponible: <span class="dark-matter-amount" id="shop-dark-matter">0</span>
            </div>
            <div class="weapon-shop" id="weapon-shop"></div>
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="closeShop()">Cerrar Tienda</button>
            </div>
        </div>
    </div>

    <script src="game-state.js"></script>
    <script src="questions.js"></script>
    <script src="weapons.js"></script>
```

Y reemplazar las funciones `handleAttackClick` y `updateView` en el script con las mismas de equipo1.html, cambiando:
- `TEAM = 'team1'` por `TEAM = 'team2'`
- `team1DarkMatter` por `team2DarkMatter`
- `team1Weapon` por `team2Weapon`  
- `team1UsedQuestions` por `team2UsedQuestions`

## 🎯 Armas Disponibles

| Arma | Icono | Celdas | Costo | Descripción |
|------|-------|--------|-------|-------------|
| Láser Pequeño | 🔹 | 1 | 0 | Ataque básico |
| Láser Mediano | 🔷 | 4 (2x2) | 50⚛️ | Ataque cuadrado |
| Láser Grande | 💠 | 5 (cruz) | 100⚛️ | Ataque en cruz |
| Rayo Destructor | ⚡ | 9 (3x3) | 150⚛️ | Ataque masivo |
| Bomba Planetaria | 💣 | 13 | 250⚛️ | Devastador |

## 🎮 Flujo del Juego

1. Equipos colocan planetas
2. Profesor inicia el juego
3. **NUEVO**: Al atacar, el equipo responde una pregunta
4. Si aciertan: +10 Materia Oscura ⚛️
5. Se ejecuta el ataque con el arma seleccionada
6. Con Materia Oscura, compran armas mejores
7. Gana quien destruya todos los planetas enemigos

## 📝 Categorías de Preguntas

- 🧪 Ciencias (5 preguntas)
- 🔢 Matemáticas (5 preguntas)
- 🌍 Geografía (5 preguntas)
- 📜 Historia (5 preguntas)
- 🎨 Cultura General (5 preguntas)
