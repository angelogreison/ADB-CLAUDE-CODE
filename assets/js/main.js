(function () {
  // Nav scroll state
  var nav = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Mobile menu
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  if (burger && menu) {
    burger.addEventListener('click', function () { menu.classList.toggle('open'); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('open'); });
    });
  }

  // Reveal on scroll (Intersection Observer)
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal, .reveal-scale, .stagger').forEach(function (el) { io.observe(el); });

  // Counter animation
  var counters = document.querySelectorAll('.num[data-count]');
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      var el = e.target;
      var target = parseFloat(el.getAttribute('data-count'));
      var decimals = parseInt(el.getAttribute('data-decimal') || '0');
      var dur = 1600;
      var start = performance.now();
      function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        el.textContent = decimals ? val.toFixed(decimals) : Math.round(val);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = decimals ? target.toFixed(decimals) : target;
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  counters.forEach(function (c) { cio.observe(c); });

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (i) { i.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---------- SCROLL-DRIVEN VIDEO HERO ---------- */
  var video = document.getElementById('heroVideo');
  var hero = document.getElementById('scroll-hero');
  var progressFill = document.getElementById('progressFill');

  if (video && hero) {
    var isMobile = window.matchMedia('(max-width: 768px)').matches;
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    video.addEventListener('loadeddata', function () { video.classList.add('ready'); });

    if (isMobile || prefersReduced) {
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.play().catch(function () {});
    } else {
      video.pause();
      video.currentTime = 0;
      var isReady = false;
      video.addEventListener('loadedmetadata', function () { isReady = true; });
      video.load();

      var updateVideo = function () {
        if (!isReady || !video.duration) return;
        var rect = hero.getBoundingClientRect();
        var scrolled = -rect.top;
        var scrollable = hero.offsetHeight - window.innerHeight;
        if (scrolled <= 0) {
          video.currentTime = 0;
          if (progressFill) progressFill.style.width = '0%';
          return;
        }
        if (scrolled >= scrollable) {
          video.currentTime = video.duration;
          if (progressFill) progressFill.style.width = '100%';
          return;
        }
        var progress = scrolled / scrollable;
        video.currentTime = progress * video.duration;
        if (progressFill) progressFill.style.width = (progress * 100) + '%';
      };

      var ticking = false;
      window.addEventListener('scroll', function () {
        if (!ticking) {
          requestAnimationFrame(function () { updateVideo(); ticking = false; });
          ticking = true;
        }
      }, { passive: true });
      window.addEventListener('resize', updateVideo);
    }
  }

  /* ---------- SCHEDULE BOOKING MODAL ---------- */
  var selectedSchedule = null;
  var modal = document.getElementById('schedule-modal');

  window.openScheduleModal = function (el) {
    if (!modal) return;
    selectedSchedule = {
      category: el.getAttribute('data-category'),
      day: el.getAttribute('data-day'),
      start: el.getAttribute('data-start'),
      end: el.getAttribute('data-end')
    };

    document.getElementById('m-title').innerText = selectedSchedule.category;
    document.getElementById('m-subtitle').innerText = selectedSchedule.day + ' de ' + selectedSchedule.start + ' - ' + selectedSchedule.end + 'hs';

    var planDisplay = document.getElementById('m-plan-display');
    var cat = selectedSchedule.category.toLowerCase();
    if (cat.indexOf('modelado') !== -1) {
      planDisplay.innerText = 'Plan Taller ($79.000)';
    } else if (cat.indexOf('alfarer') !== -1) {
      planDisplay.innerText = 'Plan Fusión ($90.000)';
    } else {
      planDisplay.innerText = 'Consultar Plan';
    }

    document.getElementById('modal-form').reset();
    modal.classList.add('active');
  };

  window.closeModal = function () {
    if (modal) modal.classList.remove('active');
  };

  window.handleBooking = function (event) {
    event.preventDefault();
    var name = document.getElementById('m-name').value;
    var email = document.getElementById('m-email').value;
    var whatsapp = document.getElementById('m-whatsapp').value;
    var plan = document.getElementById('m-plan-display').innerText;

    if (!selectedSchedule) return;

    var message = '¡Hola! Me gustaría reservar un lugar:\n\n'
      + '👤 Nombre: ' + name + '\n'
      + '✉️ Email: ' + email + '\n'
      + '📱 WhatsApp: ' + whatsapp + '\n'
      + '🎨 Clase: ' + selectedSchedule.category + '\n'
      + '📅 Día: ' + selectedSchedule.day + '\n'
      + '⏰ Horario: ' + selectedSchedule.start + ' - ' + selectedSchedule.end + 'hs\n'
      + '💎 Plan: ' + plan;

    var waUrl = 'https://wa.me/5491156206435?text=' + encodeURIComponent(message);
    window.open(waUrl, '_blank');
    closeModal();
  };

  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  document.addEventListener('click', function (e) {
    if (modal && e.target === modal) closeModal();
  });
})();
