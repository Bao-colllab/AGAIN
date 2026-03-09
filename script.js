// ── CANDIDATES ────────────────────────────────────────────────
const POSITIONS = [
  { key: 'president', label: 'President',     icon: '👑' },
  { key: 'vp',        label: 'Vice President', icon: '🎖️' },
  { key: 'secretary', label: 'Secretary',      icon: '📋' },
  { key: 'treasurer', label: 'Treasurer',      icon: '💰' },
];

const CANDIDATES = {
  president: [
    { id: 'p1', name: 'Andrea Reyes',    sub: 'Grade 12 - STEM A', ava: '👩' },
    { id: 'p2', name: 'Carlos Mendoza',  sub: 'Grade 12 - ABM',    ava: '👨' },
    { id: 'p3', name: 'Sofia Lim',       sub: 'Grade 11 - STEM B', ava: '👩' },
  ],
  vp: [
    { id: 'v1', name: 'Miguel Torres',   sub: 'Grade 12 - STEM A', ava: '👨' },
    { id: 'v2', name: 'Jasmine Cruz',    sub: 'Grade 11 - ABM',    ava: '👩' },
    { id: 'v3', name: 'Ryan Santos',     sub: 'Grade 12 - STEM B', ava: '👨' },
  ],
  secretary: [
    { id: 's1', name: 'Lia Fernandez',   sub: 'Grade 11 - STEM A', ava: '👩' },
    { id: 's2', name: 'Paolo Dela Cruz', sub: 'Grade 12 - ABM',    ava: '👨' },
  ],
  treasurer: [
    { id: 't1', name: 'Nina Villanueva', sub: 'Grade 12 - STEM B', ava: '👩' },
    { id: 't2', name: 'Jeric Bautista',  sub: 'Grade 11 - STEM A', ava: '👨' },
  ],
};

const ADMIN_PASS = 'sslg2025';

// ── STATE ─────────────────────────────────────────────────────
let vName = '', vId = '', vSection = '';
let picks = {};
let votes = {};
let voterLog = [];
let usedIDs = new Set();
let allVoters = [];

// ── NAVIGATION ────────────────────────────────────────────────
function goTo(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('show'));
  document.getElementById('pg-' + id).classList.add('show');
  document.querySelectorAll('.nav-btns button').forEach(b => b.classList.remove('active'));

  const map = { vote: 0, results: 1, 'admin-login': 2, admin: 2 };
  const btns = document.querySelectorAll('.nav-btns button');
  if (map[id] !== undefined) btns[map[id]]?.classList.add('active');

  if (id === 'results') renderResults();
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

// ── VERIFY ────────────────────────────────────────────────────
function verifyVoter() {
  const name    = document.getElementById('v-name').value.trim();
  const sid     = document.getElementById('v-id').value.trim().toUpperCase();
  const section = document.getElementById('v-section').value;
  const err     = document.getElementById('err-verify');

  if (!name)    return (err.textContent = '⚠ Please enter your full name.');
  if (!sid)     return (err.textContent = '⚠ Please enter your Student ID.');
  if (!section) return (err.textContent = '⚠ Please select your section.');
  if (usedIDs.has(sid)) return (err.textContent = '⚠ This Student ID has already voted.');

  err.textContent = '';
  vName = name; vId = sid; vSection = section;
  picks = {};

  document.getElementById('voter-tag').textContent =
    `🗳 Voting as: ${name}  |  ${sid}  |  ${section}`;

  renderBallot();
  showStep('ballot');
}

