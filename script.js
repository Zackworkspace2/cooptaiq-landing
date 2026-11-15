'use strict';

/* =========================================================
   Theme
   ========================================================= */

const root = document.documentElement;
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const THEME_KEY = 'cooptaiq-theme';

function currentTheme() {
  return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function syncTheme(theme) {
  const light = theme === 'light';

  root.setAttribute('data-theme', light ? 'light' : 'dark');

  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', light ? '#F6F4EE' : '#12213B');
  }

  if (themeToggle) {
    const next = light ? 'dark' : 'light';
    themeToggle.setAttribute('aria-pressed', String(light));
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
}

if (themeToggle) {
  syncTheme(currentTheme());

  themeToggle.addEventListener('click', () => {
    setTheme(currentTheme() === 'light' ? 'dark' : 'light');
  });

  window.addEventListener('storage', (event) => {
    if (event.key !== THEME_KEY) return;
    syncTheme(event.newValue === 'light' ? 'light' : 'dark');
  });
}

/* =========================================================
   Confirmation corridor — stage data
   ========================================================= */

const stages = [
  {
    stage: 'Stage 01 of 05',
    state: 'Documents uploaded',
    desc: 'The handbook, code of conduct and compliance manuals are on file.',
    foot: 'Record opened · 03 Mar 2026',
    log: [
      ['03 Mar 2026', 'Documents received', '3 documents · 84 pages indexed'],
      ['03 Mar 2026', 'Record opened', 'New hire — Operations'],
      ['04 Mar 2026', 'Awaiting curriculum', 'Generated from approved policy only']
    ]
  },
  {
    stage: 'Stage 02 of 05',
    state: 'Curriculum generated',
    desc: 'Eleven modules and a 46-question bank, built from your own policy.',
    foot: 'Curriculum ready · 05 Mar 2026',
    log: [
      ['03 Mar 2026', 'Documents received', '3 documents · 84 pages indexed'],
      ['05 Mar 2026', 'Curriculum generated', '11 modules · 46-question bank'],
      ['05 Mar 2026', 'Awaiting assessment', 'Assigned to role and department']
    ]
  },
  {
    stage: 'Stage 03 of 05',
    state: 'Assessment passed',
    desc: 'Tested, scored and on record before probation formally begins.',
    foot: 'Assessment recorded · 18 Mar 2026',
    log: [
      ['05 Mar 2026', 'Curriculum generated', '11 modules · 46-question bank'],
      ['18 Mar 2026', 'Litmus assessment', '94.2% · 11 of 11 modules complete'],
      ['18 Mar 2026', 'Probation begins', '90-day window opened']
    ]
  },
  {
    stage: 'Stage 04 of 05',
    state: 'Probation tracked',
    desc: 'Three review milestones, each with a manager sign-off.',
    foot: 'Reviews in progress · 12 May 2026',
    log: [
      ['18 Mar 2026', 'Assessment passed', '94.2% · 11 of 11 modules complete'],
      ['14 Apr 2026', 'Review 01 signed', 'Manager sign-off recorded'],
      ['12 May 2026', 'Review 02 signed', 'Manager sign-off recorded']
    ]
  },
  {
    stage: 'Stage 05 of 05',
    state: 'Confirmed',
    desc: 'Status written to the employee record and synced to payroll.',
    foot: 'Record complete · 02 Jun 2026',
    log: [
      ['03 Mar 2026', 'Documents received', '3 documents · 84 pages indexed'],
      ['18 Mar 2026', 'Assessment passed', '94.2% · 11 of 11 modules complete'],
      ['02 Jun 2026', 'Confirmed', '3 review sign-offs · payroll synced']
    ]
  }
];

/* =========================================================
   Corridor interaction
   ========================================================= */

const corridorButtons = Array.from(document.querySelectorAll('.corridor-stop'));
const recordStage = document.querySelector('[data-record-stage]');
const recordState = document.querySelector('[data-record-state]');
const recordDesc = document.querySelector('[data-record-desc]');
const recordFoot = document.querySelector('[data-record-foot]');
const recordLog = document.querySelector('[data-record-log]');
const recordDots = Array.from(document.querySelectorAll('.rp-dot'));
const corridorFill = document.querySelector('[data-corridor-fill]');

function updateCorridor(index) {
  const data = stages[index];

  corridorButtons.forEach((button, i) => {
    button.setAttribute('aria-pressed', String(i === index));
  });

  recordStage.textContent = data.stage;
  recordState.textContent = data.state;
  recordDesc.textContent = data.desc;
  recordFoot.textContent = data.foot;

  recordDots.forEach((dot, i) => {
    dot.classList.toggle('is-on', i <= index);
  });

  if (corridorFill) {
    corridorFill.style.width = `${index * 25}%`;
  }

  if (recordLog) {
    const fragment = document.createDocumentFragment();

    data.log.forEach(([date, title, detail]) => {
      const item = document.createElement('li');
      const dateEl = document.createElement('span');
      const copyEl = document.createElement('span');
      const strongEl = document.createElement('strong');
      const detailEl = document.createElement('span');

      dateEl.className = 'log-date';
      dateEl.textContent = date;

      copyEl.className = 'log-copy';
      strongEl.textContent = title;
      detailEl.textContent = detail;

      copyEl.append(strongEl, detailEl);
      item.append(dateEl, copyEl);
      fragment.append(item);
    });

    recordLog.replaceChildren(fragment);
  }
}

corridorButtons.forEach((button, index) => {
  button.addEventListener('click', () => updateCorridor(index));

  button.addEventListener('keydown', (event) => {
    let nextIndex = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (index + 1) % corridorButtons.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (index - 1 + corridorButtons.length) % corridorButtons.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = corridorButtons.length - 1;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    updateCorridor(nextIndex);
    corridorButtons[nextIndex].focus();
  });
});

/* Mark the default stage without re-rendering its content. */
recordDots.forEach((dot) => dot.classList.add('is-on'));
if (corridorFill) corridorFill.style.width = '100%';

/* =========================================================
   Email forms
   ========================================================= */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FORM_ENDPOINT_PATTERN = /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/;

function getFormEndpoint() {
  const meta = document.querySelector('meta[name="form-endpoint"]');
  return meta ? meta.getAttribute('content').trim() : '';
}

document.querySelectorAll('[data-signup]').forEach((form) => {
  const field = form.querySelector('[data-field]');
  const input = form.querySelector('input[type="email"]');
  const error = form.querySelector('.form-error');
  const success = form.querySelector('.form-success');
  const button = form.querySelector('button[type="submit"]');
  const buttonLabel = button.textContent;

  const clearError = () => {
    error.hidden = true;
    error.textContent = '';
    input.removeAttribute('aria-invalid');
  };

  input.addEventListener('input', () => {
    if (!error.hidden) clearError();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (form.getAttribute('aria-busy') === 'true') return;

    const value = input.value.trim();

    if (!EMAIL_PATTERN.test(value)) {
      error.textContent = 'Enter a valid work email, for example you@company.com.';
      error.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }

    const endpoint = getFormEndpoint();

    if (!FORM_ENDPOINT_PATTERN.test(endpoint)) {
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
    } catch (requestError) {
      form.removeAttribute('aria-busy');
      button.disabled = false;
      button.textContent = buttonLabel;
      error.textContent = 'Could not send your request. Check your connection and try again.';
      error.hidden = false;
      console.error('CooptaIQ form submission failed:', requestError);
    }
  });
});

/* =========================================================
   Header — scroll state, mobile menu, scroll spy
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
    target.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start'
    });

    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', hash);
    }

    const heading = target.querySelector('h2') || target;
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    heading.addEventListener(
      'blur',
      () => heading.removeAttribute('tabindex'),
      { once: true }
    );
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
