// Leonida Trophy Ledger — checklist, guide, roadmap and progress, all offline.
// Data lives in data/trophies.json; progress lives in localStorage only.

const STORE_KEY = 'leonida-trophy-ledger-v5';
const STAGE_NAMES = {
  1: 'S1 · Arrival',
  2: 'S2 · First Scores',
  3: 'S3 · Vice City',
  4: 'S4 · The Crew',
  5: 'S5 · Side Stories',
  6: 'S6 · The Grind',
  7: 'S7 · Heists & Platinum',
};

const state = {
  trophies: [],
  earned: new Set(),
  kind: 'all',
  grade: 'all',
  query: '',
  spoiler: false,
  selectedId: 17,
  roadmapOpen: false,
};

const $ = (sel) => document.querySelector(sel);
const listEl = $('#trophy-list');
const detailEl = $('#detail');
const roadmapEl = $('#roadmap');
const roadmapStagesEl = $('#roadmap-stages');
const roadmapViewEl = $('#roadmap-view');

function loadEarned() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.earned)) state.earned = new Set(parsed.earned);
    if (typeof parsed.spoiler === 'boolean') state.spoiler = parsed.spoiler;
  } catch (err) { /* corrupt save: start fresh */ }
}

function saveEarned() {
  localStorage.setItem(STORE_KEY, JSON.stringify({
    earned: [...state.earned].sort((a, b) => a - b),
    spoiler: state.spoiler,
  }));
}

function roadmapOrder(trophies) {
  return [...trophies].sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
}

function isHiddenFromSpoilers(t) {
  return state.spoiler && t.kind === 'story' && !state.earned.has(t.id);
}

