
const POSITIONS = [
  { key: 'president', label: 'President',      icon: '👑' },
  { key: 'vp',        label: 'Vice President',  icon: '🎖️' },
  { key: 'secretary', label: 'Secretary',       icon: '📋' },
  { key: 'treasurer', label: 'Treasurer',       icon: '💰' },
];

const CANDIDATES = {
  president: [
    { id: 'p1', name: 'Cantutay',    sub: 'Grade 11 - MONARCH', ava: '👨', img: 'images/sungg.jpg' },
    { id: 'p2', name: 'Decena',  sub: 'Grade 11 - MONARCH',    ava: '👨', img: 'images/Goku.png' },
    { id: 'p3', name: 'Awa',       sub: 'Grade 11 - MONARCH', ava: '👨', img: 'images/Shinra.jpg' },
  ],
  vp: [
    { id: 'v1', name: 'Canas',   sub: 'Grade 12 - MONARCH', ava: '👨', img: 'images/Arthur.png' },
    { id: 'v2', name: 'Genayas',    sub: 'Grade 11 - MONARCH',    ava: '👩', img: 'images/Fern.jpeg' },
    { id: 'v3', name: 'Ryan ',     sub: 'Grade 11 - MONARCH', ava: '👨', img: 'images/sungg.jpg' },
  ],
  secretary: [
    { id: 's1', name: 'Shaira Jane',   sub: 'Grade 11 - MONARCH', ava: '👩', img: 'images/Fern.jpeg' },
    { id: 's2', name: 'Eric', sub: 'Grade 11 - MONARCH',    ava: '👨', img: 'images/Goku.png' },
  ],
  treasurer: [
    { id: 't1', name: 'Lyle Mikko', sub: 'Grade 11 - MONARCH', ava: '👨', img: 'images/Arthur.png' },
    { id: 't2', name: 'Jefferson',  sub: 'Grade 11 - MONARCH', ava: '👨', img: 'images/Shinra.jpg' },
  ],
};

const ADMIN_PASS = 'dragon2212';

// ═══════════════════════════════════════════════
//  JSONBIN
// ═══════════════════════════════════════════════
const JB_BASE = 'https://api.jsonbin.io/v3/b';
let JB_KEY    = '$2a$10$OApSBPcw2D0COUpLB/lwROaW9u32KBOtZSEz/EkvqPWJ.IRhku9ZO';
let JB_BIN_ID = '69aef90bae596e708f7170c1';

