const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

const state = {
  status: 'playing', // 'playing' | 'won' | 'lost'
  score: 0,
  lives: 3,
  paddle: { x: 360, y: 560, width: 80, height: 16 },
  ball: { x: 400, y: 300, vx: 4, vy: -4, radius: 8 },
  bricks: [],
};

const PADDLE_SPEED = 6;
const keys = { left: false, right: false };

window.addEventListener( 'keydown', ( e ) => {
  if ( e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' ) keys.left = true;
  if ( e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' ) keys.right = true;
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

function resetBallOnPaddle() {
  const ball = state.ball;
  ball.x = state.paddle.x + state.paddle.width / 2;
  ball.y = state.paddle.y - ball.radius;
  ball.vx = 4;
  ball.vy = -4;
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
  }
  if ( ball.y - ball.radius < 0 ) {
    ball.vy *= -1;
  }

  checkPaddleCollision();
  checkBrickCollisions();
  checkBallOutOfBounds();
}

const BRICK_ROWS = 6;
const BRICK_COLS = 10;
const BRICK_WIDTH = 76;
const BRICK_HEIGHT = 24;
const BRICK_MARGIN = 4;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = ( canvas.width - ( BRICK_COLS * BRICK_WIDTH + ( BRICK_COLS - 1 ) * BRICK_MARGIN ) ) / 2;
const BRICK_ROW_COLORS = [ 'red', 'yellow', 'green', 'cyan', 'magenta', 'hotpink' ];

function createBricks() {
  const bricks = [];
  for ( let row = 0; row < BRICK_ROWS; row++ ) {
    for ( let col = 0; col < BRICK_COLS; col++ ) {
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

function drawHud() {
  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.fillText( `Puntaje: ${ state.score }`, 16, 28 );
  ctx.fillText( `Vidas: ${ state.lives }`, canvas.width - 120, 28 );
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
}

function loop() {
  update();
  draw();
  requestAnimationFrame( loop );
}

loadSpritesheet( loop );
