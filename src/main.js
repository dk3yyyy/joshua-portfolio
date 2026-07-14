import './styles.css';

const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('.nav-toggle');
const navLabel = navToggle?.querySelector('.sr-only');
const nav = document.querySelector('.site-nav');
const main = document.querySelector('main');
const footer = document.querySelector('.site-footer');
const signalBar = document.querySelector('.signal-bar');
const progress = document.querySelector('.scroll-progress span');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let navFocusTimer;

const setPageInert = (inert) => {
  if (main) main.inert = inert;
  if (footer) footer.inert = inert;
};

const closeNav = ({ restoreFocus = false } = {}) => {
  window.clearTimeout(navFocusTimer);
  navToggle?.setAttribute('aria-expanded', 'false');
  if (navLabel) navLabel.textContent = 'Open navigation';
  nav?.classList.remove('is-open');
  document.body.classList.remove('nav-open');
  setPageInert(false);
  if (restoreFocus) navToggle?.focus();
};

const openNav = () => {
  navToggle?.setAttribute('aria-expanded', 'true');
  if (navLabel) navLabel.textContent = 'Close navigation';
  nav?.classList.add('is-open');
  document.body.classList.add('nav-open');
  setPageInert(true);
  navFocusTimer = window.setTimeout(() => nav?.querySelector('a')?.focus({ preventScroll: true }), 50);
};

const focusLinkTarget = (link) => {
  const hash = link.hash;
  if (!hash) return;

  const target = document.querySelector(hash);
  if (!target) return;

  const hadTabIndex = target.hasAttribute('tabindex');
  if (!hadTabIndex) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  if (!hadTabIndex) {
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  }
};

navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') === 'true';
  if (open) closeNav({ restoreFocus: true });
  else openNav();
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  closeNav();
  window.requestAnimationFrame(() => focusLinkTarget(link));
}));

window.addEventListener('keydown', (event) => {
  if (navToggle?.getAttribute('aria-expanded') !== 'true') return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closeNav({ restoreFocus: true });
    return;
  }

  if (event.key !== 'Tab') return;

  const focusTargets = [navToggle, ...nav.querySelectorAll('a')].filter(Boolean);
  const firstTarget = focusTargets[0];
  const lastTarget = focusTargets.at(-1);
  const activeTarget = document.activeElement;

  if (event.shiftKey && (activeTarget === firstTarget || !focusTargets.includes(activeTarget))) {
    event.preventDefault();
    lastTarget?.focus();
  } else if (!event.shiftKey && (activeTarget === lastTarget || !focusTargets.includes(activeTarget))) {
    event.preventDefault();
    firstTarget?.focus();
  }
});

const updateChrome = () => {
  const scrollY = window.scrollY;
  header?.classList.toggle('is-scrolled', scrollY > 24);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
};

updateChrome();
window.addEventListener('scroll', updateChrome, { passive: true });

const updateSignalFocusability = () => {
  if (!signalBar) return;
  const scrollable = signalBar.scrollWidth > signalBar.clientWidth + 1;
  if (scrollable) signalBar.setAttribute('tabindex', '0');
  else signalBar.removeAttribute('tabindex');
};

updateSignalFocusability();
window.addEventListener('resize', updateSignalFocusability, { passive: true });

const mobileQuery = window.matchMedia('(max-width: 760px)');
mobileQuery.addEventListener('change', (event) => {
  if (!event.matches) closeNav();
});

const revealItems = document.querySelectorAll('[data-reveal]');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px' },
  );
  revealItems.forEach((item) => observer.observe(item));
}

const year = new Date().getFullYear();
document.querySelector('.site-footer p')?.setAttribute('title', `Portfolio updated ${year}`);
