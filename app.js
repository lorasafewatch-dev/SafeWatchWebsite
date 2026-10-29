// This website is a standalone showcase. Its preview never connects to patient data.
const appLink = document.querySelector('[data-app-link]').href;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.documentElement.classList.add('js');

function configureTabs(tabSelector, panelSelector, tabKey, panelKey, onChange = () => {}) {
  const tabs = [...document.querySelectorAll(tabSelector)];
  const panels = [...document.querySelectorAll(panelSelector)];
  function activate(value, { focus = false } = {}) {
    const selected = tabs.find(tab => tab.dataset[tabKey] === value);
    if (!selected) return;
    tabs.forEach(tab => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => {
      panel.hidden = panel.dataset[panelKey] !== value;
      panel.tabIndex = 0;
    });
    onChange(value);
    document.dispatchEvent(new CustomEvent('safewatch:tabchange', { detail: { group: tabKey, value } }));
    if (focus) selected.focus({ preventScroll: true });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset[tabKey]));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      activate(tabs[next].dataset[tabKey], { focus: true });
    });
  });
  const initial = tabs.find(tab => tab.getAttribute('aria-selected') === 'true') || tabs[0];
  activate(initial.dataset[tabKey]);
  return activate;
}

export { configureTabs, activateDemo, announce, sampleAlerts, seniorSelect, updatePreview };

const demoScroll = document.querySelector('.demo-scroll');
const activateDemo = configureTabs('[data-demo-tab]', '[data-demo-panel]', 'demoTab', 'demoPanel', () => {
  demoScroll.scrollTop = 0;
});
const activatePlatform = configureTabs('[data-platform]', '[data-platform-panel]', 'platform', 'platformPanel');
if (/Android/i.test(navigator.userAgent)) activatePlatform('android');

// Deliberately synthetic values: no network calls, medical records, or actual alerts.
const sampleProfiles = {
  carmen: { name: 'Carmen Santos', age: '74 years · Female', pulse: 72, oxygen: 98, battery: '86%' },
  roberto: { name: 'Roberto Santos', age: '78 years · Male', pulse: 78, oxygen: 97, battery: '64%' },
};
const seniorSelect = document.querySelector('#demo-senior');
const sampleAlerts = new Set();
const setText = (selector, value) => document.querySelectorAll(selector).forEach(node => { node.textContent = String(value); });

function updatePreview() {
  const profile = sampleProfiles[seniorSelect.value];
  setText('[data-demo-name]', profile.name);
  setText('[data-demo-age]', profile.age);
  setText('[data-demo-pulse]', profile.pulse);
  setText('[data-demo-oxygen]', profile.oxygen);
  setText('[data-demo-battery]', profile.battery);
  const hasAlert = sampleAlerts.has(seniorSelect.value);
  setText('[data-demo-alert-count]', hasAlert ? 1 : 0);
  document.querySelector('[data-demo-clear]').hidden = hasAlert;
  document.querySelector('[data-demo-incident]').hidden = !hasAlert;
  document.querySelector('.demo-alert-dot').hidden = !hasAlert;
}
seniorSelect.addEventListener('change', updatePreview);

let toastTimer;
let toastHideTimer;
const toast = document.querySelector('#toast');
function announce(message) {
  clearTimeout(toastTimer);
  clearTimeout(toastHideTimer);
  toast.textContent = message;
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  toastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
    toastHideTimer = setTimeout(() => { toast.hidden = true; }, 220);
  }, 3800);
}

document.querySelectorAll('[data-demo-target]').forEach(button => {
  button.addEventListener('click', () => activateDemo(button.dataset.demoTarget, { focus: true }));
});
document.querySelectorAll('[data-demo-sos]').forEach(button => {
  button.addEventListener('click', () => {
    sampleAlerts.add(seniorSelect.value);
    updatePreview();
    activateDemo('alerts', { focus: true });
    announce('Sample alert only. Nothing was sent to anyone.');
  });
});
document.querySelector('[data-demo-reset]').addEventListener('click', () => {
  sampleAlerts.delete(seniorSelect.value);
  updatePreview();
  activateDemo('alerts', { focus: true });
  announce('The sample alert has been cleared.');
});
document.querySelectorAll('[data-preview-view]').forEach(button => {
  button.addEventListener('click', () => {
    if (button.hasAttribute('data-preview-alert')) {
      sampleAlerts.add(seniorSelect.value);
      updatePreview();
      announce('Sample alert only. Nothing was sent to anyone.');
    }
    activateDemo(button.dataset.previewView, { focus: true });
    document.querySelector('#app-preview').scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
  });
});
updatePreview();

// Clipboard access is user initiated; failure leaves the link selected for manual copying.
const copyButton = document.querySelector('#copy-link');
const urlInput = document.querySelector('#app-url');
urlInput.value = appLink;
let copyResetTimer;
copyButton.addEventListener('click', async () => {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(appLink);
    copyButton.querySelector('use').setAttribute('href', '#i-check');
    copyButton.setAttribute('aria-label', 'App link copied');
    announce('Family app link copied. Ready to share with your phone.');
    clearTimeout(copyResetTimer);
    copyResetTimer = setTimeout(() => {
      copyButton.querySelector('use').setAttribute('href', '#i-copy');
      copyButton.setAttribute('aria-label', 'Copy the family app link');
    }, 3000);
  } catch {
    urlInput.focus();
    urlInput.select();
    announce('Link selected. Use your browser or keyboard to copy it.');
  }
});

const menuButton = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');
function closeMenu({ restoreFocus = false } = {}) {
  siteNav.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  siteNav.classList.toggle('is-open', isOpen);
  if (isOpen) siteNav.querySelector('a').focus();
});
siteNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  closeMenu();
  const destination = document.querySelector(new URL(link.href).hash);
  if (destination) {
    destination.tabIndex = -1;
    destination.focus({ preventScroll: true });
  }
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu({ restoreFocus: true });
});
document.addEventListener('click', event => {
  if (!siteNav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
});
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const header = document.querySelector('.site-header');
let scrollQueued = false;
function updateHeader() { header.classList.toggle('is-scrolled', window.scrollY > 12); scrollQueued = false; }
window.addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(updateHeader);
}, { passive: true });
updateHeader();

if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const reveals = [...document.querySelectorAll('.reveal')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -35px 0px', threshold: 0.05 });
  document.documentElement.classList.add('js-reveal-ready');
  reveals.forEach(element => observer.observe(element));
}
