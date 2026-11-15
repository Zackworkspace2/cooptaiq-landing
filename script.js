'use strict';

/* =========================================================
   Theme
   ========================================================= */

const root = document.documentElement;
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const THEME_KEY = 'cooptaiq-theme';
const THEME_COOKIE = 'cooptaiq_theme';
const CONSENT_COOKIE = 'cooptaiq_consent';

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

function setCookie(name, value, days) {
  const maxAge = days * 24 * 60 * 60;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

const existingConsent = getCookie(CONSENT_COOKIE);
if (existingConsent) root.dataset.cookieConsent = existingConsent;

function currentTheme() {
  return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function syncTheme(theme) {
  const dark = theme === 'dark';

  root.setAttribute('data-theme', dark ? 'dark' : 'light');

  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', dark ? '#12213B' : '#F6F4EE');
  }

  if (themeToggle) {
    const next = dark ? 'light' : 'dark';
    themeToggle.setAttribute('aria-pressed', String(!dark));
    themeToggle.setAttribute('aria-label', `Switch to ${next} mode`);
    themeToggle.setAttribute('title', `Switch to ${next} mode`);
  }
}

function setTheme(theme, persist = true) {
  syncTheme(theme);

  if (!persist) return;

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {}

  setCookie(THEME_COOKIE, theme, 365);
}

if (themeToggle) {
  syncTheme(currentTheme());

  themeToggle.addEventListener('click', () => {
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });

  window.addEventListener('storage', (event) => {
    if (event.key !== THEME_KEY) return;
    syncTheme(event.newValue === 'dark' ? 'dark' : 'light');
  });
}

/* =========================================================
   Cookie consent
   ========================================================= */

const cookieBanner = document.querySelector('[data-cookie-banner]');
const cookieStatus = document.querySelector('[data-cookie-status]');
const cookieSettings = document.querySelector('[data-cookie-settings]');
const mainContent = document.getElementById('main');

function showCookieBanner(shouldFocus = false) {
  if (!cookieBanner) return;

  cookieBanner.hidden = false;

  if (shouldFocus) {
    const firstChoice = cookieBanner.querySelector('[data-cookie-choice]');
    if (firstChoice) firstChoice.focus();
  }
}

function closeCookieBanner() {
  if (!cookieBanner) return;

  cookieBanner.hidden = true;
  if (mainContent) mainContent.focus({ preventScroll: true });
}

if (cookieBanner && !getCookie(CONSENT_COOKIE)) {
  showCookieBanner();
}

if (cookieBanner) {
  cookieBanner.querySelectorAll('[data-cookie-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      const choice = button.getAttribute('data-cookie-choice');

      setCookie(CONSENT_COOKIE, choice, 180);
      root.dataset.cookieConsent = choice;

      if (cookieStatus) {
        cookieStatus.textContent = 'Cookie preferences saved.';
      }

      closeCookieBanner();
    });
  });
}

cookieSettings?.addEventListener('click', () => {
  showCookieBanner(true);
});

/* =========================================================
   Product preview tabs
   ========================================================= */

const previewTabs = Array.from(document.querySelectorAll('[data-preview-tab]'));
const previewImage = document.querySelector('[data-product-image]');

const previewData = {
  hr: {
    src: 'assets/product-hr.png',
    alt: 'Illustrative CooptaIQ HR dashboard showing people, assessments, recruitment and learning.'
  },
  employee: {
    src: 'assets/product-employee.png',
    alt: 'Illustrative CooptaIQ employee portal showing onboarding, assessments and learning.'
  },
  intern: {
    src: 'assets/product-intern.png',
    alt: 'Illustrative CooptaIQ intern and corper portal showing onboarding tasks and progress.'
  },
  admin: {
    src: 'assets/product-admin.png',
    alt: 'Illustrative CooptaIQ platform admin view showing companies, assessments and activity.'
  }
};

function activatePreview(key, focusTab = false) {
  previewTabs.forEach((tab) => {
    const active = tab.getAttribute('data-preview-tab') === key;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-pressed', String(active));
    if (active && focusTab) tab.focus();
  });

  const data = previewData[key];
  if (!previewImage || !data) return;

  previewImage.classList.remove('is-swapping');
  void previewImage.offsetWidth;
  previewImage.src = data.src;
  previewImage.alt = data.alt;
  previewImage.classList.add('is-swapping');
}

if (previewTabs.length) {
  previewTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activatePreview(tab.getAttribute('data-preview-tab'));
    });

    tab.addEventListener('keydown', (event) => {
      let nextIndex = null;

      if (event.key === 'ArrowRight') nextIndex = (index + 1) % previewTabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + previewTabs.length) % previewTabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = previewTabs.length - 1;

      if (nextIndex === null) return;

      event.preventDefault();
      activatePreview(previewTabs[nextIndex].getAttribute('data-preview-tab'), true);
    });
  });
}

