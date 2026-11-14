(function () {
  var nav = document.getElementById('nav');
  var sticky = document.getElementById('stickyCta');
  var buy = document.getElementById('buy');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal on scroll + counters
  function countUp(el) {
    var target = +el.dataset.count, suffix = el.dataset.suffix || '', start = null, dur = 1600;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = target + suffix; }, dur + 400); // guard if rAF is throttled
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      // stagger siblings slightly
      var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('reveal'); });
      var i = sibs.indexOf(el);
      el.style.transitionDelay = Math.min(i, 6) * 0.08 + 's';
      el.classList.add('in');
      el.querySelectorAll('[data-count]').forEach(countUp);
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // Remove stagger delay after reveal so hover is instant
  document.addEventListener('transitionend', function (e) {
    if (e.target.classList && e.target.classList.contains('in')) e.target.style.transitionDelay = '';
  });

  // Contact dropdown(s) for free audit
  var recs = document.querySelectorAll('.rec');
  function closeAll(except) {
    recs.forEach(function (r) {
      if (r === except) return;
      r.classList.remove('open');
      r.querySelector('.rec-trigger').setAttribute('aria-expanded', 'false');
    });
  }
  recs.forEach(function (r) {
    var btn = r.querySelector('.rec-trigger');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !r.classList.contains('open');
      closeAll(r);
      r.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) {
        var menu = r.querySelector('.rec-menu');
        // keep menu inside the viewport on narrow screens
        menu.style.marginLeft = '0px';
        var mr = menu.getBoundingClientRect(), shift = 0;
        if (mr.left < 12) shift = 12 - mr.left;
        else if (mr.right > innerWidth - 12) shift = innerWidth - 12 - mr.right;
        menu.style.marginLeft = shift + 'px';
      }
    });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.rec-menu')) closeAll(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  // Nav state, sticky CTA, parallax
  var par = reduce ? [] : Array.prototype.slice.call(document.querySelectorAll('.parallax'));
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, vh = window.innerHeight;
    nav.classList.toggle('scrolled', y > 40);
    var buyTop = buy.getBoundingClientRect().top;
    sticky.classList.toggle('show', y > vh * 0.8 && buyTop > vh);
    par.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var off = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.speed);
      el.style.translate = '0 ' + off.toFixed(1) + 'px';
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
})();
