'use strict';

const SCHEDULE = [
  { day: 'Sunday',    label: 'Sun', open: '12PM', close: '9PM', openH: 12, closeH: 21 },
  { day: 'Monday',    label: 'Mon', open: '9AM',  close: '9PM', openH: 9,  closeH: 21 },
  { day: 'Tuesday',   label: 'Tue', open: '9AM',  close: '9PM', openH: 9,  closeH: 21 },
  { day: 'Wednesday', label: 'Wed', open: '9AM',  close: '9PM', openH: 9,  closeH: 21 },
  { day: 'Thursday',  label: 'Thu', open: '9AM',  close: '9PM', openH: 9,  closeH: 21 },
  { day: 'Friday',    label: 'Fri', open: '9AM',  close: '9PM', openH: 9,  closeH: 21 },
  { day: 'Saturday',  label: 'Sat', open: '9AM',  close: '9PM', openH: 9,  closeH: 21 },
];

function todayIndex() { return new Date().getDay(); }

function isOpenNow() {
  const now = new Date();
  const { openH, closeH } = SCHEDULE[now.getDay()];
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= openH * 60 && mins < closeH * 60;
}

function navigateTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const screen = document.getElementById('screen-' + screenId);
  const btn    = document.querySelector('.nav-btn[data-screen="' + screenId + '"]');
  if (screen) { screen.classList.add('active'); screen.scrollTop = 0; }
  if (btn)    { btn.classList.add('active'); }
}

function updateOpenStatus() {
  const pill = document.getElementById('open-pill');
  const text = document.getElementById('status-text');
  if (!pill || !text) return;
  const open = isOpenNow();
  pill.classList.toggle('is-open',   open);
  pill.classList.toggle('is-closed', !open);
  text.textContent = open ? 'Open Now' : 'Closed';
}

function updateTodayStrip() {
  const el = document.getElementById('today-hours');
  if (!el) return;
  const { open, close } = SCHEDULE[todayIndex()];
  el.textContent = open + ' – ' + close;
}

function renderHoursTable() {
  const container = document.getElementById('hours-table');
  if (!container) return;
  const today = todayIndex();
  container.innerHTML = SCHEDULE.map((row, i) => {
    const isToday = i === today;
    const badge = isToday ? '<span class="today-badge">Today</span>' : '';
    return `<div class="hours-row${isToday ? ' is-today' : ''}">
      <span class="hours-day">${row.day}${badge}</span>
      <span class="hours-time">${row.open} – ${row.close}</span>
    </div>`;
  }).join('');
}

function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
}

function init() {
  renderHoursTable();
  updateOpenStatus();
  updateTodayStrip();

  document.querySelectorAll('.nav-btn[data-screen]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.screen));
  });

  document.querySelectorAll('.tile[data-nav]').forEach(tile => {
    tile.addEventListener('click', () => navigateTo(tile.dataset.nav));
  });

  const eventsTile = document.querySelector('.tile[data-events]');
  if (eventsTile) {
    eventsTile.addEventListener('click', () => {
      window.open('https://instagram.com/cartpathsocial', '_blank', 'noopener,noreferrer');
    });
  }

  /* In-app browser for Birrdi links */
  const browser  = document.getElementById('inapp-browser');
  const frame    = document.getElementById('inapp-frame');
  const closeBtn = document.getElementById('inapp-close');

  function openInApp(url) {
    frame.src = url;
    browser.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeInApp() {
    browser.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { frame.src = ''; }, 400);
  }

  document.querySelectorAll('[data-birrdi]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      openInApp(link.href);
    });
  });

  closeBtn.addEventListener('click', closeInApp);

  setInterval(updateOpenStatus, 60_000);
  registerSW();
}

document.addEventListener('DOMContentLoaded', init);