function visibleTrophies() {
  const q = state.query.trim().toLowerCase();
  return state.trophies.filter((t) => {
    if (state.kind !== 'all' && t.kind !== state.kind) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function trophyLabel(t) {
  if (isHiddenFromSpoilers(t)) return 'Hidden trophy — earn it to reveal';
  return t.name;
}

function renderList() {
  const shown = visibleTrophies();
  $('#shown-count').textContent = `(${shown.length} of 55 shown)`;
  listEl.innerHTML = '';
  if (shown.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No trophies match those filters. Clear the search or pick another kind.';
    listEl.appendChild(li);
    return;
  }
  for (const t of shown) {
    const earned = state.earned.has(t.id);
    const li = document.createElement('li');
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'trophy-row' + (earned ? ' earned' : '') + (t.id === state.selectedId ? ' selected' : '');
    row.dataset.id = String(t.id);
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'check';
    box.checked = earned;
    box.setAttribute('aria-label', `Earned: ${t.name}`);
    box.addEventListener('click', (ev) => {
      ev.stopPropagation();
      toggleEarned(t.id);
    });
    const text = document.createElement('span');
    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = trophyLabel(t);
    const desc = document.createElement('span');
    desc.className = 'trophy-desc';
    desc.textContent = isHiddenFromSpoilers(t) ? 'Story trophy — hidden until earned.' : t.description;
    text.append(name, desc);
    const grade = document.createElement('span');
    grade.className = `grade ${t.grade}`;
    grade.textContent = t.grade;
    row.append(box, text, grade);
    if (t.missable) {
      const flag = document.createElement('span');
      flag.className = 'flag';
      flag.textContent = 'MISSABLE';
      row.append(flag);
    }
    row.addEventListener('click', () => selectTrophy(t.id));
    li.appendChild(row);
    listEl.appendChild(li);
  }
}

function renderDetail() {
  const t = state.trophies.find((x) => x.id === state.selectedId) || state.trophies[0];
  if (!t) return;
  detailEl.innerHTML = '';
  const title = document.createElement('h3');
  title.textContent = trophyLabel(t);
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = isHiddenFromSpoilers(t)
    ? 'Official description hidden until earned.'
    : `“${t.description}” — ${t.grade} trophy`;
  const guideHead = document.createElement('h4');
  guideHead.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.textContent = isHiddenFromSpoilers(t)
    ? 'This is a story trophy. Earn it to reveal the guide.'
    : t.guide;
  const stepsHead = document.createElement('h4');
  stepsHead.textContent = 'Steps';
  const steps = document.createElement('ol');
  if (isHiddenFromSpoilers(t)) {
    const li = document.createElement('li');
    li.textContent = 'Play the story to reach this trophy.';
    steps.appendChild(li);
  } else {
    for (const s of t.steps) {
      const li = document.createElement('li');
      li.textContent = s;
      steps.appendChild(li);
    }
  }
  const srcHead = document.createElement('h4');
  srcHead.textContent = 'Sources';
  const src = document.createElement('p');
  src.textContent = t.sources.join(' · ');
  const meta = document.createElement('div');
  meta.className = 'meta';
  const pills = [
    `Kind: ${t.kind}`,
    `Roadmap: ${STAGE_NAMES[t.stage]}`,
    t.hidden ? 'Hidden on PlayStation' : 'Visible on PlayStation',
  ];
  for (const p of pills) {
    const span = document.createElement('span');
    span.className = 'pill';
    span.textContent = p;
    meta.appendChild(span);
  }
  if (t.missable) {
    const span = document.createElement('span');
    span.className = 'pill missable';
    span.textContent = 'MISSABLE — do it in Chapter 1';
    meta.appendChild(span);
  }
  detailEl.append(title, official, guideHead, guide, stepsHead, steps, srcHead, src, meta);
}

function renderCounts() {
  const earned = state.earned.size;
  $('#earned-count').textContent = `${earned} / 55`;
  $('#goal-fill').style.width = `${Math.round((earned / 55) * 100)}%`;
  const next = roadmapOrder(state.trophies).find((t) => !state.earned.has(t.id));
  $('#next-up').textContent = next
    ? `${next.name} — ${STAGE_NAMES[next.stage]}`
    : 'Platinum earned. You are a Leonida Legend.';
  const banner = $('#missable-banner');
  banner.hidden = state.earned.has(28);
}

function renderRoadmap() {
  roadmapEl.innerHTML = '';
  const stages = roadmapOrder(state.trophies).reduce((acc, t) => {
    (acc[t.stage] = acc[t.stage] || []).push(t);
    return acc;
  }, {});
  for (const stage of Object.keys(stages).sort((a, b) => a - b)) {
    const done = stages[stage].filter((t) => state.earned.has(t.id)).length;
    const li = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = STAGE_NAMES[stage];
    const count = document.createElement('span');
    count.className = 'stage-count';
    count.textContent = `${done}/${stages[stage].length} earned`;
    li.append(name, count);
    roadmapEl.appendChild(li);
  }
  roadmapStagesEl.innerHTML = '';
  for (const stage of Object.keys(stages).sort((a, b) => a - b)) {
    const card = document.createElement('div');
    card.className = 'roadmap-stage';
    const h = document.createElement('h3');
    h.textContent = STAGE_NAMES[stage];
    const ul = document.createElement('ul');
    for (const t of stages[stage]) {
      const li = document.createElement('li');
      li.textContent = (state.earned.has(t.id) ? '✓ ' : '') + trophyLabel(t);
      ul.appendChild(li);
    }
    card.append(h, ul);
    roadmapStagesEl.appendChild(card);
  }
}

function renderAll() {
  renderList();
  renderDetail();
  renderCounts();
  renderRoadmap();
}

function toggleEarned(id) {
  if (state.earned.has(id)) state.earned.delete(id);
  else state.earned.add(id);
  saveEarned();
  renderAll();
}

function selectTrophy(id) {
  state.selectedId = id;
  history.replaceState(null, '', `#trophy-${id}`);
  renderList();
  renderDetail();
}

function stepCount(direction) {
  const ordered = roadmapOrder(state.trophies);
  if (direction > 0) {
    const next = ordered.find((t) => !state.earned.has(t.id));
    if (next) toggleEarned(next.id);
  } else {
    const earned = ordered.filter((t) => state.earned.has(t.id));
    if (earned.length > 0) toggleEarned(earned[earned.length - 1].id);
  }
}

function exportProgress() {
  const payload = JSON.stringify({ earned: [...state.earned].sort((a, b) => a - b), exported: new Date().toISOString() }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-trophy-ledger-progress.json';
  a.click();
  URL.revokeObjectURL(url);
  return payload;
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const ids = Array.isArray(parsed.earned) ? parsed.earned : parsed;
      const valid = ids.filter((id) => state.trophies.some((t) => t.id === id));
      state.earned = new Set(valid);
      saveEarned();
      renderAll();
    } catch (err) { /* bad file: ignore it */ }
  };
  reader.readAsText(file);
}

function readInitialState() {
  const params = new URLSearchParams(location.search);
  if (params.get('view') === 'roadmap') state.roadmapOpen = true;
  if (params.get('filter') === 'missable') state.kind = 'missable';
  if (params.get('spoiler') === 'on') state.spoiler = true;
  const hash = location.hash.match(/^#trophy-(\d+)$/);
  if (hash) {
    const id = Number(hash[1]);
    if (state.trophies.some((t) => t.id === id)) state.selectedId = id;
  }
}

function wireControls() {
  $('#search').addEventListener('input', (ev) => {
    state.query = ev.target.value;
    renderList();
  });
  document.querySelectorAll('.kind-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.kind = btn.dataset.kind;
      document.querySelectorAll('.kind-btn').forEach((b) => b.classList.toggle('active', b === btn));
      renderList();
    });
  });
  $('#grade-filter').addEventListener('change', (ev) => {
    state.grade = ev.target.value;
    renderList();
  });
  const spoilerBox = $('#spoiler');
  spoilerBox.checked = state.spoiler;
  spoilerBox.addEventListener('change', (ev) => {
    state.spoiler = ev.target.checked;
    saveEarned();
    renderAll();
  });
  $('#roadmap-toggle').addEventListener('click', () => {
    state.roadmapOpen = !state.roadmapOpen;
    roadmapViewEl.hidden = !state.roadmapOpen;
  });
  $('#export-btn').addEventListener('click', exportProgress);
  $('#reset-btn').addEventListener('click', () => {
    if (state.earned.size === 0) return;
    if (!window.confirm('Clear all earned ticks? Your saved progress will be erased.')) return;
    state.earned.clear();
    saveEarned();
    renderAll();
  });
  $('#import-file').addEventListener('change', (ev) => {
    if (ev.target.files && ev.target.files[0]) importProgress(ev.target.files[0]);
  });
  $('#step-up').addEventListener('click', () => stepCount(1));
  $('#step-down').addEventListener('click', () => stepCount(-1));
  if (state.kind === 'missable') {
    document.querySelectorAll('.kind-btn').forEach((b) => b.classList.toggle('active', b.dataset.kind === 'missable'));
  }
  roadmapViewEl.hidden = !state.roadmapOpen;
}

