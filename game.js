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
}

function draw() {
  ctx.clearRect( 0, 0, canvas.width, canvas.height );

  drawSprite( ctx, 'paddle', state.paddle.x, state.paddle.y, state.paddle.width, state.paddle.height );
  drawSprite( ctx, 'ball', state.ball.x - state.ball.radius, state.ball.y - state.ball.radius, state.ball.radius * 2, state.ball.radius * 2 );
}

function loop() {
  update();
  draw();
  requestAnimationFrame( loop );
}

loadSpritesheet( loop );
