const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const $score = document.getElementById('score');
const $lives = document.getElementById('lives');

function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
addEventListener('resize', resize);
resize();

const state = { x: innerWidth / 2, y: innerHeight - 80, w: 44, h: 24, speed: 6, vx: 0, score: 0, lives: 3, items: [], t: 0, gameOver: false };
const keys = new Set();
addEventListener('keydown', (e) => keys.add(e.code));
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('touchstart', (e) => { const x = e.touches[0].clientX; state.vx = x < innerWidth / 2 ? -1 : 1; }, { passive: true });
addEventListener('touchmove', (e) => { const x = e.touches[0].clientX; state.vx = x < innerWidth / 2 ? -1 : 1; }, { passive: true });
addEventListener('touchend', () => { state.vx = 0; }, { passive: true });

function spawn() {
  const good = Math.random() < 0.62;
  state.items.push({ x: 20 + Math.random() * (innerWidth - 40), y: -20, r: 16, vy: 2.5 + Math.random() * 2, good });
}

function update() {
  if (state.gameOver) return;
  state.t++;
  if (state.t % 28 === 0) spawn();

  let dir = state.vx;
  if (keys.has('ArrowLeft') || keys.has('KeyA')) dir = -1;
  if (keys.has('ArrowRight') || keys.has('KeyD')) dir = 1;

  state.x += dir * state.speed;
  state.x = Math.max(state.w / 2, Math.min(innerWidth - state.w / 2, state.x));

  for (const it of state.items) it.y += it.vy;

  for (let i = state.items.length - 1; i >= 0; i--) {
    const it = state.items[i];
    const hit = Math.abs(it.x - state.x) < (state.w / 2 + it.r * 0.6) && Math.abs(it.y - state.y) < (state.h / 2 + it.r * 0.8);
    if (hit) {
      if (it.good) state.score += 10;
      else state.lives -= 1;
      state.items.splice(i, 1);
      continue;
    }
    if (it.y > innerHeight + 30) {
      if (it.good) state.score = Math.max(0, state.score - 5);
      state.items.splice(i, 1);
    }
  }

  if (state.lives <= 0) state.gameOver = true;
  $score.textContent = String(state.score);
  $lives.textContent = String(state.lives);
}

function draw() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  ctx.strokeStyle = 'rgba(148,163,184,.16)';
  for (let i = 1; i < 4; i++) {
    const x = (i * innerWidth) / 4;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, innerHeight);
    ctx.stroke();
  }

  ctx.fillStyle = '#22c55e';
  ctx.fillRect(state.x - state.w / 2, state.y - state.h / 2, state.w, state.h);
  ctx.fillStyle = '#bbf7d0';
  ctx.fillRect(state.x - 8, state.y - state.h / 2 - 8, 16, 6);

  for (const it of state.items) {
    ctx.font = '22px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(it.good ? '📄' : '💸', it.x, it.y);
  }

  if (state.gameOver) {
    ctx.fillStyle = 'rgba(2,6,23,.75)';
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 30px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Fin de búsqueda 😅', innerWidth / 2, innerHeight / 2 - 20);
    ctx.font = '20px system-ui';
    ctx.fillText(`Score: ${state.score}`, innerWidth / 2, innerHeight / 2 + 16);
    ctx.font = '16px system-ui';
    ctx.fillText('Tocá para reintentar', innerWidth / 2, innerHeight / 2 + 46);
  }
}

addEventListener('click', () => {
  if (!state.gameOver) return;
  state.score = 0;
  state.lives = 3;
  state.items = [];
  state.gameOver = false;
  $score.textContent = '0';
  $lives.textContent = '3';
});

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
