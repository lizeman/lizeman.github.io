/* Roulette — European single-zero wheel.
   Manual play with multi-bet chip stacks + canvas wheel/ball animation.
   Five betting strategies (flat / martingale / fibonacci / d'alembert / labouchere)
   driving a fast Monte Carlo simulator with bankroll sparkline + profit histogram.
   Highest-profit leaderboard persisted in localStorage. */
(function () {
  'use strict';

  // ---------- wheel facts ----------
  // Standard European wheel order (clockwise starting at 0).
  var WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
  ];
  var N_POCKETS = WHEEL_ORDER.length; // 37
  var RED_SET = (function () {
    var s = {};
    [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].forEach(function (n) { s[n] = 1; });
    return s;
  })();
  function colorOf(n) {
    if (n === 0) return 'green';
    return RED_SET[n] ? 'red' : 'black';
  }
  function colorClassOf(n) { var c = colorOf(n); return c === 'red' ? 'r' : c === 'black' ? 'b' : 'g'; }

  // bet predicate + payout multiplier (1 = pays 1:1, 2 = pays 2:1)
  var BETS = {
    red:    { test: function (n) { return colorOf(n) === 'red'; },   pay: 1 },
    black:  { test: function (n) { return colorOf(n) === 'black'; }, pay: 1 },
    even:   { test: function (n) { return n !== 0 && n % 2 === 0; }, pay: 1 },
    odd:    { test: function (n) { return n !== 0 && n % 2 === 1; }, pay: 1 },
    low:    { test: function (n) { return n >= 1 && n <= 18; },      pay: 1 },
    high:   { test: function (n) { return n >= 19 && n <= 36; },     pay: 1 },
    d1:     { test: function (n) { return n >= 1 && n <= 12; },      pay: 2 },
    d2:     { test: function (n) { return n >= 13 && n <= 24; },     pay: 2 },
    d3:     { test: function (n) { return n >= 25 && n <= 36; },     pay: 2 },
    c1:     { test: function (n) { return n !== 0 && n % 3 === 1; }, pay: 2 },
    c2:     { test: function (n) { return n !== 0 && n % 3 === 2; }, pay: 2 },
    c3:     { test: function (n) { return n !== 0 && n % 3 === 0; }, pay: 2 }
  };

  var STRAT_INFO = {
    flat:       'Flat: same wager every spin. The honest baseline — house edge bleeds the bankroll at a steady rate.',
    martingale: 'Martingale: double your bet after every loss; reset after a win. Recovers all losses on a single win, but a long red streak — or the table limit — wipes you out.',
    fibonacci:  'Fibonacci: bet the next number in 1, 1, 2, 3, 5, 8, 13… on a loss; step back two on a win. Slower escalation than Martingale, same eventual fate.',
    dalembert:  'D’Alembert: +1 unit after a loss, −1 after a win. Drawdowns are gentle, but losing streaks still grind you down.',
    labouchere: 'Labouchère: write down 1, 2, 3. Bet first + last as units. Win → cross both off; loss → append the loss to the end. The list eventually empties — or grows without bound.'
  };

  // ---------- DOM ----------
  var $ = function (id) { return document.getElementById(id); };
  var canvas = $('rou-wheel');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var overlay = $('rou-result-overlay');
  var bankrollEl = $('rou-bankroll');
  var profitEl = $('rou-profit');
  var spinsEl = $('rou-spins');
  var stackEl = $('rou-stack');
  var betGrid = document.querySelector('.bet-grid');
  var stakeEl = $('rou-stake');
  var spinBtn = $('rou-spin');
  var clearBtn = $('rou-clear');
  var cashoutBtn = $('rou-cashout');
  var recentEl = $('rou-recent');
  var stratPills = $('rou-strategy');
  var stratExplain = $('rou-strategy-explain');
  var baseEl = $('rou-base');
  var stratBetEl = $('rou-strat-bet');
  var stratNextEl = $('rou-strat-next');
  var simSpinsEl = $('rou-sim-spins');
  var simBankEl = $('rou-sim-bank');
  var simRunBtn = $('rou-sim-run');
  var simSummaryEl = $('rou-sim-summary');
  var simSparkEl = $('sim-spark');
  var simHistEl = $('sim-hist');
  var simRunsEl = $('rou-sim-runs');
  var simMcBtn = $('rou-sim-mc');
  var simMcOutEl = $('rou-sim-mc-out');
  var simMcSummaryEl = $('rou-sim-mc-summary');
  var simMcHistEl = $('sim-mc-hist');
  var simMcAxisLo = $('sim-mc-axis-lo');
  var simMcAxisHi = $('sim-mc-axis-hi');
  var simStratStateEl = $('rou-sim-strat-state');
  var leaderBody = $('rou-leader-body');
  var leaderClearBtn = $('rou-leader-clear');
  var autobetBtn = $('rou-autobet');
  var peakValueEl = $('rou-peak-value');
  var peakMetaEl = $('rou-peak-meta');
  var peakRow = $('rou-peak-row');

  // ---------- state ----------
  var STARTING_BANKROLL = 1000;
  var bankroll = STARTING_BANKROLL;
  var sessionProfit = 0;
  var spinsCount = 0;
  var bets = {};            // { betKey: stakeDollars }
  var lastBets = null;      // for a "re-bet" via clicking same button after spin (not in UI)
  var recent = [];          // last winning numbers
  var spinning = false;
  var wheelAngle = 0;       // current rotation (radians)
  var ballAngle = 0;        // current ball angle (radians)
  var ballRadius = 0.83;    // fraction of wheel radius where ball sits
  var rafId = 0;
  var strategy = 'flat';
  var strategyState = newStrategyState('flat', 5); // tracks the *play-side* run
  var lastWonStreakLabel = '';

  // ---------- localStorage ----------
  var LS_LEADER = 'zl_roulette_leaders_v1';
  var LS_PEAK = 'zl_roulette_peak_v1';

  function loadLeaders() {
    try {
      var raw = localStorage.getItem(LS_LEADER);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function saveLeaders(arr) {
    try { localStorage.setItem(LS_LEADER, JSON.stringify(arr.slice(0, 10))); } catch (e) {}
  }
  function loadPeak() {
    try { return parseFloat(localStorage.getItem(LS_PEAK)) || 0; } catch (e) { return 0; }
  }
  function savePeak(v) {
    try { localStorage.setItem(LS_PEAK, String(v)); } catch (e) {}
  }
  function recordResult(profit, strat, spins, label) {
    if (!isFinite(profit)) return;
    var arr = loadLeaders();
    arr.push({
      profit: Math.round(profit),
      strategy: strat || label || 'manual',
      spins: spins || 0,
      when: Date.now()
    });
    arr.sort(function (a, b) { return b.profit - a.profit; });
    arr = arr.slice(0, 10);
    saveLeaders(arr);
    var prev = loadPeak();
    var peak = Math.max(prev, profit);
    savePeak(peak);
    paintLeaders();
    paintPeak(peak > prev);
  }
  function paintPeak(bump) {
    if (!peakValueEl) return;
    var peak = loadPeak();
    var arr = loadLeaders();
    peakValueEl.textContent = peak > 0 ? '+$' + Math.round(peak).toLocaleString('en-US') : '$0';
    peakMetaEl.textContent = arr.length
      ? 'set by ' + arr[0].strategy + ' · ' + arr.length + ' runs recorded'
      : 'no runs yet';
    if (bump && peakRow) {
      peakRow.classList.remove('bumped');
      void peakRow.offsetWidth; // restart animation
      peakRow.classList.add('bumped');
    }
  }

  // ---------- formatting ----------
  function fmt(v) {
    var sign = v < 0 ? '-' : '';
    var abs = Math.abs(Math.round(v));
    return sign + '$' + abs.toLocaleString('en-US');
  }
  function fmtSigned(v) {
    var r = Math.round(v);
    return (r >= 0 ? '+$' : '-$') + Math.abs(r).toLocaleString('en-US');
  }

  // ---------- wheel rendering ----------
  // Wheel is drawn into the offscreen canvas every frame, rotated by `wheelAngle`.
  // Ball is drawn on top at `ballAngle`.
  function sizeCanvas() {
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    var size = Math.max(120, Math.floor(rect.width));
    if (canvas.width !== size * dpr) {
      canvas.width = size * dpr;
      canvas.height = size * dpr;
    }
  }

  function drawWheel() {
    sizeCanvas();
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H / 2;
    var rOuter = Math.min(W, H) / 2 - 4;
    var rInner = rOuter * 0.42;
    var rRing  = rOuter * 0.95;        // pocket inner-ring boundary
    var rBall  = rOuter * ballRadius;
    var step   = (Math.PI * 2) / N_POCKETS;

    ctx.clearRect(0, 0, W, H);

    // wood rim
    var rim = ctx.createRadialGradient(cx, cy, rOuter * 0.85, cx, cy, rOuter);
    rim.addColorStop(0, '#6b4a30');
    rim.addColorStop(1, '#2a1d14');
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
    ctx.fill();

    // pockets
    for (var i = 0; i < N_POCKETS; i++) {
      var n = WHEEL_ORDER[i];
      var a0 = wheelAngle + i * step - Math.PI / 2 - step / 2;
      var a1 = a0 + step;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, rRing, a0, a1);
      ctx.closePath();
      var c = colorOf(n);
      ctx.fillStyle = c === 'red' ? '#b85c38' : c === 'black' ? '#1c1c1c' : '#1b6e3a';
      ctx.fill();
      // separator
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // number text
      var tx = cx + Math.cos((a0 + a1) / 2) * (rRing * 0.82);
      var ty = cy + Math.sin((a0 + a1) / 2) * (rRing * 0.82);
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate((a0 + a1) / 2 + Math.PI / 2);
      ctx.fillStyle = 'white';
      ctx.font = 'bold ' + Math.round(rOuter * 0.06) + 'px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(n), 0, 0);
      ctx.restore();
    }

    // inner hub
    var hub = ctx.createRadialGradient(cx - rInner * 0.3, cy - rInner * 0.3, rInner * 0.1,
                                       cx, cy, rInner);
    hub.addColorStop(0, '#f0d09a');
    hub.addColorStop(0.55, '#9a6c42');
    hub.addColorStop(1, '#3a2718');
    ctx.fillStyle = hub;
    ctx.beginPath();
    ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
    ctx.fill();

    // hub crossbars (rotate with wheel)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(wheelAngle);
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 2;
    for (var k = 0; k < 4; k++) {
      ctx.beginPath();
      ctx.moveTo(-rInner * 0.95, 0);
      ctx.lineTo(rInner * 0.95, 0);
      ctx.stroke();
      ctx.rotate(Math.PI / 4);
    }
    ctx.restore();

    // ball
    var bx = cx + Math.cos(ballAngle - Math.PI / 2) * rBall;
    var by = cy + Math.sin(ballAngle - Math.PI / 2) * rBall;
    var ballR = rOuter * 0.045;
    var bg = ctx.createRadialGradient(bx - ballR * 0.3, by - ballR * 0.3, ballR * 0.1,
                                       bx, by, ballR);
    bg.addColorStop(0, '#fff');
    bg.addColorStop(0.6, '#dad6cc');
    bg.addColorStop(1, '#7a7770');
    ctx.fillStyle = bg;
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(bx, by, ballR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ---------- spin animation ----------
  var TWO_PI = Math.PI * 2;
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }
  function easeOutQuint(t) { return 1 - Math.pow(1 - t, 5); }
  function reducedMotion() {
    return window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function spinTo(winNum, onDone) {
    var idx = WHEEL_ORDER.indexOf(winNum);
    var step = TWO_PI / N_POCKETS;

    // Wheel rotates forward; pocket `idx` should sit at top pointer at end.
    // Pocket i is drawn at angle (wheelAngle + i*step - π/2), so for pocket idx
    // at top (-π/2 in canvas) we need wheelAngle ≡ -idx*step (mod 2π).
    var startWheel = wheelAngle;
    var targetMod = ((-idx * step) % TWO_PI + TWO_PI) % TWO_PI;
    var currentMod = ((startWheel % TWO_PI) + TWO_PI) % TWO_PI;
    var fwd = targetMod - currentMod;
    if (fwd <= 0) fwd += TWO_PI;
    var revsW = 5;
    var endWheel = startWheel + revsW * TWO_PI + fwd;

    // Ball orbits backward (visually opposite the wheel) and lands at angle 0
    // (mod 2π) — top of canvas, under the pointer.
    var startBall = ballAngle;
    var ballMod = ((startBall % TWO_PI) + TWO_PI) % TWO_PI;
    var revsB = 7;
    var endBall = startBall - revsB * TWO_PI - ballMod;

    if (reducedMotion()) {
      wheelAngle = endWheel;
      ballAngle = endBall;
      drawWheel();
      if (onDone) onDone();
      return;
    }

    var DURATION = 4200;
    var t0 = performance.now();
    cancelAnimationFrame(rafId);
    function frame(now) {
      var t = Math.min(1, (now - t0) / DURATION);
      var ew = easeOutQuart(t);
      var eb = easeOutQuint(t);
      wheelAngle = startWheel + (endWheel - startWheel) * ew;
      ballAngle  = startBall  + (endBall  - startBall) * eb;
      // settle wobble: small damped oscillation in the last 8% of the spin
      if (t > 0.92) {
        var w = (t - 0.92) / 0.08;
        ballAngle += Math.sin(w * Math.PI * 4) * 0.025 * (1 - w);
      }
      drawWheel();
      if (t < 1) rafId = requestAnimationFrame(frame);
      else if (onDone) onDone();
    }
    rafId = requestAnimationFrame(frame);
  }

  // ---------- chip helpers ----------
  var CHIP_DENOMS = [500, 100, 25, 5, 1];
  function decompose(amount) {
    var out = [];
    var rem = Math.max(0, Math.floor(amount));
    for (var i = 0; i < CHIP_DENOMS.length; i++) {
      var d = CHIP_DENOMS[i];
      while (rem >= d) { out.push(d); rem -= d; }
    }
    return out;
  }
  function paintStack() {
    if (!stackEl) return;
    stackEl.innerHTML = '';
    var total = totalBet();
    if (total <= 0) {
      var e = document.createElement('span');
      e.className = 'chip-stack-empty';
      e.textContent = 'no chips on the table';
      stackEl.appendChild(e);
      return;
    }
    var chips = decompose(total);
    // group identical denominations into stacks
    var groups = [];
    chips.forEach(function (v) {
      if (groups.length && groups[groups.length - 1].v === v) {
        groups[groups.length - 1].n++;
      } else {
        groups.push({ v: v, n: 1 });
      }
    });
    groups.forEach(function (g) {
      var col = document.createElement('div');
      col.style.display = 'flex';
      col.style.flexDirection = 'column-reverse';
      col.style.alignItems = 'center';
      col.style.position = 'relative';
      col.style.height = '100%';
      col.style.minWidth = '26px';
      var max = Math.min(g.n, 8);
      for (var i = 0; i < max; i++) {
        var c = document.createElement('div');
        c.className = 'chip';
        c.setAttribute('data-v', g.v);
        c.style.height = '7px';
        c.style.marginTop = '-3px';
        col.appendChild(c);
      }
      var label = document.createElement('div');
      label.style.fontFamily = 'var(--sans)';
      label.style.fontSize = '0.62rem';
      label.style.color = 'var(--soft)';
      label.style.marginTop = '2px';
      label.textContent = g.n + '×' + g.v;
      col.appendChild(label);
      stackEl.appendChild(col);
    });
  }

  // ---------- bets ----------
  function totalBet() {
    var t = 0;
    for (var k in bets) if (bets.hasOwnProperty(k)) t += bets[k];
    return t;
  }
  function getStake() {
    var v = parseInt(stakeEl.value, 10);
    if (!isFinite(v) || v < 1) v = 1;
    return v;
  }
  function placeBet(key) {
    if (spinning) return;
    var stake = getStake();
    if (stake > bankroll - totalBet()) {
      stake = Math.max(0, bankroll - totalBet());
      if (stake <= 0) { flashStat(bankrollEl); return; }
    }
    bets[key] = (bets[key] || 0) + stake;
    paintBets();
    paintStack();
    paintHeader();
  }
  function clearBets() {
    if (spinning) return;
    bets = {};
    paintBets();
    paintStack();
    paintHeader();
  }
  function paintBets() {
    if (!betGrid) return;
    Array.prototype.forEach.call(betGrid.querySelectorAll('button[data-bet]'), function (b) {
      var k = b.getAttribute('data-bet');
      var v = bets[k] || 0;
      b.classList.toggle('placed', v > 0);
      // keep base label, append amount
      var base = b.dataset.label || b.textContent.replace(/\s+\$\d+(?:,\d+)*$/, '');
      b.dataset.label = base;
      b.textContent = v > 0 ? base + '  $' + v.toLocaleString('en-US') : base;
    });
  }
  function flashStat(el) {
    if (!el) return;
    el.style.transition = 'color 0.2s ease';
    var prev = el.style.color;
    el.style.color = 'var(--accent)';
    setTimeout(function () { el.style.color = prev; }, 350);
  }

  // ---------- header / recent ----------
  function paintHeader() {
    bankrollEl.textContent = fmt(bankroll);
    profitEl.textContent = fmtSigned(sessionProfit);
    profitEl.style.color = sessionProfit > 0 ? '#1b6e3a'
                          : sessionProfit < 0 ? 'var(--accent)'
                          : 'var(--text)';
    spinsEl.textContent = String(spinsCount);
  }
  function paintRecent() {
    if (!recentEl) return;
    recentEl.innerHTML = '';
    recent.slice(-12).forEach(function (n) {
      var d = document.createElement('span');
      d.className = 'num ' + colorClassOf(n);
      d.textContent = String(n);
      recentEl.appendChild(d);
    });
  }
  function showOverlay(n) {
    if (!overlay) return;
    var c = colorOf(n);
    overlay.textContent = String(n);
    overlay.style.background =
      c === 'red'   ? 'radial-gradient(circle, rgba(184,92,56,0.85) 0%, rgba(184,92,56,0) 60%)' :
      c === 'black' ? 'radial-gradient(circle, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0) 60%)' :
                      'radial-gradient(circle, rgba(27,110,58,0.8) 0%, rgba(27,110,58,0) 60%)';
    overlay.classList.add('show');
    setTimeout(function () { overlay.classList.remove('show'); }, 1700);
  }

  // ---------- play spin ----------
  function spinPlay() {
    if (spinning) return;
    var stakes = totalBet();
    if (stakes <= 0) { flashStat(profitEl); return; }
    if (stakes > bankroll) { flashStat(bankrollEl); return; }

    spinning = true;
    spinBtn.disabled = true;
    clearBtn.disabled = true;

    // deduct stakes immediately
    bankroll -= stakes;
    paintHeader();
    var winNum = Math.floor(Math.random() * N_POCKETS); // 0..36 uniform
    spinTo(winNum, function () {
      // resolve bets
      var payout = 0;
      var winningBets = [];
      for (var k in bets) {
        if (!bets.hasOwnProperty(k)) continue;
        var def = BETS[k];
        if (def && def.test(winNum)) {
          payout += bets[k] * (1 + def.pay); // stake returned + winnings
          winningBets.push(k);
        }
      }
      var net = payout - stakes;
      bankroll += payout;
      sessionProfit += net;
      spinsCount += 1;
      recent.push(winNum);
      paintRecent();
      paintHeader();
      showOverlay(winNum);
      lastBets = Object.assign({}, bets);
      // visual: keep losing bets dim, briefly highlight winners
      Array.prototype.forEach.call(betGrid.querySelectorAll('button[data-bet]'), function (b) {
        if (winningBets.indexOf(b.getAttribute('data-bet')) >= 0) {
          b.style.boxShadow = '0 0 0 3px rgba(27,110,58,0.55)';
          setTimeout(function () { b.style.boxShadow = ''; }, 1500);
        }
      });
      // running peak record
      var prevPeak = loadPeak();
      if (sessionProfit > prevPeak) {
        savePeak(sessionProfit);
        paintPeak(true);
      }
      // strategy state advances on the wagered target (one logical bet at a time)
      var primary = stratBetEl ? stratBetEl.value : null;
      if (primary && (primary in bets || winningBets.length || stakes > 0)) {
        var unitsBet = Math.max(1, Math.round((bets[primary] || stakes) / Math.max(1, strategyState.base)));
        var wonOnPrimary = winningBets.indexOf(primary) >= 0;
        updateStrategy(strategyState, wonOnPrimary, unitsBet);
        refreshStrategyDisplay();
      }
      // clear bets after spin
      bets = {};
      paintBets();
      paintStack();
      spinning = false;
      spinBtn.disabled = false;
      clearBtn.disabled = false;
    });
  }

  function cashOut() {
    if (spinning) return;
    if (sessionProfit !== 0 || spinsCount > 0) {
      recordResult(sessionProfit, 'manual', spinsCount, 'manual');
    }
    bankroll = STARTING_BANKROLL;
    sessionProfit = 0;
    spinsCount = 0;
    bets = {};
    recent = [];
    paintBets();
    paintStack();
    paintHeader();
    paintRecent();
  }

  // ---------- strategy logic ----------
  function newStrategyState(strat, base) {
    base = Math.max(1, parseInt(base, 10) || 1);
    if (strat === 'flat') return { strat: strat, base: base };
    if (strat === 'martingale') return { strat: strat, base: base, current: base };
    if (strat === 'fibonacci') return { strat: strat, base: base, idx: 0, fib: [1, 1] };
    if (strat === 'dalembert') return { strat: strat, base: base, units: 1 };
    if (strat === 'labouchere') return { strat: strat, base: base, list: [1, 2, 3] };
    return { strat: 'flat', base: base };
  }
  function fibAt(state, i) {
    while (state.fib.length <= i + 1) {
      state.fib.push(state.fib[state.fib.length - 1] + state.fib[state.fib.length - 2]);
    }
    return state.fib[i];
  }
  function suggestBet(state) {
    if (state.strat === 'flat') return state.base;
    if (state.strat === 'martingale') return state.current;
    if (state.strat === 'fibonacci') return state.base * fibAt(state, state.idx);
    if (state.strat === 'dalembert') return state.base * state.units;
    if (state.strat === 'labouchere') {
      if (!state.list.length) return state.base; // sequence done, reset to 1 unit
      if (state.list.length === 1) return state.base * state.list[0];
      return state.base * (state.list[0] + state.list[state.list.length - 1]);
    }
    return state.base;
  }
  function updateStrategy(state, won, lastUnits) {
    if (state.strat === 'flat') return;
    if (state.strat === 'martingale') {
      state.current = won ? state.base : state.current * 2;
      return;
    }
    if (state.strat === 'fibonacci') {
      state.idx = won ? Math.max(0, state.idx - 2) : state.idx + 1;
      return;
    }
    if (state.strat === 'dalembert') {
      state.units = won ? Math.max(1, state.units - 1) : state.units + 1;
      return;
    }
    if (state.strat === 'labouchere') {
      if (won) {
        if (state.list.length <= 2) state.list = [];
        else { state.list.shift(); state.list.pop(); }
        if (!state.list.length) state.list = [1, 2, 3]; // restart cycle
      } else {
        state.list.push(lastUnits);
      }
      return;
    }
  }

  // refresh side-panel "next bet" reading from the live play-side state
  function refreshStrategyDisplay() {
    // re-baseline if user changed strategy or base mid-run
    if (strategyState.strat !== strategy ||
        strategyState.base !== (parseInt(baseEl.value, 10) || 1)) {
      strategyState = newStrategyState(strategy, parseInt(baseEl.value, 10) || 1);
    }
    var next = suggestBet(strategyState);
    stratNextEl.textContent = '$' + next.toLocaleString('en-US');
    stratExplain.textContent = STRAT_INFO[strategy] || '';
  }

  // place the strategy's suggested wager on the chosen target
  function autoBet() {
    if (spinning) return;
    var target = stratBetEl ? stratBetEl.value : 'red';
    var amount = suggestBet(strategyState);
    if (amount <= 0) amount = strategyState.base;
    if (amount > bankroll - totalBet()) amount = Math.max(0, bankroll - totalBet());
    if (amount <= 0) { flashStat(bankrollEl); return; }
    bets[target] = (bets[target] || 0) + amount;
    paintBets();
    paintStack();
    paintHeader();
  }

  // ---------- simulation ----------
  // Returns { trajectory, finalBankroll, peak, trough, busted, wins, losses }
  function simulate(strat, base, betKey, bankroll0, spins, opts) {
    opts = opts || {};
    var keepTraj = opts.keepTraj !== false; // pass false to skip Float32Array allocation
    var state = newStrategyState(strat, base);
    var bk = bankroll0;
    var peak = 0;
    var trough = 0;
    var wins = 0, losses = 0;
    var traj = keepTraj ? new Float32Array(spins + 1) : null;
    if (traj) traj[0] = 0;
    var betDef = BETS[betKey];
    if (!betDef) betDef = BETS.red;

    // strategy telemetry
    var maxBet = 0, maxLossStreak = 0, maxWinStreak = 0, lossStreak = 0, winStreak = 0;
    var maxFibIdx = 0, maxDAUnits = 1, maxLabLen = 0;

    for (var i = 1; i <= spins; i++) {
      var bet = suggestBet(state);
      if (bet > bk) bet = bk;
      if (bet <= 0) { if (traj) traj[i] = bk - bankroll0; continue; }
      if (bet > maxBet) maxBet = bet;
      var roll = Math.floor(Math.random() * N_POCKETS);
      var won = betDef.test(roll);
      var lastUnits = Math.max(1, Math.round(bet / state.base));
      if (won) {
        bk += bet * betDef.pay;
        wins++;
        winStreak++; if (winStreak > maxWinStreak) maxWinStreak = winStreak;
        lossStreak = 0;
      } else {
        bk -= bet;
        losses++;
        lossStreak++; if (lossStreak > maxLossStreak) maxLossStreak = lossStreak;
        winStreak = 0;
      }
      updateStrategy(state, won, lastUnits);
      // capture per-strategy telemetry
      if (state.idx > maxFibIdx) maxFibIdx = state.idx;
      if (state.units && state.units > maxDAUnits) maxDAUnits = state.units;
      if (state.list && state.list.length > maxLabLen) maxLabLen = state.list.length;

      var prof = bk - bankroll0;
      if (prof > peak) peak = prof;
      if (prof < trough) trough = prof;
      if (traj) traj[i] = prof;
      if (bk <= 0) {
        if (traj) for (var j = i + 1; j <= spins; j++) traj[j] = bk - bankroll0;
        return {
          trajectory: traj, finalBankroll: bk, peak: peak, trough: trough,
          busted: true, wins: wins, losses: losses, lastSpin: i,
          maxBet: maxBet, maxLossStreak: maxLossStreak, maxWinStreak: maxWinStreak,
          finalState: state, maxFibIdx: maxFibIdx, maxDAUnits: maxDAUnits, maxLabLen: maxLabLen
        };
      }
    }
    return {
      trajectory: traj, finalBankroll: bk, peak: peak, trough: trough,
      busted: false, wins: wins, losses: losses, lastSpin: spins,
      maxBet: maxBet, maxLossStreak: maxLossStreak, maxWinStreak: maxWinStreak,
      finalState: state, maxFibIdx: maxFibIdx, maxDAUnits: maxDAUnits, maxLabLen: maxLabLen
    };
  }

  function runSimulation() {
    var spins = Math.max(1, Math.min(50000, parseInt(simSpinsEl.value, 10) || 500));
    var bank = Math.max(10, parseInt(simBankEl.value, 10) || 1000);
    var base = Math.max(1, parseInt(baseEl.value, 10) || 5);
    var betKey = stratBetEl.value || 'red';
    var t0 = performance.now();
    var res = simulate(strategy, base, betKey, bank, spins);
    var dt = performance.now() - t0;

    var profit = res.finalBankroll - bank;
    var pct = (res.wins + res.losses) > 0 ? (100 * res.wins / (res.wins + res.losses)) : 0;
    simSummaryEl.innerHTML =
      '<strong>' + STRAT_INFO[strategy].split(':')[0] + '</strong> on <strong>' + betKey +
      '</strong> · <strong>' + res.lastSpin.toLocaleString('en-US') + '</strong> spins · ' +
      'final ' + (profit >= 0 ? '<span style="color:#1b6e3a">' : '<span style="color:var(--accent)">') +
        fmtSigned(profit) + '</span> · ' +
      'peak ' + fmtSigned(res.peak) + ' · ' +
      'trough ' + fmtSigned(res.trough) + ' · ' +
      'win rate ' + pct.toFixed(1) + '%' +
      (res.busted ? ' · <span style="color:var(--accent)"><strong>busted</strong> at spin ' + res.lastSpin + '</span>' : '') +
      ' · ' + dt.toFixed(0) + 'ms';

    paintSpark(res.trajectory);
    paintHist(res.trajectory, bank);
    paintStrategyState(res);
    recordResult(res.peak, strategy, res.lastSpin, strategy);
  }

  function paintStrategyState(res) {
    if (!simStratStateEl) return;
    var html = '<strong>Strategy telemetry — ' + strategy + ':</strong> ';
    var bits = [
      'peak wager <code>$' + Math.round(res.maxBet).toLocaleString('en-US') + '</code>',
      'max loss streak <code>' + res.maxLossStreak + '</code>',
      'max win streak <code>' + res.maxWinStreak + '</code>'
    ];
    if (strategy === 'fibonacci') {
      bits.push('peak Fibonacci index <code>' + res.maxFibIdx + '</code>');
    } else if (strategy === 'dalembert') {
      bits.push('peak units <code>' + res.maxDAUnits + '</code>');
    } else if (strategy === 'labouchere' && res.finalState && res.finalState.list) {
      bits.push('peak list length <code>' + res.maxLabLen + '</code>');
      var L = res.finalState.list;
      var preview = L.length > 10 ? L.slice(0, 10).join(', ') + ', …(' + L.length + ' total)' : (L.join(', ') || 'empty');
      bits.push('final list <code>[' + preview + ']</code>');
    }
    simStratStateEl.innerHTML = html + bits.join(' · ') + '.';
    simStratStateEl.style.display = 'block';
  }

  // ---------- Monte Carlo aggregate ----------
  // Run K independent sims with the current settings; report distribution.
  function runMonteCarlo() {
    var spins = Math.max(1, Math.min(50000, parseInt(simSpinsEl.value, 10) || 500));
    var bank = Math.max(10, parseInt(simBankEl.value, 10) || 1000);
    var base = Math.max(1, parseInt(baseEl.value, 10) || 5);
    var betKey = stratBetEl.value || 'red';
    var K = Math.max(1, Math.min(5000, parseInt(simRunsEl ? simRunsEl.value : 500, 10) || 500));

    if (simMcBtn) { simMcBtn.disabled = true; simMcBtn.textContent = 'running…'; }

    // run on next tick so the disabled state paints first
    setTimeout(function () {
      var t0 = performance.now();
      var finals = new Float32Array(K);
      var peaks = new Float32Array(K);
      var lastSpins = new Int32Array(K);
      var busts = 0, profitable = 0;
      for (var k = 0; k < K; k++) {
        var r = simulate(strategy, base, betKey, bank, spins, { keepTraj: false });
        var prof = r.finalBankroll - bank;
        finals[k] = prof;
        peaks[k] = r.peak;
        lastSpins[k] = r.lastSpin;
        if (r.busted) busts++;
        if (prof > 0) profitable++;
      }
      var dt = performance.now() - t0;

      // compute summary stats
      var sortedFinals = Array.prototype.slice.call(finals).sort(function (a, b) { return a - b; });
      var median = sortedFinals[Math.floor(K / 2)];
      var mean = sortedFinals.reduce(function (s, v) { return s + v; }, 0) / K;
      var sortedPeaks = Array.prototype.slice.call(peaks).sort(function (a, b) { return a - b; });
      var medianPeak = sortedPeaks[Math.floor(K / 2)];
      var bestPeak = sortedPeaks[K - 1];

      var pBust = (100 * busts / K).toFixed(1);
      var pProfit = (100 * profitable / K).toFixed(1);

      simMcSummaryEl.innerHTML =
        '<strong>Monte Carlo:</strong> ' + K.toLocaleString('en-US') + ' independent runs of ' +
        spins.toLocaleString('en-US') + ' spins · ' +
        'P(profit > 0) <strong>' + pProfit + '%</strong> · ' +
        'P(bust) <strong style="color:var(--accent)">' + pBust + '%</strong> · ' +
        'median final ' + fmtSigned(median) + ' · ' +
        'mean final ' + fmtSigned(mean) + ' · ' +
        'median peak ' + fmtSigned(medianPeak) + ' · ' +
        'best peak <strong style="color:#1b6e3a">' + fmtSigned(bestPeak) + '</strong> · ' +
        dt.toFixed(0) + 'ms';

      paintMcHist(finals, median, bank);
      simMcOutEl.style.display = 'block';

      // record best peak across the whole MC sweep
      recordResult(bestPeak, strategy + ' (MC)', spins * K, strategy);

      if (simMcBtn) { simMcBtn.disabled = false; simMcBtn.textContent = 'aggregate'; }
    }, 16);
  }

  function paintMcHist(finals, median, bank0) {
    if (!simMcHistEl) return;
    simMcHistEl.innerHTML = '';
    var W = 600, H = 80, P = 4;
    var n = finals.length;
    if (!n) return;
    var minV = Infinity, maxV = -Infinity;
    for (var i = 0; i < n; i++) {
      if (finals[i] < minV) minV = finals[i];
      if (finals[i] > maxV) maxV = finals[i];
    }
    // symmetric range around 0 if both signs present, else clamp
    var span = Math.max(Math.abs(minV), Math.abs(maxV), bank0 / 4);
    var lo = -span, hi = span;
    var BUCKETS = 30;
    var counts = new Array(BUCKETS).fill(0);
    for (var j = 0; j < n; j++) {
      var b = Math.floor((finals[j] - lo) / (hi - lo) * BUCKETS);
      if (b < 0) b = 0; if (b >= BUCKETS) b = BUCKETS - 1;
      counts[b]++;
    }
    var maxC = 1;
    for (var c = 0; c < BUCKETS; c++) if (counts[c] > maxC) maxC = counts[c];

    var bw = (W - 2 * P) / BUCKETS;
    for (var k = 0; k < BUCKETS; k++) {
      var x = P + k * bw;
      var h = (counts[k] / maxC) * (H - 2 * P - 8);
      if (counts[k] > 0 && h < 1) h = 1;
      var y = H - P - h;
      var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      var bucketCenter = lo + (k + 0.5) * (hi - lo) / BUCKETS;
      rect.setAttribute('class', counts[k] === 0 ? 'zero' :
                                  bucketCenter > 0 ? 'pos' :
                                  bucketCenter < 0 ? 'neg' : 'zero');
      rect.setAttribute('x', x.toFixed(1));
      rect.setAttribute('y', y.toFixed(1));
      rect.setAttribute('width', Math.max(1, bw - 0.6).toFixed(1));
      rect.setAttribute('height', Math.max(1, h).toFixed(1));
      simMcHistEl.appendChild(rect);
    }

    // zero line
    var zeroX = P + (0 - lo) / (hi - lo) * (W - 2 * P);
    var zline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    zline.setAttribute('class', 'zero');
    zline.setAttribute('x1', zeroX.toFixed(1));
    zline.setAttribute('x2', zeroX.toFixed(1));
    zline.setAttribute('y1', P);
    zline.setAttribute('y2', H - P);
    simMcHistEl.appendChild(zline);

    // median line
    var medX = P + (median - lo) / (hi - lo) * (W - 2 * P);
    var mline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    mline.setAttribute('class', 'median');
    mline.setAttribute('x1', medX.toFixed(1));
    mline.setAttribute('x2', medX.toFixed(1));
    mline.setAttribute('y1', P);
    mline.setAttribute('y2', H - P);
    simMcHistEl.appendChild(mline);

    // labels
    if (simMcAxisLo) simMcAxisLo.textContent = fmtSigned(lo);
    if (simMcAxisHi) simMcAxisHi.textContent = fmtSigned(hi);
  }

  function paintSpark(traj) {
    if (!simSparkEl) return;
    simSparkEl.innerHTML = '';
    var W = 600, H = 60, P = 2;
    var n = traj.length;
    if (n < 2) return;
    var min = 0, max = 0;
    for (var i = 0; i < n; i++) {
      if (traj[i] < min) min = traj[i];
      if (traj[i] > max) max = traj[i];
    }
    var span = Math.max(1, max - min);
    function y(v) { return H - P - (H - 2 * P) * (v - min) / span; }
    function x(i) { return P + (W - 2 * P) * (i / (n - 1)); }

    // zero line
    var z = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    z.setAttribute('class', 'zero');
    z.setAttribute('d', 'M ' + P + ',' + y(0).toFixed(1) + ' L ' + (W - P) + ',' + y(0).toFixed(1));
    simSparkEl.appendChild(z);

    // area
    // sample at most ~600 points (drop downsample)
    var STEPS = Math.min(600, n);
    var pts = [];
    for (var s = 0; s < STEPS; s++) {
      var idx = Math.floor(s * (n - 1) / (STEPS - 1));
      pts.push([x(idx), y(traj[idx])]);
    }
    var dArea = 'M ' + pts[0][0].toFixed(1) + ',' + y(0).toFixed(1) + ' ';
    pts.forEach(function (p, i) {
      dArea += (i === 0 ? 'L ' : 'L ') + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ' ';
    });
    dArea += 'L ' + pts[pts.length - 1][0].toFixed(1) + ',' + y(0).toFixed(1) + ' Z';
    var area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    area.setAttribute('class', 'area');
    area.setAttribute('d', dArea);
    simSparkEl.appendChild(area);

    var dLine = pts.map(function (p, i) {
      return (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1);
    }).join(' ');
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('class', 'line');
    line.setAttribute('d', dLine);
    simSparkEl.appendChild(line);
  }

  function paintHist(traj, bank0) {
    if (!simHistEl) return;
    simHistEl.innerHTML = '';
    var BUCKETS = 21;
    var range = bank0; // ±bankroll on either side of zero
    var counts = new Array(BUCKETS).fill(0);
    for (var i = 1; i < traj.length; i++) {
      var v = traj[i];
      // bucket = floor((v + range) / (2*range/BUCKETS)) clamped
      var b = Math.floor((v + range) * BUCKETS / (2 * range));
      if (b < 0) b = 0; if (b >= BUCKETS) b = BUCKETS - 1;
      counts[b]++;
    }
    var max = Math.max.apply(null, counts) || 1;
    counts.forEach(function (c, i) {
      var d = document.createElement('div');
      d.className = 'b' + (c === 0 ? ' zero' : '');
      var h = c === 0 ? 1 : Math.max(2, Math.round((c / max) * 50));
      d.style.height = h + 'px';
      // dim the negative half slightly different
      if (i < BUCKETS / 2) d.style.background = 'var(--accent)';
      else if (i > BUCKETS / 2) d.style.background = '#1b6e3a';
      simHistEl.appendChild(d);
    });
  }

  // ---------- leaderboard ----------
  function paintLeaders() {
    if (!leaderBody) return;
    var arr = loadLeaders();
    if (!arr.length) {
      leaderBody.innerHTML =
        '<tr><td colspan="5" style="color:var(--soft); text-align:center; padding:0.6rem;">' +
        'play a hand or run a simulation to populate.</td></tr>';
      return;
    }
    leaderBody.innerHTML = '';
    arr.forEach(function (r, i) {
      var tr = document.createElement('tr');
      var when = new Date(r.when);
      var ago = relTime(when);
      tr.innerHTML =
        '<td>' + (i + 1) + '</td>' +
        '<td>' + escapeHtml(String(r.strategy)) + '</td>' +
        '<td>' + r.spins.toLocaleString('en-US') + '</td>' +
        '<td class="profit ' + (r.profit >= 0 ? 'pos' : 'neg') + '">' + fmtSigned(r.profit) + '</td>' +
        '<td style="color:var(--soft);">' + ago + '</td>';
      leaderBody.appendChild(tr);
    });
  }
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function relTime(d) {
    var diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.round(diff / 60) + 'm ago';
    if (diff < 86400) return Math.round(diff / 3600) + 'h ago';
    return Math.round(diff / 86400) + 'd ago';
  }

  // ---------- wiring ----------
  function init() {
    // initial draw + first frame
    drawWheel();
    paintHeader();
    paintBets();
    paintStack();
    paintLeaders();
    paintPeak(false);
    refreshStrategyDisplay();

    // idle drift keeps the wheel feeling alive — disabled under reduced motion.
    if (!reducedMotion()) {
      var lastFrame = performance.now();
      (function idleTick(now) {
        if (!spinning) {
          var dt = (now - lastFrame) / 1000;
          wheelAngle += dt * 0.18;
          ballAngle  -= dt * 0.34;
          drawWheel();
        }
        lastFrame = now;
        requestAnimationFrame(idleTick);
      })(performance.now());
    }

    // bet placement
    if (betGrid) {
      betGrid.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-bet]');
        if (!b) return;
        placeBet(b.getAttribute('data-bet'));
      });
    }

    // controls
    spinBtn.addEventListener('click', spinPlay);
    clearBtn.addEventListener('click', clearBets);
    cashoutBtn.addEventListener('click', cashOut);
    if (autobetBtn) autobetBtn.addEventListener('click', autoBet);

    document.addEventListener('keydown', function (e) {
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return;
      if (e.key === ' ') { e.preventDefault(); spinPlay(); return; }
      if (e.key === 'a' || e.key === 'A') { autoBet(); return; }
      if (e.key === 'c' || e.key === 'C') { clearBets(); return; }
      if (e.key === 's' || e.key === 'S') { runSimulation(); return; }
    });

    // strategy
    if (stratPills) {
      stratPills.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-s]');
        if (!b) return;
        strategy = b.getAttribute('data-s');
        Array.prototype.forEach.call(stratPills.querySelectorAll('button'), function (x) {
          x.classList.toggle('on', x === b);
        });
        refreshStrategyDisplay();
      });
    }
    if (baseEl) baseEl.addEventListener('input', refreshStrategyDisplay);
    if (stratBetEl) stratBetEl.addEventListener('change', refreshStrategyDisplay);

    // sim
    if (simRunBtn) simRunBtn.addEventListener('click', runSimulation);
    if (simMcBtn) simMcBtn.addEventListener('click', runMonteCarlo);

    // leaderboard
    if (leaderClearBtn) {
      leaderClearBtn.addEventListener('click', function () {
        try { localStorage.removeItem(LS_LEADER); localStorage.removeItem(LS_PEAK); } catch (e) {}
        paintLeaders();
        paintPeak(false);
      });
    }

    window.addEventListener('resize', drawWheel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
