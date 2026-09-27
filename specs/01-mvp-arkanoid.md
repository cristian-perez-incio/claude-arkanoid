# SPEC 01 — MVP jugable de Arkanoid

> **Status:** Approved
> **Depends on:** —
> **Date:** 2026-09-27
> **Objective:** Construir un Arkanoid jugable de un solo nivel, con pala controlable por teclado y mouse, física de rebote simple, vidas, puntaje y pantallas de victoria/derrota con reinicio.

## Scope

**In:**

- `index.html` con un `<canvas>` de 800x600px como área de juego.
- Loop de juego (`requestAnimationFrame`) que actualiza física y renderiza cada frame.
- Pala controlable por teclado (flechas / A-D) y por mouse (seguir posición X del cursor sobre el canvas).
- Una bola con velocidad constante y rebote simple: invierte `vy` al chocar con pala, bloques o techo; invierte `vx` al chocar con paredes laterales.
- Un único nivel fijo: grid de 10 columnas x 6 filas de bloques, cada fila de un color distinto (`block_red`, `block_yellow`, `block_green`, `block_cyan`, `block_magenta`, `block_hotpink`), usando `drawSprite` de `assets/spritesheet.js`.
- Sistema de vidas: 3 vidas iniciales. Al perder la bola (cae debajo de la pala) se pierde una vida y la bola se reposiciona sobre la pala con velocidad inicial.
- Puntaje: +10 puntos fijos por cada bloque roto, sin importar el color. Se muestra en pantalla durante la partida.
- Condición de victoria: se rompen los 10x6 = 60 bloques. Condición de derrota: se agotan las 3 vidas.
- Overlay de fin de partida ("¡Ganaste!" o "Game Over") con opción de reiniciar la partida completa (tecla o botón) sin recargar la página.
- Animación de explosión al romper un bloque, usando `EXPLOSION_FRAMES` y `drawFrame` de `assets/spritesheet.js`.

**Out of scope (for future specs):**

- Sonido (`assets/sounds/*.mp3` no se usan en este MVP).
- Persistencia de high scores entre sesiones (localStorage).
- Múltiples niveles o progresión de niveles.
- Pausa de partida.
- Ángulo de rebote variable según punto de impacto en la pala (física "arcade" clásica).
- Power-ups o bloques especiales (irrompibles, multi-golpe, etc).
- Versión móvil / controles táctiles.

## Data model

```js
// Estado del juego, en memoria (sin persistencia)
const state = {
  status: "playing", // 'playing' | 'won' | 'lost'
  score: 0,
  lives: 3,
  paddle: { x: 360, y: 560, width: 80, height: 16 },
  ball: { x: 400, y: 300, vx: 4, vy: -4, radius: 8 },
  bricks: [
    // { x, y, width, height, color, alive: true }
  ],
};
```

Conventions:

- Coordenadas: origen arriba-izquierda, igual que el canvas.
- Velocidades en píxeles/frame (asumiendo ~60fps vía `requestAnimationFrame`).
- Canvas fijo de 800x600px, sin escalado ni resize.
- `bricks` se genera al iniciar/reiniciar la partida: 10 columnas x 6 filas, cada bloque de 76x24px aprox. con un pequeño margen entre ellos para que el grid completo (con márgenes) quepa en 800px de ancho.
- Orden de colores por fila (de arriba a abajo): `red`, `yellow`, `green`, `cyan`, `magenta`, `hotpink`.

Esta feature no depende de ningún dato persistido; todo el estado vive en memoria y se reinicia al llamar a la función de reinicio.

## Implementation plan

