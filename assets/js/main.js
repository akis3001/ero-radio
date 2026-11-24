/* ERO Radio — Engine: GSAP + ScrollTrigger + SplitText + Lenis (alles lokal). */
(function () {
  'use strict';

  var body = document.body;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bereit = function () { body.classList.add('ist-bereit'); };

  $$('[data-jahr]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Kopf ---------- */
  var kopf = $('#kopf');
  var kopfSchatten = function () { kopf.classList.toggle('ist-gescrollt', window.scrollY > 8); };
  kopfSchatten();
  window.addEventListener('scroll', kopfSchatten, { passive: true });

  var burger = $('.burger'), menue = $('#menue');
  var menueZu = function () { menue.hidden = true; burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', function () {
    var auf = menue.hidden;
    menue.hidden = !auf;
    burger.setAttribute('aria-expanded', auf ? 'true' : 'false');
    if (auf && window.gsap && !ruhig) gsap.from($$('a', menue), { y: 24, autoAlpha: 0, stagger: .05, duration: .45, ease: 'power3.out' });
  });
  $$('a', menue).forEach(function (a) { a.addEventListener('click', menueZu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menue.hidden) { menueZu(); burger.focus(); } });

  /* ---------- Sendeplan: was läuft gerade ---------- */
  var bonJetzt = $('#bon-jetzt');
  function planMarkieren() {
    var std = new Date().getHours(), laeuft = null;
    $$('.plan__liste li').forEach(function (li) {
      var an = std >= +li.dataset.von && std < +li.dataset.bis;
      li.classList.toggle('ist-jetzt', an);
      if (an) laeuft = $('.plan__name', li).textContent;
    });
    bonJetzt.textContent = laeuft ? 'Τώρα: ' + laeuft : 'Μουσική όλο το 24ωρο';
  }
  planMarkieren();
  setInterval(planMarkieren, 60000);

  /* ---------- Player ---------- */
  var audio = $('#stream'), play = $('#play'), laut = $('#laut');
  var ICON_PLAY = '<polygon points="6 3 20 12 6 21 6 3"></polygon>';
  var ICON_STOP = '<rect x="6" y="5" width="4" height="14" rx="1"></rect><rect x="14" y="5" width="4" height="14" rx="1"></rect>';

  play.addEventListener('click', function () {
    if (audio.paused) {
      audio.play().then(function () {
        play.querySelector('svg').innerHTML = ICON_STOP;
        play.setAttribute('aria-label', 'Παύση');
        body.classList.add('laeuft');
      }).catch(function () { $('#jetzt').textContent = 'Η ροή δεν είναι διαθέσιμη'; });
    } else {
      audio.pause();
      play.querySelector('svg').innerHTML = ICON_PLAY;
      play.setAttribute('aria-label', 'Αναπαραγωγή');
      body.classList.remove('laeuft');
    }
  });
  audio.volume = laut.value / 100;
  laut.addEventListener('input', function () { audio.volume = laut.value / 100; });

  function titelHolen() {
    fetch('https://stream.ero-radio.de:8000/status-json.xsl', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var q = d && d.icestats && d.icestats.source;
        if (Array.isArray(q)) q = q[0];
        var t = q && (q.title || q.yp_currently_playing);
        if (t) $('#jetzt').textContent = t;
      })
      .catch(function () { /* Statusdienst nicht erreichbar, Vorgabetext bleibt */ });
  }
  titelHolen();
  setInterval(titelHolen, 20000);

  /* ---------- Videos: erst auf Klick einbetten ---------- */
  $$('.clip__play, .kachel').forEach(function (el) {
    var knopf = el.classList.contains('clip__play') ? el : null;
    if (!knopf) return;
    knopf.addEventListener('click', function () {
      var rahmen = document.createElement('iframe');
      rahmen.src = 'https://www.youtube-nocookie.com/embed/' + knopf.dataset.vid + '?autoplay=1&rel=0';
      rahmen.title = knopf.getAttribute('aria-label');
      rahmen.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
      rahmen.allowFullscreen = true;
      rahmen.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';
      knopf.closest('.clip__bild').appendChild(rahmen);
      knopf.remove();
    });
  });

  /* ---------- Bewegung ---------- */
  if (!window.gsap || !window.ScrollTrigger) { bereit(); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  if (ruhig) { bereit(); return; }

  gsap.set('[data-hero], [data-reveal]', { autoAlpha: 0 });
  bereit();

  if (window.Lenis) {
    var lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var ziel = $(id);
        if (!ziel) return;
        e.preventDefault();
        lenis.scrollTo(ziel, { offset: -kopf.offsetHeight + 1 });
      });
    });
  }

  /* Hero-Intro */
  var intro = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: .15 });
  intro
    .to('[data-hero="eyebrow"]', { autoAlpha: 1, duration: .01 })
    .from('.hero .augenbraue__linie', { scaleX: 0, duration: .8 }, '<')
    .from('[data-hero="eyebrow"]', { x: -12, duration: .8 }, '<')
    .set('[data-hero="titel"]', { autoAlpha: 1 }, .1)
    .fromTo('.hero__titel .zeile',
      { yPercent: 70, autoAlpha: 0, clipPath: 'inset(0% 0% 100% 0%)' },
      { yPercent: 0, autoAlpha: 1, clipPath: 'inset(-25% -10% -25% -10%)', duration: 1.1, stagger: .12, clearProps: 'clipPath' }, .15)
    .fromTo('[data-hero="teller"]', { autoAlpha: 0, scale: .86, rotate: 6 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.3, ease: 'expo.out' }, .3)
    .from('.siegel', { scale: 0, rotate: -90, duration: .9, ease: 'back.out(1.8)' }, .9)
    .fromTo('[data-hero="sub"]', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .9 }, .75)
    .fromTo('[data-hero="ctas"]', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .9 }, .9)
    .fromTo('[data-hero="usp"]', { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 }, 1)
    .from('.usp li', { y: 20, autoAlpha: 0, stagger: .08, duration: .7 }, 1);

  gsap.to('.teller__buehne', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* Die Platte dreht sich mit dem Scrollen; das Label bleibt aufrecht stehen. */
  gsap.to('.platte__dreh', {
    rotation: 540, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 }
  });
  gsap.to('.siegel', { yPercent: -40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* SplitText-Überschriften */
  $$('[data-split]').forEach(function (el) {
    if (!window.SplitText) { gsap.set(el, { autoAlpha: 1 }); return; }
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: function (self) {
        gsap.set(el, { autoAlpha: 1 });
        return gsap.from(self.lines, {
          yPercent: 110, duration: 1.1, stagger: .1, ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
      }
    });
  });

  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%', once: true,
    onEnter: function (els) { gsap.fromTo(els, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .9, stagger: .1, ease: 'power3.out' }); }
  });

  $$('[data-wipe]').forEach(function (img) {
    gsap.fromTo(img, { clipPath: 'inset(0% 100% 0% 0%)', scale: 1.15 },
      { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.4, ease: 'expo.inOut',
        scrollTrigger: { trigger: img, start: 'top 80%', once: true } });
  });

  gsap.from('.plan__liste li', { autoAlpha: 0, y: 18, stagger: .06, duration: .7, ease: 'power3.out',
    scrollTrigger: { trigger: '.bon', start: 'top 75%', once: true } });

  /* BÜHNE: gepinnt, das Medium wächst von der Karte auf die Vollfläche */
  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', function () {
    var sticky = $('.buehne__sticky'), platz = $('.buehne__platz');
    var startClip = function () {
      var s = sticky.getBoundingClientRect(), p = platz.getBoundingClientRect();
      return 'inset(' + (p.top - s.top) + 'px ' + (s.right - p.right) + 'px ' + (s.bottom - p.bottom) + 'px ' + (p.left - s.left) + 'px round 20px)';
    };
    gsap.set('.buehne__ende', { y: 30 });
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.buehne', start: 'top top', end: 'bottom bottom', scrub: .8, invalidateOnRefresh: true } });
    tl.fromTo('.buehne__medien', { clipPath: startClip }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', ease: 'power1.inOut', duration: .7 }, 0)
      .fromTo('.buehne__bild', { scale: 1.15 }, { scale: 1, ease: 'none', duration: .7 }, 0)
      .to('.buehne__spalte--links', { xPercent: -136, scale: .36, autoAlpha: 0, ease: 'power1.in', duration: .6 }, 0)
      .to('.buehne__spalte--rechts', { xPercent: 136, scale: .36, autoAlpha: 0, ease: 'power1.in', duration: .6 }, 0)
      .to('.buehne__titel', { autoAlpha: 0, scale: 1.25, yPercent: -20, ease: 'power1.in', duration: .3 }, .05)
      .to('.buehne__ende', { autoAlpha: 1, y: 0, ease: 'power2.out', duration: .15 }, .72)
      .fromTo('.buehne__pille', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, ease: 'power2.out', duration: .12 }, .75)
      .to({}, { duration: .13 });

    if (window.SplitText) {
      var st = SplitText.create('.buehne__titel', { type: 'chars' });
      gsap.from(st.chars, { yPercent: 60, autoAlpha: 0, rotate: 8, stagger: .03, duration: .8, ease: 'back.out(1.6)',
        scrollTrigger: { trigger: '.buehne', start: 'top 70%', once: true } });
      return function () { st.revert(); };
    }
  });
  mm.add('(max-width: 899px)', function () {
    gsap.from('.kachel', { y: 40, autoAlpha: 0, stagger: .08, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: '.buehne__rahmen', start: 'top 85%', once: true } });
  });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
