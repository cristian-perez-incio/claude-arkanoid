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

function update() {
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