1. Crear `index.html` con el `<canvas id="game" width="800" height="600">`, enlazando `assets/spritesheet.js` y `style.css` y `game.js`. Prueba manual: la página carga sin errores en consola y muestra un canvas vacío o con fondo.
2. Crear `style.css` con estilos mínimos para centrar el canvas y dar un fondo oscuro a la página.
3. En `game.js`, usar `loadSpritesheet(cb)` para esperar a que la hoja cargue, y dentro de `cb` dibujar la pala y la bola en sus posiciones iniciales usando `drawSprite`. Prueba manual: se ven la pala y la bola estáticas en el canvas.
4. Implementar el loop principal con `requestAnimationFrame`: mover la bola según `vx`/`vy` y redibujar cada frame. Prueba manual: la bola se mueve y rebota en techo y paredes laterales.
5. Implementar movimiento de la pala por teclado (flechas/A-D) y por mouse (`mousemove` sobre el canvas), con límites para no salir del canvas. Prueba manual: la pala responde a ambos inputs.
6. Implementar colisión bola-pala (rebote simple invirtiendo `vy`) y pérdida de vida cuando la bola cae debajo de la pala (reposicionar bola, decrementar `lives`, o pasar a `status: 'lost'` si `lives` llega a 0). Prueba manual: perder la bola resta una vida y la reposiciona; perder las 3 detiene el juego.
7. Generar el grid de bloques (10x6, colores por fila) y dibujarlos con `drawSprite`. Prueba manual: se ven los 60 bloques con sus colores correctos.
8. Implementar colisión bola-bloque: al chocar, invertir `vy`, marcar el bloque como no vivo, sumar 10 puntos y disparar la animación de explosión (`EXPLOSION_FRAMES`/`drawFrame`/`EXPLOSION_DURATION`) en la posición del bloque. Prueba manual: romper un bloque lo hace desaparecer, anima la explosión y suma puntaje visible en pantalla.
9. Implementar condición de victoria (todos los bloques rotos) y de derrota (vidas en 0), mostrando el overlay correspondiente y deteniendo el loop de física. Prueba manual: se puede llegar a ambos estados jugando.
10. Implementar el reinicio de partida (tecla o botón en el overlay) que resetea `state` por completo y vuelve a `status: 'playing'`. Prueba manual: tras ganar o perder, reiniciar deja el juego jugable desde cero sin recargar la página.

## Acceptance criteria

- [ ] `index.html` carga sin errores en la consola del navegador.
- [ ] La pala se mueve con flechas/A-D y también siguiendo el mouse sobre el canvas.
- [ ] La bola rebota en paredes laterales, techo y pala sin atravesarlos.
- [ ] Romper un bloque lo elimina, reproduce la animación de explosión y suma exactamente 10 puntos al puntaje mostrado en pantalla.
- [ ] Perder la bola (cae debajo de la pala) resta una vida y reposiciona la bola sobre la pala si quedan vidas.
- [ ] Al llegar a 0 vidas se muestra un overlay de "Game Over" y el juego deja de actualizar la física.
- [ ] Al romper los 60 bloques se muestra un overlay de "¡Ganaste!" y el juego deja de actualizar la física.
- [ ] Desde cualquiera de los dos overlays se puede reiniciar la partida (tecla o botón) sin recargar la página, volviendo al estado inicial (3 vidas, 0 puntos, 60 bloques).

## Decisions

- **Sí:** control dual teclado + mouse para la pala. El usuario lo pidió explícitamente por cobertura, aceptando el costo extra de código.
- **Sí:** un solo nivel fijo (10x6). Foco del MVP en que el loop completo funcione antes de invertir en progresión de niveles.
- **Sí:** rebote simple (solo invierte `vy`/`vx`), sin ángulo variable según punto de impacto. El usuario pidió explícitamente física predecible y simple, no el comportamiento "arcade" clásico de Arkanoid.
- **Sí:** puntaje fijo (10 pts) por bloque, sin variar por color. Mantiene el MVP simple; variar por color queda como posible mejora futura.
- **No:** sonido en este MVP. Los archivos en `assets/sounds/` quedan para una spec futura de audio/pulido.
- **No:** persistencia de high scores. Se descarta para no añadir localStorage/versionado de esquema en el MVP.
- **No:** pausa de partida. Fuera de alcance para mantener el MVP mínimo.
- **Sí:** archivos `index.html`, `style.css`, `game.js` en la raíz del repo. Estructura plana, sin build tools, coherente con "cero dependencias".

## What is **not** in this spec

- Sonido de eventos (rebotes, roturas, fin de partida).
- Persistencia de high scores entre sesiones.
- Múltiples niveles o progresión.
- Pausa de partida.
- Ángulo de rebote variable según punto de impacto en la pala.
- Power-ups, bloques especiales o multiplayer.
- Versión móvil o controles táctiles.

Cada uno de estos, si se implementa, va en su propia spec futura.
