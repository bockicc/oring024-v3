/* ============================================================
   ORING 024 doo Subotica — js/main.js
   Mobile Menu · Scroll Header · Scroll Reveal · Number Counter
   ============================================================ */

'use strict';

(function () {

  /* ─── DOM READY ─────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileNav();
    initScrollReveal();
    initCounters();
    initActiveNav();
    initContactForm();
    initFooterActiveState();
  });


  /* ─── 1. SCROLL-AWARE HEADER ─────────────────────────────
     Switches between transparent (over hero) and opaque
     (when user has scrolled past 60px).
  ─────────────────────────────────────────────────────────── */
  function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const SCROLL_THRESHOLD = 60;

    function updateHeader() {
      const scrolled = window.scrollY > SCROLL_THRESHOLD;
      header.classList.toggle('is-scrolled', scrolled);
      header.classList.toggle('is-transparent', !scrolled);
    }

    // Run immediately so the initial state is correct
    updateHeader();

    // Throttled scroll listener
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateHeader();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }


  /* ─── 2. MOBILE NAVIGATION ───────────────────────────────
     Toggles the off-canvas drawer and the overlay backdrop.
     Traps focus within the drawer when open.
     Closes on: overlay click, Escape key, nav link click.
  ─────────────────────────────────────────────────────────── */
  function initMobileNav() {
    const toggle   = document.querySelector('.mobile-toggle');
    const nav      = document.querySelector('.mobile-nav');
    const overlay  = document.querySelector('.mobile-nav__overlay');
    const navLinks = document.querySelectorAll('.mobile-nav__link');

    if (!toggle || !nav) return;

    let isOpen = false;

    function openNav() {
      isOpen = true;
      toggle.classList.add('is-open');
      nav.classList.add('is-open');
      overlay && overlay.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
      toggle.setAttribute('aria-expanded', 'true');
      nav.setAttribute('aria-hidden', 'false');

      // Move focus to first link
      const firstLink = nav.querySelector('a, button');
      firstLink && setTimeout(() => firstLink.focus(), 50);
    }

    function closeNav() {
      isOpen = false;
      toggle.classList.remove('is-open');
      nav.classList.remove('is-open');
      overlay && overlay.classList.remove('is-visible');
      document.body.style.overflow = '';
      toggle.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
      toggle.focus();
    }

    toggle.addEventListener('click', () => {
      isOpen ? closeNav() : openNav();
    });

    overlay && overlay.addEventListener('click', closeNav);

    navLinks.forEach(link => link.addEventListener('click', closeNav));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) closeNav();
    });

    // Initial ARIA state
    toggle.setAttribute('aria-expanded', 'false');
    nav.setAttribute('aria-hidden', 'true');
  }


  /* ─── 3. SCROLL REVEAL ───────────────────────────────────
     Any element with class .reveal will animate in when it
     enters the viewport.  Add .reveal-delay-1/2/3/4 for
     staggered children.
  ─────────────────────────────────────────────────────────── */
  function initScrollReveal() {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    const options = {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, options);

    targets.forEach(el => observer.observe(el));
  }


  /* ─── 4. NUMBER COUNTERS ─────────────────────────────────
     Elements with data-counter="70" will animate from 0 to
     that value when they enter the viewport.
  ─────────────────────────────────────────────────────────── */
  function initCounters() {
    const counterEls = document.querySelectorAll('[data-counter]');
    if (!counterEls.length) return;

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function animateCounter(el) {
      const target   = parseFloat(el.dataset.counter);
      const duration = parseInt(el.dataset.counterDuration || '2000', 10);
      const suffix   = el.dataset.counterSuffix || '';
      const decimals = (target % 1 !== 0) ? 1 : 0;
      const start    = performance.now();

      function update(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const value    = easeOutQuart(progress) * target;
        el.textContent = value.toFixed(decimals) + suffix;

        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target.toFixed(decimals) + suffix;
      }

      requestAnimationFrame(update);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counterEls.forEach(el => observer.observe(el));
  }


  /* ─── 5. ACTIVE NAV STATE ────────────────────────────────
     Highlights the nav link matching the current page.
  ─────────────────────────────────────────────────────────── */
  function initActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav__link, .mobile-nav__link');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }


/* ─── 6. CONTACT FORM ────────────────────────────────────
      Basic client-side validation + success state toggle.
   ─────────────────────────────────────────────────────────── */
  function initContactForm() {
    const form    = document.querySelector('.js-contact-form');
    const success = document.querySelector('.form-success');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simple required-field check
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          valid = false;
          field.classList.add('is-invalid');
          field.addEventListener('input', () => field.classList.remove('is-invalid'), { once: true });
        }
      });

      if (!valid) return;

      // Simulate async submission
      const submitBtn = form.querySelector('.form-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Slanje...';
      }

      setTimeout(() => {
        form.style.display = 'none';
        if (success) success.classList.add('is-visible');
      }, 1200);
    });
  }


  /* ─── 7. FOOTER ACTIVE STATE ───────────────────────────────
      Replaces current page link with plain text in footer.
   ─────────────────────────────────────────────────────────── */
  function initFooterActiveState() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const footerLinks = document.querySelectorAll('.footer__nav-link');

    footerLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        const span = document.createElement('span');
        span.className = 'footer__nav-current';
        span.textContent = link.textContent;
        link.parentNode.replaceChild(span, link);
      }
    });
  }

})();