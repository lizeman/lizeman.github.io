/* Buffalo — interactive growth of the famous "Buffalo buffalo …" sentence.

   Construction. Let NP be a noun phrase, V a verb. The grammar:
     S(n)   -> NP(k) V NP(n - k - 1)         for some 1 <= k <= n-2
     NP(1)  -> "Buffalo buffalo"             (i.e. one place + one animal noun)
     NP(k)  -> NP(k-1) V NP(j)   (reduced relative clause:
                                  "the [Buffalo buffalo that]
                                   [Buffalo buffalo] buffalo")
   We canonicalise: NP(k) for k>=1 has 2k tokens; an S(n) with n top-level
   buffaloes uses (k+1)+1+(j+1) = total tokens depending on bracketing.

   To make every n produce a sentence cleanly, we use the canonical
   left-branching expansion taken from Pinker:
     n=1: "Buffalo!"                                  (place)
     n=2: "Buffalo buffalo."                          (place noun)
     n=3: "Buffalo buffalo buffalo."                  (NP V — short)
     n=4: "Buffalo buffalo Buffalo buffalo."          (place noun place noun)
     n=5: "Buffalo buffalo Buffalo buffalo buffalo."  (NP NP V — incomplete)
     n=6: "Buffalo buffalo Buffalo buffalo buffalo buffalo."
     n=7: "Buffalo buffalo Buffalo buffalo buffalo buffalo Buffalo." (incomplete)
     n=8: "Buffalo buffalo Buffalo buffalo buffalo buffalo Buffalo buffalo."  ← canonical
   For n>=8 we recursively wrap the previous canonical sentence with a
   relative clause of the same form, growing by 4 tokens each time.

   For simplicity and clarity, we generate tokens for every n with a
   role tag (place / noun / verb) that's grammatically defensible. */

