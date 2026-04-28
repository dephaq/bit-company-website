/* bit — shared client JS: nav active state, reveal, contact form */
(function () {
  'use strict';

  // ───── Active nav link ─────
  function setActiveNav() {
    var parts = location.pathname.split('/').filter(Boolean);
    // Drop trailing index.html, and strip .html from the last segment
    if (parts.length && /^index\.html$/i.test(parts[parts.length - 1])) parts.pop();
    if (parts.length) parts[parts.length - 1] = parts[parts.length - 1].replace(/\.html$/i, '');
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      var match = (a.getAttribute('data-nav') || '').replace(/^\//, '');
      if (!match) return;
      if (parts.indexOf(match) !== -1) {
        a.classList.add('active');
      }
    });
  }

  // ───── Reveal-on-scroll ─────
  function initReveal() {
    var sels = '.hero h1, .hero .sub, .hero-cta, .hero-meta, .hero-badges, .triad-item, .card, .why-cell, .metric-cell, .step, .domain-card, .product-row, .opt-card, .team-card, .method-card, .scale-row, .highlight, .mockup';
    var els = document.querySelectorAll(sels);
    els.forEach(function (el) { el.classList.add('reveal'); });
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // ───── Contact form ─────
  function initForm() {
    var form = document.getElementById('bit-form');
    if (!form) return;
    var ENDPOINT = 'https://formspree.io/f/xlggwyzr';
    var errLine = document.getElementById('form-error');
    var submitBtn = document.getElementById('submit-btn');
    var submitLabel = submitBtn ? submitBtn.querySelector('[data-label]') : null;

    function getField(name) {
      var wrap = form.querySelector('[data-field="' + name + '"]');
      if (!wrap) return null;
      return {
        wrap: wrap,
        el: wrap.querySelector('input, textarea, select'),
        errEl: wrap.querySelector('[data-err]')
      };
    }

    function setErr(field, msg) {
      var f = getField(field);
      if (!f) return;
      f.wrap.classList.toggle('invalid', !!msg);
      if (f.errEl) f.errEl.textContent = msg || '';
    }

    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function validate() {
      var ok = true;
      // required text fields
      var required = form.querySelectorAll('[data-field][data-required="1"]');
      required.forEach(function (wrap) {
        var name = wrap.getAttribute('data-field');
        var el = wrap.querySelector('input, textarea, select');
        if (!el) return;
        var v = (el.value || '').trim();
        if (!v) {
          setErr(name, wrap.getAttribute('data-msg') || 'Заполните поле.');
          ok = false;
        } else {
          setErr(name, '');
        }
      });
      // email
      var emailField = getField('email');
      if (emailField) {
        var e = (emailField.el.value || '').trim();
        if (!emailRe.test(e)) { setErr('email', 'Введите корректный email.'); ok = false; }
        else { setErr('email', ''); }
      }
      // message min length
      var mWrap = form.querySelector('[data-field="message"]');
      if (mWrap) {
        var min = parseInt(mWrap.getAttribute('data-minlen') || '10', 10);
        var mEl = mWrap.querySelector('textarea, input');
        var mv = (mEl.value || '').trim();
        if (mv.length < min) {
          setErr('message', 'Опишите задачу хотя бы в ' + min + ' символов.');
          ok = false;
        } else {
          setErr('message', '');
        }
      }
      return ok;
    }

    // Live re-validate on input
    form.querySelectorAll('input, textarea, select').forEach(function (el) {
      el.addEventListener('input', function () {
        var wrap = el.closest('[data-field]');
        if (wrap && wrap.classList.contains('invalid')) {
          var name = wrap.getAttribute('data-field');
          if (name === 'email') {
            if (emailRe.test((el.value || '').trim())) setErr('email', '');
          } else if (name === 'message') {
            var min = parseInt(wrap.getAttribute('data-minlen') || '10', 10);
            if ((el.value || '').trim().length >= min) setErr('message', '');
          } else if ((el.value || '').trim()) {
            setErr(name, '');
          }
        }
        if (errLine) errLine.classList.remove('show');
      });
      el.addEventListener('change', function () {
        var wrap = el.closest('[data-field]');
        if (wrap && wrap.classList.contains('invalid')) {
          var name = wrap.getAttribute('data-field');
          if ((el.value || '').trim()) setErr(name, '');
        }
      });
    });

    function showSuccess() {
      var mount = document.getElementById('form-mount');
      if (!mount) return;
      mount.innerHTML =
        '<div class="form-success" role="status" aria-live="polite">' +
          '<div class="ok-mark" aria-hidden="true">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' +
          '</div>' +
          '<h3>Принято.</h3>' +
          '<p>Ответим в течение 24 часов на указанный email.</p>' +
        '</div>';
    }

    function showError() {
      if (errLine) {
        errLine.textContent = 'Что-то пошло не так. Напишите на hello@bit-company.ru';
        errLine.classList.add('show');
      }
      if (submitBtn) submitBtn.disabled = false;
      if (submitLabel) submitLabel.textContent = 'Отправить';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (errLine) errLine.classList.remove('show');
      if (!validate()) return;

      if (submitBtn) submitBtn.disabled = true;
      if (submitLabel) submitLabel.textContent = 'Отправляем…';

      var data = new FormData(form);
      fetch(ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (res.ok) showSuccess();
        else showError();
      }).catch(function () { showError(); });
    });
  }

  // ───── Hero mouse-tracking aurora ─────
  function initHeroParallax() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var spotlight = hero.querySelector('.aurora .spotlight');
    var rafId = null;
    var nx = 0, ny = 0, sx = 0, sy = 0;

    function update() {
      hero.style.setProperty('--mx', nx.toFixed(3));
      hero.style.setProperty('--my', ny.toFixed(3));
      if (spotlight) {
        hero.style.setProperty('--sx', sx.toFixed(0));
        hero.style.setProperty('--sy', sy.toFixed(0));
      }
      rafId = null;
    }

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      var w = rect.width, h = rect.height;
      // Normalized -1..1 for parallax
      nx = ((e.clientX - rect.left) / w) * 2 - 1;
      ny = ((e.clientY - rect.top) / h) * 2 - 1;
      // Pixel offset for spotlight (relative to hero center)
      sx = (e.clientX - rect.left) - w / 2;
      sy = (e.clientY - rect.top) - h / 2;
      hero.classList.add('is-hover');
      if (rafId === null) rafId = requestAnimationFrame(update);
    });

    hero.addEventListener('mouseleave', function () {
      hero.classList.remove('is-hover');
      nx = 0; ny = 0; sx = 0; sy = 0;
      if (rafId === null) rafId = requestAnimationFrame(update);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setActiveNav();
    initReveal();
    initForm();
    initHeroParallax();
  });
})();