function loadConfig() {
  JB_KEY    = localStorage.getItem('jb_key')    || '';
  JB_BIN_ID = localStorage.getItem('jb_bin_id') || '';
}
function saveConfig() {
  localStorage.setItem('jb_key',    JB_KEY);
  localStorage.setItem('jb_bin_id', JB_BIN_ID);
}
async function createBin() {
  const res = await fetch(JB_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Master-Key': JB_KEY, 'X-Bin-Name': 'sslg-election-2025', 'X-Bin-Private': 'false' },
    body: JSON.stringify({ votes: {}, voterLog: [], usedIDs: [] }),
  });
  if (!res.ok) throw new Error('Failed to create bin: ' + res.status);
  return (await res.json()).metadata.id;
}
async function readBin() {
  const res = await fetch(`${JB_BASE}/${JB_BIN_ID}/latest`, { headers: { 'X-Master-Key': JB_KEY } });
  if (!res.ok) throw new Error('Read failed: ' + res.status);
  return (await res.json()).record;
}
async function writeBin(record) {
  const res = await fetch(`${JB_BASE}/${JB_BIN_ID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Master-Key': JB_KEY },
    body: JSON.stringify(record),
  });
  if (!res.ok) throw new Error('Write failed: ' + res.status);
}

// ═══════════════════════════════════════════════
//  SETUP
// ═══════════════════════════════════════════════
async function setupConnect() {
  const key = document.getElementById('jb-key').value.trim();
  const err = document.getElementById('err-setup');
  if (!key) return (err.textContent = '⚠ Please enter your JSONBin Secret Key.');
  err.textContent = 'Connecting...';
  JB_KEY = key;
  try {
    JB_BIN_ID = await createBin();
    saveConfig();
    err.textContent = '';
    alert('✅ Connected! Your voting system is ready.');
    goTo('vote');
  } catch (e) {
    err.textContent = '❌ Failed: ' + e.message;
  }
}

// ═══════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════
function goTo(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('show'));
  document.getElementById('pg-' + id).classList.add('show');
  document.querySelectorAll('.nav-btns button').forEach(b => b.classList.remove('active'));
  const map = { vote: 0, results: 1, 'admin-login': 2, admin: 2 };
  const btns = document.querySelectorAll('.nav-btns button');
  if (map[id] >= 0) btns[map[id]]?.classList.add('active');
  if (id === 'results') loadResults();
  if (id === 'admin')   renderAdmin();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showStep(s) {
  ['verify', 'ballot', 'success'].forEach(x => {
    document.getElementById('step-' + x).style.display = 'none';
  });
  document.getElementById('step-' + s).style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ═══════════════════════════════════════════════
//  AVATAR HELPER  ← THIS IS THE FIX
// ═══════════════════════════════════════════════
function avatarHTML(c, size = 48) {
  if (c.img && c.img.trim() !== '') {
    return `
      <img
        src="${c.img}"
        alt="${c.name}"
        width="${size}" height="${size}"
        style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;
               border:2px solid #e2e8f0;display:block;flex-shrink:0;"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
      <span style="display:none;width:${size}px;height:${size}px;font-size:${Math.round(size*0.55)}px;
                   align-items:center;justify-content:center;flex-shrink:0;">${c.ava}</span>
    `;
  }
  return `<span style="font-size:${Math.round(size*0.55)}px;width:${size}px;height:${size}px;
                        display:flex;align-items:center;justify-content:center;flex-shrink:0;">${c.ava}</span>`;
}

// ═══════════════════════════════════════════════
//  VOTER STATE
// ═══════════════════════════════════════════════
let vName = '', vId = '', vSection = '';
let picks = {};

async function verifyVoter() {
  const name    = document.getElementById('v-name').value.trim();
  const sid     = document.getElementById('v-id').value.trim().toUpperCase();
  const section = document.getElementById('v-section').value;
  const err     = document.getElementById('err-verify');
  const btn     = document.getElementById('btn-proceed');

  if (!name)    return (err.textContent = '⚠ Please enter your full name.');
  if (!sid)     return (err.textContent = '⚠ Please enter your Student ID.');
  if (!section) return (err.textContent = '⚠ Please select your section.');

  err.textContent = 'Checking...';
  btn.disabled = true;

  try {
    const record = await readBin();
    if ((record.usedIDs || []).includes(sid)) {
      err.textContent = '⚠ This Student ID has already voted.';
      btn.disabled = false;
      return;
    }
    err.textContent = '';
    btn.disabled = false;
    vName = name; vId = sid; vSection = section;
    picks = {};
    document.getElementById('voter-tag').textContent = `🗳 Voting as: ${name}  |  ${sid}  |  ${section}`;
    renderBallot();
    showStep('ballot');
  } catch (e) {
    err.textContent = '❌ Error: ' + e.message;
    btn.disabled = false;
  }
}

function renderBallot() {
  POSITIONS.forEach(pos => {
    const el = document.getElementById('cands-' + pos.key);
    if (!el) return;
    el.innerHTML = CANDIDATES[pos.key].map(c => `
      <div class="cand ${picks[pos.key] === c.id ? 'picked' : ''}"
           id="card-${c.id}" onclick="pick('${pos.key}','${c.id}')">
        <div style="display:flex;align-items:center;flex-shrink:0;">
          ${avatarHTML(c, 48)}
        </div>
        <div class="cand-info">
          <div class="cand-name">${c.name}</div>
          <div class="cand-sub">${c.sub}</div>
        </div>
        <div class="cand-tick">✓</div>
      </div>
    `).join('');
  });
}

function pick(pos, id) {
  if (picks[pos]) {
    const prev = document.getElementById('card-' + picks[pos]);
    if (prev) prev.classList.remove('picked');
  }
  picks[pos] = id;
  const card = document.getElementById('card-' + id);
  if (card) card.classList.add('picked');
  document.getElementById('err-ballot').textContent = '';
}

async function submitVote() {
  const err = document.getElementById('err-ballot');
  const btn = document.getElementById('btn-submit');
  const missing = POSITIONS.filter(p => !picks[p.key]);
  if (missing.length) {
    err.textContent = '⚠ Please select for: ' + missing.map(p => p.label).join(', ');
    return;
  }
  err.textContent = '';
  btn.disabled = true;
  btn.textContent = 'Submitting...';
  try {
    const record = await readBin();
    if ((record.usedIDs || []).includes(vId)) {
      err.textContent = '⚠ This Student ID has already voted.';
      btn.disabled = false;
      btn.textContent = '✅ Submit Vote';
      showStep('verify');
      return;
    }
    POSITIONS.forEach(pos => {
      const id = picks[pos.key];
      record.votes[id] = (record.votes[id] || 0) + 1;
    });
    const ref = 'REF-' + Date.now().toString(36).toUpperCase();
    record.voterLog.push({ name: vName, studentId: vId, section: vSection, time: new Date().toLocaleString(), ref });
    record.usedIDs.push(vId);
    await writeBin(record);
    document.getElementById('success-msg').textContent = `Thank you, ${vName}! Your ballot has been recorded.`;
    document.getElementById('ref-num').textContent = ref;
    btn.disabled = false;
    btn.textContent = '✅ Submit Vote';
    showStep('success');
  } catch (e) {
    err.textContent = '❌ Error: ' + e.message;
    btn.disabled = false;
    btn.textContent = '✅ Submit Vote';
  }
}

// ═══════════════════════════════════════════════
//  RESULTS
// ═══════════════════════════════════════════════
async function loadResults() {
  document.getElementById('results-body').innerHTML = '<div class="spinner"></div>';
  try {
    const record   = await readBin();
    const votes    = record.votes    || {};
    const voterLog = record.voterLog || [];
    const sections = new Set(voterLog.map(v => v.section)).size;
    document.getElementById('r-total').textContent    = voterLog.length;
    document.getElementById('r-voters').textContent   = voterLog.length;
    document.getElementById('r-sections').textContent = sections;

    document.getElementById('results-body').innerHTML = POSITIONS.map(pos => {
      const cands    = CANDIDATES[pos.key].map(c => ({ ...c, votes: votes[c.id] || 0 }));
      const posTotal = cands.reduce((a, c) => a + c.votes, 0);
      const sorted   = [...cands].sort((a, b) => b.votes - a.votes);
      const leader   = sorted[0];
      return `
        <div class="res-block">
          <div class="res-pos-header">
            <span>${pos.icon} ${pos.label}</span>
            <span class="res-pos-votes">${posTotal} vote${posTotal !== 1 ? 's' : ''}</span>
          </div>
          <div class="res-rows">
            ${sorted.map(c => {
              const pct   = posTotal > 0 ? Math.round(c.votes / posTotal * 100) : 0;
              const isTop = c.votes > 0 && c.id === leader.id;
              return `
                <div class="res-row ${isTop ? 'leader' : ''}">
                  <div style="display:flex;align-items:center;flex-shrink:0;">
                    ${avatarHTML(c, 38)}
                  </div>
                  <div class="res-info">
                    <div class="res-name">${c.name}
                      ${isTop && c.votes > 0 ? '<span class="win-badge">🏆 Leading</span>' : ''}
                    </div>
                    <div class="res-bar-wrap">
                      <div class="res-bar"><div class="res-fill ${isTop ? 'lead' : ''}" style="width:${pct}%"></div></div>
                      <span class="res-pct">${pct}%</span>
                    </div>
                  </div>
                  <div class="res-votes">
                    <span class="res-vn">${c.votes}</span>
                    <span class="res-vl">votes</span>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>`;
    }).join('');
  } catch (e) {
    document.getElementById('results-body').innerHTML = `<div class="loading-msg">❌ ${e.message}</div>`;
  }
}

// ═══════════════════════════════════════════════
//  ADMIN
// ═══════════════════════════════════════════════
function doLogin() {
  const pass = document.getElementById('admin-pass').value;
  if (pass === ADMIN_PASS) { document.getElementById('err-admin').textContent = ''; goTo('admin'); }
  else document.getElementById('err-admin').textContent = '⚠ Wrong password.' ;
}

let allVoters = [];

async function renderAdmin() {
  document.getElementById('admin-results').innerHTML = '<div class="spinner"></div>';
  try {
    const record   = await readBin();
    const votes    = record.votes    || {};
    allVoters      = record.voterLog || [];
    const sections = new Set(allVoters.map(v => v.section)).size;
    document.getElementById('a-total').textContent    = allVoters.length;
    document.getElementById('a-voters').textContent   = allVoters.length;
    document.getElementById('a-sections').textContent = sections;

    document.getElementById('admin-results').innerHTML = POSITIONS.map(pos => {
      const cands    = CANDIDATES[pos.key].map(c => ({ ...c, votes: votes[c.id] || 0 }));
      const posTotal = cands.reduce((a, c) => a + c.votes, 0);
      const sorted   = [...cands].sort((a, b) => b.votes - a.votes);
      const leader   = sorted[0];
      return `
        <div style="margin-bottom:20px;">
          <div style="font-size:12px;font-weight:700;color:#1e3a5f;text-transform:uppercase;
                      letter-spacing:.5px;margin-bottom:10px;padding-bottom:7px;border-bottom:1px solid #f0f4f8;">
            ${pos.icon} ${pos.label}
          </div>
          ${sorted.map(c => {
            const pct   = posTotal > 0 ? Math.round(c.votes / posTotal * 100) : 0;
            const isTop = c.votes > 0 && c.id === leader.id;
            return `
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                ${avatarHTML(c, 32)}
                <div style="flex:1;">
                  <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;">
                    <span style="font-weight:600;">${c.name} ${isTop && c.votes > 0 ? '<span class="win-badge">🏆</span>' : ''}</span>
                    <span style="color:#94a3b8;">${c.votes} votes — ${pct}%</span>
                  </div>
                  <div class="res-bar"><div class="res-fill ${isTop ? 'lead' : ''}" style="width:${pct}%;transition:width .5s;"></div></div>
                </div>
              </div>`;
          }).join('')}
        </div>`;
    }).join('');
    filterLog();
  } catch (e) {
    document.getElementById('admin-results').innerHTML = `<div class="loading-msg">❌ ${e.message}</div>`;
  }
}

function filterLog() {
  const q      = (document.getElementById('search')?.value || '').toLowerCase();
  const tbody  = document.getElementById('voter-tbody');
  const noData = document.getElementById('no-voters');
  const filtered = allVoters.filter(v =>
    v.name.toLowerCase().includes(q) ||
    v.studentId.toLowerCase().includes(q) ||
    (v.section || '').toLowerCase().includes(q)
  );
  if (!filtered.length) { tbody.innerHTML = ''; noData.style.display = 'block'; return; }
  noData.style.display = 'none';
  tbody.innerHTML = filtered.map((v, i) => `
    <tr>
      <td>${i + 1}</td><td>${v.name}</td>
      <td><code>${v.studentId}</code></td>
      <td>${v.section}</td><td>${v.time}</td>
    </tr>`).join('');
}

function exportCSV() {
  if (!allVoters.length) { alert('No data to export.'); return; }
  const rows = [['#','Name','Student ID','Section','Time','Ref'],
    ...allVoters.map((v,i) => [i+1, v.name, v.studentId, v.section, v.time, v.ref])];
  const csv = rows.map(r => r.map(x => `"${x}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv,' + encodeURIComponent(csv);
  a.download = 'sslg_voters.csv';
  a.click();
}

async function confirmReset() {
  if (!confirm('Delete ALL votes? Cannot be undone!')) return;
  if (prompt('Type RESET to confirm:') !== 'RESET') { alert('Cancelled.'); return; }
  try {
    await writeBin({ votes: {}, voterLog: [], usedIDs: [] });
    alert('✅ All data reset.');
    renderAdmin();
  } catch (e) { alert('❌ Error: ' + e.message); }
}

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Config is hardcoded — all devices use the same database automatically
  goTo('vote');
  document.getElementById('v-id')?.addEventListener('keydown', e => { if (e.key === 'Enter') verifyVoter(); });
  document.getElementById('admin-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
});