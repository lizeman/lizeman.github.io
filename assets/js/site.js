/* Vanilla site JS:
   - IntersectionObserver reveals for [data-reveal]
   - Active anchor nav highlighting
   - Visitor widget: city via ipapi.co, per-user count via localStorage,
     site-wide total via GoatCounter public API (degrades silently)
   - Konami code → /portal/
   - ?key=lizeman query string → unlock games
*/
(function () {
  'use strict';
  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------- reveals -------
  var revealItems = document.querySelectorAll('[data-reveal]');
  // index publication entries for staggered reveal
  document.querySelectorAll('.pubs > li[data-reveal]').forEach(function (li, i) {
    li.style.setProperty('--idx', i);
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in-view');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    revealItems.forEach(function (el) { io.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('in-view'); });
  }

  // ------- active anchor nav -------
  var sections = ['bio', 'news', 'publications', 'vita']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var navLinks = document.querySelectorAll('#anchor-nav a');
  function setActive(id) {
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
  }
  if ('IntersectionObserver' in window && sections.length) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setActive(en.target.id);
      });
    }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });
    sections.forEach(function (s) { navIO.observe(s); });
  }

  // ------- visitor widget -------
  var widget = document.querySelector('.visitor');
  if (widget) {
    // per-user visit count
    try {
      var c = parseInt(localStorage.getItem('zl_visit_count') || '0', 10);
      c = isNaN(c) ? 0 : c;
      c += 1;
      localStorage.setItem('zl_visit_count', String(c));
      var countEl = widget.querySelector('[data-visitor-count]');
      if (countEl) countEl.textContent = '#' + c;
    } catch (e) { /* private mode etc */ }

    // city via ipapi.co (cached for 24h)
    var cityEl = widget.querySelector('[data-visitor-city]');
    function paintCity(city, country) {
      if (!cityEl) return;
      if (city && country) cityEl.textContent = city + ', ' + country;
      else if (country) cityEl.textContent = country;
    }
    try {
      var raw = localStorage.getItem('zl_ipapi_v1');
      var cached = raw ? JSON.parse(raw) : null;
      var fresh = cached && cached.ts && (Date.now() - cached.ts < 86400000);
      if (fresh && cached.city) {
        paintCity(cached.city, cached.country);
      } else {
        fetch('https://ipapi.co/json/', { cache: 'no-store' })
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (j) {
            if (!j) return;
            var city = j.city || '';
            var country = j.country_name || j.country || '';
            paintCity(city, country);
            try {
              localStorage.setItem('zl_ipapi_v1', JSON.stringify({
                city: city, country: country, ts: Date.now()
              }));
            } catch (_) {}
          })
          .catch(function () {});
      }
    } catch (e) {}

    // site-wide total via GoatCounter — public hits endpoint
    var totalEl = widget.querySelector('[data-visitor-total]');
    if (totalEl) {
      fetch('https://lizeman.goatcounter.com/counter//TOTAL.json', { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          if (j && (j.count_unique != null || j.count != null)) {
            totalEl.textContent = (j.count_unique || j.count).toLocaleString();
          }
        })
        .catch(function () {});
    }
  }

  // ------- Konami → /portal/ -------
  var konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
                'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
                'b', 'a'];
  var kIdx = 0;
  document.addEventListener('keydown', function (e) {
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === konami[kIdx]) {
      kIdx += 1;
      if (kIdx === konami.length) {
        kIdx = 0;
        window.location.href = '/portal/';
      }
    } else {
      kIdx = (k === konami[0]) ? 1 : 0;
    }
  });

  // ------- ?key=lizeman → unlock immediately -------
  try {
    var q = new URLSearchParams(window.location.search);
    if (q.get('key') === 'lizeman') {
      localStorage.setItem('zl_unlocked', '1');
    }
  } catch (e) {}

  // if unlocked, mark cipher dot
  try {
    if (localStorage.getItem('zl_unlocked') === '1') {
      var cipher = document.querySelector('.cipher');
      if (cipher) cipher.title = 'unlocked';
    }
  } catch (e) {}
})();
