# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Arkanoid hecho con HTML, CSS y JavaScript vanilla — cero dependencias. Aún no está implementado: por ahora el repo solo contiene assets (`assets/spritesheet-breakout.png`, `assets/spritesheet.js`, `assets/sounds/*.mp3`) y no hay código del juego, ni `index.html`, ni herramientas de build, ni historial de git. Tampoco es todavía un repositorio git.

## Flujo de trabajo spec-driven

Este repo usa un flujo de specs en dos pasos (skills provenientes de `Klerith/fernando-skills`, registradas en `skills-lock.json`, enlazadas por symlink desde `.claude/skills/` hacia `.agents/skills/`):

- `/spec <descripción>` — aclara una funcionalidad mediante preguntas puntuales y luego escribe `specs/NN-slug.md` (el estado arranca como `Draft`/`Borrador`).
- `/spec-impl <NN-slug>` — solo continúa si el estado de la spec significa `Approved`/`Aprobado`; si no, se detiene. Al aprobarse, crea/cambia a la rama `spec-NN-slug` e implementa el plan paso a paso, pausando después de cada paso para revisión. La creación automática de rama se controla con `specs/.spec-config.yml` (`AutoCreateBranch`, por defecto `true`).

No escribas código del juego de forma improvisada fuera de este flujo cuando el usuario lo esté siguiendo: primero revisa si existe una spec aprobada en `specs/`. Todavía no existe el directorio `specs/`.

## API del spritesheet (`assets/spritesheet.js`)

Helper ya existente para dibujar desde `assets/spritesheet-breakout.png`. Cualquier código de renderizado debería reutilizar esto en vez de recalcular coordenadas de sprites:

- `loadSpritesheet(cb)` — carga y cachea la hoja en un canvas offscreen; llama a `cb` cuando está lista (se puede invocar varias veces, encola callbacks hasta que termine de cargar).
- `drawSprite(ctx, name, x, y, w, h)` — dibuja un sprite por nombre (`'paddle'`, `'ball'`, o `'block_<color>'` para `block_gray`, `block_red`, `block_yellow`, `block_cyan`, `block_magenta`, `block_hotpink`, `block_green`) en el destino `x, y, w, h`.
- `drawFrame(ctx, frame, x, y, w, h)` — dibuja un frame crudo `{sx, sy, sw, sh}`, usado para animaciones como las explosiones (`EXPLOSION_FRAMES[color]`, 4 frames por color, `EXPLOSION_DURATION = 150` ms).
