/* ============================================================
   BUBBLE SHOOTER — original casual game, HTML5 Canvas
   Self-contained module. Auto-initializes on DOMContentLoaded.
   No external assets — all graphics drawn on canvas, all sound
   synthesized with the Web Audio API.
   ============================================================ */
"use strict";

function initBubbleShooter() {
  const canvas = document.getElementById("bubbleCanvas");
  if (!canvas || canvas.dataset.bsInit) return; // never initialize twice
  canvas.dataset.bsInit = "1";
  const ctx = canvas.getContext("2d");

  // ---------------- Config ----------------
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const LOGICAL_W = 280;
  const LOGICAL_H = 380;
  canvas.width = LOGICAL_W * DPR;
  canvas.height = LOGICAL_H * DPR;
  ctx.scale(DPR, DPR);

  const R = 14;                          // bubble radius
  const COLS = Math.floor(LOGICAL_W / (2 * R));
  const ROW_H = R * Math.sqrt(3);        // vertical distance between rows
  const TOP_MARGIN = 20;
  const DANGER_Y = LOGICAL_H - 74;       // bubbles reaching this line = game over
  const SHOOTER_Y = LOGICAL_H - 30;
  const SHOOTER_X = LOGICAL_W / 2;
  const SHOT_SPEED = 9;
  const ACTIVE_COLORS = 5;               // how many colors are in play (keeps it winnable)
  const ROWS_PER_NEW_ROW = 8;            // shots between a new row appearing

  const COLORS = [
    { fill: "#FF6B9D", hi: "#FFC2DA" }, // pink
    { fill: "#B490E8", hi: "#DED0FA" }, // lavender
    { fill: "#F5C842", hi: "#FFEBAA" }, // gold
    { fill: "#4FD8A0", hi: "#B0F2D8" }, // mint
    { fill: "#5FAEFF", hi: "#C0E0FF" }, // sky
    { fill: "#FF9F5A", hi: "#FFD3AA" }, // peach
  ];

  // ---------------- DOM refs ----------------
  const scoreEl        = document.getElementById("bsScore");
  const highEl         = document.getElementById("bsHighScore");
  const startOverlay    = document.getElementById("bsStartOverlay");
  const pauseOverlay    = document.getElementById("bsPauseOverlay");
  const overOverlay     = document.getElementById("bsGameOverOverlay");
  const winOverlay      = document.getElementById("bsWinOverlay");
  const finalScoreEl   = document.getElementById("bsFinalScore");
  const winScoreEl     = document.getElementById("bsWinScore");
  const startBtn       = document.getElementById("bsStartBtn");
  const pauseBtn       = document.getElementById("bsPauseBtn");
  const resumeBtn      = document.getElementById("bsResumeBtn");
  const restartBtn2    = document.getElementById("bsRestartBtn2");
  const restartBtn3    = document.getElementById("bsRestartBtn3");
  const swapBtn        = document.getElementById("bsSwapBtn");
  const soundBtn       = document.getElementById("bsSoundBtn");

  // ---------------- State ----------------
  let grid = [];              // grid[r] = array of cells (null | {color}), with a .offset (0|1) property
  let particles = [];
  let floatingTexts = [];
  let fallingBubbles = [];
  let shots = 0;
  let score = 0;
  let highScore = Number(localStorage.getItem("bubbleShooterHighScore") || 0);
  let running = false;
  let paused = false;
  let soundOn = true;
  let shake = 0;
  let aimAngle = -Math.PI / 2;
  let aiming = false;
  let currentColor = 0;
  let nextColor = 0;
  let shotBubble = null;      // {x,y,vx,vy,color}
  let rafId = null;

  highEl.textContent = highScore;

  // ---------------- Small helpers ----------------
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

  // ---------------- Sound (tiny synth, no files needed) ----------------
  let actx = null;
  function beep(freq, duration, type, vol) {
    if (!soundOn) return;
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = vol;
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + duration);
      osc.stop(actx.currentTime + duration);
    } catch (e) { /* audio unavailable — fail silently */ }
  }
  const sfxShoot = () => beep(440, 0.08, "triangle", 0.10);
  const sfxWall  = () => beep(220, 0.06, "sine", 0.07);
  const sfxPop   = (n) => beep(600 + n * 35, 0.12, "square", 0.12);
  const sfxFall  = () => beep(300, 0.16, "sawtooth", 0.09);
  const sfxLose  = () => beep(140, 0.4, "sawtooth", 0.15);
  const sfxWin   = () => beep(880, 0.5, "sine", 0.18);

  // ---------------- Grid geometry ----------------
  // Each row remembers its own "offset" (0 = flush left, 1 = shifted right by R),
  // stored as a property on the row array itself — this way inserting new rows
  // at the top never desyncs a row's visual offset from its content.
  function rowOffset(r) { return grid[r] ? grid[r].offset : 0; }
  function rowCols(r) { return rowOffset(r) === 0 ? COLS : COLS - 1; }
  function cellX(r, c) { return R + c * 2 * R + (rowOffset(r) === 1 ? R : 0); }
  function cellY(r) { return TOP_MARGIN + R + r * ROW_H; }

  function neighbors(r, c) {
    const off = rowOffset(r);
    const deltas = off === 0
      ? [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]]
      : [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]];
    const out = [];
    deltas.forEach(([dr, dc]) => {
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < grid.length && grid[rr] && cc >= 0 && cc < grid[rr].length) {
        out.push([rr, cc]);
      }
    });
    return out;
  }
  function getCell(r, c) { return (grid[r] && grid[r][c]) ? grid[r][c] : null; }
  function setCell(r, c, val) { if (grid[r]) grid[r][c] = val; }

  function activeColorSet() {
    const set = new Set();
    grid.forEach(row => row && row.forEach(cell => { if (cell) set.add(cell.color); }));
    if (!set.size) for (let i = 0; i < ACTIVE_COLORS; i++) set.add(i);
    return [...set];
  }
  function randomActiveColor() {
    const set = activeColorSet();
    return set[randInt(0, set.length - 1)];
  }

  function buildInitialGrid(rows) {
    grid = [];
    for (let r = 0; r < rows; r++) {
      const off = r % 2;
      const cols = off === 0 ? COLS : COLS - 1;
      const row = [];
      for (let c = 0; c < cols; c++) row.push({ color: randInt(0, ACTIVE_COLORS - 1) });
      row.offset = off;
      grid[r] = row;
    }
  }

  function addRow() {
    const newOffset = grid[0] ? 1 - grid[0].offset : 0;
    const cols = newOffset === 0 ? COLS : COLS - 1;
    const row = [];
    for (let c = 0; c < cols; c++) row.push({ color: randomActiveColor() });
    row.offset = newOffset;
    grid.unshift(row);
  }

  // ---------------- Drawing ----------------
  function drawBubble(x, y, colorIdx, scale, alpha) {
    scale = scale === undefined ? 1 : scale;
    alpha = alpha === undefined ? 1 : alpha;
    const col = COLORS[colorIdx % COLORS.length];
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.arc(1.4, 2, R - 1, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fill();

    const grad = ctx.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.15, 0, 0, R);
    grad.addColorStop(0, col.hi);
    grad.addColorStop(1, col.fill);
    ctx.beginPath();
    ctx.arc(0, 0, R - 1, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(-R * 0.32, -R * 0.38, R * 0.32, R * 0.19, -0.6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fill();
    ctx.restore();
  }

  function drawGrid() {
    for (let r = 0; r < grid.length; r++) {
      if (!grid[r]) continue;
      for (let c = 0; c < grid[r].length; c++) {
        const cell = grid[r][c];
        if (cell) drawBubble(cellX(r, c), cellY(r), cell.color);
      }
    }
  }

  function drawAimLine() {
    if (!aiming || shotBubble) return;
    let dx = Math.cos(aimAngle), dy = Math.sin(aimAngle);
    let cx = SHOOTER_X, cy = SHOOTER_Y;
    ctx.save();
    ctx.setLineDash([5, 6]);
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    let bounces = 0;
    for (let steps = 0; steps < 120 && bounces < 3; steps++) {
      cx += dx * 6; cy += dy * 6;
      if (cx - R < 0) { cx = R; dx = -dx; bounces++; }
      if (cx + R > LOGICAL_W) { cx = LOGICAL_W - R; dx = -dx; bounces++; }
      if (cy < TOP_MARGIN) break;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.restore();
  }

  const NEXT_X = SHOOTER_X + 38, NEXT_Y = SHOOTER_Y + 4;

  function drawShooter() {
    drawBubble(SHOOTER_X, SHOOTER_Y, currentColor);

    // Dashed ring around the "next" bubble hints that tapping it swaps it in
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(NEXT_X, NEXT_Y, R * 0.6 + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    drawBubble(NEXT_X, NEXT_Y, nextColor, 0.6, 0.9);
    if (shotBubble) drawBubble(shotBubble.x, shotBubble.y, shotBubble.color);
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawFloatingTexts() {
    floatingTexts.forEach(t => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.life / t.maxLife);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 3;
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });
  }

  function drawFallingBubbles() {
    fallingBubbles.forEach(b => drawBubble(b.x, b.y, b.color, 1, Math.max(0, b.life / b.maxLife)));
  }

  function drawDangerLine() {
    ctx.save();
    ctx.strokeStyle = "rgba(255,90,90,0.3)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, DANGER_Y);
    ctx.lineTo(LOGICAL_W, DANGER_Y);
    ctx.stroke();
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    drawDangerLine();
    drawGrid();
    drawFallingBubbles();
    drawParticles();
    drawFloatingTexts();
    drawAimLine();
    drawShooter();
    ctx.restore();
  }

  // ---------------- Update / physics ----------------
  function update(dt) {
    // Normalize to the original 60fps tuning: at exactly 60fps, dtScale === 1.
    // This keeps every constant below feeling the same as before, but now
    // motion speed no longer depends on how often the browser calls this.
    const dtScale = dt * 60;

    if (shake > 0) shake = Math.max(0, shake - dt * 40);

    if (shotBubble) {
      shotBubble.x += shotBubble.vx * dtScale;
      shotBubble.y += shotBubble.vy * dtScale;
      if (shotBubble.x - R < 0) { shotBubble.x = R; shotBubble.vx *= -1; sfxWall(); }
      if (shotBubble.x + R > LOGICAL_W) { shotBubble.x = LOGICAL_W - R; shotBubble.vx *= -1; sfxWall(); }

      let collided = shotBubble.y - R <= TOP_MARGIN;
      if (!collided) {
        outer:
        for (let r = 0; r < grid.length; r++) {
          if (!grid[r]) continue;
          for (let c = 0; c < grid[r].length; c++) {
            if (!grid[r][c]) continue;
            const dx = shotBubble.x - cellX(r, c);
            const dy = shotBubble.y - cellY(r);
            if (Math.sqrt(dx * dx + dy * dy) < 2 * R - 3) { collided = true; break outer; }
          }
        }
      }
      if (collided) snapShotBubble();
    }

    particles.forEach(p => { p.x += p.vx * dtScale; p.y += p.vy * dtScale; p.vy += 0.15 * dtScale; p.life -= dt * 1000; });
    particles = particles.filter(p => p.life > 0);

    floatingTexts.forEach(t => { t.y -= 0.4 * dtScale; t.life -= dt * 1000; });
    floatingTexts = floatingTexts.filter(t => t.life > 0);

    fallingBubbles.forEach(b => { b.vy += 0.35 * dtScale; b.x += b.vx * dtScale; b.y += b.vy * dtScale; b.life -= dt * 1000; });
    fallingBubbles = fallingBubbles.filter(b => b.life > 0 && b.y < LOGICAL_H + 40);
  }

  function loop(ts) {
    if (!running || paused) return;
    if (!loop.last) loop.last = ts;
    const dt = Math.min(0.05, (ts - loop.last) / 1000);
    loop.last = ts;
    update(dt);
    render();
    rafId = requestAnimationFrame(loop);
  }

  // ---------------- Snap + match logic ----------------
  function nearestEmptyCell(x, y) {
    let best = null, bestDist = Infinity;
    for (let r = 0; r < grid.length; r++) {
      if (!grid[r]) continue;
      for (let c = 0; c < grid[r].length; c++) {
        if (!grid[r][c]) continue;
        const dx = x - cellX(r, c), dy = y - cellY(r);
        const d = dx * dx + dy * dy;
        if (d < bestDist) { bestDist = d; best = [r, c]; }
      }
    }
    if (!best) {
      const c = Math.max(0, Math.min(COLS - 1, Math.round((x - R) / (2 * R))));
      return [0, c];
    }
    const [r, c] = best;
    let candidates = neighbors(r, c).filter(([rr, cc]) => !getCell(rr, cc));
    if (r === 0) {
      candidates.push([0, Math.max(0, c - 1)]);
      candidates.push([0, Math.min(rowCols(0) - 1, c + 1)]);
    }
    if (!candidates.length) {
      // Extremely rare: completely boxed in. Extend a fresh row just below and drop it there.
      const newR = r + 1;
      if (!grid[newR]) {
        const newOffset = 1 - rowOffset(r);
        const cols = newOffset === 0 ? COLS : COLS - 1;
        const row = new Array(cols).fill(null);
        row.offset = newOffset;
        grid[newR] = row;
      }
      const newCols = rowCols(newR);
      return [newR, Math.max(0, Math.min(newCols - 1, c))];
    }
    let bestCand = candidates[0], bestCandDist = Infinity;
    candidates.forEach(([rr, cc]) => {
      const px = cellX(rr, cc), py = cellY(rr);
      const dx = x - px, dy = y - py;
      const d = dx * dx + dy * dy;
      if (d < bestCandDist) { bestCandDist = d; bestCand = [rr, cc]; }
    });
    return bestCand;
  }

  function floodMatch(r, c) {
    const target = getCell(r, c);
    if (!target) return [];
    const color = target.color;
    const visited = new Set();
    const stack = [[r, c]];
    const group = [];
    while (stack.length) {
      const [cr, cc] = stack.pop();
      const key = cr + "," + cc;
      if (visited.has(key)) continue;
      visited.add(key);
      const cell = getCell(cr, cc);
      if (!cell || cell.color !== color) continue;
      group.push([cr, cc]);
      neighbors(cr, cc).forEach(n => stack.push(n));
    }
    return group;
  }

  function spawnPopParticles(x, y, colorIdx) {
    const col = COLORS[colorIdx % COLORS.length].fill;
    for (let i = 0; i < 9; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 1 + Math.random() * 3;
      particles.push({
        x, y,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 1,
        size: 1.5 + Math.random() * 2,
        color: col,
        life: 500, maxLife: 500,
      });
    }
  }
  function spawnFloatingText(r, c, text) {
    floatingTexts.push({ x: cellX(r, c), y: cellY(r), text, life: 700, maxLife: 700 });
  }

  function popGroup(group) {
    group.forEach(([r, c]) => {
      const cell = getCell(r, c);
      if (!cell) return;
      spawnPopParticles(cellX(r, c), cellY(r), cell.color);
      setCell(r, c, null);
    });
    const pts = group.length * 10;
    score += pts;
    scoreEl.textContent = score;
    spawnFloatingText(group[0][0], group[0][1], "+" + pts);
    sfxPop(group.length);
  }

  function dropFloating() {
    const anchored = new Set();
    const stack = [];
    if (grid[0]) grid[0].forEach((cell, c) => { if (cell) stack.push([0, c]); });
    while (stack.length) {
      const [r, c] = stack.pop();
      const key = r + "," + c;
      if (anchored.has(key)) continue;
      anchored.add(key);
      neighbors(r, c).forEach(([nr, nc]) => {
        if (getCell(nr, nc) && !anchored.has(nr + "," + nc)) stack.push([nr, nc]);
      });
    }
    const floatingGroup = [];
    for (let r = 0; r < grid.length; r++) {
      if (!grid[r]) continue;
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] && !anchored.has(r + "," + c)) floatingGroup.push([r, c]);
      }
    }
    if (floatingGroup.length) {
      floatingGroup.forEach(([r, c]) => {
        const cell = getCell(r, c);
        fallingBubbles.push({
          x: cellX(r, c), y: cellY(r),
          vx: (Math.random() - 0.5) * 1.5, vy: 0,
          color: cell.color, life: 900, maxLife: 900,
        });
        setCell(r, c, null);
      });
      const pts = floatingGroup.length * 20;
      score += pts;
      scoreEl.textContent = score;
      spawnFloatingText(floatingGroup[0][0], floatingGroup[0][1], "+" + pts + "!");
      sfxFall();
    }
  }

  function snapShotBubble() {
    const [r, c] = nearestEmptyCell(shotBubble.x, shotBubble.y);
    if (!grid[r]) { shotBubble = null; prepareNextShot(); return; }
    grid[r][c] = { color: shotBubble.color };
    shotBubble = null;

    const group = floodMatch(r, c);
    if (group.length >= 3) {
      popGroup(group);
      shake = 6;
      dropFloating();
    }
    checkWinLose();
    prepareNextShot();
  }

  function prepareNextShot() {
    if (!running) return;
    currentColor = nextColor;
    nextColor = randomActiveColor();
    shots++;
    if (shots % ROWS_PER_NEW_ROW === 0) {
      addRow();
      checkWinLose();
    }
  }

  function checkWinLose() {
    for (let r = 0; r < grid.length; r++) {
      if (!grid[r]) continue;
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] && cellY(r) + R >= DANGER_Y) { gameOver(); return; }
      }
    }
    const anyLeft = grid.some(row => row && row.some(cell => cell));
    if (!anyLeft && grid.length) winGame();
  }

  // ---------------- Input ----------------
  function angleFromPointer(px, py) {
    let dx = px - SHOOTER_X;
    let dy = py - SHOOTER_Y;
    if (dy > -8) dy = -8; // always treat the target as above the shooter — avoids ambiguous wraparound
    let ang = Math.atan2(dy, dx);
    const minA = -Math.PI + 0.15, maxA = -0.15;
    return Math.max(minA, Math.min(maxA, ang));
  }
  function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = LOGICAL_W / rect.width;
    const scaleY = LOGICAL_H / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }
  function onPointerDown(e) {
    if (!running || paused || shotBubble) return;
    aiming = true;
    const p = getPointerPos(e);
    aimAngle = angleFromPointer(p.x, p.y);
  }
  function onPointerMove(e) {
    if (!aiming) return;
    const p = getPointerPos(e);
    aimAngle = angleFromPointer(p.x, p.y);
  }
  function onPointerUp() {
    if (!aiming) return;
    aiming = false;
    fireShot();
  }
  function fireShot() {
    if (shotBubble || !running || paused) return;
    shotBubble = {
      x: SHOOTER_X, y: SHOOTER_Y,
      vx: Math.cos(aimAngle) * SHOT_SPEED,
      vy: Math.sin(aimAngle) * SHOT_SPEED,
      color: currentColor,
    };
    sfxShoot();
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);

  swapBtn.addEventListener("click", () => {
    if (!running || paused) return;
    const tmp = currentColor;
    currentColor = nextColor;
    nextColor = tmp;
  });
  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    soundBtn.textContent = soundOn ? "♪" : "×";
  });
  pauseBtn.addEventListener("click", () => {
    if (!running || paused) return;
    paused = true;
    pauseOverlay.style.display = "flex";
  });
  resumeBtn.addEventListener("click", () => {
    paused = false;
    pauseOverlay.style.display = "none";
    loop.last = performance.now();
    rafId = requestAnimationFrame(loop);
  });

  // ---------------- Game state transitions ----------------
  function gameOver() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    sfxLose();
    if (score > highScore) { highScore = score; localStorage.setItem("bubbleShooterHighScore", highScore); }
    highEl.textContent = highScore;
    finalScoreEl.textContent = score;
    overOverlay.style.display = "flex";
  }
  function winGame() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    sfxWin();
    if (score > highScore) { highScore = score; localStorage.setItem("bubbleShooterHighScore", highScore); }
    highEl.textContent = highScore;
    winScoreEl.textContent = score;
    winOverlay.style.display = "flex";
    for (let i = 0; i < 36; i++) {
      particles.push({
        x: LOGICAL_W / 2, y: LOGICAL_H / 2,
        vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
        size: 2 + Math.random() * 3,
        color: COLORS[randInt(0, COLORS.length - 1)].fill,
        life: 900, maxLife: 900,
      });
    }
    render();
  }

  function startGame() {
    grid = [];
    particles = []; floatingTexts = []; fallingBubbles = [];
    shots = 0; score = 0; shake = 0; shotBubble = null; aiming = false;
    scoreEl.textContent = "0";
    buildInitialGrid(5);
    currentColor = randomActiveColor();
    nextColor = randomActiveColor();
    startOverlay.style.display = "none";
    overOverlay.style.display = "none";
    winOverlay.style.display = "none";
    pauseOverlay.style.display = "none";
    running = true; paused = false;
    loop.last = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  startBtn.addEventListener("click", startGame);
  restartBtn2.addEventListener("click", startGame);
  restartBtn3.addEventListener("click", startGame);

  // Static preview behind the start screen
  buildInitialGrid(4);
  currentColor = randomActiveColor();
  nextColor = randomActiveColor();
  render();
}

document.addEventListener("DOMContentLoaded", initBubbleShooter);
