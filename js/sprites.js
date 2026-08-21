/*
 * Procedural pixel-art sprites.
 * Each sprite is defined as a small grid (gridW x gridH "pixels") plus a list
 * of colored blocks [col, row, wCells, hCells, color]. Row 0 is the TOP of
 * the sprite; the sprite is anchored at its bottom-center point when drawn.
 */

const Sprites = (() => {

  function sprite(gridW, gridH, blocks) {
    return { gridW, gridH, blocks };
  }

  // ---------------------------------------------------------------- TREE --
  const tree = sprite(14, 18, [
    [5, 0, 4, 1, '#2f9350'],
    [3, 1, 8, 1, '#2f9350'],
    [2, 2, 10, 2, '#2f9350'],
    [1, 4, 12, 4, '#237a3f'],
    [3, 3, 3, 2, '#4bc06a'],
    [8, 5, 3, 3, '#4bc06a'],
    [2, 8, 10, 2, '#2f9350'],
    [3, 10, 8, 2, '#2f9350'],
    [6, 12, 2, 6, '#6b4423'],
    [7, 12, 1, 6, '#4d2f18'],
  ]);

  // --------------------------------------------------------------- LAMP ---
  const lamp = sprite(9, 20, [
    [3, 6, 2, 13, '#55606e'],
    [3, 5, 4, 1, '#55606e'],
    [5, 3, 3, 2, '#55606e'],
    [5, 1, 4, 3, '#ffd77a'],
    [6, 0, 3, 2, '#ffb032'],
    [1, 19, 6, 1, '#2b323d'],
  ]);

  // ---------------------------------------------------------- BMW PLAYER --
  const bmw = sprite(22, 24, [
    // body silhouette
    [6, 0, 10, 1, '#0c0d10'],
    [4, 1, 14, 1, '#0c0d10'],
    [2, 2, 18, 2, '#0c0d10'],
    [1, 4, 20, 13, '#0c0d10'],
    [2, 17, 18, 2, '#0c0d10'],
    [4, 19, 14, 1, '#0c0d10'],
    [6, 20, 10, 1, '#0c0d10'],
    // windshield
    [4, 4, 14, 4, '#22344a'],
    [6, 5, 10, 2, '#3a5674'],
    // BMW roundel badge
    [9, 9, 2, 2, '#0a5fd1'],
    [11, 9, 2, 2, '#ffffff'],
    [9, 11, 2, 2, '#ffffff'],
    [11, 11, 2, 2, '#0a5fd1'],
    // angled tail/headlight accents
    [3, 11, 6, 2, '#e21b1b'],
    [3, 13, 4, 2, '#8f0f0f'],
    [13, 11, 6, 2, '#e21b1b'],
    [15, 13, 4, 2, '#8f0f0f'],
    // bumper + grille
    [5, 16, 12, 2, '#eef0f2'],
    [5, 18, 12, 1, '#1a1d22'],
    // wheel shadows
    [1, 21, 5, 2, '#8a8f96'],
    [16, 21, 5, 2, '#8a8f96'],
  ]);

  // --------------------------------------------------- TARGET: FATHER + DAUGHTER (correct target) --
  const fatherDaughter = sprite(20, 30, [
    // scooter chassis
    [3, 20, 14, 7, '#232323'],
    [9, 20, 3, 2, '#ffe38a'],
    [2, 25, 4, 3, '#3f3f3f'],
    [14, 25, 4, 3, '#3f3f3f'],
    // father (green jacket, driving)
    [6, 9, 8, 12, '#3f6b2f'],
    [5, 12, 2, 4, '#3f6b2f'],
    [13, 12, 2, 4, '#3f6b2f'],
    [8, 5, 4, 4, '#f2c49b'],
    [7, 4, 6, 1, '#181818'],
    [8, 7, 4, 1, '#1465c9'],
    // daughter (white uniform, riding behind)
    [11, 3, 7, 9, '#ffffff'],
    [13, 8, 3, 3, '#22315a'],
    [12, 1, 5, 3, '#f2c49b'],
    [12, 0, 5, 1, '#271b12'],
  ]);

  // --------------------------------------------------- TARGET: DORAEMON + NOBITA --
  const doraemonNobita = sprite(20, 30, [
    // time-machine desk platform
    [2, 21, 16, 6, '#c9a227'],
    [3, 23, 14, 2, '#8a6b16'],
    [0, 24, 4, 5, '#2f6fe0'],
    [1, 25, 2, 3, '#5a95ff'],
    [15, 24, 5, 5, '#2f6fe0'],
    [16, 25, 2, 3, '#5a95ff'],
    // doraemon
    [4, 9, 9, 12, '#3f8ee0'],
    [6, 15, 5, 5, '#ffffff'],
    [6, 14, 5, 1, '#e0342f'],
    [5, 7, 7, 3, '#3f8ee0'],
    [6, 9, 1, 1, '#ffffff'],
    [9, 9, 1, 1, '#ffffff'],
    [7, 10, 1, 1, '#e0342f'],
    // nobita
    [11, 10, 6, 11, '#3a6bc4'],
    [12, 7, 4, 4, '#f2c49b'],
    [12, 6, 4, 1, '#1a1a1a'],
    [12, 18, 4, 3, '#1a3a7a'],
  ]);

  // --------------------------------------------------- TARGET: YAMCHA --
  const yamcha = sprite(20, 30, [
    // hover-bike hull
    [2, 18, 16, 7, '#8a7433'],
    [4, 24, 4, 3, '#5b4a1f'],
    [12, 24, 4, 3, '#5b4a1f'],
    [8, 20, 4, 3, '#d9c98a'],
    [2, 25, 3, 2, '#ffb347'],
    [15, 25, 3, 2, '#ffb347'],
    // yamcha rider
    [6, 6, 9, 13, '#e0692a'],
    [7, 4, 7, 3, '#2f8f4f'],
    [8, 2, 5, 3, '#f2c49b'],
    [7, 0, 7, 2, '#1a1a1a'],
    [5, 10, 2, 4, '#f2c49b'],
    [15, 10, 2, 4, '#f2c49b'],
  ]);

  // --------------------------------------------------- TARGET: NARUTO + KURAMA --
  const narutoKurama = sprite(20, 30, [
    // kurama body
    [1, 14, 18, 12, '#e8792b'],
    [18, 8, 3, 8, '#e8792b'],
    [16, 6, 3, 6, '#e8792b'],
    [2, 15, 16, 3, '#c85a12'],
    [4, 20, 12, 6, '#f2b26b'],
    [5, 14, 1, 10, '#231a12'],
    [14, 14, 1, 10, '#231a12'],
    [6, 10, 8, 6, '#e8792b'],
    [7, 12, 2, 2, '#ff1e1e'],
    [11, 12, 2, 2, '#ff1e1e'],
    // naruto rider
    [7, 3, 7, 9, '#e8720a'],
    [8, 1, 5, 3, '#f2c49b'],
    [7, 0, 7, 1, '#f5d13a'],
    [7, 1, 7, 1, '#1e5fbf'],
    [9, 1, 3, 1, '#c9c9c9'],
  ]);

  // --------------------------------------------------- TARGET: COUPLE (girl piggyback on guy) --
  const couple = sprite(20, 30, [
    // guy
    [6, 9, 8, 16, '#2b3440'],
    [8, 6, 4, 4, '#f2c49b'],
    [7, 5, 6, 1, '#161616'],
    [6, 22, 3, 5, '#1c2430'],
    [11, 22, 3, 5, '#1c2430'],
    [6, 26, 3, 2, '#111111'],
    [11, 26, 3, 2, '#111111'],
    // girl riding on shoulders
    [7, 0, 6, 1, '#3a2416'],
    [7, 1, 6, 3, '#f2c49b'],
    [6, 4, 8, 6, '#ff6fa5'],
    [4, 5, 2, 2, '#f2c49b'],
    [14, 5, 2, 2, '#f2c49b'],
  ]);

  const TARGET_TYPES = {
    father_daughter: {
      key: 'father_daughter',
      name: 'Bố chở con gái',
      icon: '👨‍👧',
      correct: true,
      sprite: fatherDaughter,
    },
    doraemon_nobita: {
      key: 'doraemon_nobita',
      name: 'Doraemon & Nobita',
      icon: '🐱',
      correct: false,
      sprite: doraemonNobita,
    },
    yamcha: {
      key: 'yamcha',
      name: 'Yamcha',
      icon: '🥋',
      correct: false,
      sprite: yamcha,
    },
    naruto_kurama: {
      key: 'naruto_kurama',
      name: 'Naruto & Kurama',
      icon: '🦊',
      correct: false,
      sprite: narutoKurama,
    },
    couple: {
      key: 'couple',
      name: 'Đôi tình nhân',
      icon: '💑',
      correct: false,
      sprite: couple,
    },
  };

  function draw(ctx, spr, x, y, unit, flip) {
    const w = spr.gridW * unit;
    const h = spr.gridH * unit;
    const left = x - w / 2;
    const top = y - h;
    ctx.save();
    if (flip) {
      ctx.translate(x, 0);
      ctx.scale(-1, 1);
      ctx.translate(-x, 0);
    }
    for (const [c, r, cw, ch, color] of spr.blocks) {
      ctx.fillStyle = color;
      ctx.fillRect(
        Math.round(left + c * unit),
        Math.round(top + r * unit),
        Math.ceil(cw * unit),
        Math.ceil(ch * unit)
      );
    }
    ctx.restore();
    return { w, h, left, top };
  }

  return { tree, lamp, bmw, TARGET_TYPES, draw };
})();
