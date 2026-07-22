# Solar System War

Juego educativo multijugador por turnos inspirado en una batalla espacial. Dos equipos colocan sus planetas, responden preguntas para conseguir materia oscura y utilizan distintas armas para destruir el sistema solar rival. Una tercera pantalla permite al profesor crear y controlar la partida.

## Características

- Partidas compartidas mediante códigos de sesión.
- Panel independiente para el profesor y para cada equipo.
- Tableros de 50 x 50 con ocho planetas por equipo.
- Preguntas educativas integradas y baterías personalizadas en CSV.
- Materia oscura y tienda de armas con patrones de ataque diferentes.
- Sondas de espionaje y seguimiento de impactos en tiempo real.
- Sincronización periódica mediante una API REST de Spring Boot.

## Tecnologías

- Frontend: HTML, CSS y JavaScript sin framework.
- Backend: Java 21, Spring Boot 3.3 y Maven.
- Pruebas: Node.js Test Runner y JUnit 5.
- Despliegue del backend: Docker o un servicio compatible con contenedores.

## Estructura

```text
game/
|-- frontend/
|   |-- index.html          # Menú principal
|   |-- profesor.html       # Control de la partida
|   |-- equipo1.html        # Vista del equipo 1
|   |-- equipo2.html        # Vista del equipo 2
|   |-- game-state.js       # Estado local y sincronización remota
|   |-- questions.js        # Banco de preguntas
|   `-- weapons.js          # Armas y patrones de ataque
`-- backend/springboot/
    |-- src/main/           # API y modelo de estado
    |-- src/test/           # Pruebas del servicio
    |-- Dockerfile
    `-- pom.xml
```

## Requisitos

- Java 21.
- Maven 3.9 o superior.
- Un navegador moderno.
- Node.js 18 o superior para ejecutar las pruebas del frontend.
- Python 3, Node.js u otro servidor HTTP estático para servir el frontend localmente.

## Ejecución local

### 1. Iniciar el backend

Desde la raíz del repositorio:

```bash
cd game/backend/springboot
mvn spring-boot:run
```

La API quedará disponible en `http://localhost:8080/api`.

### 2. Configurar el frontend para la API local

El frontend utiliza por defecto el backend desplegado en Render. Para trabajar con el backend local, abre la consola del navegador en el mismo origen donde servirás el frontend y ejecuta:

```javascript
localStorage.setItem('gameApiBase', 'http://localhost:8080/api');
location.reload();
```

Para volver al backend configurado por defecto:

```javascript
localStorage.removeItem('gameApiBase');
location.reload();
```

### 3. Servir el frontend

En otra terminal:

```bash
cd game/frontend
python -m http.server 5500
```

Abre `http://localhost:5500` en el navegador. También puedes usar cualquier otro servidor de archivos estáticos.

## Cómo jugar

1. Abre la vista **Profesor** y crea una partida.
2. Comparte el código generado con los dos equipos.
3. Cada equipo abre su pantalla, introduce el código y coloca sus ocho planetas.
4. Los equipos confirman que están preparados.
5. El profesor inicia la partida cuando ambos equipos están listos.
6. En cada turno, el equipo responde una pregunta y realiza un ataque.
7. Las respuestas correctas conceden materia oscura para comprar armas.
8. Gana el primer equipo que destruye todos los planetas rivales.

## Preguntas personalizadas

El profesor puede cargar un archivo CSV desde su panel. Se aceptan separadores por coma o punto y coma, campos entre comillas y archivos con BOM UTF-8.

El archivo debe contener siete columnas:

```csv
categoria,pregunta,opcion1,opcion2,opcion3,opcion4,correcta
Ciencias,¿Cuál es el planeta más grande?,Tierra,Júpiter,Saturno,Neptuno,2
```

`correcta` es el número de la respuesta válida, entre `1` y `4`. Las preguntas cargadas se comparten con todos los participantes de la sesión.

## API

Todos los endpoints usan el prefijo `/api/game`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/{code}` | Obtiene una partida o crea su estado inicial. |
| `PUT` | `/{code}` | Sustituye el estado completo de una partida. |
| `PATCH` | `/{code}` | Actualiza campos concretos de forma atómica. |
| `POST` | `/{code}/reset` | Reinicia la partida. |
| `POST` | `/{code}/start` | Marca la partida como iniciada. |

El estado se conserva en memoria. Las partidas se pierden cuando se reinicia el backend.

## Pruebas

Frontend:

```bash
cd game/frontend
node --test game-state.test.js
```

Backend:

```bash
cd game/backend/springboot
mvn test
```

## Docker

Para construir y ejecutar sólo el backend:

```bash
cd game/backend/springboot
docker build -t solar-system-war-backend .
docker run --rm -p 8080:8080 solar-system-war-backend
```

El frontend debe servirse por separado como contenido estático.
