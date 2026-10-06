import { milestones, mechanicsChapters, explosionForProgress } from './story.js';
import { createAmbience } from './ambience.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const loader = $('#loader');
const loaderPercent = $('#loading-percent');
const loaderBar = $('#loading-bar');
let introFinished = false;
let engineReady = false;
let engineLoadFailed = false;
let heroScene;
let anatomyScene;
const bootTime = performance.now();
const introVisited = (() => { try { return sessionStorage.getItem('continuum-visited') === 'yes'; } catch { return false; } })();
document.body.classList.add('intro-active');

function finishIntro() {
  if (introFinished) return;
  introFinished = true;
  loader.classList.add('open');
  document.body.classList.remove('intro-active');
  try { sessionStorage.setItem('continuum-visited', 'yes'); } catch { /* Storage can be unavailable in private mode. */ }
  $$('.hero .reveal').forEach((el, i) => setTimeout(() => el.classList.add('visible'), reducedMotion ? 0 : 160 + i * 130));
  setTimeout(() => loader.remove(), reducedMotion ? 20 : 1300);
}
$('#skip-intro').addEventListener('click', finishIntro);

function loadingFrame(now) {
  if (introFinished) return;
  const elapsed = now - bootTime;
  const hold = introVisited || reducedMotion ? 150 : 1750;
  const progress = engineReady || engineLoadFailed ? Math.min(100, elapsed / hold * 100) : Math.min(94, elapsed / 2000 * 85);
  loaderPercent.textContent = `${Math.floor(progress).toString().padStart(2, '0')}%`;
  loaderBar.style.width = `${progress}%`;
  if (progress >= 100 || elapsed > 6500) { finishIntro(); return; }
  requestAnimationFrame(loadingFrame);
}
requestAnimationFrame(loadingFrame);

// Loading the 3D engine is optional: history and navigation are fully HTML.
import('./watch-scene.js').then(({ createWatchScene }) => {
  engineReady = true;
  // The real product image leads; keep a quiet 3D layer behind it for depth and hover.
  heroScene = createWatchScene($('#hero-watch-stage'), { reducedMotion });
  // Build the exploded movement only when the visitor approaches its chapter.
  const anatomyObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting) && !anatomyScene) {
      anatomyScene = createWatchScene($('#anatomy-stage'), { anatomy: true, reducedMotion });
      updateScroll();
      anatomyObserver.disconnect();
    }
  }, { rootMargin: '400px' });
  anatomyObserver.observe($('#mechanics'));
  updateScroll();
}).catch(error => {
  console.info('Using the lightweight watch illustration.', error);
  engineLoadFailed = true;
  $('#hero-watch-stage').classList.add('no-webgl');
  $('#anatomy-stage').classList.add('no-webgl');
});

const productStage = $('#hero-watch-stage');
productStage.addEventListener('pointermove', event => {
  if (reducedMotion || event.pointerType === 'touch') return;
  const bounds = productStage.getBoundingClientRect();
  productStage.style.setProperty('--watch-tilt-x', `${((event.clientY - bounds.top) / bounds.height - .5) * -6}deg`);
  productStage.style.setProperty('--watch-tilt-y', `${((event.clientX - bounds.left) / bounds.width - .5) * 8}deg`);
});
productStage.addEventListener('pointerleave', () => {
  productStage.style.setProperty('--watch-tilt-x', '0deg');
  productStage.style.setProperty('--watch-tilt-y', '0deg');
});

const revealObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting && !entry.target.closest('.hero')) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  }
}, { threshold: .08 });
$$('.reveal').forEach(el => revealObserver.observe(el));

// Accessible tabs: arrows, Home/End, focus, and a single tab stop.
const timelineTabs = $$('.timeline-tab');
function selectMilestone(tab, focus = false) {
  const year = tab.dataset.year;
  const milestone = milestones[year];
  timelineTabs.forEach(t => {
    const selected = t === tab;
    t.classList.toggle('active', selected);
    t.setAttribute('aria-selected', String(selected));
    t.tabIndex = selected ? 0 : -1;
  });
  $('#timeline-year').textContent = year;
  $('#timeline-location').textContent = milestone.location;
  $('#timeline-title').textContent = milestone.title;
  $('#timeline-description').textContent = milestone.description;
  $('#timeline-source').href = milestone.source;
  $('#timeline-source').setAttribute('aria-label', `Read the source for the ${year} milestone`);
  const panel = $('#timeline-panel');
  panel.setAttribute('aria-labelledby', tab.id);
  panel.classList.remove('switching');
  void panel.offsetWidth;
  panel.classList.add('switching');
  if (focus) tab.focus();
}
timelineTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectMilestone(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % timelineTabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + timelineTabs.length) % timelineTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = timelineTabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectMilestone(timelineTabs[next], true); }
  });
});

