import { configureTabs, activateDemo, announce, sampleAlerts, seniorSelect, updatePreview } from './app.js';
import { clamp, sampleReadings, locationContext, alertStages, nextAlertStage, installationScene, tourSteps } from './experience-model.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const setText = (selector, value) => { const node = $(selector); if (node.textContent !== String(value)) node.textContent = String(value); };

// Appearance is a website preference, independent of the actual family app.
const appearanceButton = $('#appearance-toggle');
function setAppearance(evening) {
  document.documentElement.dataset.appearance = evening ? 'evening' : 'morning';
  appearanceButton.setAttribute('aria-pressed', String(evening));
  appearanceButton.setAttribute('aria-label', `Switch website to ${evening ? 'morning' : 'evening'} appearance`);
  $('meta[name="theme-color"]').content = evening ? '#0b211b' : '#f1f8ef';
}
try { setAppearance(localStorage.getItem('safewatch-showcase-appearance') === 'evening'); } catch { setAppearance(false); }
appearanceButton.addEventListener('click', () => {
  const evening = document.documentElement.dataset.appearance !== 'evening';
  setAppearance(evening);
  try { localStorage.setItem('safewatch-showcase-appearance', evening ? 'evening' : 'morning'); } catch { /* Private browsing can restrict storage. */ }
});

