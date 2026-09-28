# SPEC 02 — Progresión de niveles

> **Status:** Approved
> **Depends on:** SPEC 01
> **Date:** 2026-09-27
> **Objective:** Añadir 3 niveles con layouts de bloques distintos y dificultad creciente, jugables en secuencia sin perder puntaje ni vidas entre uno y otro.

## Scope

**In:**

- 3 niveles con layout de bloques distinto cada uno, definidos en un nuevo archivo `levels.js`.
- Al romper todos los bloques vivos de un nivel que no es el último, se entra en estado `level-complete`: se detiene el loop y se muestra un overlay "¡Nivel completado!".
- Desde el overlay `level-complete`, presionar la barra espaciadora genera el siguiente nivel, reposiciona la bola sobre la pala y reanuda el juego (`status: 'playing'`), sin resetear `score` ni `lives`.
- La velocidad de la bola aumenta un 15% en cada nivel respecto al nivel anterior (nivel 1 = velocidad base, nivel 2 = base × 1.15, nivel 3 = base × 1.15²). El signo de `vx`/`vy` se preserva, solo cambia la magnitud.
- Al romper todos los bloques del último nivel (nivel 3), se entra en `status: 'won'` igual que hoy (overlay "¡Ganaste!").
- El HUD muestra el nivel actual como `Nivel X/3`, junto al puntaje existente.
- `resetGame()` (tecla R desde `won`/`lost`) siempre vuelve al nivel 1, con `score: 0`, `lives: 3`, velocidad base.

**Out of scope (for future specs):**

- Persistencia del nivel alcanzado entre recargas de página (localStorage). Todo vive en memoria; recargar la página vuelve al nivel 1.
- Reintentar un `Game Over` desde el nivel en el que se perdió (siempre se reinicia desde el nivel 1).
- Más de 3 niveles o un editor/generador de niveles.
- Power-ups, bloques irrompibles o multi-golpe en los layouts.
- Pantalla de selección de nivel.

## Data model

```js
// levels.js
const LEVELS = [
  {
    // Nivel 1: grid completo, igual al MVP.
    rows: [
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
    ],
  },
  {
    // Nivel 2: marco (borde relleno, centro vacío).
    rows: [
      "XXXXXXXXXX",
      "X........X",
      "X........X",
      "X........X",
      "X........X",
      "XXXXXXXXXX",
    ],
  },
  {
    // Nivel 3: rombo.
    rows: [
      "....XX....",
      "...XXXX...",
      "..XXXXXX..",
      "..XXXXXX..",
      "...XXXX...",
      "....XX....",
    ],
  },
];
```

Conventions:

- Cada fila de `rows` tiene exactamente `BRICK_COLS` (10) caracteres; `'X'` = bloque vivo, `'.'` = celda vacía (no se genera bloque ahí).
- El color de cada bloque se sigue derivando de su fila usando `BRICK_ROW_COLORS` (igual que en SPEC 01): la fila 0 es `red`, la fila 1 `yellow`, etc., independientemente de cuántas celdas de esa fila estén vacías.
- `state` (en `game.js`) agrega un campo nuevo: `level: 0` (índice 0-based sobre `LEVELS`; "Nivel 1/3" en HUD es `state.level + 1`).
- `state.status` agrega un valor nuevo: `'level-complete'`, junto a los ya existentes `'playing' | 'won' | 'lost'`.
- La velocidad base de la bola (magnitud 4, como en SPEC 01) se escala por `1.15 ** state.level` cada vez que la bola se reposiciona sobre la pala (inicio de partida, inicio de nivel, o tras perder una vida dentro del mismo nivel).

## Implementation plan

