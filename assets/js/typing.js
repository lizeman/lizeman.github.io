/* Typing trial — measures WPM + accuracy on a rotating passage. */
(function () {
  'use strict';

  var passages = [
    "Optimization is, in many ways, a discipline of compromise: between speed and accuracy, between memory and computation, between the elegance of a closed-form solution and the necessity of an iterative one.",
    "A Turing machine that runs the longest before halting is, paradoxically, the simplest description of a fundamentally uncomputable function.",
    "Privacy is not the absence of information; it is the presence of careful boundaries on what information moves where.",
    "Differential privacy is a contract between a query and the world: noisy enough to be safe, accurate enough to be useful.",
    "The good thing about test-time training is that the model never stops learning. The hard thing about test-time training is also that the model never stops learning.",
    "Beneath every gradient descent there is an unspoken assumption: that the loss landscape is gentle enough to forgive our small steps.",
    "The art of generating synthetic text is, in the end, the art of remembering data without remembering it.",
    "Memory in a neural network is not a place; it is a habit."
  ];

  var passage, chars, idx = 0, started = 0, finished = false;
  var errors = 0, typed = 0;
  var passageEl = document.getElementById('typing-passage');
  var input = document.getElementById('typing-input');
  var wpmEl = document.getElementById('t-wpm');
  var accEl = document.getElementById('t-acc');
  var timeEl = document.getElementById('t-time');
  var resultEl = document.getElementById('t-result');
  var finalEl = document.getElementById('t-final');
  var newBtn = document.getElementById('t-new');
  var resetBtn = document.getElementById('t-reset');

  if (!passageEl || !input) return;

  function pickPassage() {
    return passages[Math.floor(Math.random() * passages.length)];
  }

  function render() {
    passageEl.innerHTML = '';
    chars = [];
    for (var i = 0; i < passage.length; i++) {
      var s = document.createElement('span');
      s.className = 'ch';
      s.textContent = passage[i];
      passageEl.appendChild(s);
      chars.push(s);
    }
    if (chars[0]) chars[0].classList.add('cur');
  }

  function reset(newP) {
    passage = newP ? pickPassage() : passage || pickPassage();
    idx = 0; errors = 0; typed = 0; started = 0; finished = false;
    render();
    if (resultEl) resultEl.classList.remove('show');
    wpmEl.textContent = '0';
    accEl.textContent = '100%';
    timeEl.textContent = '0.0s';
    input.value = '';
    input.focus();
  }

  function tick() {
    if (!started || finished) return;
    var dt = (Date.now() - started) / 1000;
    timeEl.textContent = dt.toFixed(1) + 's';
    var minutes = dt / 60;
    var words = idx / 5;
    wpmEl.textContent = minutes > 0 ? Math.round(words / minutes) : 0;
    var acc = typed > 0 ? Math.max(0, 100 * (typed - errors) / typed) : 100;
    accEl.textContent = acc.toFixed(0) + '%';
    requestAnimationFrame(tick);
  }

  function finish() {
    finished = true;
    var dt = (Date.now() - started) / 1000;
    var minutes = dt / 60;
    var words = passage.length / 5;
    var wpm = minutes > 0 ? Math.round(words / minutes) : 0;
    var acc = typed > 0 ? (100 * (typed - errors) / typed) : 100;
    if (resultEl) resultEl.classList.add('show');
    if (finalEl) {
      finalEl.textContent = wpm + ' WPM at ' +
        acc.toFixed(0) + '% accuracy over ' +
        dt.toFixed(1) + ' seconds.';
    }
  }

  function handleChar(c) {
    if (finished || idx >= passage.length) return;
    if (!started) { started = Date.now(); requestAnimationFrame(tick); }
    typed += 1;
    var span = chars[idx];
    if (c === passage[idx]) {
      span.classList.remove('cur', 'err');
      span.classList.add('ok');
      idx += 1;
      if (chars[idx]) chars[idx].classList.add('cur');
      if (idx >= passage.length) finish();
    } else {
      errors += 1;
      span.classList.add('err');
    }
  }

  function handleBackspace() {
    if (finished || idx === 0) return;
    idx -= 1;
    var span = chars[idx];
    span.classList.remove('ok', 'err');
    span.classList.add('cur');
    if (chars[idx + 1]) chars[idx + 1].classList.remove('cur');
  }

  function focusInput() { input.focus(); }
  passageEl.addEventListener('click', focusInput);
  passageEl.addEventListener('focus', focusInput);

  document.addEventListener('keydown', function (e) {
    if (e.target && e.target !== input) {
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Escape') {
        focusInput();
      }
    }
    if (e.key === 'Escape') reset(false);
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspace();
      return;
    }
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'Escape') {
      e.preventDefault();
      return;
    }
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      handleChar(e.key);
    }
  });

  if (newBtn) newBtn.addEventListener('click', function () { reset(true); });
  if (resetBtn) resetBtn.addEventListener('click', function () { reset(false); });

  reset(true);
})();
