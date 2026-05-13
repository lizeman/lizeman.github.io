/* Typing trial v2 — modes, categories, caret, personal best, sparkline,
   per-key error report, pause/resume, mobile keyboard support. */
(function () {
  'use strict';

  // -------- passage pool --------
  // Three categories × short/medium/long pulled from each pool's pieces.
  var PASSAGES = {
    papers: [
      "Optimization is, in many ways, a discipline of compromise: between speed and accuracy, between memory and computation, between the elegance of a closed-form solution and the necessity of an iterative one.",
      "Privacy is not the absence of information; it is the presence of careful boundaries on what information moves where.",
      "Differential privacy is a contract between a query and the world: noisy enough to be safe, accurate enough to be useful.",
      "The good thing about test-time training is that the model never stops learning. The hard thing about test-time training is also that the model never stops learning.",
      "Beneath every gradient descent there is an unspoken assumption: that the loss landscape is gentle enough to forgive our small steps.",
      "The art of generating synthetic text is, in the end, the art of remembering data without remembering it.",
      "Memory in a neural network is not a place; it is a habit.",
      "A zeroth-order method asks the model nothing about its own gradient and yet still finds its way down the slope.",
      "Synthetic data, like a borrowed voice, is most useful when you remember whose voice it really came from.",
      "When data is scarce, sampling well matters more than scaling up; when data is abundant, mixing well matters more than sampling well."
    ],
    classics: [
      "It is a truth universally acknowledged that a single algorithm in possession of a good loss function must be in want of a regularizer.",
      "We hold these truths to be self-evident: that all gradients are not created equal, that some descend more cleanly than others.",
      "There are more things in heaven and earth, Horatio, than are dreamt of in your hyperparameter sweep.",
      "Beware the Jabberwock, my son! The jaws that bite, the claws that catch, the parameters that drift, and the activations that vanish without warning.",
      "Two roads diverged in a wood, and I — I took the one with more pretrained weights, and that has made all the difference.",
      "It was the best of fits, it was the worst of fits, it was the age of overparameterization, it was the age of distillation.",
      "Call me Ishmael. Some years ago — never mind how precisely — I signed up for a deep learning course and have been chasing minima ever since.",
      "All happy networks are alike; every unhappy network is unhappy in its own way."
    ],
    code: [
      "def train(model, data, optimizer):\n    for batch in data:\n        loss = model(batch).backward()\n        optimizer.step()\n        optimizer.zero_grad()",
      "for i in range(steps):\n    grad = estimate_gradient(theta, batch)\n    theta = theta - lr * grad\n    if i % 100 == 0:\n        log(loss(theta, batch))",
      "function busyBeaver(states, tape) {\n  let head = 0, step = 0, s = 'A';\n  while (s !== 'H') {\n    const t = states[s][tape[head] || 0];\n    tape[head] = t.write;\n    head += t.move === 'R' ? 1 : -1;\n    s = t.next;\n    step++;\n  }\n  return step;\n}",
      "with torch.no_grad():\n    preds = model(x_test)\n    acc = (preds.argmax(-1) == y_test).float().mean()\n    print(f'test acc = {acc:.4f}')",
      "import numpy as np\n\ndef softmax(x):\n    z = x - x.max(axis=-1, keepdims=True)\n    e = np.exp(z)\n    return e / e.sum(axis=-1, keepdims=True)"
    ]
  };

  // length budgets (chars) for short / medium / long; we pick a passage in range.
  var LENGTH = {
    short:  { min: 80,  max: 160 },
    medium: { min: 160, max: 280 },
    long:   { min: 280, max: 600 }
  };

  // -------- DOM --------
  var passageEl = document.getElementById('typing-passage');
  var input = document.getElementById('typing-input');
  var caret = document.getElementById('typing-caret');
  var passageWrap = document.getElementById('t-passage-wrap');
  var wpmEl = document.getElementById('t-wpm');
  var accEl = document.getElementById('t-acc');
  var timeEl = document.getElementById('t-time');
  var resultEl = document.getElementById('t-result');
  var summaryEl = document.getElementById('t-summary');
  var missedEl = document.getElementById('t-missed');
  var newPbEl = document.getElementById('t-new-pb');
  var pbValEl = document.getElementById('t-pb');
  var sparkEl = document.getElementById('t-spark');
  var newBtn = document.getElementById('t-new');
  var resetBtn = document.getElementById('t-reset');
  var pauseBtn = document.getElementById('t-pause');
  var modeTabs = document.getElementById('t-mode');
  var catTabs = document.getElementById('t-cat');
  if (!passageEl || !input) return;

  // -------- state --------
  var passage, chars, idx = 0, started = 0, finished = false;
  var errors = 0, typed = 0;
  var paused = false, pausedAccum = 0, pausedAt = 0;
  var perKeyErrors = {};
  var rafId = 0;

  // private-mode browsers can have localStorage throw on access.
  function lsGet(k, def) { try { return localStorage.getItem(k) || def; } catch (e) { return def; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* quota / private mode */ } }
  var mode = lsGet('zl_typing_mode', 'medium');
  var category = lsGet('zl_typing_cat', 'papers');

  function loadHistory() {
    try {
      var raw = localStorage.getItem('zl_typing_history_v1');
      var h = raw ? JSON.parse(raw) : {};
      return (h && typeof h === 'object') ? h : {};
    } catch (e) { return {}; }
  }
  function saveHistory(h) {
    try { localStorage.setItem('zl_typing_history_v1', JSON.stringify(h)); } catch (e) {}
  }
  function modeKey() { return mode + ':' + category; }

  // -------- selection --------
  function pickPassage() {
    var pool = PASSAGES[category] || PASSAGES.papers;
    var lo = LENGTH[mode].min, hi = LENGTH[mode].max;
    var fits = pool.filter(function (s) { return s.length >= lo && s.length <= hi; });
    if (!fits.length) {
      // for long, allow concatenation; for short, allow shorter pool.
      if (mode === 'long') {
        var combined = '';
        var shuffled = pool.slice().sort(function () { return Math.random() - 0.5; });
        for (var i = 0; i < shuffled.length && combined.length < lo; i++) {
          combined += (combined ? ' ' : '') + shuffled[i];
        }
        return combined.slice(0, hi);
      }
      fits = pool;
    }
    return fits[Math.floor(Math.random() * fits.length)];
  }

  function render() {
    passageEl.innerHTML = '';
    chars = [];
    for (var i = 0; i < passage.length; i++) {
      var s = document.createElement('span');
      s.className = 'ch';
      // visualize whitespace + newlines explicitly
      if (passage[i] === '\n') {
        s.textContent = '↵';
        s.dataset.nl = '1';
      } else {
        s.textContent = passage[i];
      }
      passageEl.appendChild(s);
      if (passage[i] === '\n') {
        passageEl.appendChild(document.createElement('br'));
      }
      chars.push(s);
    }
    requestAnimationFrame(positionCaret);
  }

  function positionCaret() {
    if (!chars || idx > chars.length) return;
    var rect, refEl, atEnd = false;
    if (idx < chars.length) {
      refEl = chars[idx];
      rect = refEl.getBoundingClientRect();
    } else if (chars.length) {
      refEl = chars[chars.length - 1];
      rect = refEl.getBoundingClientRect();
      atEnd = true;
    } else { return; }
    var wrap = passageWrap.getBoundingClientRect();
    var left = rect.left - wrap.left + (atEnd ? rect.width : 0);
    var top = rect.top - wrap.top;
    caret.style.left = left + 'px';
    caret.style.top = top + 'px';
    caret.style.height = rect.height + 'px';
  }

  // -------- run lifecycle --------
  function reset(newP) {
    cancelAnimationFrame(rafId);
    passage = newP ? pickPassage() : (passage || pickPassage());
    idx = 0; errors = 0; typed = 0; started = 0; finished = false;
    paused = false; pausedAccum = 0; pausedAt = 0;
    perKeyErrors = {};
    render();
    if (resultEl) resultEl.classList.remove('show');
    if (newPbEl) newPbEl.style.display = 'none';
    wpmEl.textContent = '0';
    accEl.textContent = '100%';
    timeEl.textContent = '0.0s';
    passageWrap.classList.remove('paused');
    pauseBtn.textContent = 'Pause';
    input.value = '';
    focusInput();
    paintPb();
  }

  function elapsed() {
    if (!started) return 0;
    var now = paused ? pausedAt : Date.now();
    return (now - started - pausedAccum) / 1000;
  }

  function tick() {
    if (!started || finished) return;
    var dt = elapsed();
    timeEl.textContent = dt.toFixed(1) + 's';
    var minutes = dt / 60;
    var words = idx / 5;
    wpmEl.textContent = (minutes > 0 && idx > 0) ? Math.round(words / minutes) : 0;
    var acc = typed > 0 ? Math.max(0, 100 * (typed - errors) / typed) : 100;
    accEl.textContent = acc.toFixed(0) + '%';
    rafId = requestAnimationFrame(tick);
  }

  function finish() {
    finished = true;
    cancelAnimationFrame(rafId);
    var dt = elapsed();
    var minutes = dt / 60;
    var words = passage.length / 5;
    var wpm = (minutes > 0) ? Math.round(words / minutes) : 0;
    var acc = typed > 0 ? (100 * (typed - errors) / typed) : 100;
    pushHistory(wpm);
    var isPb = checkPersonalBest(wpm);
    paintPb();
    if (resultEl) resultEl.classList.add('show');
    if (newPbEl) newPbEl.style.display = isPb ? 'inline-block' : 'none';
    summaryEl.innerHTML =
      '<strong>' + wpm + '</strong> WPM at <strong>' + acc.toFixed(0) +
      '%</strong> accuracy · ' + dt.toFixed(1) + 's · ' +
      typed + ' chars typed · ' + errors + ' mistake' + (errors === 1 ? '' : 's') + '.';
    paintMissed();
  }

  function paintMissed() {
    missedEl.innerHTML = '';
    var entries = Object.keys(perKeyErrors)
      .map(function (k) { return [k, perKeyErrors[k]]; })
      .sort(function (a, b) { return b[1] - a[1]; })
      .slice(0, 5);
    if (!entries.length) {
      missedEl.innerHTML = '<span>no mistakes — clean run.</span>';
      return;
    }
    var label = document.createElement('span');
    label.textContent = 'most missed:';
    missedEl.appendChild(label);
    entries.forEach(function (e) {
      var span = document.createElement('span');
      var k = document.createElement('kbd');
      k.textContent = e[0] === ' ' ? '␣' : e[0];
      span.appendChild(k);
      var c = document.createElement('span');
      c.className = 'count';
      c.textContent = '×' + e[1];
      span.appendChild(c);
      missedEl.appendChild(span);
    });
  }

  // -------- personal best + history --------
  function pushHistory(wpm) {
    var h = loadHistory();
    var key = modeKey();
    var rec = h[key] || { best: 0, recent: [] };
    rec.recent.push(wpm);
    if (rec.recent.length > 5) rec.recent.shift();
    if (wpm > (rec.best || 0)) rec.best = wpm;
    h[key] = rec;
    saveHistory(h);
  }
  function checkPersonalBest(wpm) {
    var h = loadHistory();
    var key = modeKey();
    var rec = h[key] || { best: 0 };
    return wpm > 0 && wpm >= rec.best;
  }
  function paintPb() {
    var h = loadHistory();
    var key = modeKey();
    var rec = h[key] || { best: 0, recent: [] };
    pbValEl.textContent = rec.best ? rec.best + ' WPM' : '— WPM';
    paintSpark(rec.recent || []);
  }
  function paintSpark(recent) {
    sparkEl.innerHTML = '';
    if (!recent || recent.length < 2) return;
    var W = 110, H = 22, P = 2;
    var max = Math.max.apply(null, recent);
    var min = Math.min.apply(null, recent);
    var span = Math.max(1, max - min);
    var pts = recent.map(function (v, i) {
      var x = P + (W - 2 * P) * (i / (recent.length - 1));
      var y = H - P - (H - 2 * P) * ((v - min) / span);
      return [x, y];
    });
    var d = pts.map(function (p, i) {
      return (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1);
    }).join(' ');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    sparkEl.appendChild(path);
    var last = pts[pts.length - 1];
    var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('class', 'dot');
    dot.setAttribute('cx', last[0]);
    dot.setAttribute('cy', last[1]);
    dot.setAttribute('r', '2.2');
    sparkEl.appendChild(dot);
  }

  // -------- input handling --------
  function focusInput() {
    try { input.focus({ preventScroll: false }); } catch (e) { input.focus(); }
  }

  function startTimerIfNeeded() {
    if (!started) {
      started = Date.now();
      rafId = requestAnimationFrame(tick);
    }
  }

  function consume(c) {
    if (finished || idx >= passage.length || paused) return;
    startTimerIfNeeded();
    typed += 1;
    var span = chars[idx];
    if (c === passage[idx]) {
      span.classList.remove('cur', 'err');
      span.classList.add('ok');
      idx += 1;
      positionCaret();
      if (idx >= passage.length) finish();
    } else {
      errors += 1;
      span.classList.add('err');
      var k = passage[idx];
      perKeyErrors[k] = (perKeyErrors[k] || 0) + 1;
    }
  }

  function backspace() {
    if (finished || paused || idx === 0) return;
    idx -= 1;
    var span = chars[idx];
    span.classList.remove('ok', 'err');
    positionCaret();
  }

  function togglePause() {
    if (finished || !started) return;
    if (paused) {
      pausedAccum += Date.now() - pausedAt;
      paused = false;
      passageWrap.classList.remove('paused');
      pauseBtn.textContent = 'Pause';
      rafId = requestAnimationFrame(tick);
      focusInput();
    } else {
      paused = true;
      pausedAt = Date.now();
      passageWrap.classList.add('paused');
      pauseBtn.textContent = 'Resume';
      cancelAnimationFrame(rafId);
    }
  }

  // mobile: input event captures composed characters too.
  input.addEventListener('input', function () {
    var v = input.value;
    if (!v) return;
    for (var i = 0; i < v.length; i++) consume(v[i]);
    input.value = '';
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      backspace();
      return;
    }
    if (e.key === 'Tab') { e.preventDefault(); return; }
    if (e.key === 'Escape') { e.preventDefault(); reset(false); return; }
    if (e.key === 'Enter') {
      // if finished, retry. otherwise treat as newline if passage has \n.
      if (finished) { e.preventDefault(); reset(true); return; }
      if (passage && passage.indexOf('\n') !== -1) {
        e.preventDefault();
        consume('\n');
        return;
      }
      e.preventDefault();
      return;
    }
    if (e.key === ' ' && !started) {
      // Space before start can also pause-toggle on result panel; ignore here, normal char.
    }
    if (e.key === ' ' && finished) {
      e.preventDefault();
      togglePause();
      return;
    }
  });

  passageEl.addEventListener('click', focusInput);
  passageEl.addEventListener('focus', focusInput);
  passageWrap.addEventListener('click', focusInput);

  document.addEventListener('keydown', function (e) {
    if (e.target === input) return;
    // Don't hijack browser/OS shortcuts (Cmd+C, Ctrl+A, etc.) — and
    // critically, don't focus-jack the input on Ctrl+C, which would
    // clear any selection the user had outside the input.
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') { reset(false); return; }
    if (e.key === 'Enter' && finished) { reset(true); return; }
    if (e.key === ' ' && !finished && started) {
      e.preventDefault();
      togglePause();
      return;
    }
    if (e.key && (e.key.length === 1 || e.key === 'Backspace')) focusInput();
  });

  if (newBtn) newBtn.addEventListener('click', function () { reset(true); });
  if (resetBtn) resetBtn.addEventListener('click', function () { reset(false); });
  if (pauseBtn) pauseBtn.addEventListener('click', togglePause);

  // -------- tab handling --------
  function activateTab(set, attr, value) {
    Array.prototype.forEach.call(set.querySelectorAll('button'), function (b) {
      b.classList.toggle('on', b.getAttribute(attr) === value);
    });
  }
  activateTab(modeTabs, 'data-mode', mode);
  activateTab(catTabs, 'data-cat', category);

  modeTabs.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-mode]'); if (!b) return;
    mode = b.getAttribute('data-mode');
    lsSet('zl_typing_mode', mode);
    activateTab(modeTabs, 'data-mode', mode);
    reset(true);
  });
  catTabs.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-cat]'); if (!b) return;
    category = b.getAttribute('data-cat');
    lsSet('zl_typing_cat', category);
    activateTab(catTabs, 'data-cat', category);
    reset(true);
  });

  // reposition caret on resize / font load
  window.addEventListener('resize', positionCaret);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(positionCaret);
  }

  reset(true);
})();
