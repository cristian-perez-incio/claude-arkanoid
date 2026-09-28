const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

const SOUNDS = {
  bounce: new Audio( 'assets/sounds/ball-bounce.mp3' ),
  break: new Audio( 'assets/sounds/break-sound.mp3' ),
};

function playSound( name ) {
  const sound = SOUNDS[ name ].cloneNode();
  sound.play().catch( () => {} );
}

const state = {
  status: 'playing', // 'playing' | 'level-complete' | 'won' | 'lost'
  score: 0,
  lives: 3,
  level: 0,
  paddle: { x: 360, y: 560, width: 80, height: 16 },
  ball: { x: 400, y: 300, vx: 4, vy: -4, radius: 8 },
  bricks: [],
};

const PADDLE_SPEED = 6;
const keys = { left: false, right: false };

window.addEventListener( 'keydown', ( e ) => {
  if ( e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' ) keys.left = true;
  if ( e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' ) keys.right = true;

  if ( ( e.key === 'r' || e.key === 'R' ) && state.status !== 'playing' ) {
    resetGame();
  }

  if ( e.key === ' ' && state.status === 'level-complete' ) {
    state.level += 1;
    state.bricks = createBricks();
    resetBallOnPaddle();
    state.status = 'playing';
  }
} );

window.addEventListener( 'keyup', ( e ) => {
  if ( e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' ) keys.left = false;
  if ( e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' ) keys.right = false;
} );

canvas.addEventListener( 'mousemove', ( e ) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  state.paddle.x = clampPaddleX( mouseX - state.paddle.width / 2 );
} );

function clampPaddleX( x ) {
  return Math.max( 0, Math.min( canvas.width - state.paddle.width, x ) );
}

function updatePaddle() {
  if ( keys.left ) state.paddle.x -= PADDLE_SPEED;
  if ( keys.right ) state.paddle.x += PADDLE_SPEED;
  state.paddle.x = clampPaddleX( state.paddle.x );
}

const BALL_BASE_SPEED = 4;

function resetBallOnPaddle() {
  const ball = state.ball;
  ball.x = state.paddle.x + state.paddle.width / 2;
  ball.y = state.paddle.y - ball.radius;

  const speed = BALL_BASE_SPEED * ( 1.15 ** state.level );
  ball.vx = Math.sign( ball.vx ) * speed;
  ball.vy = Math.sign( ball.vy ) * speed;
}

function checkPaddleCollision() {
  const ball = state.ball;
  const paddle = state.paddle;

  if (
    ball.vy > 0 &&
    ball.y + ball.radius >= paddle.y &&
    ball.y + ball.radius <= paddle.y + paddle.height &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width
  ) {
    ball.vy *= -1;
    playSound( 'bounce' );
  }
}

function checkBallOutOfBounds() {
  if ( state.ball.y - state.ball.radius > canvas.height ) {
    state.lives -= 1;
    if ( state.lives <= 0 ) {
      state.status = 'lost';
    } else {
      resetBallOnPaddle();
    }
  }
}

function update() {
  updatePaddle();

  const ball = state.ball;

  ball.x += ball.vx;
  ball.y += ball.vy;

  if ( ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width ) {
    ball.vx *= -1;
    playSound( 'bounce' );
  }
  if ( ball.y - ball.radius < 0 ) {
    ball.vy *= -1;
    playSound( 'bounce' );
  }

  checkPaddleCollision();
  checkBrickCollisions();
  checkBallOutOfBounds();
  checkWinCondition();
}

function checkWinCondition() {
  if ( state.bricks.every( ( brick ) => !brick.alive ) ) {
    state.status = state.level < LEVELS.length - 1 ? 'level-complete' : 'won';
  }
}

const BRICK_ROWS = 6;
const BRICK_COLS = 10;
const BRICK_WIDTH = 76;
const BRICK_HEIGHT = 24;
const BRICK_MARGIN = 4;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = ( canvas.width - ( BRICK_COLS * BRICK_WIDTH + ( BRICK_COLS - 1 ) * BRICK_MARGIN ) ) / 2;
const BRICK_ROW_COLORS = [ 'red', 'yellow', 'green', 'cyan', 'magenta', 'hotpink' ];

function createBricks( rows = LEVELS[ state.level ].rows ) {
  const bricks = [];
  for ( let row = 0; row < BRICK_ROWS; row++ ) {
    for ( let col = 0; col < BRICK_COLS; col++ ) {
      if ( rows[ row ][ col ] !== 'X' ) continue;

      bricks.push( {
        x: BRICK_OFFSET_LEFT + col * ( BRICK_WIDTH + BRICK_MARGIN ),
        y: BRICK_OFFSET_TOP + row * ( BRICK_HEIGHT + BRICK_MARGIN ),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        color: BRICK_ROW_COLORS[ row ],
        alive: true,
      } );
    }
  }
  return bricks;
}

state.bricks = createBricks();
state.explosions = [];

function resetGame() {
  state.status = 'playing';
  state.score = 0;
  state.lives = 3;
  state.paddle.x = 360;
  state.paddle.y = 560;
  state.ball.x = 400;
  state.ball.y = 300;
  state.ball.vx = 4;
  state.ball.vy = -4;
  state.bricks = createBricks();
  state.explosions = [];
}

function checkBrickCollisions() {
  const ball = state.ball;

  for ( const brick of state.bricks ) {
    if ( !brick.alive ) continue;

    if (
      ball.x + ball.radius > brick.x &&
      ball.x - ball.radius < brick.x + brick.width &&
      ball.y + ball.radius > brick.y &&
      ball.y - ball.radius < brick.y + brick.height
    ) {
      brick.alive = false;
      ball.vy *= -1;
      state.score += 10;
      spawnExplosion( brick );
      playSound( 'break' );
      break;
    }
  }
}

function spawnExplosion( brick ) {
  state.explosions.push( {
    frames: EXPLOSION_FRAMES[ brick.color ],
    x: brick.x,
    y: brick.y,
    width: brick.width,
    height: brick.height,
    startTime: performance.now(),
  } );
}

function drawExplosions() {
  const now = performance.now();

  state.explosions = state.explosions.filter( ( explosion ) => {
    const elapsed = now - explosion.startTime;
    const frameDuration = EXPLOSION_DURATION / explosion.frames.length;
    const frameIndex = Math.floor( elapsed / frameDuration );

    if ( frameIndex >= explosion.frames.length ) return false;

    drawFrame( ctx, explosion.frames[ frameIndex ], explosion.x, explosion.y, explosion.width, explosion.height );
    return true;
  } );
}

const RETRO_FONT = "'Press Start 2P', monospace";

const LIFE_ICON_SIZE = 16;
const LIFE_ICON_GAP = 6;

function drawHud() {
  ctx.fillStyle = '#fff';
  ctx.font = `14px ${ RETRO_FONT }`;
  ctx.fillText( `Puntaje: ${ state.score }`, 16, 28 );

  const iconsWidth = state.lives * LIFE_ICON_SIZE + ( state.lives - 1 ) * LIFE_ICON_GAP;
  let iconX = canvas.width - 16 - iconsWidth;
  const iconY = 16;

  for ( let i = 0; i < state.lives; i++ ) {
    drawSprite( ctx, 'ball', iconX, iconY, LIFE_ICON_SIZE, LIFE_ICON_SIZE );
    iconX += LIFE_ICON_SIZE + LIFE_ICON_GAP;
  }
}

function drawOverlay() {
  if ( state.status === 'playing' ) return;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect( 0, 0, canvas.width, canvas.height );

  const messages = {
    'level-complete': '¡Nivel completado!',
    won: '¡Ganaste!',
    lost: 'Game Over',
  };
  const message = messages[ state.status ];
  const hint = state.status === 'level-complete' ? 'Presiona ESPACIO para continuar' : 'Presiona R para reiniciar';

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.font = `32px ${ RETRO_FONT }`;
  ctx.fillText( message, canvas.width / 2, canvas.height / 2 - 20 );

  ctx.font = `14px ${ RETRO_FONT }`;
  ctx.fillText( hint, canvas.width / 2, canvas.height / 2 + 40 );
  ctx.textAlign = 'left';
}

function draw() {
  ctx.clearRect( 0, 0, canvas.width, canvas.height );

  for ( const brick of state.bricks ) {
    if ( !brick.alive ) continue;
    drawSprite( ctx, `block_${ brick.color }`, brick.x, brick.y, brick.width, brick.height );
  }

  drawSprite( ctx, 'paddle', state.paddle.x, state.paddle.y, state.paddle.width, state.paddle.height );
  drawSprite( ctx, 'ball', state.ball.x - state.ball.radius, state.ball.y - state.ball.radius, state.ball.radius * 2, state.ball.radius * 2 );

  drawExplosions();
  drawHud();
  drawOverlay();
}

function loop() {
  if ( state.status === 'playing' ) {
    update();
  }
  draw();
  requestAnimationFrame( loop );
}

loadSpritesheet( loop );