1. Crear `levels.js` con la constante `LEVELS` y los 3 patrones de arriba. Enlazar `<script src="levels.js">` en `index.html`, antes de `game.js`. Prueba manual: la página sigue cargando sin errores en consola.
2. En `game.js`, agregar `level: 0` a `state` y modificar `createBricks()` para que reciba el patrón (`LEVELS[state.level].rows`) y solo genere un bloque en las celdas marcadas `'X'`, saltando las `'.'`. Prueba manual: el nivel 1 se ve igual que antes (grid completo); cambiar manualmente `state.level` a 1 o 2 en consola y recargar muestra el marco o el rombo.
3. Modificar `resetBallOnPaddle()` para aplicar el multiplicador de velocidad `1.15 ** state.level` sobre la magnitud base (4), preservando el signo actual de `vx`/`vy`. Prueba manual: en nivel 2 o 3 la bola se mueve visiblemente más rápido que en nivel 1.
4. Modificar `checkWinCondition()`: cuando todos los bloques del nivel actual están rotos, si `state.level` no es el último índice de `LEVELS`, poner `status: 'level-complete'`; si es el último, poner `status: 'won'` (comportamiento actual). Prueba manual: romper todos los bloques del nivel 1 muestra el nuevo overlay en vez de "¡Ganaste!".
5. Agregar en `drawOverlay()` la rama para `status === 'level-complete'`: mensaje "¡Nivel completado!" y texto "Presiona ESPACIO para continuar". Prueba manual: el overlay se ve con el mensaje correcto.
6. Agregar listener de `keydown` para la barra espaciadora: si `state.status === 'level-complete'`, incrementar `state.level`, regenerar `state.bricks` con `createBricks()` para el nuevo nivel, llamar `resetBallOnPaddle()` (con la nueva velocidad) y volver a `status: 'playing'`, sin tocar `score` ni `lives`. Prueba manual: tras completar el nivel 1, presionar espacio arranca el nivel 2 jugable, con el puntaje acumulado intacto.
7. Actualizar `drawHud()` para mostrar `Nivel ${state.level + 1}/${LEVELS.length}` junto al puntaje. Prueba manual: el HUD muestra "Nivel 1/3" al iniciar y el número correcto en cada nivel.
8. Actualizar `resetGame()` para volver siempre a `level: 0` además de resetear `score`, `lives` y la posición/velocidad de la bola. Prueba manual: tras un `Game Over` o una victoria, reiniciar con R vuelve al nivel 1 con el grid completo.

## Acceptance criteria

- [ ] El nivel 1 se ve idéntico al grid 10x6 completo de SPEC 01.
- [ ] Al romper todos los bloques del nivel 1 se detiene el juego y se muestra el overlay "¡Nivel completado!", sin perder vidas ni puntaje.
- [ ] Presionar la barra espaciadora en el overlay "¡Nivel completado!" arranca el nivel 2 con su layout de marco (borde relleno, centro vacío) y la bola visiblemente más rápida que en el nivel 1.
- [ ] Al completar el nivel 2, el nivel 3 arranca con el layout de rombo y una velocidad aún mayor que la del nivel 2.
- [ ] Al romper todos los bloques del nivel 3 se muestra el overlay "¡Ganaste!" (no "¡Nivel completado!").
- [ ] El HUD muestra `Nivel X/3` con el número correcto durante toda la partida.
- [ ] Perder todas las vidas en cualquier nivel muestra "Game Over"; presionar R reinicia siempre en el nivel 1, con `score: 0`, `lives: 3` y velocidad base.
- [ ] Perder una vida dentro de un nivel (sin llegar a 0) reposiciona la bola sobre la pala manteniendo la velocidad correspondiente al nivel actual (no vuelve a la velocidad base del nivel 1).

## Decisions

- **Sí:** 3 niveles con layouts distintos definidos a mano (grid completo, marco, rombo). El usuario lo pidió explícitamente para tener control creativo sobre los patrones, priorizando esto sobre generación procedural.
- **Sí:** archivo nuevo `levels.js` en vez de meter los patrones dentro de `game.js`. Mantiene `game.js` enfocado en lógica y dinámica del juego, separado del contenido/datos de los niveles.
- **Sí:** la velocidad de la bola aumenta 15% por nivel. Da sensación de dificultad creciente además del cambio de layout.
- **Sí:** overlay intermedio "¡Nivel completado!" con avance manual (barra espaciadora), en vez de transición instantánea. Le da al jugador un respiro visible entre niveles y confirma el progreso.
- **Sí:** tecla distinta (espacio) para avanzar de nivel, separada de R (reinicio total de partida). Evita ambigüedad entre "continuar" y "reiniciar todo".
- **Sí:** vidas y puntaje se mantienen entre niveles; solo se resetean por completo con R desde `won`/`lost`. Consistente con la idea de que los niveles son progresión dentro de la misma partida, no partidas independientes.
- **No:** persistencia del nivel alcanzado (localStorage). Se descarta para esta spec; el resto del estado tampoco persiste hoy, y agregarla introduciría versionado de esquema fuera de alcance.
- **No:** reintentar `Game Over` desde el nivel actual. Se decide que perder todas las vidas siempre vuelve al nivel 1, manteniendo el comportamiento de `resetGame()` simple y predecible.

## What is **not** in this spec

- Persistencia del nivel entre recargas de página.
- Reintento de `Game Over` desde el nivel en que se perdió.
- Más de 3 niveles, editor de niveles o generación procedural.
- Power-ups o bloques especiales en los layouts.
- Pantalla de selección de nivel.

Cada uno de estos, si se implementa, va en su propia spec futura.
