(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const CANVAS_W = canvas.width;
  const CANVAS_H = canvas.height;

  const HORIZON_Y = CANVAS_H * 0.12;
  const TOP_HALF_WIDTH = CANVAS_W * 0.12;
  const BOTTOM_HALF_WIDTH = CANVAS_W * 0.62;
  const CENTER_X = CANVAS_W / 2;
  const BASE_UNIT = 3.1;
  const MIN_SCALE = 0.22;

  const PLAYER_MIN_Y = CANVAS_H * 0.52;
  const PLAYER_MAX_Y = CANVAS_H * 0.93;
  const PLAYER_SPEED = 340; // px/sec via keyboard

  const LEVEL_TIME = 50; // seconds to complete the run
  const SPAWN_INTERVAL_BASE = 1.9;
  const TREE_INTERVAL_BASE = 1.35;
  const LAMP_INTERVAL_BASE = 1.5;

  const TARGET_KEYS = Object.keys(Sprites.TARGET_TYPES);

  // ---------------------------------------------------------------- state --
  let state = 'menu'; // 'menu' | 'playing' | 'ended'
  let lastTs = 0;
  let elapsed = 0;
  let difficultyRate = 1;

  let player = { x: CENTER_X, y: PLAYER_MAX_Y * 0.95, vx: 0, vy: 0 };
  let desired = { x: player.x, y: player.y, active: false };

  let targets = [];
  let trees = [];
  let lamps = [];
  let particles = [];

  let spawnTimer = 0;
  let treeTimer = 0;
  let lampTimer = 0;

  let flags = { hitTree: false, hitCorrect: false, wrongHit: null, timeUp: false };
  let shake = 0;

  const keys = new Set();

  // ------------------------------------------------------------- helpers --
  function roadHalfWidthAt(y) {
    const t = clamp((y - HORIZON_Y) / (CANVAS_H - HORIZON_Y), 0, 1);
    return TOP_HALF_WIDTH + t * (BOTTOM_HALF_WIDTH - TOP_HALF_WIDTH);
  }
  function roadLeftAt(y) { return CENTER_X - roadHalfWidthAt(y); }
  function roadRightAt(y) { return CENTER_X + roadHalfWidthAt(y); }
  function scaleAt(y) {
    const t = clamp((y - HORIZON_Y) / (CANVAS_H - HORIZON_Y), 0, 1);
    return MIN_SCALE + t * (1 - MIN_SCALE);
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function advanceT(t, dt, speedMul) {
    const ease = 0.28 + 1.9 * t;
    return t + dt * 0.5 * speedMul * ease;
  }

  function yFromT(t) { return HORIZON_Y + t * (CANVAS_H - HORIZON_Y); }

  // -------------------------------------------------------------- input ---
  function clientToCanvas(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * CANVAS_W;
    const y = ((clientY - rect.top) / rect.height) * CANVAS_H;
    return { x, y };
  }

  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    desired.active = true;
    const p = clientToCanvas(e.clientX, e.clientY);
    desired.x = p.x;
    desired.y = p.y;
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!desired.active) return;
    const p = clientToCanvas(e.clientX, e.clientY);
    desired.x = p.x;
    desired.y = p.y;
  });
  window.addEventListener('pointerup', () => { desired.active = false; });
  window.addEventListener('pointercancel', () => { desired.active = false; });

  window.addEventListener('keydown', (e) => {
    keys.add(e.key.toLowerCase());
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) e.preventDefault();
  }, { passive: false });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

  // ------------------------------------------------------------ spawning --
  function spawnTarget() {
    const key = pick(TARGET_KEYS);
    const def = Sprites.TARGET_TYPES[key];
    const laneJitter = rand(-0.14, 0.14);
    targets.push({
      id: Math.random(),
      key,
      def,
      t: 0,
      laneFrac: -0.5 + laneJitter, // negative = left/oncoming lane
      hit: false,
    });
  }

  function spawnTree() {
    trees.push({ id: Math.random(), t: 0, jitter: rand(-0.08, 0.05), hit: false });
  }

  function spawnLamp() {
    lamps.push({ id: Math.random(), t: 0, jitter: rand(-0.04, 0.06) });
  }

  function spawnParticle(x, y, text, color) {
    particles.push({ x, y, text, color, life: 1 });
  }

  // ------------------------------------------------------------- reset ----
  function resetGame() {
    state = 'playing';
    elapsed = 0;
    difficultyRate = 1;
    player.x = CENTER_X + roadHalfWidthAt(PLAYER_MAX_Y) * 0.5;
    player.y = PLAYER_MAX_Y * 0.95;
    desired.x = player.x; desired.y = player.y; desired.active = false;
    targets = []; trees = []; lamps = []; particles = [];
    spawnTimer = 0; treeTimer = 0.4; lampTimer = 0.2;
    flags = { hitTree: false, hitCorrect: false, wrongHit: null, timeUp: false };
    shake = 0;
    updateHud();
    hideOverlay();
  }

  // -------------------------------------------------------------- update --
  function update(dt) {
    if (state !== 'playing') { updateAmbient(dt); return; }

    elapsed += dt;
    difficultyRate = 1 + Math.min(elapsed / 90, 0.6);

    // player movement — keyboard
    let mx = 0, my = 0;
    if (keys.has('arrowleft') || keys.has('a')) mx -= 1;
    if (keys.has('arrowright') || keys.has('d')) mx += 1;
    if (keys.has('arrowup') || keys.has('w')) my -= 1;
    if (keys.has('arrowdown') || keys.has('s')) my += 1;
    if (mx || my) {
      const len = Math.hypot(mx, my) || 1;
      player.x += (mx / len) * PLAYER_SPEED * dt;
      player.y += (my / len) * PLAYER_SPEED * dt;
      desired.x = player.x; desired.y = player.y;
    } else if (desired.active) {
      player.x = lerp(player.x, desired.x, Math.min(1, dt * 14));
      player.y = lerp(player.y, desired.y, Math.min(1, dt * 14));
    }

    // clamp within road + shoulder margin (allow reaching trees/lamps)
    player.y = clamp(player.y, PLAYER_MIN_Y, PLAYER_MAX_Y);
    const shoulderMargin = 46;
    player.x = clamp(player.x, roadLeftAt(player.y) - shoulderMargin, roadRightAt(player.y) + shoulderMargin);

    // spawn timers
    spawnTimer -= dt; treeTimer -= dt; lampTimer -= dt;
    if (spawnTimer <= 0) { spawnTarget(); spawnTimer = SPAWN_INTERVAL_BASE / difficultyRate * rand(0.85, 1.15); }
    if (treeTimer <= 0) { spawnTree(); treeTimer = TREE_INTERVAL_BASE / difficultyRate * rand(0.8, 1.2); }
    if (lampTimer <= 0) { spawnLamp(); lampTimer = LAMP_INTERVAL_BASE / difficultyRate * rand(0.8, 1.2); }

    // advance world entities
    for (const t of targets) t.t = advanceT(t.t, dt, difficultyRate);
    for (const t of trees) t.t = advanceT(t.t, dt, difficultyRate);
    for (const l of lamps) l.t = advanceT(l.t, dt, difficultyRate);

    targets = targets.filter((t) => t.t < 1.12);
    trees = trees.filter((t) => t.t < 1.12);
    lamps = lamps.filter((l) => l.t < 1.12);

    checkCollisions();

    particles = particles.filter((p) => p.life > 0);
    for (const p of particles) { p.life -= dt * 0.9; p.y -= dt * 24; }

    if (shake > 0) shake = Math.max(0, shake - dt * 3);

    if (flags.wrongHit) { endGame(false); return; }
    if (flags.hitTree && flags.hitCorrect) { endGame(true); return; }
    if (elapsed >= LEVEL_TIME) { flags.timeUp = true; endGame(false); return; }

    updateHud();
  }

  function updateAmbient(dt) {
    treeTimer -= dt; lampTimer -= dt;
    if (treeTimer <= 0) { spawnTree(); treeTimer = TREE_INTERVAL_BASE * rand(0.9, 1.3); }
    if (lampTimer <= 0) { spawnLamp(); lampTimer = LAMP_INTERVAL_BASE * rand(0.9, 1.3); }
    for (const t of trees) t.t = advanceT(t.t, dt, 0.6);
    for (const l of lamps) l.t = advanceT(l.t, dt, 0.6);
    trees = trees.filter((t) => t.t < 1.12);
    lamps = lamps.filter((l) => l.t < 1.12);
  }

  function entityScreenPos(entity, laneFrac) {
    const y = yFromT(entity.t);
    const halfW = roadHalfWidthAt(y);
    const x = CENTER_X + laneFrac * halfW;
    return { x, y, scale: scaleAt(y) };
  }

  function checkCollisions() {
    const pr = Sprites.bmw.gridW * BASE_UNIT * 0.5 * 0.72;

    for (const tr of trees) {
      if (tr.hit) continue;
      const pos = entityScreenPos(tr, -1 + tr.jitter - 0.06);
      const r = Sprites.tree.gridW * BASE_UNIT * pos.scale * 0.5 * 0.75 + pr;
      if (Math.hypot(pos.x - player.x, pos.y - player.y) < r) {
        tr.hit = true;
        if (!flags.hitTree) {
          flags.hitTree = true;
          spawnParticle(pos.x, pos.y - 20, '🌳 Đã tông cây!', '#3ddc84');
          shake = 1;
        }
      }
    }

    for (const tg of targets) {
      if (tg.hit) continue;
      const pos = entityScreenPos(tg, tg.laneFrac);
      const r = tg.def.sprite.gridW * BASE_UNIT * pos.scale * 0.5 * 0.7 + pr;
      if (Math.hypot(pos.x - player.x, pos.y - player.y) < r) {
        tg.hit = true;
        if (tg.def.correct) {
          flags.hitCorrect = true;
          spawnParticle(pos.x, pos.y - 20, `${tg.def.icon} Trúng mục tiêu!`, '#3ddc84');
          shake = 1;
        } else {
          flags.wrongHit = tg.def;
          spawnParticle(pos.x, pos.y - 20, `💥 Tông nhầm ${tg.def.name}!`, '#ff5470');
          shake = 1.6;
        }
      }
    }
  }

  function endGame(win) {
    state = 'ended';
    updateHud();
    const title = document.getElementById('overlay-title');
    const text = document.getElementById('overlay-text');
    title.className = win ? 'win' : 'lose';
    if (win) {
      title.textContent = '🏆 Chiến thắng!';
      text.innerHTML = 'Bạn đã tông trúng <b>cây bên đường</b> và <b>xe của bố chở con gái</b>. Hoàn hảo!';
    } else if (flags.wrongHit) {
      title.textContent = '💥 Thua cuộc!';
      text.innerHTML = `Bạn đã tông nhầm <b>${flags.wrongHit.name}</b>. Chỉ được tông cây và xe của bố chở con gái thôi!`;
    } else {
      title.textContent = '⏱️ Thua cuộc!';
      const missing = [];
      if (!flags.hitTree) missing.push('tông cây');
      if (!flags.hitCorrect) missing.push('tông xe của bố chở con gái');
      text.innerHTML = `Hết đường mà bạn chưa hoàn thành: <b>${missing.join(' và ')}</b>.`;
    }
    document.getElementById('btn-start').textContent = '↺ Chơi lại';
    showOverlay();
  }

  // -------------------------------------------------------------- draw ----
  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, HORIZON_Y + 40);
    sky.addColorStop(0, '#8fd3f4');
    sky.addColorStop(1, '#bfe8c9');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_W, HORIZON_Y + 40);

    const grassL = ctx.createLinearGradient(0, HORIZON_Y, 0, CANVAS_H);
    grassL.addColorStop(0, '#79b463');
    grassL.addColorStop(1, '#3f8a4a');
    ctx.fillStyle = grassL;
    ctx.fillRect(0, HORIZON_Y, CANVAS_W, CANVAS_H - HORIZON_Y);
  }

  function drawRoad() {
    ctx.beginPath();
    ctx.moveTo(CENTER_X - TOP_HALF_WIDTH, HORIZON_Y);
    ctx.lineTo(CENTER_X - BOTTOM_HALF_WIDTH, CANVAS_H);
    ctx.lineTo(CENTER_X + BOTTOM_HALF_WIDTH, CANVAS_H);
    ctx.lineTo(CENTER_X + TOP_HALF_WIDTH, HORIZON_Y);
    ctx.closePath();
    const roadGrad = ctx.createLinearGradient(0, HORIZON_Y, 0, CANVAS_H);
    roadGrad.addColorStop(0, '#4a4f57');
    roadGrad.addColorStop(1, '#33363c');
    ctx.fillStyle = roadGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#14161a';
    ctx.stroke();

    // dashed center lane divider (scrolling)
    ctx.strokeStyle = '#f4e04d';
    const dashCount = 14;
    const cycle = (elapsed * 90) % (CANVAS_H / dashCount);
    for (let i = -1; i < dashCount + 1; i++) {
      const y0 = i * (CANVAS_H / dashCount) + cycle;
      const y1 = y0 + (CANVAS_H / dashCount) * 0.45;
      if (y1 < HORIZON_Y) continue;
      const cy0 = clamp(y0, HORIZON_Y, CANVAS_H);
      const cy1 = clamp(y1, HORIZON_Y, CANVAS_H);
      const w = 2 + 4 * scaleAt((cy0 + cy1) / 2);
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(CENTER_X, cy0);
      ctx.lineTo(CENTER_X, cy1);
      ctx.stroke();
    }

    // outer edge lines (white)
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CENTER_X - TOP_HALF_WIDTH, HORIZON_Y);
    ctx.lineTo(CENTER_X - BOTTOM_HALF_WIDTH, CANVAS_H);
    ctx.moveTo(CENTER_X + TOP_HALF_WIDTH, HORIZON_Y);
    ctx.lineTo(CENTER_X + BOTTOM_HALF_WIDTH, CANVAS_H);
    ctx.stroke();
  }

  function drawShadow(x, y, w) {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(x, y + 4, w * 0.5, w * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawEntities() {
    const drawList = [];

    for (const tr of trees) {
      const pos = entityScreenPos(tr, -1 + tr.jitter - 0.06);
      drawList.push({ y: pos.y, draw: () => {
        drawShadow(pos.x, pos.y, Sprites.tree.gridW * BASE_UNIT * pos.scale);
        Sprites.draw(ctx, Sprites.tree, pos.x, pos.y, BASE_UNIT * pos.scale, false);
      }});
    }
    for (const l of lamps) {
      const pos = entityScreenPos(l, 1 + l.jitter + 0.08);
      drawList.push({ y: pos.y, draw: () => {
        drawShadow(pos.x, pos.y, Sprites.lamp.gridW * BASE_UNIT * pos.scale);
        Sprites.draw(ctx, Sprites.lamp, pos.x, pos.y, BASE_UNIT * pos.scale, false);
      }});
    }
    for (const tg of targets) {
      const pos = entityScreenPos(tg, tg.laneFrac);
      drawList.push({ y: pos.y, draw: () => {
        drawShadow(pos.x, pos.y, tg.def.sprite.gridW * BASE_UNIT * pos.scale);
        Sprites.draw(ctx, tg.def.sprite, pos.x, pos.y, BASE_UNIT * pos.scale, false);
        if (pos.scale > 0.4) {
          ctx.font = `${Math.round(14 * pos.scale)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(tg.def.icon, pos.x, pos.y - tg.def.sprite.gridH * BASE_UNIT * pos.scale - 4);
        }
      }});
    }

    // player drawn at its own y among the sorted list
    drawList.push({ y: player.y, draw: () => {
      drawShadow(player.x, player.y, Sprites.bmw.gridW * BASE_UNIT);
      Sprites.draw(ctx, Sprites.bmw, player.x, player.y, BASE_UNIT, false);
    }});

    drawList.sort((a, b) => a.y - b.y);
    for (const item of drawList) item.draw();
  }

  function drawParticles() {
    ctx.textAlign = 'center';
    ctx.font = 'bold 15px sans-serif';
    for (const p of particles) {
      ctx.globalAlpha = clamp(p.life, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, p.x, p.y);
      ctx.globalAlpha = 1;
    }
  }

  function render() {
    ctx.save();
    if (shake > 0) {
      ctx.translate(rand(-1, 1) * shake * 5, rand(-1, 1) * shake * 5);
    }
    drawBackground();
    drawRoad();
    drawEntities();
    drawParticles();
    ctx.restore();
  }

  // --------------------------------------------------------------- HUD ----
  function updateHud() {
    const checkTree = document.getElementById('check-tree');
    const checkTarget = document.getElementById('check-target');
    const hudTree = document.getElementById('hud-tree');
    const hudTarget = document.getElementById('hud-target');
    checkTree.textContent = flags.hitTree ? '✓' : '✕';
    checkTree.className = 'hud-check' + (flags.hitTree ? ' done' : '');
    hudTree.className = 'hud-item' + (flags.hitTree ? ' done' : '');
    checkTarget.textContent = flags.hitCorrect ? '✓' : '✕';
    checkTarget.className = 'hud-check' + (flags.hitCorrect ? ' done' : '');
    hudTarget.className = 'hud-item' + (flags.hitCorrect ? ' done' : '');

    const distEl = document.getElementById('hud-distance');
    const meters = Math.floor(elapsed * 22);
    const remain = Math.max(0, Math.ceil(LEVEL_TIME - elapsed));
    distEl.textContent = state === 'menu' ? '0 m' : `${meters} m · ${remain}s`;
  }

  function showOverlay() { document.getElementById('overlay').classList.remove('hidden'); }
  function hideOverlay() { document.getElementById('overlay').classList.add('hidden'); }

  // -------------------------------------------------------------- boot ----
  function buildLegend() {
    const legend = document.getElementById('legend');
    legend.innerHTML = '';
    const entries = [
      { icon: '👨‍👧', name: 'Bố chở con gái', cls: 'correct', note: 'TÔNG TRÚNG' },
      { icon: '🌳', name: 'Cây bên đường', cls: 'correct', note: 'TÔNG TRÚNG' },
      { icon: '🐱', name: 'Doraemon & Nobita', cls: 'wrong', note: 'tránh' },
      { icon: '🥋', name: 'Yamcha', cls: 'wrong', note: 'tránh' },
      { icon: '🦊', name: 'Naruto & Kurama', cls: 'wrong', note: 'tránh' },
      { icon: '💑', name: 'Đôi tình nhân', cls: 'wrong', note: 'tránh' },
    ];
    for (const e of entries) {
      const div = document.createElement('div');
      div.className = 'legend-item ' + e.cls;
      div.innerHTML = `<span>${e.icon}</span><span>${e.name}</span><span style="margin-left:auto;opacity:.7">${e.note}</span>`;
      legend.appendChild(div);
    }
  }

  document.getElementById('btn-start').addEventListener('click', resetGame);
  document.getElementById('btn-restart').addEventListener('click', () => {
    if (state === 'playing') resetGame();
    else { state = 'menu'; hideOverlay(); document.getElementById('overlay-title').className = ''; document.getElementById('overlay-title').textContent = 'BMW X3 Hookcase'; document.getElementById('overlay-text').innerHTML = 'Kéo chuột (hoặc chạm) để lái xe, hoặc dùng phím mũi tên / WASD.<br>Nhiệm vụ: <b>tông trúng cây bên đường</b> và <b>tông trúng xe của bố đang chở con gái</b>.<br>Tông nhầm bất kỳ xe nào khác — <b>thua ngay!</b>'; document.getElementById('btn-start').textContent = '▶ Bắt đầu'; showOverlay(); }
  });

  buildLegend();
  updateHud();

  function frame(ts) {
    if (!lastTs) lastTs = ts;
    let dt = (ts - lastTs) / 1000;
    lastTs = ts;
    dt = Math.min(dt, 0.05);
    update(dt);
    render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