/* =========================================================
   Waitlist form
   ========================================================= */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FORM_ENDPOINT_PATTERN = /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/;

function getFormEndpoint() {
  const meta = document.querySelector('meta[name="form-endpoint"]');
  return meta ? meta.getAttribute('content').trim() : '';
}

document.querySelectorAll('[data-signup]').forEach((form) => {
  const field = form.querySelector('[data-field]');
  const nameInput = form.querySelector('input[name="full_name"]');
  const emailInput = form.querySelector('input[type="email"]');
  const error = form.querySelector('.form-error');
  const success = form.querySelector('.form-success');
  const successText = success.querySelector('.success-text');
  const newsletter = form.querySelector('input[name="newsletter"]');
  const button = form.querySelector('button[type="submit"]');
  const buttonLabel = button.textContent;

  const clearError = () => {
    error.hidden = true;
    error.textContent = '';
    nameInput?.removeAttribute('aria-invalid');
    emailInput.removeAttribute('aria-invalid');
  };

  [nameInput, emailInput].filter(Boolean).forEach((input) => {
    input.addEventListener('input', () => {
      if (!error.hidden) clearError();
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (form.getAttribute('aria-busy') === 'true') return;

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput.value.trim();

    if (nameInput && name.length < 2) {
      clearError();
      error.textContent = 'Enter your full name.';
      error.hidden = false;
      nameInput.setAttribute('aria-invalid', 'true');
      nameInput.focus();
      return;
    }

    if (!EMAIL_PATTERN.test(email)) {
      clearError();
      error.textContent = 'Enter a valid work email, for example you@company.com.';
      error.hidden = false;
      emailInput.setAttribute('aria-invalid', 'true');
      emailInput.focus();
      return;
    }

    const endpoint = getFormEndpoint();

    if (!FORM_ENDPOINT_PATTERN.test(endpoint)) {
      clearError();
      error.textContent = 'Requests are not connected yet. Add your Formspree endpoint in the page head.';
      error.hidden = false;
      return;
    }

    clearError();
    form.setAttribute('aria-busy', 'true');
    button.disabled = true;
    button.textContent = 'Sending…';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      });

      if (!response.ok) {
        throw new Error(`Formspree rejected the request (${response.status}).`);
      }

      form.removeAttribute('aria-busy');
      field.hidden = true;
      success.hidden = false;
      success.setAttribute('tabindex', '-1');
      success.focus({ preventScroll: true });
      button.disabled = false;
      button.textContent = buttonLabel;

      if (newsletter?.checked && successText) {
        successText.textContent = "We'll keep you updated and send product news too.";
      }
    } catch (requestError) {
      form.removeAttribute('aria-busy');
      button.disabled = false;
      button.textContent = buttonLabel;
      clearError();
      error.textContent = 'Could not send your request. Check your connection and try again.';
      error.hidden = false;
      console.error('CooptaIQ form submission failed:', requestError);
    }
  });
});

/* =========================================================
   Header, mobile menu and scroll spy
   ========================================================= */

const header = document.querySelector('[data-header]');
const nav = document.getElementById('site-nav');
const menuToggle = document.querySelector('.menu-toggle');

const setScrolled = () => {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 8);
};
window.addEventListener('scroll', setScrolled, { passive: true });
setScrolled();

function setMenu(open, returnFocus = false) {
  if (!nav || !menuToggle) return;

  nav.classList.toggle('is-open', open);
  document.body.classList.toggle('nav-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');

  if (open) {
    const firstLink = nav.querySelector('a');
    if (firstLink) firstLink.focus();
  } else if (returnFocus) {
    menuToggle.focus();
  }
}

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;

    setMenu(false);

    const hash = link.getAttribute('href');
    if (!hash || !hash.startsWith('#') || hash.length < 2) return;

    const target = document.querySelector(hash);
    if (!target) return;

    event.preventDefault();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });

    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', hash);
    }

    const heading = target.querySelector('h1, h2') || target;
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), { once: true });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false, true);
    }
  });

  const desktop = window.matchMedia('(min-width: 901px)');
  desktop.addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });
}

window.addEventListener('popstate', () => {
  const hash = window.location.hash;
  if (!hash) {
    window.scrollTo({ top: 0, behavior: 'auto' });
    return;
  }

  const target = document.querySelector(hash);
  if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
});

const navLinks = Array.from(document.querySelectorAll('[data-nav]'));
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && navSections.length) {
  const setActive = (id) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-42% 0px -52% 0px', threshold: 0 }
  );

  navSections.forEach((section) => spy.observe(section));
}