const heroCopy = {
  home: ['Your family. One clear view.', 'Choose a senior and explore the latest watch update.'],
  health: ['The reading. And the context.', 'Pulse rate and blood oxygen, alongside the time of their last update.'],
  location: ['A place. A little perspective.', 'See an illustrative watch position and its safe-zone status.'],
  alerts: ['Safety, with a next step.', 'Explore a sample incident and the app’s alert view.'],
  profile: ['Your connected family.', 'One account, with multiple approved senior links.'],
};
function updateHeroStory(view) {
  const entry = heroCopy[view] || heroCopy.home;
  setText('#preview-headline', entry[0]);
  setText('#preview-caption', entry[1]);
  setText('#preview-number', `${String(tourSteps.findIndex(step => step.view === view) + 1).padStart(2, '0')} / 05`);
  $$('[data-hero-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.heroView === view)));
}
$$('[data-hero-view]').forEach(button => button.addEventListener('click', () => activateDemo(button.dataset.heroView)));
updateHeroStory($('[data-demo-tab][aria-selected="true"]').dataset.demoTab);

// A guided tour moves the existing interactive phone into a native modal.
const tour = $('#tour-dialog');
const phone = $('.phone-frame');
const phoneAnchor = document.createComment('Interactive phone returns here after the tour');
phone.before(phoneAnchor);
let tourStep = 0;
let changingTour = false;
let previousView = 'home';
let previousAlerts = [];
let tourOpener;
let previousOverflow = '';
let previousProductMinHeight = '';

function renderTour(index, { switchView = true } = {}) {
  tourStep = clamp(index, 0, tourSteps.length - 1);
  const step = tourSteps[tourStep];
  setText('#tour-count', `${String(tourStep + 1).padStart(2, '0')} / 05 · ${step.name}`);
  const title = $('#tour-title');
  title.replaceChildren();
  step.title.split('\n').forEach((line, index) => {
    if (index) title.append(document.createTextNode(' '), document.createElement('br'));
    title.append(document.createTextNode(line));
  });
  setText('#tour-description', step.description);
  const hint = $('#tour-hint');
  // Keep the decorative icon while replacing only the hint text.
  [...hint.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => node.remove());
  hint.append(document.createTextNode(step.hint));
  setText('#tour-page-label', `Step ${tourStep + 1} of ${tourSteps.length}`);
  $('#tour-previous').disabled = tourStep === 0;
  const next = $('#tour-next');
  [...next.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => node.remove());
  next.prepend(document.createTextNode(tourStep === tourSteps.length - 1 ? 'Finish tour ' : 'Next view '));
  $$('[data-tour-step]').forEach(button => {
    if (Number(button.dataset.tourStep) === tourStep) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  if (switchView) {
    if (step.view === 'alerts') { sampleAlerts.add(seniorSelect.value); updatePreview(); }
    changingTour = true;
    activateDemo(step.view);
    changingTour = false;
  }
}
function openTour(view = 'home') {
  if (typeof tour.showModal !== 'function') {
    activateDemo(view, { focus: true });
    $('#app-preview').scrollIntoView({ behavior: motion.matches ? 'auto' : 'smooth', block: 'center' });
    announce('Explore the preview using its five tabs.');
    return;
  }
  if (tour.open) return;
  tourOpener = document.activeElement;
  previousView = $('[data-demo-tab][aria-selected="true"]').dataset.demoTab;
  previousAlerts = [...sampleAlerts];
  previousOverflow = document.body.style.overflow;
  const home = phoneAnchor.parentElement;
  previousProductMinHeight = home.style.minHeight;
  home.style.minHeight = `${home.getBoundingClientRect().height}px`;
  $('#tour-device').append(phone);
  renderTour(Math.max(0, tourSteps.findIndex(step => step.view === view)));
  tour.showModal();
  document.body.style.overflow = 'hidden';
  $('#tour-close').focus();
}
$$('[data-open-tour]').forEach(button => button.addEventListener('click', () => openTour()));
$$('[data-tour-view]').forEach(button => button.addEventListener('click', () => openTour(button.dataset.tourView)));
$$('[data-tour-step]').forEach(button => button.addEventListener('click', () => renderTour(Number(button.dataset.tourStep))));
$('#tour-close').addEventListener('click', () => tour.close());
$('#tour-previous').addEventListener('click', () => renderTour(tourStep - 1));
$('#tour-next').addEventListener('click', () => {
  if (tourStep < tourSteps.length - 1) renderTour(tourStep + 1);
  else { tour.close(); announce('You’ve explored all five views. Try the hands-on feature demos below.'); }
});
tour.addEventListener('close', () => {
  phoneAnchor.after(phone);
  phoneAnchor.parentElement.style.minHeight = previousProductMinHeight;
  document.body.style.overflow = previousOverflow;
  sampleAlerts.clear();
  previousAlerts.forEach(value => sampleAlerts.add(value));
  updatePreview();
  activateDemo(previousView);
  if (tourOpener?.isConnected) tourOpener.focus({ preventScroll: true });
});
tour.addEventListener('click', event => {
  if (event.target !== tour) return;
  const bounds = tour.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) tour.close();
});
tour.addEventListener('keydown', event => {
  if (event.target.closest('.phone-frame')) return;
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  renderTour(tourStep + (event.key === 'ArrowRight' ? 1 : -1));
});

// The feature exhibit uses keyboard-accessible, manually activated tabs.
configureTabs('[data-lab-tab]', '[data-lab-panel]', 'labTab', 'labPanel');
let readingIndex = 0;
let freshness = 'fresh';
const healthVisual = $('.health-visual');
function renderReading() {
  const reading = sampleReadings[readingIndex];
  setText('#lab-pulse', freshness === 'missing' ? '—' : reading.pulse);
  setText('#lab-oxygen', freshness === 'missing' ? '—' : reading.oxygen);
  const age = {
    fresh: ['Sample · just updated', 'Read the numbers alongside their last-update time.'],
    older: ['Sample · last update 30 min ago', 'An older reading does not describe a new watch update.'],
    missing: ['Sample · awaiting a reading', 'Missing data is shown as unavailable, not as a zero.'],
  }[freshness];
  setText('#sample-age', age[0]); setText('#sample-age-description', age[1]);
  $('#sample-freshness').classList.toggle('is-older', freshness === 'older');
  $('#sample-freshness').classList.toggle('is-missing', freshness === 'missing');
  healthVisual.classList.toggle('is-missing', freshness === 'missing');
  $$('[data-freshness]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.freshness === freshness)));
}
$$('[data-freshness]').forEach(button => button.addEventListener('click', () => { freshness = button.dataset.freshness; renderReading(); }));
$('#sample-update').addEventListener('click', () => {
  readingIndex = (readingIndex + 1) % sampleReadings.length;
  freshness = 'fresh';
  renderReading();
  if (!motion.matches) {
    healthVisual.classList.remove('is-updating');
    void healthVisual.offsetWidth;
    healthVisual.classList.add('is-updating');
  }
  announce(`Sample update: pulse rate ${sampleReadings[readingIndex].pulse} bpm, blood oxygen ${sampleReadings[readingIndex].oxygen}%.`);
});
renderReading();

// Map geometry stays in SVG coordinates, including while zoomed.
const map = $('#interactive-map');
const mapLayer = $('#map-layer');
const position = $('#watch-position');
let mapX = 245;
let mapY = 210;
let mapSource = 'current';
let zoom = 1;
let dragPointer = null;
function renderMap() {
  const context = locationContext(mapX, mapY, mapSource);
  $('#lab-map-marker').setAttribute('transform', `translate(${mapX} ${mapY})`);
  $('.location-visual').classList.toggle('is-outside', !context.inside);
  $('.location-visual').classList.toggle('is-last', mapSource === 'last');
  setText('#map-zone-state', context.title);
  setText('#map-zone-description', context.description);
  setText('#position-label', context.label);
  position.value = String(Math.round(clamp((mapX - 160) / 330 * 100, 0, 100)));
  position.setAttribute('aria-valuetext', context.label);
  $$('[data-map-source]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mapSource === mapSource)));
}
position.addEventListener('input', () => {
  const progress = Number(position.value) / 100;
  mapX = 160 + progress * 330;
  mapY = 210 + Math.sin(progress * Math.PI) * 22;
  renderMap();
});
$$('[data-map-source]').forEach(button => button.addEventListener('click', () => { mapSource = button.dataset.mapSource; renderMap(); }));
function moveMapPoint(event) {
  const matrix = mapLayer.getScreenCTM();
  if (!matrix) return;
  const point = map.createSVGPoint();
  point.x = event.clientX; point.y = event.clientY;
  const local = point.matrixTransform(matrix.inverse());
  mapX = Math.round(clamp(local.x, 40, 560));
  mapY = Math.round(clamp(local.y, 60, 350));
  renderMap();
}
map.addEventListener('pointerdown', event => {
  if (event.button !== 0 || dragPointer !== null) return;
  event.preventDefault();
  dragPointer = event.pointerId;
  map.setPointerCapture(event.pointerId);
  moveMapPoint(event);
});
map.addEventListener('pointermove', event => { if (event.pointerId === dragPointer) moveMapPoint(event); });
function releaseMap(event) {
  if (event.pointerId !== dragPointer) return;
  if (map.hasPointerCapture(event.pointerId)) map.releasePointerCapture(event.pointerId);
  dragPointer = null;
}
map.addEventListener('pointerup', releaseMap);
map.addEventListener('pointercancel', releaseMap);
map.addEventListener('lostpointercapture', () => { dragPointer = null; });
function setZoom(value) {
  zoom = clamp(Math.round(value * 100) / 100, 1, 1.45);
  mapLayer.setAttribute('transform', `translate(${300 * (1 - zoom)} ${210 * (1 - zoom)}) scale(${zoom})`);
  $('#map-zoom-out').disabled = zoom <= 1;
  $('#map-zoom-in').disabled = zoom >= 1.45;
}
$('#map-zoom-in').addEventListener('click', () => setZoom(zoom + 0.15));
$('#map-zoom-out').addEventListener('click', () => setZoom(zoom - 0.15));
renderMap();

let alertStage = 0;
function renderAlertExample() {
  const stage = alertStages[alertStage];
  $('#alert-example-content').dataset.stage = stage.name;
  setText('#alert-example-badge', stage.badge);
  setText('#alert-example-title', stage.title);
  setText('#alert-example-description', stage.description);
  const next = $('#alert-example-next');
  next.hidden = alertStage === 0;
  [...next.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => node.remove());
  next.prepend(document.createTextNode(`${stage.action} `));
  $('.alert-example-icon use').setAttribute('href', alertStage === 1 ? '#i-bell' : '#i-shield');
  $$('[data-alert-step]').forEach(item => {
    const index = Number(item.dataset.alertStep);
    const done = alertStage === 3 || index < alertStage - 1;
    item.dataset.state = done ? 'done' : (index === alertStage - 1 ? 'current' : 'pending');
    item.querySelector('span').textContent = done ? '✓' : String(index + 1);
  });
  const start = $('#start-alert-example');
  [...start.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => node.remove());
  start.append(document.createTextNode(alertStage === 0 ? 'Create a sample SOS' : 'Restart the sample SOS'));
}
$('#start-alert-example').addEventListener('click', () => { alertStage = 1; renderAlertExample(); announce('Sample SOS created. No alert was sent.'); });
$('#alert-example-next').addEventListener('click', () => {
  alertStage = nextAlertStage(alertStage);
  renderAlertExample();
  if (alertStage === 0) $('#start-alert-example').focus();
  if (alertStage === 3) announce('Sample response confirmed. No record was saved.');
});
renderAlertExample();

// Device-specific illustrated guide; it cannot install another origin's app.
let installDevice = $('[data-platform][aria-selected="true"]').dataset.platform;
let installStep = 0;
function renderInstallation() {
  const scene = installationScene(installDevice, installStep);
  $('#install-device').dataset.scene = String(installStep);
  $('#install-device').dataset.device = installDevice;
  setText('#installer-platform-label', installDevice === 'iphone' ? 'IPHONE / SAFARI' : 'ANDROID / CHROME');
  setText('#browser-menu-symbol', installDevice === 'iphone' ? '⋯' : '⋮');
  setText('#installer-step-title', scene.title);
  setText('#installer-step-caption', scene.caption);
  setText('#webapp-toggle-label', installDevice === 'iphone' ? 'Open as Web App' : 'Confirm installation');
  const action = $('#install-action-label');
  [...action.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => node.remove());
  action.prepend(document.createTextNode(installDevice === 'iphone' ? 'Add to Home Screen' : 'Install and create shortcut'));
  $$('[data-install-scene-panel]').forEach(panel => { panel.hidden = Number(panel.dataset.installScenePanel) !== installStep; });
  $$('[data-install-step]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.installDevice === installDevice && Number(button.dataset.installStep) === installStep)));
  $$('[data-install-goto]').forEach(button => {
    if (Number(button.dataset.installGoto) === installStep) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  $('#installer-previous').disabled = installStep === 0;
  const next = $('#installer-next');
  [...next.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => node.remove());
  next.prepend(document.createTextNode(installStep === 3 ? 'Replay guide ' : (installStep === 2 ? 'Finish guide ' : 'Next step ')));
}
$$('[data-install-step]').forEach(button => button.addEventListener('click', () => {
  installStep = Number(button.dataset.installStep);
  renderInstallation();
  if (window.matchMedia('(max-width: 760px)').matches) {
    $('#installer-stage').scrollIntoView({ behavior: motion.matches ? 'auto' : 'smooth', block: 'start' });
  }
}));
$$('[data-install-goto]').forEach(button => button.addEventListener('click', () => { installStep = Number(button.dataset.installGoto); renderInstallation(); }));
$$('[data-install-advance]').forEach(button => button.addEventListener('click', () => {
  installStep = Math.min(3, installStep + 1); renderInstallation();
  $('#installer-next').focus({ preventScroll: true });
}));
$('#installer-next').addEventListener('click', () => { installStep = (installStep + 1) % 4; renderInstallation(); });
$('#installer-previous').addEventListener('click', () => { installStep = Math.max(0, installStep - 1); renderInstallation(); });
renderInstallation();

document.addEventListener('safewatch:tabchange', event => {
  const { group, value } = event.detail;
  if (group === 'demoTab') {
    updateHeroStory(value);
    if (tour.open && !changingTour) renderTour(tourSteps.findIndex(step => step.view === value), { switchView: false });
  } else if (group === 'platform') {
    installDevice = value; installStep = 0; renderInstallation();
  }
});

const faqInput = $('#faq-search');
const questions = $$('.faq-list details');
const faqAliases = ['install iphone android ios safari chrome download app store google play', 'account family seniors multiple', 'privacy approval watch access account barangay', 'location gps current last known', 'internet offline network connection', 'sample demo medical readings pulse oxygen'];
let originalOpenStates;
function filterQuestions() {
  const query = faqInput.value.trim().toLowerCase().replace(/[“”"']/g, '');
  const terms = query.split(/\s+/).filter(Boolean);
  if (terms.length && !originalOpenStates) originalOpenStates = questions.map(question => question.open);
  let count = 0;
  questions.forEach((question, index) => {
    const text = `${question.textContent} ${faqAliases[index] || ''}`.toLowerCase();
    const matches = terms.every(term => text.includes(term));
    question.hidden = !matches;
    if (matches) count++;
    if (terms.length) question.open = matches;
    else if (originalOpenStates) question.open = originalOpenStates[index];
  });
  if (!terms.length) originalOpenStates = undefined;
  $('#faq-empty').hidden = count !== 0;
  setText('#faq-result-count', terms.length ? `${count} matching question${count === 1 ? '' : 's'}.` : `${questions.length} questions, a little clarity.`);
}
faqInput.addEventListener('input', filterQuestions);
$('#faq-reset').addEventListener('click', () => { faqInput.value = ''; filterQuestions(); faqInput.focus(); });

// A subtle tilt only while hovering with a mouse; never while using the phone.
const product = $('#app-preview');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
let tiltFrame;
product.addEventListener('pointermove', event => {
  if (motion.matches || !finePointer.matches || tour.open || phone.contains(document.activeElement)) return;
  if (tiltFrame) cancelAnimationFrame(tiltFrame);
  const bounds = product.getBoundingClientRect();
  const x = clamp((event.clientX - bounds.left) / bounds.width - .5, -.5, .5);
  const y = clamp((event.clientY - bounds.top) / bounds.height - .5, -.5, .5);
  tiltFrame = requestAnimationFrame(() => {
    phone.style.setProperty('--phone-rx', `${-y * 5}deg`);
    phone.style.setProperty('--phone-ry', `${x * 7}deg`);
  });
});
product.addEventListener('pointerleave', () => {
  if (tiltFrame) cancelAnimationFrame(tiltFrame);
  phone.style.removeProperty('--phone-rx'); phone.style.removeProperty('--phone-ry');
});

const navSections = ['features', 'how-it-works', 'install', 'questions'].map(id => document.getElementById(id));
let progressQueued = false;
function renderProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  document.documentElement.style.setProperty('--read-progress', String(maxScroll > 0 ? clamp(window.scrollY / maxScroll, 0, 1) : 0));
  let current = '';
  navSections.forEach(section => { if (section.getBoundingClientRect().top <= window.innerHeight * .4) current = section.id; });
  $$('#site-nav a').forEach(link => {
    if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  progressQueued = false;
}
function queueProgress() { if (!progressQueued) { progressQueued = true; requestAnimationFrame(renderProgress); } }
window.addEventListener('scroll', queueProgress, { passive: true });
window.addEventListener('resize', queueProgress, { passive: true });
if ('ResizeObserver' in window) new ResizeObserver(queueProgress).observe($('main'));
renderProgress();
