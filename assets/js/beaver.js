/* Busy Beaver visualizer — canvas tape + transition table animation. */
(function () {
  'use strict';

  // Champion machines. Transition: state -> [ {write,move,next}_for_0, {...}_for_1 ]
  // Move: 'L' or 'R'. Next 'H' = halt.
  var MACHINES = {
    bb2: {
      name: 'BB(2)',
      start: 'A',
      transitions: {
        // writes 4 ones, halts in 6 steps
        A: [{w:1,m:'R',n:'B'}, {w:1,m:'L',n:'B'}],
        B: [{w:1,m:'L',n:'A'}, {w:1,m:'R',n:'H'}]
      }
    },
    bb3: {
      name: 'BB(3)',
      start: 'A',
      transitions: {
        // writes 6 ones, halts in 14 steps
        A: [{w:1,m:'R',n:'B'}, {w:1,m:'R',n:'H'}],
        B: [{w:0,m:'R',n:'C'}, {w:1,m:'R',n:'B'}],
        C: [{w:1,m:'L',n:'C'}, {w:1,m:'L',n:'A'}]
      }
    },
    bb4: {
      name: 'BB(4)',
      start: 'A',
      transitions: {
        // writes 13 ones, halts in 107 steps
        A: [{w:1,m:'R',n:'B'}, {w:1,m:'L',n:'B'}],
        B: [{w:1,m:'L',n:'A'}, {w:0,m:'L',n:'C'}],
        C: [{w:1,m:'R',n:'H'}, {w:1,m:'L',n:'D'}],
        D: [{w:1,m:'R',n:'D'}, {w:0,m:'R',n:'A'}]
      }
    }
  };

  var canvas = document.getElementById('bb-canvas');
  var machineSel = document.getElementById('bb-machine');
  var playBtn = document.getElementById('bb-play');
  var stepBtn = document.getElementById('bb-step');
  var resetBtn = document.getElementById('bb-reset');
  var speedEl = document.getElementById('bb-speed');
  var stateEl = document.getElementById('bb-state');
  var stepsEl = document.getElementById('bb-steps');
  var onesEl = document.getElementById('bb-ones');
  var tableBody = document.querySelector('#bb-table tbody');
  if (!canvas || !machineSel || !tableBody) return;

  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;

  var state = {
    machineKey: 'bb3',
    tape: {},          // sparse, idx -> 0/1
    head: 0,
    s: 'A',
    steps: 0,
    halted: false,
    playing: false,
    timer: null
  };

  function fmtMove(t) {
    return t.w + ',' + t.m + ',' + (t.n === 'H' ? 'halt' : t.n);
  }

  function buildTable() {
    var m = MACHINES[state.machineKey];
    tableBody.innerHTML = '';
    Object.keys(m.transitions).forEach(function (k) {
      var tr = document.createElement('tr');
      tr.dataset.state = k;
      var t0 = m.transitions[k][0];
      var t1 = m.transitions[k][1];
      tr.innerHTML = '<td>' + k + '</td><td>' + fmtMove(t0) + '</td><td>' + fmtMove(t1) + '</td>';
      tableBody.appendChild(tr);
    });
    highlightState();
  }

  function highlightState() {
    Array.prototype.forEach.call(tableBody.querySelectorAll('tr'), function (tr) {
      tr.classList.toggle('firing', tr.dataset.state === state.s && !state.halted);
    });
    stateEl.textContent = state.halted ? 'HALT' : state.s;
  }

  function readCell(i) { return state.tape[i] || 0; }
  function writeCell(i, v) {
    if (v) state.tape[i] = 1;
    else delete state.tape[i];
  }

  function countOnes() {
    var n = 0;
    for (var k in state.tape) if (state.tape[k]) n++;
    return n;
  }

  function setupCanvas() {
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    var cell = 26;
    var cells = Math.floor(w / cell);
    var halfCells = Math.floor(cells / 2);

    ctx.clearRect(0, 0, w, h);

    var y = (h - cell) / 2;
    for (var i = -halfCells; i <= halfCells; i++) {
      var idx = state.head + i;
      var x = w / 2 + i * cell - cell / 2;
      var v = readCell(idx);
      ctx.fillStyle = v ? '#1c1c1c' : '#fbf8f3';
      ctx.strokeStyle = '#cfcabe';
      ctx.lineWidth = 1;
      ctx.fillRect(x, y, cell, cell);
      ctx.strokeRect(x + 0.5, y + 0.5, cell, cell);
    }

    // head
    var hx = w / 2 - cell / 2;
    ctx.strokeStyle = '#b85c38';
    ctx.lineWidth = 2;
    ctx.strokeRect(hx - 1.5, y - 1.5, cell + 3, cell + 3);

    // arrow
    ctx.fillStyle = '#b85c38';
    ctx.beginPath();
    ctx.moveTo(w / 2, y - 9);
    ctx.lineTo(w / 2 - 6, y - 16);
    ctx.lineTo(w / 2 + 6, y - 16);
    ctx.closePath();
    ctx.fill();

    // state label below
    ctx.fillStyle = '#5a5a5a';
    ctx.font = '500 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('head @ ' + state.head + (state.halted ? ' (halted)' : ''), w / 2, y + cell + 22);
  }

  function step() {
    if (state.halted) return;
    var m = MACHINES[state.machineKey];
    var read = readCell(state.head);
    var t = m.transitions[state.s][read];
    if (!t) { state.halted = true; finalize(); return; }
    writeCell(state.head, t.w);
    state.head += (t.m === 'R' ? 1 : -1);
    state.s = t.n;
    state.steps += 1;
    if (state.s === 'H') { state.halted = true; finalize(); }
    paint();
  }

  function finalize() {
    pause();
    paint();
  }

  function paint() {
    draw();
    stepsEl.textContent = state.steps;
    onesEl.textContent = countOnes();
    highlightState();
  }

  function reset(machineKey) {
    pause();
    state.machineKey = machineKey || state.machineKey;
    state.tape = {};
    state.head = 0;
    state.s = MACHINES[state.machineKey].start;
    state.steps = 0;
    state.halted = false;
    buildTable();
    paint();
  }

  function delay() {
    // speed 0..3 → 1200ms..40ms (log-ish)
    var s = parseFloat(speedEl.value);
    return Math.max(20, 1200 / Math.pow(2, s));
  }

  function play() {
    if (state.halted) reset(state.machineKey);
    state.playing = true;
    playBtn.textContent = '⏸ pause';
    function loop() {
      if (!state.playing || state.halted) return;
      step();
      state.timer = setTimeout(loop, delay());
    }
    loop();
  }

  function pause() {
    state.playing = false;
    playBtn.textContent = '▶ play';
    if (state.timer) { clearTimeout(state.timer); state.timer = null; }
  }

  playBtn.addEventListener('click', function () {
    if (state.playing) pause();
    else play();
  });
  stepBtn.addEventListener('click', function () { pause(); step(); });
  resetBtn.addEventListener('click', function () { reset(state.machineKey); });
  machineSel.addEventListener('change', function () { reset(machineSel.value); });

  window.addEventListener('resize', function () {
    setupCanvas();
    draw();
  });

  setupCanvas();
  reset(machineSel.value);
})();
