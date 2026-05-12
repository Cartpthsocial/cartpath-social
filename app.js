'use strict';

/* ─── Hours schedule (index 0 = Sunday … 6 = Saturday) ─────────────────────── */
const SCHEDULE = [
  { day: 'Sunday',    label: 'Sun', open: '9AM',  close: '9PM', openH: 9,  closeH: 21 },
  { day: 'Monday',    label: 'Mon', open: '9AM',  close: '9PM', openH: 9,  closeH: 21 },
  { day: 'Tuesday',   label: 'Tue', open: '9AM',  close: '9PM', openH: 9,  closeH: 21 },
  { day: 'Wednesday', label: 'Wed', open: '9AM',  close: '9PM', openH: 9,  closeH: 21 },
  { day: 'Thursday',  label: 'Thu', open: '9AM',  close: '9PM', openH: 9,  closeH: 21 },
  { day: 'Friday',    label: 'Fri', open: '9AM',  close: '9PM', openH: 9,  closeH: 21 },
  { day: 'Saturday',  label: 'Sat', open: '7AM',  close: '9PM', openH: 7,  closeH: 21 },
];

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
function todayIndex() {
  return new Date().getDay(); // 0 = Sun
}

function isOpenNow() {
  const now = new Date();
  const { openH, closeH } = SCHEDULE[now.getDay()];
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= openH * 60 && mins < closeH * 60;
}

/* ─── Navigation ────────────────────────────────────────────────────────────── */
function navigateTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const screen = document.getElementById('screen-' + screenId);
  const btn    = document.querySelector('.nav-btn[data-screen="' + screenId + '"]');

  if (screen) { screen.classList.add('active'); screen.scrollTop = 0; }
  if (btn)    { btn.classList.add('active'); }
}

/* ─── Open-status pill ──────────────────────────────────────────────────────── */
function updateOpenStatus() {
  const pill = document.getElementById('open-pill');
  const text = document.getElementById('status-text');
  if (!pill || !text) return;

  const open = isOpenNow();
  pill.classList.toggle('is-open',   open);
  pill.classList.toggle('is-closed', !open);
  text.textContent = open ? 'Open Now' : 'Closed';
}

/* ─── Today's hours strip (home screen) ────────────────────────────────────── */
function updateTodayStrip() {
  const el = document.getElementById('today-hours');
  if (!el) return;
  const { open, close } = SCHEDULE[todayIndex()];
  el.textContent = open + ' – ' + close;
}

/* ─── Hours table (hours screen) ───────────────────────────────────────────── */
function renderHoursTable() {
  const container = document.getElementById('hours-table');
  if (!container) return;

  const today = todayIndex();

  container.innerHTML = SCHEDULE.map((row, i) => {
    const isToday = i === today;
    const badge = isToday ? '<span class="today-badge">Today</span>' : '';
    return `
      <div class="hours-row${isToday ? ' is-today' : ''}">
        <span class="hours-day">${row.day}${badge}</span>
        <span class="hours-time">${row.open} – ${row.close}</span>
      </div>`;
  }).join('');
}

/* ─── Service-worker registration ───────────────────────────────────────────── */
function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
}

/* ─── Init ──────────────────────────────────────────────────────────────────── */
function init() {
  renderHoursTable();
  updateOpenStatus();
  updateTodayStrip();

  /* Bottom nav */
  document.querySelectorAll('.nav-btn[data-screen]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.screen));
  });

  /* Home shortcut tiles */
  document.querySelectorAll('.tile[data-nav]').forEach(tile => {
    tile.addEventListener('click', () => navigateTo(tile.dataset.nav));
  });

  /* Events tile → Instagram */
  const eventsTile = document.querySelector('.tile[data-events]');
  if (eventsTile) {
    eventsTile.addEventListener('click', () => {
      window.open('https://instagram.com/cartpathsocial', '_blank', 'noopener,noreferrer');
    });
  }

  /* Refresh open status every minute */
  setInterval(updateOpenStatus, 60_000);

  registerSW();
}

document.addEventListener('DOMContentLoaded', init);
