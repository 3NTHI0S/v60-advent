(() => {
  'use strict';
  const YEAR = 2026;
  const TOTAL = 25;
  const TEST_MODE = new URLSearchParams(window.location.search).get('test') === '1';
  const FIXED_ASSIGNMENTS = Object.freeze([
    'Alo Bomb',
    'Edilberto Coronado',
    'Gisheke',
    'Elto Coffee',
    'Baragwi Guama AA',
    'Nginda',
    'Kafipamba Heirloom',
    'Las Etiopes Lot #33',
    'Colourful v17',
    'El Paraiso Cardamomo',
    'Gicatha-Ini',
    'Familia Primavera',
    'Wilson Mamani Gesha',
    'Aquiares',
    'Café Ceres',
    'Colourful v18',
    'Colourful v15',
    'La Piragua',
    'Musozi',
    'Githiga PB',
    'Kiambu EAAGADS Estate',
    'Karumandi AA #023',
    'Simon Brown Sudan Rume',
    'Time Left',
    'Filadelfia'
  ]);
  // Keep the pre-PWA production key so existing opened-door progress survives the upgrade.
  const PRODUCTION_KEY = 'coffee-v60-advent-2026-personal-v2';
  const TEST_KEY = 'coffee-v60-advent-2026-test-v1';
  const CALENDAR_ID = 'v60-2026-personal';
  const DAY_GROUPS = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20], [21, 22, 23, 24], [25]];
  const $ = id => document.getElementById(id);
  const buttons = new Map();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let pendingReveal = false;
  let toastTimer = null;

  function validOpened(value) {
    if (!Array.isArray(value) || !value.every(day => Number.isInteger(day) && day >= 1 && day <= TOTAL)) return null;
    return [...new Set(value)].sort((a, b) => a - b);
  }
  function validAssignments(value) {
    if (!Array.isArray(value) || value.length !== TOTAL || !value.every(v => typeof v === 'string')) return false;
    const expected = [...FIXED_ASSIGNMENTS].sort();
    return JSON.stringify([...value].sort()) === JSON.stringify(expected);
  }
  function loadState() {
    try {
      const key = TEST_MODE ? TEST_KEY : PRODUCTION_KEY;
      const saved = JSON.parse(localStorage.getItem(key));
      return {
        assignments: TEST_MODE && validAssignments(saved?.assignments) ? [...saved.assignments] : [...FIXED_ASSIGNMENTS],
        opened: validOpened(saved?.opened) || []
      };
    } catch (_) {
      return { assignments: [...FIXED_ASSIGNMENTS], opened: [] };
    }
  }
  let state = loadState();
  function saveState() {
    try {
      if (TEST_MODE) {
        localStorage.setItem(TEST_KEY, JSON.stringify(state));
      } else {
        // Preserve original format for backward-compatible backups/versions.
        localStorage.setItem(PRODUCTION_KEY, JSON.stringify({ opened: state.opened }));
      }
      return true;
    } catch (_) {
      showToast('Storage is unavailable. Export a backup before closing.');
      return false;
    }
  }
  function unlockDate(day) { return new Date(YEAR, 11, day); }
  function isUnlocked(day) { return TEST_MODE || new Date() >= unlockDate(day); }
  function niceDate(day) {
    return unlockDate(day).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  function showToast(message) {
    const el = $('toast');
    if (toastTimer) clearTimeout(toastTimer);
    el.textContent = message;
    el.hidden = false;
    toastTimer = setTimeout(() => { el.hidden = true; }, 4000);
  }
  function shuffleAssignments() {
    const a = [...state.assignments];
    for (let i = a.length - 1; i > 0; i--) {
      let j;
      if (globalThis.crypto?.getRandomValues) {
        const r = new Uint32Array(1);
        crypto.getRandomValues(r);
        j = Math.floor((r[0] / 4294967296) * (i + 1));
      } else {
        j = Math.floor(Math.random() * (i + 1));
      }
      [a[i], a[j]] = [a[j], a[i]];
    }
    // Very unlikely, but ensure the user sees a different order after reshuffling.
    if (a.every((coffee, i) => coffee === state.assignments[i])) [a[0], a[1]] = [a[1], a[0]];
    return a;
  }

  function createDoors() {
    DAY_GROUPS.forEach((group, rowIndex) => {
      const row = $('row' + (rowIndex + 1));
      group.forEach(day => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'door';
        btn.innerHTML = `<span class="door-reveal" aria-hidden="true"><span class="little-day"></span><span class="coffee-name"></span></span>
          <span class="door-front" aria-hidden="true"><span class="door-num"></span>
          <svg class="door-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>
          </svg></span>`;
        btn.querySelector('.door-num').textContent = day;
        btn.querySelector('.little-day').textContent = day;
        btn.addEventListener('click', () => openDoor(day));
        row.append(btn);
        buttons.set(day, btn);
      });
    });
  }
  function render() {
    for (const [day, button] of buttons) {
      const isOpen = state.opened.includes(day);
      const locked = !isOpen && !isUnlocked(day);
      button.classList.toggle('opened', isOpen);
      button.classList.toggle('locked', locked);
      button.querySelector('.coffee-name').textContent = isOpen ? state.assignments[day - 1] : '';
      button.setAttribute('aria-label', isOpen
        ? `Day ${day}: ${state.assignments[day - 1]}. View coffee.`
        : locked ? `Day ${day}: locked until ${niceDate(day)}.`
        : `Open day ${day} to reveal your coffee.`);
      button.title = isOpen ? `${day} December: ${state.assignments[day - 1]}`
        : locked ? `Unlocks ${niceDate(day)}` : `Open ${day} December`;
    }
    $('progress').textContent = `${state.opened.length} / 25 opened`;
    if (TEST_MODE) {
      $('unlockStatus').textContent = 'Testing: all 25 doors are unlocked, whatever the date.';
    } else {
      const unlocked = Array.from({length: TOTAL}, (_, i) => i + 1).filter(isUnlocked);
      $('unlockStatus').textContent = unlocked.length === 0
        ? 'The first door unlocks on 1 December 2026.'
        : unlocked.length === TOTAL ? 'All 25 doors are unlocked.'
        : `Doors 1–${unlocked.length} are available to open.`;
    }
  }
  function revealCoffee(day, alreadyOpened) {
    $('revealDay').textContent = `December ${day}`;
    $('revealTitle').textContent = state.assignments[day - 1];
    $('revealHint').textContent = alreadyOpened
      ? 'You can revisit this coffee at any time.'
      : 'This door is now open and will stay open.';
    $('revealDialog').showModal();
  }
  function openDoor(day) {
    if (pendingReveal) return;
    // Check the date on every click, including tabs that were left open overnight.
    if (!state.opened.includes(day) && !isUnlocked(day)) {
      $('lockedTitle').textContent = `Door ${day} is still locked`;
      $('lockedMessage').textContent = `Come back on ${niceDate(day)} to discover which coffee is behind this door.`;
      $('lockedDialog').showModal();
      return;
    }
    const alreadyOpened = state.opened.includes(day);
    if (alreadyOpened) { revealCoffee(day, true); return; }

    state.opened = [...state.opened, day].sort((a, b) => a - b);
    saveState();
    const button = buttons.get(day);
    button.classList.add('opening');
    render();
    pendingReveal = true;
    const show = () => {
      button.classList.remove('opening');
      pendingReveal = false;
      revealCoffee(day, false);
    };
    if (reduceMotion.matches) show();
    else setTimeout(show, 920);
  }

  document.querySelectorAll('[data-close]').forEach(el =>
    el.addEventListener('click', () => $(el.dataset.close).close()));
  document.querySelectorAll('dialog').forEach(d =>
    d.addEventListener('click', e => { if (e.target === d) d.close(); }));

  $('backupBtn').addEventListener('click', () => {
    const data = { app: 'V60 Advent Calendar', version: 3, year: YEAR, calendarId: CALENDAR_ID,
      mode: TEST_MODE ? 'test' : 'production', assignments: state.assignments, opened: state.opened };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = TEST_MODE ? 'v60-advent-2026-test-backup.json' : 'v60-advent-2026-backup.json';
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  });
  $('importBtn').addEventListener('click', () => $('backupFile').click());
  $('backupFile').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const restored = validOpened(data?.opened);
      const sameMode = data?.mode === (TEST_MODE ? 'test' : 'production');
      const oldProductionBackup = !TEST_MODE && data?.version === 2 && data?.mode == null;
      if (data?.calendarId !== CALENDAR_ID || data?.year !== YEAR ||
          !validAssignments(data?.assignments) || !restored || !(sameMode || oldProductionBackup) ||
          (!TEST_MODE && JSON.stringify(data.assignments) !== JSON.stringify(FIXED_ASSIGNMENTS))) {
        throw new Error('This backup does not match the current calendar or mode.');
      }
      if (!confirm('Replace opened-door progress' + (TEST_MODE ? ' and the test coffee order' : '') + ' with this backup?')) return;
      state = { assignments: TEST_MODE ? [...data.assignments] : [...FIXED_ASSIGNMENTS], opened: restored };
      saveState();
      render();
      showToast('Backup restored.');
    } catch (error) {
      alert('Could not import the backup: ' + error.message);
    } finally {
      event.target.value = '';
    }
  });

  if (TEST_MODE) {
    $('testBanner').hidden = false;
    document.title = 'TEST · ' + document.title;
    $('shuffleBtn').addEventListener('click', () => {
      if (!confirm('Reshuffle all 25 test coffees? This also closes every TEST door. The real calendar is unaffected.')) return;
      state = { assignments: shuffleAssignments(), opened: [] };
      saveState();
      render();
      showToast('Test coffees reshuffled. All test doors are closed.');
    });
    $('resetTestBtn').addEventListener('click', () => {
      if (!confirm('Close all TEST doors? The real calendar is unaffected.')) return;
      state.opened = [];
      saveState();
      render();
      showToast('All test doors are closed.');
    });
  }

  let installPrompt = null;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    $('installBtn').hidden = false;
  });
  $('installBtn').addEventListener('click', async () => {
    if (!installPrompt) return;
    const prompt = installPrompt;
    installPrompt = null;
    $('installBtn').hidden = true;
    await prompt.prompt();
  });
  window.addEventListener('appinstalled', () => { $('installBtn').hidden = true; });

  createDoors();
  render();
  // Keep the date lock display in sync after midnight / app resumption.
  setInterval(render, 60_000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  window.addEventListener('focus', render);
  window.addEventListener('storage', event => {
    if (event.key === (TEST_MODE ? TEST_KEY : PRODUCTION_KEY)) {
      state = loadState();
      render();
    }
  });

  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(error =>
        console.warn('Offline support unavailable:', error));
    });
  }
})();