async function runSelfTest() {
  const results = [];
  const check = (name, ok) => results.push(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  check('55 rows render', document.querySelectorAll('.trophy-row').length === 55);
  toggleEarned(17);
  check('localStorage toggle persists', JSON.parse(localStorage.getItem(STORE_KEY)).earned.includes(17));
  toggleEarned(17);
  state.query = 'shootist';
  renderList();
  check('search works', document.querySelectorAll('.trophy-row').length === 1);
  state.query = '';
  renderList();
  state.spoiler = true;
  renderAll();
  check('spoiler hides story trophy', document.body.textContent.includes('Hidden trophy'));
  state.spoiler = false;
  renderAll();
  stepCount(1);
  check('stepper checks next trophy', state.earned.size === 1);
  stepCount(-1);
  check('stepper unchecks last earned', state.earned.size === 0);
  check('roadmap shows 7 stages', document.querySelectorAll('#roadmap li').length === 7);
  const payload = exportProgress();
  check('export works', payload.includes('"earned"'));
  const box = $('#selftest');
  box.hidden = false;
  box.textContent = `SELFTEST ${results.every((r) => r.startsWith('PASS')) ? 'PASS' : 'FAIL'} :: ${results.join(' | ')}`;
  document.title = box.textContent;
}

async function init() {
  const res = await fetch('data/trophies.json');
  const data = await res.json();
  state.trophies = data.trophies;
  loadEarned();
  readInitialState();
  wireControls();
  renderAll();
  if (state.roadmapOpen) roadmapViewEl.scrollIntoView();
  if (new URLSearchParams(location.search).get('selftest') === '1') await runSelfTest();
}

init();
