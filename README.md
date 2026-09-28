# Juego de Arkanoid

Arkanoid jugable con HTML, CSS y JavaScript vanilla — cero dependencias, sin build tools.

## Cómo jugar

Abrí `index.html` en el navegador (o serví la carpeta con cualquier servidor estático).

- **Mover la pala:** flechas ←/→, teclas A/D, o moviendo el mouse sobre el canvas.
- **Avanzar de nivel:** ESPACIO cuando aparece "¡Nivel completado!".
- **Reiniciar partida:** R cuando aparece "¡Ganaste!" o "Game Over".

3 niveles con layouts de bloques distintos y velocidad de bola creciente (+15% por nivel). 3 vidas, +10 puntos por bloque roto.

## Estructura

- `index.html` — canvas de 800x600 y carga de scripts.
- `game.js` — loop del juego, física, input, HUD y overlays.
- `levels.js` — definición de los 3 niveles.
- `style.css` — estilos de la página.
- `assets/` — spritesheet, sonidos y el helper `spritesheet.js` para dibujar sprites.

## Desarrollo

Este proyecto sigue un flujo spec-driven (`/spec` y `/spec-impl`, ver `specs/` y `CLAUDE.md`) para añadir nuevas funcionalidades.