// ── BALLOT ────────────────────────────────────────────────────
function renderBallot() {
  POSITIONS.forEach(pos => {
    const el = document.getElementById('cands-' + pos.key);
    if (!el) return;
    el.innerHTML = CANDIDATES[pos.key].map(c => `
      <div class="cand ${picks[pos.key] === c.id ? 'picked' : ''}"
           id="card-${c.id}" onclick="pick('${pos.key}', '${c.id}')">
        <div class="cand-ava">${c.ava}</div>
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

// ── SUBMIT ────────────────────────────────────────────────────
function submitVote() {
  const err = document.getElementById('err-ballot');
  const missing = POSITIONS.filter(p => !picks[p.key]);

  if (missing.length) {
    err.textContent = '⚠ Please select for: ' + missing.map(p => p.label).join(', ');
    return;
  }

  err.textContent = '';

  // Tally votes
  POSITIONS.forEach(pos => {
    const id = picks[pos.key];
    votes[id] = (votes[id] || 0) + 1;
  });

  // Mark ID used
  usedIDs.add(vId);

  // Log voter
  const ref = 'REF-' + Date.now().toString(36).toUpperCase();
  voterLog.push({
    name: vName,
    studentId: vId,
    section: vSection,
    time: new Date().toLocaleString(),
    ref: ref,
  });

  document.getElementById('success-msg').textContent =
    `Thank you, ${vName}! Your ballot has been recorded.`;
  document.getElementById('ref-num').textContent = ref;

  showStep('success');
}

// ── RESULTS ───────────────────────────────────────────────────
function renderResults() {
  const total    = voterLog.length;
  const sections = new Set(voterLog.map(v => v.section)).size;

  document.getElementById('r-total').textContent   = total;
  document.getElementById('r-voters').textContent  = total;
  document.getElementById('r-sections').textContent = sections;

  document.getElementById('results-body').innerHTML =
    POSITIONS.map(pos => {
      const cands   = CANDIDATES[pos.key].map(c => ({ ...c, votes: votes[c.id] || 0 }));
      const posTotal = cands.reduce((a, c) => a + c.votes, 0);
      const sorted  = [...cands].sort((a, b) => b.votes - a.votes);
      const leader  = sorted[0];

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
                  <div class="res-ava">${c.ava}</div>
                  <div class="res-info">
                    <div class="res-name">
                      ${c.name}
                      ${isTop && c.votes > 0 ? '<span class="win-badge">🏆 Leading</span>' : ''}
                    </div>
                    <div class="res-bar-wrap">
                      <div class="res-bar">
                        <div class="res-fill ${isTop ? 'lead' : ''}" style="width:${pct}%"></div>
                      </div>
                      <span class="res-pct">${pct}%</span>
                    </div>
                  </div>
                  <div class="res-votes">
                    <span class="res-vn">${c.votes}</span>
                    <span class="res-vl">votes</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
}

// ── ADMIN ─────────────────────────────────────────────────────
function doLogin() {
  const pass = document.getElementById('admin-pass').value;
  if (pass === ADMIN_PASS) {
    document.getElementById('err-admin').textContent = '';
    goTo('admin');
  } else {
    document.getElementById('err-admin').textContent = '⚠ Wrong password. Hint: sslg2025';
  }
}

function renderAdmin() {
  allVoters = voterLog;
  const total    = voterLog.length;
  const sections = new Set(voterLog.map(v => v.section)).size;

  document.getElementById('a-total').textContent    = total;
  document.getElementById('a-voters').textContent   = total;
  document.getElementById('a-sections').textContent = sections;

  // Results bars
  document.getElementById('admin-results').innerHTML =
    POSITIONS.map(pos => {
      const cands    = CANDIDATES[pos.key].map(c => ({ ...c, votes: votes[c.id] || 0 }));
      const posTotal = cands.reduce((a, c) => a + c.votes, 0);
      const sorted   = [...cands].sort((a, b) => b.votes - a.votes);
      const leader   = sorted[0];

      return `
        <div style="margin-bottom: 20px;">
          <div style="font-size:12px;font-weight:700;color:#1e3a5f;text-transform:uppercase;
                      letter-spacing:.5px;margin-bottom:10px;padding-bottom:7px;
                      border-bottom:1px solid #f0f4f8;">
            ${pos.icon} ${pos.label}
          </div>
          ${sorted.map(c => {
            const pct   = posTotal > 0 ? Math.round(c.votes / posTotal * 100) : 0;
            const isTop = c.votes > 0 && c.id === leader.id;
            return `
              <div style="margin-bottom:10px;">
                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px;">
                  <span style="font-weight:600;">${c.ava} ${c.name}
                    ${isTop && c.votes > 0 ? '<span class="win-badge">🏆</span>' : ''}
                  </span>
                  <span style="color:#94a3b8;">${c.votes} votes — ${pct}%</span>
                </div>
                <div class="res-bar">
                  <div class="res-fill ${isTop ? 'lead' : ''}" style="width:${pct}%;transition:width .5s;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }).join('');

  filterLog();
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

  if (!filtered.length) {
    tbody.innerHTML = '';
    noData.style.display = 'block';
    return;
  }

  noData.style.display = 'none';
  tbody.innerHTML = filtered.map((v, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${v.name}</td>
      <td><code>${v.studentId}</code></td>
      <td>${v.section}</td>
      <td>${v.time}</td>
    </tr>
  `).join('');
}

function exportCSV() {
  if (!voterLog.length) return alert('No data to export.');
  const rows = [
    ['#', 'Name', 'Student ID', 'Section', 'Time', 'Ref'],
    ...voterLog.map((v, i) => [i + 1, v.name, v.studentId, v.section, v.time, v.ref]),
  ];
  const csv = rows.map(r => r.map(x => `"${x}"`).join(',')).join('\n');
  const a   = document.createElement('a');
  a.href    = 'data:text/csv,' + encodeURIComponent(csv);
  a.download = 'sslg_voters.csv';
  a.click();
}

function confirmReset() {
  if (!confirm('Delete ALL votes? This cannot be undone.')) return;
  if (prompt('Type RESET to confirm:') !== 'RESET') { alert('Cancelled.'); return; }
  votes = {}; voterLog = []; usedIDs = new Set(); allVoters = [];
  alert('✅ All data reset.');
  renderAdmin();
}

// ── ENTER KEY ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('v-id')
    .addEventListener('keydown', e => { if (e.key === 'Enter') verifyVoter(); });
  document.getElementById('admin-pass')
    .addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
});