(function () {
  'use strict';

  // role tokens: 'p' = Buffalo (place, capitalised), 'n' = buffalo (animal),
  // 'v' = buffalo (verb).
  // For a "complete" sentence with n>=3, the basic canonical form is:
  //   p n p n v v p n   (n=8, from Pinker)
  // For n that doesn't naturally give a complete sentence, we annotate
  // it as "incomplete" but still show the role-coloured tokens.

  // A robust strategy: build the canonical n=8 sentence, then for n>8 wrap
  // the n=8 sentence in a relative clause of the form "p n v" prepended
  // (4 more tokens each time): so n in {8, 12, 16, 20, ...} stays canonical.
  // For other n we still produce a coloured sequence by truncating /
  // extending and label whether the result parses fully.

  var canonical8 = ['p','n','p','n','v','v','p','n'];

  function buildTokens(n) {
    if (n <= 0) return [];
    if (n === 1) return [{ role: 'p', complete: false, note: 'just the city — not a sentence yet.' }];
    if (n === 2) return [
      { role: 'p' }, { role: 'n' }
    ].map(function (t) { return { role: t.role, complete: false, note: 'noun phrase only.' }; });
    if (n === 3) return [
      { role: 'p' }, { role: 'n' }, { role: 'v' }
    ].map(function (t) { return { role: t.role, complete: false, note: 'fragment — verb without object.' }; });
    if (n === 4) return [
      { role: 'p' }, { role: 'n' }, { role: 'p' }, { role: 'n' }
    ].map(function (t) { return { role: t.role, complete: false, note: 'two NPs, no verb.' }; });
    if (n === 5) return [
      { role: 'p' }, { role: 'n' }, { role: 'p' }, { role: 'n' }, { role: 'v' }
    ].map(function (t) { return { role: t.role, complete: false, note: 'incomplete — missing object.' }; });
    if (n === 6) return [
      { role: 'p' }, { role: 'n' }, { role: 'p' }, { role: 'n' }, { role: 'v' }, { role: 'n' }
    ].map(function (t) { return { role: t.role, complete: true,
        note: 'short complete sentence: Buffalo buffalo Buffalo buffalo buffalo buffalo.' }; });
    if (n === 7) return [
      { role: 'p' }, { role: 'n' }, { role: 'p' }, { role: 'n' }, { role: 'v' }, { role: 'n' }, { role: 'p' }
    ].map(function (t) { return { role: t.role, complete: false, note: 'fragment — extra place noun, awaits an animal.' }; });

    if (n === 8) return canonical8.map(function (r) {
      return { role: r, complete: true, note: 'canonical 8-token Buffalo sentence.' };
    });

    // n > 8: wrap canonical with reduced relative clauses of form "p n v"
    // prepended, each adding 3 tokens. We also support n that aren't
    // perfectly aligned — pad with extras and mark incomplete.
    var extras = n - 8;
    var fullClauses = Math.floor(extras / 3);
    var remainder = extras % 3;
    var prefix = [];
    for (var i = 0; i < fullClauses; i++) {
      prefix.push('p'); prefix.push('n'); prefix.push('v');
    }
    var pad = ['p','n','v'].slice(0, remainder);
    var seq = prefix.concat(pad).concat(canonical8);
    var complete = remainder === 0;
    return seq.map(function (r) {
      return { role: r, complete: complete, note: complete ?
        'recursive canonical: ' + (fullClauses + 1) + ' nested clauses.' :
        'extended fragment — add ' + (3 - remainder) + ' more for a complete clause.' };
    });
  }

  function paraphrase(n) {
    if (n <= 0) return 'Empty.';
    if (n === 1) return 'Just the name of the city.';
    if (n === 2) return 'A noun phrase: <strong>buffaloes from Buffalo</strong>.';
    if (n === 3) return 'Fragment: <strong>Buffalo buffaloes</strong> (do something), but the verb has no object.';
    if (n === 4) return 'Two noun phrases. No verb yet — not a sentence.';
    if (n === 5) return 'Incomplete: <strong>Buffalo buffaloes</strong>, in a clause that <em>buffalo</em>(verb) needs an object.';
    if (n === 6) return 'Six is the shortest complete form: <strong>Buffalo buffaloes Buffalo buffaloes buffalo buffaloes</strong> — bison from Buffalo bully bison from Buffalo.';
    if (n === 7) return 'Add one and the relative clause becomes a fragment again — a stray <em>Buffalo</em> awaiting an animal noun.';
    if (n === 8) return 'The canonical eight: <strong>Buffalo buffaloes that Buffalo buffaloes bully — themselves bully Buffalo buffaloes.</strong>';
    var extras = n - 8;
    var fullClauses = Math.floor(extras / 3);
    var remainder = extras % 3;
    if (remainder === 0) {
      return fullClauses === 1 ?
        'Nine more <em>buffalo</em>es deep: another reduced relative clause modifies the previous noun phrase. Still complete.' :
        'Recursion deepens: ' + (fullClauses + 1) + ' nested clauses, all describing buffaloes that buffalo buffaloes that buffalo …';
    }
    return 'Mid-clause: add ' + (3 - remainder) + ' more buffalo to close it.';
  }

  // -------- DOM --------
  var n = 8;
  var sentenceEl = document.getElementById('buf-sentence');
  var paraEl = document.getElementById('buf-paraphrase');
  var nEl = document.getElementById('buf-n');
  var tokensEl = document.getElementById('buf-tokens');
  var treeEl = document.getElementById('buf-tree');
  var prevBtn = document.getElementById('buf-prev');
  var nextBtn = document.getElementById('buf-next');
  var playBtn = document.getElementById('buf-play');
  var loopBtn = document.getElementById('buf-loop');
  var resetBtn = document.getElementById('buf-reset');
  var speedEl = document.getElementById('buf-speed');
  if (!sentenceEl || !nEl) return;

  var playing = false;
  var looping = false;
  var timer = null;

  function ROLE_TEXT(role) {
    if (role === 'p') return 'Buffalo';
    return 'buffalo';
  }
  function ROLE_TIP(role) {
    if (role === 'p') return 'Buffalo (city, proper noun)';
    if (role === 'n') return 'buffalo (animals, plural noun)';
    return 'buffalo (verb: to bully)';
  }
  function ROLE_CLASS(role) {
    if (role === 'p') return 'place';
    if (role === 'n') return 'noun';
    return 'verb';
  }

  function render() {
    var tokens = buildTokens(n);
    sentenceEl.innerHTML = '';
    sentenceEl.classList.toggle('loop', looping);
    tokens.forEach(function (t, i) {
      var sp = document.createElement('span');
      sp.className = 'buf-token ' + ROLE_CLASS(t.role);
      sp.textContent = ROLE_TEXT(t.role);
      sp.tabIndex = 0;
      sp.style.animationDelay = (Math.min(i, 30) * 35) + 'ms';
      var tip = document.createElement('span');
      tip.className = 'tip';
      tip.textContent = ROLE_TIP(t.role);
      sp.appendChild(tip);
      sentenceEl.appendChild(sp);
      sentenceEl.appendChild(document.createTextNode(' '));
    });
    var dot = document.createElement('span');
    dot.textContent = (tokens.length && tokens[0].complete) ? '.' : '…';
    sentenceEl.appendChild(dot);

    paraEl.innerHTML = paraphrase(n);
    nEl.textContent = String(n);
    tokensEl.textContent = tokens.length + ' token' + (tokens.length === 1 ? '' : 's');
    drawTree(tokens);
  }

  function drawTree(tokens) {
    treeEl.innerHTML = '';
    var w = 800, h = 240;
    var ns = 'http://www.w3.org/2000/svg';
    function el(tag, attrs) {
      var e = document.createElementNS(ns, tag);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      return e;
    }
    if (!tokens.length) return;

    // simple bracketed visualization: each pair (Buffalo, buffalo) becomes
    // a small "NP" pair connected by a bracket; verbs link two adjacent
    // NPs. We render this as boxes along the bottom and brackets above.
    var x0 = 30, x1 = w - 30, count = tokens.length;
    var step = (x1 - x0) / Math.max(1, count - 1);
    var leafY = h - 22;
    tokens.forEach(function (t, i) {
      var x = x0 + i * step;
      var g = el('g', { class: 'leaf ' + ROLE_CLASS(t.role) });
      g.appendChild(el('text', { x: x, y: leafY, 'text-anchor': 'middle' })).textContent =
        ROLE_TEXT(t.role);
      treeEl.appendChild(g);
    });

    // brackets: we'll do a simple rule — pair adjacent (place,noun) into NPs
    // and group the rest under "S".
    var pairs = [];
    for (var i = 0; i < count; i++) {
      if (tokens[i].role === 'p' && i + 1 < count && tokens[i + 1].role === 'n') {
        pairs.push([i, i + 1, 'NP']);
        i++;
      } else {
        pairs.push([i, i, tokens[i].role === 'v' ? 'V' : 'X']);
      }
    }

    // draw brackets ascending in level
    var bracketY = leafY - 32;
    pairs.forEach(function (p) {
      var lx = x0 + p[0] * step, rx = x0 + p[1] * step;
      var path = el('path', {
        class: 'branch',
        d: 'M' + (lx - 6) + ',' + bracketY +
           ' L' + (lx - 6) + ',' + (bracketY + 8) +
           ' M' + (rx + 6) + ',' + bracketY +
           ' L' + (rx + 6) + ',' + (bracketY + 8) +
           ' M' + (lx - 6) + ',' + bracketY +
           ' L' + (rx + 6) + ',' + bracketY
      });
      treeEl.appendChild(path);
      var label = el('text', {
        x: (lx + rx) / 2, y: bracketY - 5, 'text-anchor': 'middle'
      });
      label.setAttribute('class', '');
      label.textContent = p[2];
      label.style.fontFamily = 'var(--sans)';
      label.style.fontSize = '11px';
      label.setAttribute('fill', '#5a5a5a');
      treeEl.appendChild(label);
    });

    // top "S" arc
    if (count >= 3) {
      var topY = bracketY - 28;
      var pathTop = el('path', {
        class: 'branch',
        d: 'M' + (x0 - 6) + ',' + topY +
           ' L' + (x0 - 6) + ',' + (topY + 12) +
           ' M' + (x0 + (count - 1) * step + 6) + ',' + topY +
           ' L' + (x0 + (count - 1) * step + 6) + ',' + (topY + 12) +
           ' M' + (x0 - 6) + ',' + topY +
           ' L' + (x0 + (count - 1) * step + 6) + ',' + topY
      });
      treeEl.appendChild(pathTop);
      var sLabel = el('text', {
        x: (x0 + x0 + (count - 1) * step) / 2,
        y: topY - 5, 'text-anchor': 'middle'
      });
      sLabel.textContent = tokens[0].complete ? 'S (complete sentence)' : 'fragment';
      sLabel.setAttribute('fill', tokens[0].complete ? '#1b6e3a' : '#b85c38');
      sLabel.style.fontFamily = 'var(--sans)';
      sLabel.style.fontSize = '12px';
      sLabel.style.fontWeight = '600';
      treeEl.appendChild(sLabel);
    }
  }

  function setN(v) {
    n = Math.max(1, Math.min(40, v));
    render();
  }

  function startAuto(thenLoop) {
    looping = !!thenLoop;
    playing = true;
    playBtn.textContent = '⏸ pause';
    loopBtn.textContent = looping ? '◼ stop loop' : 'loop ∞';
    function tick() {
      if (!playing) return;
      if (n >= 40) {
        if (looping) {
          n = 1;
        } else {
          stopAuto();
          return;
        }
      } else {
        n += 1;
      }
      render();
      timer = setTimeout(tick, parseInt(speedEl.value, 10));
    }
    timer = setTimeout(tick, parseInt(speedEl.value, 10));
  }
  function stopAuto() {
    playing = false; looping = false;
    playBtn.textContent = '▶ auto-grow';
    loopBtn.textContent = 'loop ∞';
    if (timer) { clearTimeout(timer); timer = null; }
    sentenceEl.classList.remove('loop');
  }

  prevBtn.addEventListener('click', function () { stopAuto(); setN(n - 1); });
  nextBtn.addEventListener('click', function () { stopAuto(); setN(n + 1); });
  playBtn.addEventListener('click', function () {
    // When playing (whether looped or not), the button reads "⏸ pause",
    // so clicking it should always stop. Only start non-loop when idle.
    if (playing) stopAuto();
    else startAuto(false);
  });
  loopBtn.addEventListener('click', function () {
    if (playing && looping) stopAuto();
    else startAuto(true);
  });
  resetBtn.addEventListener('click', function () { stopAuto(); setN(1); });

  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') { stopAuto(); setN(n + 1); }
    else if (e.key === 'ArrowLeft') { stopAuto(); setN(n - 1); }
    else if (e.key === ' ') { e.preventDefault(); playing ? stopAuto() : startAuto(false); }
  });

  setN(8);
})();
