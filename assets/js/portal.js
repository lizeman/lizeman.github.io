/* Portal — three-riddle gate. Persists unlock in localStorage. */
(function () {
  'use strict';

  function norm(s) {
    return (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  var riddles = [
    {
      q: 'I have N states, 2 symbols, and write the most 1s before halting. What am I?',
      check: function (ans) {
        var n = norm(ans);
        return n === 'busybeaver' || n === 'bb' || n === 'beaver';
      },
      hint: '(two words, three letters initialism, named after an industrious rodent)'
    },
    {
      q: 'My Ph.D. advisor at USC. What is his last name?',
      check: function (ans) {
        return norm(ans) === 'razaviyayn';
      },
      hint: '(starts with R, ends in -yayn)'
    },
    {
      q: 'How many Chinese characters in 李泽慢?',
      check: function (ans) {
        var n = norm(ans);
        return n === '3' || n === 'three' || n === 'three3';
      },
      hint: '(count them: 李 · 泽 · 慢)'
    }
  ];

  var idx = 0;
  var wrong = 0;
  var stage = document.getElementById('portal-stage');
  var qEl = document.getElementById('portal-riddle');
  var input = document.getElementById('portal-input');
  var fb = document.getElementById('portal-feedback');
  var hintEl = document.getElementById('portal-hint');
  var doors = document.getElementById('portal-doors');
  var dots = document.querySelectorAll('.progress span');

  if (!qEl || !input) return;

  function unlock() {
    try { localStorage.setItem('zl_unlocked', '1'); } catch (e) {}
    if (stage) stage.style.display = 'none';
    if (doors) doors.classList.add('open');
    if (fb) {
      fb.className = 'portal-feedback ok';
      fb.textContent = 'Welcome through. Two doors await.';
    }
  }

  // already unlocked? skip the riddles.
  try {
    if (localStorage.getItem('zl_unlocked') === '1') {
      unlock();
      return;
    }
  } catch (e) {}

  function render() {
    qEl.textContent = riddles[idx].q;
    input.value = '';
    input.focus();
    if (hintEl) hintEl.textContent = 'Press Enter to submit.';
    fb.textContent = ' ';
    fb.className = 'portal-feedback';
  }

  function next() {
    idx += 1;
    wrong = 0;
    if (dots[idx - 1]) dots[idx - 1].classList.add('done');
    if (idx >= riddles.length) {
      if (dots[dots.length - 1]) dots[dots.length - 1].classList.add('done');
      unlock();
      return;
    }
    render();
  }

  function submit() {
    var ans = input.value.trim();
    if (!ans) return;
    if (riddles[idx].check(ans)) {
      fb.className = 'portal-feedback ok';
      fb.textContent = '✓ correct';
      setTimeout(next, 480);
    } else {
      wrong += 1;
      fb.className = 'portal-feedback err';
      fb.textContent = '× try again';
      input.value = '';
      input.focus();
      if (wrong >= 2 && hintEl) {
        hintEl.textContent = riddles[idx].hint;
      }
    }
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  });

  render();
})();