// Overlay navigation locks the background and restores focus on close.
const menuButton = $('#menu-button');
const mobileMenu = $('#mobile-menu');
let menuOpen = false;
function setMenu(open) {
  menuOpen = open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobileMenu.classList.toggle('open', open);
  mobileMenu.inert = !open;
  $('main').inert = open;
  $('.site-footer').inert = open;
  document.body.classList.toggle('menu-open', open);
  if (open) mobileMenu.querySelector('a').focus();
  else menuButton.focus({ preventScroll: true });
}
menuButton.addEventListener('click', () => setMenu(!menuOpen));
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (!menuOpen) return;
  if (event.key === 'Escape') setMenu(false);
  if (event.key === 'Tab') {
    const links = [menuButton, ...mobileMenu.querySelectorAll('a')];
    const first = links[0]; const last = links[links.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
window.addEventListener('resize', () => { if (window.innerWidth > 800 && menuOpen) setMenu(false); });

createAmbience($('#sound-button'));

const mechanics = $('#mechanics');
const mechanicsSticky = $('.mechanics-sticky');
const assemblyToggle = $('#assembly-toggle');
const components = $$('.component-row');
const indicators = $$('.chapter-progress i');
const progressBar = $('#page-progress-bar');
const header = $('#site-header');
let manualExplosion = null;
let lastScrollY = window.scrollY;
let previousChapter = -1;
let scrollFrame = 0;

function updateMechanics(explosion, progress) {
  anatomyScene?.setExplosion(explosion);
  $('#anatomy-stage').style.setProperty('--explosion', explosion);
  $('#anatomy-stage').style.setProperty('--real-watch-opacity', Math.max(0, 1 - explosion * 2));
  $('#anatomy-stage').style.setProperty('--real-watch-x', `${explosion * -18}px`);
  $('#anatomy-stage').style.setProperty('--real-watch-y', `${explosion * -12}px`);
  $('#anatomy-stage').style.setProperty('--real-watch-rotation', `${explosion * -12}deg`);
  $('#anatomy-stage').style.setProperty('--real-watch-scale', `${1 - explosion * .12}`);
  const chapter = Math.min(3, Math.floor(progress * 4));
  if (chapter !== previousChapter) {
    previousChapter = chapter;
    const content = mechanicsChapters[chapter];
    $('#mechanics-step').textContent = content.label;
    $('#mechanics-description').textContent = content.description;
    components.forEach((row, i) => row.classList.toggle('active', i === content.component));
    indicators.forEach((indicator, i) => indicator.classList.toggle('active', i === chapter));
    $('#mechanics-progress-label').textContent = `0${chapter + 1} / 04`;
  }
  const assembled = Math.round((1 - explosion) * 100);
  $('#assembly-percent').textContent = assembled;
  $('#assembly-bar').style.width = `${assembled}%`;
  $('#assembly-state').textContent = explosion < .01 ? 'ASSEMBLED' : explosion > .99 ? 'DISASSEMBLED' : progress > .6 ? 'REASSEMBLING' : 'OPENING';
  mechanics.dataset.explosion = explosion.toFixed(3);
  mechanics.dataset.progress = progress.toFixed(3);
}

function updateScroll() {
  scrollFrame = 0;
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  header.classList.toggle('scrolled', y > 200);
  const rect = mechanics.getBoundingClientRect();
  const distance = mechanics.offsetHeight - mechanicsSticky.offsetHeight;
  const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, distance)));
  if (manualExplosion !== null && Math.abs(y - lastScrollY) > 3) {
    manualExplosion = null;
    assemblyToggle.setAttribute('aria-pressed', 'false');
    assemblyToggle.innerHTML = 'PREVIEW DISASSEMBLY <span>↗</span>';
  }
  lastScrollY = y;
  updateMechanics(manualExplosion ?? explosionForProgress(progress), progress);
  for (const nav of $$('[data-nav]')) {
    const section = $(`#${nav.dataset.nav}`);
    const r = section.getBoundingClientRect();
    nav.classList.toggle('active', r.top <= 150 && r.bottom > 150);
  }
}
function scheduleScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }
window.addEventListener('scroll', scheduleScroll, { passive: true });
window.addEventListener('resize', scheduleScroll);
assemblyToggle.addEventListener('click', () => {
  const current = manualExplosion ?? Number(mechanics.dataset.explosion || 0);
  manualExplosion = current > .5 ? 0 : 1;
  assemblyToggle.setAttribute('aria-pressed', String(manualExplosion === 1));
  assemblyToggle.innerHTML = manualExplosion === 1 ? 'REASSEMBLE THE WATCH <span>↙</span>' : 'PREVIEW DISASSEMBLY <span>↗</span>';
  updateScroll();
});

$('#copyright-year').textContent = new Date().getFullYear();
$('a[href="#sources"]').addEventListener('click', () => { $('#sources').open = true; });
updateScroll();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    heroScene?.dispose(); anatomyScene?.dispose();
  });
}
