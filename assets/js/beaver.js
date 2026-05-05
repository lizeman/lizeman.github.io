/* Busy Beaver visualizer v2 — DOM-based animated tape, mini-map,
   step-back history, state diagram, speed presets, keyboard shortcuts. */
(function () {
  'use strict';

  // ---------- machines ----------
  var MACHINES = {
    bb2: {
      name: 'BB(2)', start: 'A',
      transitions: {
        A: [{w:1,m:'R',n:'B'}, {w:1,m:'L',n:'B'}],
        B: [{w:1,m:'L',n:'A'}, {w:1,m:'R',n:'H'}]
      }
    },
    bb3: {
      name: 'BB(3)', start: 'A',
      transitions: {
        A: [{w:1,m:'R',n:'B'}, {w:1,m:'R',n:'H'}],
        B: [{w:0,m:'R',n:'C'}, {w:1,m:'R',n:'B'}],
        C: [{w:1,m:'L',n:'C'}, {w:1,m:'L',n:'A'}]
      }
    },
    bb4: {
      name: 'BB(4)', start: 'A',
      transitions: {
        A: [{w:1,m:'R',n:'B'}, {w:1,m:'L',n:'B'}],
        B: [{w:1,m:'L',n:'A'}, {w:0,m:'L',n:'C'}],
        C: [{w:1,m:'R',n:'H'}, {w:1,m:'L',n:'D'}],
        D: [{w:1,m:'R',n:'D'}, {w:0,m:'R',n:'A'}]
      }
    },
    // BB(5) Marxen-Buntrock 1989 champion (proved optimal, 2024 Busy
    // Beaver Challenge). Writes 4098 ones in 47,176,870 steps.
    bb5: {
      name: 'BB(5)', start: 'A',
      transitions: {
        A: [{w:1,m:'R',n:'B'}, {w:1,m:'L',n:'C'}],
        B: [{w:1,m:'R',n:'C'}, {w:1,m:'R',n:'B'}],
        C: [{w:1,m:'R',n:'D'}, {w:0,m:'L',n:'E'}],
        D: [{w:1,m:'L',n:'A'}, {w:1,m:'L',n:'D'}],
        E: [{w:1,m:'R',n:'H'}, {w:0,m:'L',n:'A'}]
      }
    }
  };

  var SPEED = {
    slow: 600, medium: 220, fast: 80, blitz: 25, max: 0
  };

  // ---------- state ----------
  var st = {
    machineKey: 'bb3',
    tape: {},               // index -> 0/1
    cellWriteStep: {},      // index -> step at which last written
    head: 0,
    s: 'A',
    steps: 0,
    halted: false,
    playing: false,
    timerId: null,
    rafId: 0,
    speed: 'medium',
    history: [],            // ring buffer for step-back, capped
    historyMax: 200,
    trajectory: []          // array of head positions over time
  };

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- DOM ----------
  var tape = document.getElementById('bb-tape');
  var head = document.getElementById('bb-head');
  var headMeta = document.getElementById('bb-head-meta');
  var stateEl = document.getElementById('bb-state');
  var stepsEl = document.getElementById('bb-steps');
  var onesEl = document.getElementById('bb-ones');
  var tableBody = document.querySelector('#bb-table tbody');
  var summaryEl = document.getElementById('bb-summary');
  var diagram = document.getElementById('bb-diagram');
  var minimap = document.getElementById('bb-minimap');
  var machineSel = document.getElementById('bb-machine');
  var playBtn = document.getElementById('bb-play');
  var stepBtn = document.getElementById('bb-step');
  var backBtn = document.getElementById('bb-back');
  var resetBtn = document.getElementById('bb-reset');
  var speedTabs = document.getElementById('bb-speed');
  if (!tape || !head || !tableBody || !diagram || !minimap) return;

  var mctx = minimap.getContext('2d');

  // ---------- tape rendering ----------
  var CELL = 32;            // cell + 1px gap each side ≈ 32px
  var visibleCells;
  function computeVisibleCells() {
    var w = tape.parentElement.clientWidth;
    visibleCells = Math.max(11, Math.floor((w - 16) / CELL));
    if (visibleCells % 2 === 0) visibleCells -= 1; // keep odd so head sits centered
  }

  function buildTape() {
    tape.innerHTML = '';
    var half = (visibleCells - 1) / 2;
    for (var i = -half; i <= half; i++) {
      var c = document.createElement('div');
      c.className = 'cell zero';
      c.dataset.offset = String(i);
      c.textContent = '0';
      tape.appendChild(c);
    }
  }

  function paintTape() {
    if (!tape.children.length) buildTape();
    var half = (visibleCells - 1) / 2;
    var stage = tape.parentElement.getBoundingClientRect();
    for (var i = -half; i <= half; i++) {
      var idx = st.head + i;
      var v = st.tape[idx] || 0;
      var c = tape.children[i + half];
      c.textContent = v ? '1' : '0';
      c.classList.toggle('one', v === 1);
      c.classList.toggle('zero', v !== 1);

      // heat-fade: cell background tinted by recency of last write
      var when = st.cellWriteStep[idx];
      if (when != null && st.steps > 0 && v) {
        var age = (st.steps - when) / Math.max(1, st.steps);
        // age=0 (just written): full text bg; age=1 (long ago): muted
        var alpha = 1 - Math.min(0.7, age * 0.7);
        c.style.background = 'rgba(28, 28, 28, ' + alpha.toFixed(2) + ')';
      } else {
        c.style.background = '';
      }
    }
    // head sits at index 0 of the tape (i.e. half-th cell)
    var headCell = tape.children[half];
    if (headCell) {
      var rect = headCell.getBoundingClientRect();
      var stageRect = tape.parentElement.getBoundingClientRect();
      head.style.transform = 'translateX(' +
        (rect.left - stageRect.left - 1) + 'px) translateY(' +
        (rect.top - stageRect.top - 4) + 'px)';
      head.style.width = (rect.width + 2) + 'px';
    }
    headMeta.textContent = 'head @ ' + st.head + (st.halted ? ' (halted)' : '');
  }

  // ---------- mini-map ----------
  function paintMinimap() {
    var w = minimap.clientWidth, h = minimap.clientHeight;
    var dpr = window.devicePixelRatio || 1;
    if (minimap.width !== Math.floor(w * dpr)) {
      minimap.width = Math.floor(w * dpr);
      minimap.height = Math.floor(h * dpr);
    }
    mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mctx.clearRect(0, 0, w, h);

    var traj = st.trajectory;
    if (!traj.length) return;
    var lo = Math.min.apply(null, traj);
    var hi = Math.max.apply(null, traj);
    var range = Math.max(1, hi - lo);

    // axis line for head=0
    mctx.strokeStyle = 'rgba(0,0,0,0.06)';
    mctx.beginPath();
    var zeroY = h - ((0 - lo) / range) * h;
    mctx.moveTo(0, zeroY); mctx.lineTo(w, zeroY); mctx.stroke();

    mctx.fillStyle = '#b85c38';
    var xStep = w / Math.max(1, traj.length - 1);
    for (var i = 0; i < traj.length; i++) {
      var x = i * xStep;
      var y = h - ((traj[i] - lo) / range) * h;
      mctx.fillRect(x, y, Math.max(1, xStep), 1.4);
    }
    // mark current position
    var cx = (traj.length - 1) * xStep;
    var cy = h - ((traj[traj.length - 1] - lo) / range) * h;
    mctx.fillStyle = '#1c1c1c';
    mctx.beginPath();
    mctx.arc(cx, cy, 2.4, 0, Math.PI * 2);
    mctx.fill();
  }

  // ---------- transition table ----------
  function fmtMove(t) {
    return t.w + ',' + t.m + ',' + (t.n === 'H' ? 'halt' : t.n);
  }
  function buildTable() {
    var m = MACHINES[st.machineKey];
    tableBody.innerHTML = '';
    Object.keys(m.transitions).forEach(function (k) {
      var tr = document.createElement('tr');
      tr.dataset.state = k;
      var t0 = m.transitions[k][0];
      var t1 = m.transitions[k][1];
      tr.innerHTML = '<td>' + k + '</td><td>' + fmtMove(t0) + '</td><td>' + fmtMove(t1) + '</td>';
      tableBody.appendChild(tr);
    });
  }
  function paintTable() {
    Array.prototype.forEach.call(tableBody.querySelectorAll('tr'), function (tr) {
      tr.classList.toggle('firing', tr.dataset.state === st.s && !st.halted);
    });
    stateEl.textContent = st.halted ? 'HALT' : st.s;
  }

  // ---------- state diagram ----------
  // place state nodes around a circle, plus a halt node bottom-center.
  function buildDiagram() {
    diagram.innerHTML = '';
    var m = MACHINES[st.machineKey];
    var states = Object.keys(m.transitions);
    var allNodes = states.concat(['H']);
    var W = 360, H = 240, cx = W/2, cy = 110, R = 75;

    var pos = {};
    states.forEach(function (s, i) {
      var t = -Math.PI/2 + (2 * Math.PI * i / states.length);
      pos[s] = { x: cx + R * Math.cos(t), y: cy + R * Math.sin(t) };
    });
    pos.H = { x: cx, y: H - 24 };

    var ns = 'http://www.w3.org/2000/svg';
    function el(tag, attrs) {
      var e = document.createElementNS(ns, tag);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      return e;
    }

    // arrowhead marker
    var defs = el('defs', {});
    var marker = el('marker', { id: 'arrow', viewBox: '0 0 10 10', refX: '8', refY: '5',
      markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' });
    marker.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', class: 'arrowhead' }));
    var markerF = el('marker', { id: 'arrowF', viewBox: '0 0 10 10', refX: '8', refY: '5',
      markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' });
    markerF.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', class: 'arrowhead firing' }));
    defs.appendChild(marker); defs.appendChild(markerF);
    diagram.appendChild(defs);

    // edges first (so nodes paint over)
    var edgeGroup = el('g', { class: 'edges' });
    diagram.appendChild(edgeGroup);

    states.forEach(function (s) {
      [0, 1].forEach(function (read) {
        var t = m.transitions[s][read];
        var to = t.n;
        var p = pos[s], q = pos[to];
        var path, label, midX, midY;
        if (s === to) {
          // self-loop: small arc above node
          path = el('path', { class: 'edge', d:
            'M' + (p.x - 12) + ',' + (p.y - 16) +
            ' Q' + p.x + ',' + (p.y - 38) + ' ' +
            (p.x + 12) + ',' + (p.y - 16),
            'marker-end': 'url(#arrow)'
          });
          midX = p.x; midY = p.y - 36;
        } else {
          // line slightly offset depending on read so the two
          // labels don't overlap
          var dx = q.x - p.x, dy = q.y - p.y;
          var len = Math.sqrt(dx*dx + dy*dy) || 1;
          var ox = -dy / len * (read === 0 ? 6 : -6);
          var oy = dx / len * (read === 0 ? 6 : -6);
          // shorten so arrow stops at node edge
          var nx = dx / len, ny = dy / len;
          var sx = p.x + nx * 18, sy = p.y + ny * 18;
          var tx = q.x - nx * 18, ty = q.y - ny * 18;
          path = el('path', { class: 'edge', d:
            'M' + (sx + ox).toFixed(1) + ',' + (sy + oy).toFixed(1) +
            ' L' + (tx + ox).toFixed(1) + ',' + (ty + oy).toFixed(1),
            'marker-end': 'url(#arrow)'
          });
          midX = (sx + tx) / 2 + ox * 1.4;
          midY = (sy + ty) / 2 + oy * 1.4;
        }
        path.dataset.from = s;
        path.dataset.read = String(read);
        edgeGroup.appendChild(path);

        label = el('text', {
          class: 'edge-label', x: midX, y: midY,
          'text-anchor': 'middle'
        });
        label.dataset.from = s;
        label.dataset.read = String(read);
        label.textContent = read + '|' + t.w + t.m + (t.n === 'H' ? 'H' : t.n);
        edgeGroup.appendChild(label);
      });
    });

    // nodes
    allNodes.forEach(function (s) {
      var p = pos[s];
      var g = el('g', { class: 'node' + (s === 'H' ? ' halt' : ''), 'data-s': s });
      g.appendChild(el('circle', { cx: p.x, cy: p.y, r: 16 }));
      var t = el('text', { x: p.x, y: p.y + 5, 'text-anchor': 'middle' });
      t.textContent = s;
      g.appendChild(t);
      diagram.appendChild(g);
    });
  }

  function paintDiagram() {
    var fromRead;
    if (!st.halted) {
      var m = MACHINES[st.machineKey];
      var read = st.tape[st.head] || 0;
      fromRead = { from: st.s, read: read };
    }
    Array.prototype.forEach.call(diagram.querySelectorAll('.node'), function (n) {
      n.classList.toggle('current', n.dataset.s === st.s && !st.halted);
    });
    Array.prototype.forEach.call(diagram.querySelectorAll('.edge'), function (e) {
      var firing = fromRead && e.dataset.from === fromRead.from && e.dataset.read === String(fromRead.read);
      e.classList.toggle('firing', !!firing);
      e.setAttribute('marker-end', firing ? 'url(#arrowF)' : 'url(#arrow)');
    });
    Array.prototype.forEach.call(diagram.querySelectorAll('.edge-label'), function (l) {
      var firing = fromRead && l.dataset.from === fromRead.from && l.dataset.read === String(fromRead.read);
      l.classList.toggle('firing', !!firing);
    });
  }

  // ---------- core step ----------
  function readCell(i) { return st.tape[i] || 0; }
  function writeCell(i, v) {
    if (v) st.tape[i] = 1;
    else delete st.tape[i];
    st.cellWriteStep[i] = st.steps;
  }
  function countOnes() {
    var n = 0;
    for (var k in st.tape) if (st.tape[k]) n++;
    return n;
  }

  function pushHistory(snap) {
    st.history.push(snap);
    if (st.history.length > st.historyMax) st.history.shift();
    backBtn.disabled = !st.history.length;
  }

  function step() {
    if (st.halted) return false;
    var m = MACHINES[st.machineKey];
    var read = readCell(st.head);
    var t = m.transitions[st.s][read];
    if (!t) { st.halted = true; finalize(); return false; }
    pushHistory({
      head: st.head, s: st.s, prev: read, prevWriteStep: st.cellWriteStep[st.head]
    });
    writeCell(st.head, t.w);
    st.head += (t.m === 'R' ? 1 : -1);
    st.s = t.n;
    st.steps += 1;
    // cap trajectory: downsample when it gets large (BB(5) emits ~47M)
    if (st.trajectory.length < 4000) {
      st.trajectory.push(st.head);
    } else if (st.steps % Math.ceil(st.steps / 4000) === 0) {
      st.trajectory.push(st.head);
    }
    if (st.s === 'H') { st.halted = true; finalize(); }
    return true;
  }

  function stepBack() {
    if (!st.history.length) return;
    var snap = st.history.pop();
    backBtn.disabled = !st.history.length;
    st.head = snap.head;
    st.s = snap.s;
    if (snap.prev) st.tape[st.head] = snap.prev;
    else delete st.tape[st.head];
    if (snap.prevWriteStep != null) st.cellWriteStep[st.head] = snap.prevWriteStep;
    else delete st.cellWriteStep[st.head];
    if (st.steps > 0) st.steps -= 1;
    st.trajectory.pop();
    st.halted = false;
    summaryEl.classList.remove('show');
    paintAll();
  }

  function finalize() { pause(); paintAll(); paintSummary(); }
  function paintSummary() {
    if (!st.halted) { summaryEl.classList.remove('show'); return; }
    var ones = countOnes();
    var lo = st.trajectory.length ? Math.min.apply(null, st.trajectory) : 0;
    var hi = st.trajectory.length ? Math.max.apply(null, st.trajectory) : 0;
    var name = MACHINES[st.machineKey].name;
    summaryEl.innerHTML =
      '<strong>' + name + '</strong> halted in <strong>' + st.steps + '</strong> steps, ' +
      'wrote <strong>' + ones + '</strong> ones, ' +
      'visited cells <strong>' + lo + '</strong>…<strong>' + hi + '</strong>.';
    summaryEl.classList.add('show');
  }

  function paintAll() {
    paintTape();
    paintTable();
    paintDiagram();
    paintMinimap();
    stepsEl.textContent = st.steps;
    onesEl.textContent = countOnes();
  }

  function reset(machineKey) {
    pause();
    st.machineKey = machineKey || st.machineKey;
    st.tape = {}; st.cellWriteStep = {};
    st.head = 0;
    st.s = MACHINES[st.machineKey].start;
    st.steps = 0;
    st.halted = false;
    st.history = [];
    st.trajectory = [0];
    backBtn.disabled = true;
    summaryEl.classList.remove('show');
    buildTable();
    buildDiagram();
    paintAll();
  }

  function delay() { return SPEED[st.speed] || 220; }

  function play() {
    if (st.halted) reset(st.machineKey);
    st.playing = true;
    playBtn.textContent = '⏸ pause';
    if (st.speed === 'max') {
      // batch many steps per frame for max throughput
      var loopMax = function () {
        if (!st.playing || st.halted) return;
        var start = performance.now();
        while (st.playing && !st.halted && performance.now() - start < 14) {
          step();
        }
        paintAll();
        st.rafId = requestAnimationFrame(loopMax);
      };
      st.rafId = requestAnimationFrame(loopMax);
    } else {
      var d = delay();
      var loopT = function () {
        if (!st.playing || st.halted) return;
        step();
        paintAll();
        st.timerId = setTimeout(loopT, delay());
      };
      st.timerId = setTimeout(loopT, d);
    }
  }
  function pause() {
    st.playing = false;
    playBtn.textContent = '▶ play';
    if (st.timerId) { clearTimeout(st.timerId); st.timerId = null; }
    if (st.rafId) { cancelAnimationFrame(st.rafId); st.rafId = 0; }
  }

  // ---------- listeners ----------
  playBtn.addEventListener('click', function () { st.playing ? pause() : play(); });
  stepBtn.addEventListener('click', function () { pause(); step(); paintAll(); });
  backBtn.addEventListener('click', function () { pause(); stepBack(); });
  resetBtn.addEventListener('click', function () { reset(st.machineKey); });
  machineSel.addEventListener('change', function () {
    if (machineSel.value === 'bb5') {
      // BB(5) is impractical at any speed below max
      var maxBtn = speedTabs.querySelector('[data-speed=max]');
      if (maxBtn) maxBtn.click();
    }
    reset(machineSel.value);
  });

  speedTabs.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-speed]'); if (!b) return;
    Array.prototype.forEach.call(speedTabs.querySelectorAll('button'),
      function (x) { x.classList.toggle('on', x === b); });
    st.speed = b.getAttribute('data-speed');
    if (st.playing) { pause(); play(); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    switch (e.key) {
      case ' ':
        e.preventDefault(); st.playing ? pause() : play(); break;
      case 'ArrowRight':
        e.preventDefault(); pause(); step(); paintAll(); break;
      case 'ArrowLeft':
        e.preventDefault(); pause(); stepBack(); break;
      case 'r': case 'R':
        e.preventDefault(); reset(st.machineKey); break;
      case '1': speedTabs.querySelector('[data-speed=slow]').click(); break;
      case '2': speedTabs.querySelector('[data-speed=medium]').click(); break;
      case '3': speedTabs.querySelector('[data-speed=fast]').click(); break;
      case '4': speedTabs.querySelector('[data-speed=blitz]').click(); break;
      case '5': speedTabs.querySelector('[data-speed=max]').click(); break;
    }
  });

  window.addEventListener('resize', function () {
    computeVisibleCells();
    buildTape();
    paintAll();
  });

  // boot
  computeVisibleCells();
  buildTape();
  reset(machineSel.value);
})();
