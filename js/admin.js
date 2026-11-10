/**
 * ADMIN CONTENT MANAGEMENT SYSTEM (CMS) LOGIC
 * Lutfi Esa Prasetyo Portfolio Website
 * Security Hardened: SHA-256 PIN verification, anti-brute-force rate limiting,
 * safe URL scheme validation, and DOM XSS escaping.
 */

let isAdminLoggedIn = false;
let currentEditorContext = null; // { entity: 'experience'|'skill'|'education'|'certificate', id: string|null }

// Rate limiting state
let failedLoginAttempts = 0;
let lockoutTimestamp = 0;

/**
 * Security: Compute SHA-256 hash using native Web Crypto API
 */
async function computePinHash(pin) {
  if (window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(String(pin).trim());
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch(e) {
      console.warn('SubtleCrypto error, falling back:', e);
    }
  }
  // Fallback simple bitwise hash
  let h = 0;
  const str = String(pin).trim();
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return 'legacy_h_' + Math.abs(h);
}

/**
 * Get stored PIN hash with auto-migration of legacy plaintext PIN
 */
function getStoredPinHash() {
  // Check if legacy plaintext PIN exists and migrate it
  const legacyPin = localStorage.getItem('lep_admin_pin');
  if (legacyPin) {
    computePinHash(legacyPin).then(hash => {
      localStorage.setItem(PIN_HASH_KEY, hash);
      localStorage.removeItem('lep_admin_pin');
    });
  }

  return localStorage.getItem(PIN_HASH_KEY) || DEFAULT_PIN_HASH;
}

/**
 * Set new PIN hash in localStorage (never stores plaintext)
 */
async function setAdminPin(newPin) {
  const hash = await computePinHash(newPin);
  localStorage.setItem(PIN_HASH_KEY, hash);
  localStorage.removeItem('lep_admin_pin'); // Purge legacy plaintext
}

/**
 * Security Helper: HTML Entity Escaping
 */
function escapeAdminHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Security Helper: URL Protocol Sanitization
 */
function sanitizeAdminUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }
  return '';
}

/**
 * CMS Forms & Entity List Renderers
 */
function renderCmsProfileForm() {
  const p = appData.profile;
  const nameEl = document.getElementById('edit-profile-name');
  if (!nameEl) return;

  nameEl.value = p.name || '';
  document.getElementById('edit-profile-role').value = p.role || '';
  document.getElementById('edit-profile-birth').value = p.birthInfo || '';
  document.getElementById('edit-profile-email').value = p.email || '';
  document.getElementById('edit-profile-phone').value = p.phone || '';
  document.getElementById('edit-profile-linkedin').value = p.linkedinUrl || p.linkedin || '';
  const ghEl = document.getElementById('edit-profile-github');
  if (ghEl) ghEl.value = p.githubUrl || p.github || 'https://github.com/Lutfiesa';
  document.getElementById('edit-profile-address').value = p.address || '';
  document.getElementById('edit-profile-tagline').value = p.tagline || '';
  document.getElementById('edit-profile-about').value = p.about || p.tagline || '';
}

function renderCmsExperienceList() {
  const container = document.getElementById('cms-experience-list');
  if (!container) return;
  container.innerHTML = '';

  appData.experiences.forEach((exp) => {
    const item = document.createElement('div');
    item.className = 'p-4 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-200 dark:border-cyan-500/20 flex items-center justify-between gap-4';
    item.innerHTML = `
      <div>
        <div class="text-xs text-slate-500 dark:text-cyan-400 font-semibold">${escapeAdminHtml(exp.period)}</div>
        <div class="text-sm font-bold text-slate-900 dark:text-white">${escapeAdminHtml(exp.company)} — <span class="text-cyan-600 dark:text-cyan-400">${escapeAdminHtml(exp.role)}</span></div>
        <div class="text-[11px] text-slate-500 mt-0.5">${exp.responsibilities.length} poin tanggung jawab</div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button onclick="openEditExperience('${escapeAdminHtml(exp.id)}')" class="p-1.5 rounded-lg bg-slate-200 dark:bg-[#132035] hover:bg-slate-300 dark:hover:bg-[#1a2d4b] text-cyan-600 dark:text-cyan-400" title="Edit">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </button>
        <button onclick="deleteExperience('${escapeAdminHtml(exp.id)}')" class="p-1.5 rounded-lg bg-slate-200 dark:bg-[#132035] hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400" title="Hapus">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderCmsSkillsList() {
  const container = document.getElementById('cms-skills-list');
  if (!container) return;
  container.innerHTML = '';

  appData.skills.forEach(skill => {
    const item = document.createElement('div');
    item.className = 'p-4 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-200 dark:border-cyan-500/20 flex flex-col justify-between gap-3';
    item.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-900 dark:text-white uppercase">${escapeAdminHtml(skill.category)}</span>
          <div class="flex items-center gap-1.5">
            <button onclick="openEditSkill('${escapeAdminHtml(skill.id)}')" class="p-1 text-cyan-600 dark:text-cyan-400 hover:text-cyan-500">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button onclick="deleteSkill('${escapeAdminHtml(skill.id)}')" class="p-1 text-rose-600 dark:text-rose-400 hover:text-rose-500">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
        <div class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">${escapeAdminHtml(skill.items.join(', '))}</div>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderCmsEducationList() {
  const container = document.getElementById('cms-education-list');
  if (!container) return;
  container.innerHTML = '';

  appData.education.forEach(edu => {
    const item = document.createElement('div');
    item.className = 'p-4 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-200 dark:border-cyan-500/20 flex items-center justify-between gap-4';
    item.innerHTML = `
      <div>
        <div class="text-xs text-slate-500 dark:text-cyan-400 font-semibold">${escapeAdminHtml(edu.period)}</div>
        <div class="text-sm font-bold text-slate-900 dark:text-white">${escapeAdminHtml(edu.level)} — <span class="text-cyan-600 dark:text-cyan-400">${escapeAdminHtml(edu.institution)}</span></div>
        <div class="text-[11px] text-slate-500 mt-0.5">${escapeAdminHtml(edu.notes || '-')}</div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button onclick="openEditEducation('${escapeAdminHtml(edu.id)}')" class="p-1.5 rounded-lg bg-slate-200 dark:bg-[#132035] hover:bg-slate-300 dark:hover:bg-[#1a2d4b] text-cyan-600 dark:text-cyan-400" title="Edit">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </button>
        <button onclick="deleteEducation('${escapeAdminHtml(edu.id)}')" class="p-1.5 rounded-lg bg-slate-200 dark:bg-[#132035] hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400" title="Hapus">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderCmsCertificatesList() {
  const container = document.getElementById('cms-certificates-list');
  if (!container) return;
  container.innerHTML = '';

  appData.certificates.forEach(c => {
    const item = document.createElement('div');
    item.className = 'p-4 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-200 dark:border-cyan-500/20 flex items-center justify-between gap-4';
    item.innerHTML = `
      <div class="overflow-hidden">
        <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-100 dark:bg-[#0f213d] text-cyan-800 dark:text-cyan-300">${escapeAdminHtml(c.issuer || 'Sertifikat')}</span>
        <div class="text-sm font-bold text-slate-900 dark:text-white truncate mt-1">${escapeAdminHtml(c.name)}</div>
        <a href="${sanitizeAdminUrl(c.link)}" target="_blank" rel="noopener noreferrer" class="text-xs text-cyan-600 dark:text-cyan-400 hover:underline truncate block mt-0.5">${escapeAdminHtml(c.link)}</a>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button onclick="openEditCertificate('${escapeAdminHtml(c.id)}')" class="p-1.5 rounded-lg bg-slate-200 dark:bg-[#132035] hover:bg-slate-300 dark:hover:bg-[#1a2d4b] text-cyan-600 dark:text-cyan-400" title="Edit">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </button>
        <button onclick="deleteCertificate('${escapeAdminHtml(c.id)}')" class="p-1.5 rounded-lg bg-slate-200 dark:bg-[#132035] hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400" title="Hapus">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderCmsAll() {
  renderCmsProfileForm();
  renderCmsExperienceList();
  renderCmsSkillsList();
  renderCmsEducationList();
  renderCmsCertificatesList();
}

/**
 * Item Editor Modal Helper (XSS Protected)
 */
function openItemEditor(entity, title, fieldsHtml, id = null) {
  currentEditorContext = { entity, id };
  const modal = document.getElementById('item-editor-modal');
  const titleEl = document.getElementById('item-editor-title');
  const fieldsContainer = document.getElementById('item-editor-fields');

  if (titleEl) titleEl.textContent = title;
  if (fieldsContainer) fieldsContainer.innerHTML = fieldsHtml;
  if (modal) modal.classList.remove('hidden');
}

function closeItemEditor() {
  const modal = document.getElementById('item-editor-modal');
  if (modal) modal.classList.add('hidden');
  currentEditorContext = null;
}

// Global CRUD Actions
window.openCreateExperience = function() {
  openItemEditor('experience', 'Tambah Pengalaman Baru', `
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Perusahaan</label>
      <input id="f-company" type="text" required placeholder="Contoh: PT ABC Indonesia" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Posisi / Role</label>
      <input id="f-role" type="text" required placeholder="Contoh: QA Lead" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Periode</label>
      <input id="f-period" type="text" required placeholder="Contoh: Mei 2026 – Sekarang" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">URL Logo / Ikon Perusahaan (Opsional)</label>
      <input id="f-logo" type="url" placeholder="https://..." class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggung Jawab (1 baris per poin)</label>
      <textarea id="f-responsibilities" rows="5" required placeholder="Baris 1&#10;Baris 2&#10;Baris 3" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"></textarea>
    </div>
  `);
};

window.openEditExperience = function(id) {
  const exp = appData.experiences.find(x => x.id === id);
  if (!exp) return;
  openItemEditor('experience', 'Edit Pengalaman Kerja', `
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Perusahaan</label>
      <input id="f-company" type="text" required value="${escapeAdminHtml(exp.company)}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Posisi / Role</label>
      <input id="f-role" type="text" required value="${escapeAdminHtml(exp.role)}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Periode</label>
      <input id="f-period" type="text" required value="${escapeAdminHtml(exp.period)}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">URL Logo / Ikon Perusahaan (Opsional)</label>
      <input id="f-logo" type="url" value="${escapeAdminHtml(exp.logo || '')}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggung Jawab (1 baris per poin)</label>
      <textarea id="f-responsibilities" rows="5" required class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">${escapeAdminHtml(exp.responsibilities.join('\n'))}</textarea>
    </div>
  `, id);
};

window.deleteExperience = function(id) {
  if (confirm('Yakin ingin menghapus pengalaman kerja ini?')) {
    appData.experiences = appData.experiences.filter(x => x.id !== id);
    saveData();
    showToast('Pengalaman kerja berhasil dihapus.');
  }
};

window.openCreateSkill = function() {
  openItemEditor('skill', 'Tambah Kategori Skill Baru', `
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Kategori</label>
      <input id="f-category" type="text" required placeholder="Contoh: Cloud & Containers" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Daftar Skill (Pisahkan dengan koma)</label>
      <textarea id="f-items" rows="3" required placeholder="Docker, Kubernetes, AWS" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"></textarea>
    </div>
  `);
};

window.openEditSkill = function(id) {
  const s = appData.skills.find(x => x.id === id);
  if (!s) return;
  openItemEditor('skill', 'Edit Kategori Skill', `
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Kategori</label>
      <input id="f-category" type="text" required value="${escapeAdminHtml(s.category)}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Daftar Skill (Pisahkan dengan koma)</label>
      <textarea id="f-items" rows="3" required class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">${escapeAdminHtml(s.items.join(', '))}</textarea>
    </div>
  `, id);
};

window.deleteSkill = function(id) {
  if (confirm('Yakin ingin menghapus kategori skill ini?')) {
    appData.skills = appData.skills.filter(x => x.id !== id);
    saveData();
    showToast('Kategori skill berhasil dihapus.');
  }
};

window.openCreateEducation = function() {
  openItemEditor('education', 'Tambah Pendidikan Baru', `
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Jenjang / Program</label>
      <input id="f-level" type="text" required placeholder="Contoh: Master Degree" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Institusi</label>
      <input id="f-institution" type="text" required placeholder="Contoh: Universitas Indonesia" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Periode</label>
      <input id="f-period" type="text" required placeholder="Contoh: 2026 – 2028" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Keterangan / Nilai</label>
      <input id="f-notes" type="text" value="-" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
  `);
};

window.openEditEducation = function(id) {
  const edu = appData.education.find(x => x.id === id);
  if (!edu) return;
  openItemEditor('education', 'Edit Pendidikan', `
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Jenjang / Program</label>
      <input id="f-level" type="text" required value="${escapeAdminHtml(edu.level)}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Institusi</label>
      <input id="f-institution" type="text" required value="${escapeAdminHtml(edu.institution)}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Periode</label>
      <input id="f-period" type="text" required value="${escapeAdminHtml(edu.period)}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Keterangan / Nilai</label>
      <input id="f-notes" type="text" value="${escapeAdminHtml(edu.notes || '-')}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
  `, id);
};

window.deleteEducation = function(id) {
  if (confirm('Yakin ingin menghapus riwayat pendidikan ini?')) {
    appData.education = appData.education.filter(x => x.id !== id);
    saveData();
    showToast('Data pendidikan berhasil dihapus.');
  }
};

window.openCreateCertificate = function() {
  openItemEditor('certificate', 'Tambah Sertifikat Baru', `
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Sertifikat</label>
      <input id="f-name" type="text" required placeholder="Contoh: Certified Software Tester (CSTE)" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Penerbit / Organisasi</label>
      <input id="f-issuer" type="text" placeholder="Contoh: ISTQB" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Link Bukti Sertifikat (URL)</label>
      <input id="f-link" type="url" required placeholder="https://..." class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
  `);
};

window.openEditCertificate = function(id) {
  const c = appData.certificates.find(x => x.id === id);
  if (!c) return;
  openItemEditor('certificate', 'Edit Sertifikat', `
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Sertifikat</label>
      <input id="f-name" type="text" required value="${escapeAdminHtml(c.name)}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Penerbit / Organisasi</label>
      <input id="f-issuer" type="text" value="${escapeAdminHtml(c.issuer || '')}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Link Bukti Sertifikat (URL)</label>
      <input id="f-link" type="url" required value="${escapeAdminHtml(c.link)}" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070c14] border border-slate-300 dark:border-cyan-500/20 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
    </div>
  `, id);
};

window.deleteCertificate = function(id) {
  if (confirm('Yakin ingin menghapus sertifikat ini?')) {
    appData.certificates = appData.certificates.filter(x => x.id !== id);
    saveData();
    showToast('Sertifikat berhasil dihapus.');
  }
};

/**
 * Authentication and CMS Navigation initialization
 */
function initAdmin() {
  const loginModal = document.getElementById('admin-login-modal');
  const cmsModal = document.getElementById('admin-cms-modal');
  const adminActiveBar = document.getElementById('admin-active-bar');

  function openAdminAuth() {
    if (isAdminLoggedIn) {
      openCms();
    } else {
      const pinInput = document.getElementById('admin-pin-input');
      if (pinInput) pinInput.value = '';
      const errMsg = document.getElementById('login-error-msg');
      if (errMsg) errMsg.classList.add('hidden');
      if (loginModal) loginModal.classList.remove('hidden');
      if (pinInput) pinInput.focus();
    }
  }

  function openCms() {
    renderCmsAll();
    if (cmsModal) cmsModal.classList.remove('hidden');
  }

  function closeCms() {
    if (cmsModal) cmsModal.classList.add('hidden');
  }

  // Trigger buttons
  const adminBtn = document.getElementById('admin-trigger-btn');
  const footerAdminBtn = document.getElementById('footer-admin-btn');
  const closeLoginBtn = document.getElementById('close-login-modal');
  const cmsCloseBtn = document.getElementById('cms-close-btn');
  const barOpenCmsBtn = document.getElementById('bar-open-cms-btn');
  const adminLogoutBtn = document.getElementById('admin-logout-btn');

  if (adminBtn) adminBtn.addEventListener('click', openAdminAuth);
  if (footerAdminBtn) footerAdminBtn.addEventListener('click', openAdminAuth);
  if (closeLoginBtn) closeLoginBtn.addEventListener('click', () => loginModal.classList.add('hidden'));
  if (cmsCloseBtn) cmsCloseBtn.addEventListener('click', closeCms);
  if (barOpenCmsBtn) barOpenCmsBtn.addEventListener('click', openCms);

  // Login Form Submission with Cryptographic Hash & Rate Limiting
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Check brute-force lockout
      const now = Date.now();
      if (lockoutTimestamp > now) {
        const remainingSeconds = Math.ceil((lockoutTimestamp - now) / 1000);
        const errMsg = document.getElementById('login-error-msg');
        if (errMsg) {
          errMsg.textContent = `Terlalu banyak percobaan salah. Silakan coba lagi dalam ${remainingSeconds} detik.`;
          errMsg.classList.remove('hidden');
        }
        return;
      }

      const enteredPin = document.getElementById('admin-pin-input').value.trim();
      const enteredHash = await computePinHash(enteredPin);
      const expectedHash = getStoredPinHash();

      if (enteredHash === expectedHash) {
        isAdminLoggedIn = true;
        failedLoginAttempts = 0;
        lockoutTimestamp = 0;
        if (loginModal) loginModal.classList.add('hidden');
        if (adminActiveBar) adminActiveBar.classList.remove('hidden');
        openCms();
        showToast('Verifikasi PIN berhasil! Mode Admin aktif.');
      } else {
        failedLoginAttempts++;
        const errMsg = document.getElementById('login-error-msg');
        if (failedLoginAttempts >= 5) {
          lockoutTimestamp = Date.now() + 30000; // 30 second cooldown
          if (errMsg) {
            errMsg.textContent = 'Terlalu banyak percobaan salah. Diblokir sementara selama 30 detik.';
            errMsg.classList.remove('hidden');
          }
        } else {
          if (errMsg) {
            errMsg.textContent = `PIN salah. Sisa percobaan: ${5 - failedLoginAttempts}`;
            errMsg.classList.remove('hidden');
          }
        }

        const pinInput = document.getElementById('admin-pin-input');
        if (pinInput) {
          pinInput.value = '';
          pinInput.focus();
        }
      }
    });
  }

  // Logout
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      isAdminLoggedIn = false;
      if (adminActiveBar) adminActiveBar.classList.add('hidden');
      closeCms();
      showToast('Anda telah keluar dari Mode Admin.');
    });
  }

  // Tab Switcher
  const tabButtons = document.querySelectorAll('.cms-tab-btn');
  const tabPanes = document.querySelectorAll('.cms-tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabButtons.forEach(b => {
        b.classList.remove('active', 'border-cyan-500', 'text-cyan-700', 'dark:text-cyan-300', 'bg-white', 'dark:bg-[#0c1424]', 'shadow-sm');
        b.classList.add('border-transparent', 'text-slate-500', 'dark:text-slate-400');
      });

      btn.classList.add('active', 'border-cyan-500', 'text-cyan-700', 'dark:text-cyan-300', 'bg-white', 'dark:bg-[#0c1424]', 'shadow-sm');
      btn.classList.remove('border-transparent', 'text-slate-500', 'dark:text-slate-400');

      tabPanes.forEach(pane => {
        if (pane.id === targetTab) {
          pane.classList.remove('hidden');
        } else {
          pane.classList.add('hidden');
        }
      });
    });
  });

  // Profile Form Save (with input trimming and safe URL check)
  const profileForm = document.getElementById('cms-profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawGh = document.getElementById('edit-profile-github') ? document.getElementById('edit-profile-github').value.trim() : '';
      const rawLi = document.getElementById('edit-profile-linkedin') ? document.getElementById('edit-profile-linkedin').value.trim() : '';

      appData.profile = {
        name: document.getElementById('edit-profile-name').value.trim(),
        role: document.getElementById('edit-profile-role').value.trim(),
        birthInfo: document.getElementById('edit-profile-birth').value.trim(),
        email: document.getElementById('edit-profile-email').value.trim(),
        phone: document.getElementById('edit-profile-phone').value.trim(),
        address: document.getElementById('edit-profile-address').value.trim(),
        linkedin: rawLi,
        linkedinUrl: sanitizeAdminUrl(rawLi) || 'https://www.linkedin.com/in/lutfiesap',
        github: appData.profile.github || 'Lutfi Esa Prasetyo',
        githubUrl: sanitizeAdminUrl(rawGh) || (appData.profile.githubUrl || 'https://github.com/Lutfiesa'),
        tagline: document.getElementById('edit-profile-tagline').value.trim(),
        about: document.getElementById('edit-profile-about').value.trim()
      };
      saveData();
      showToast('Informasi profil berhasil diperbarui!');
    });
  }

  // Modal Editor Form Submit
  const editorForm = document.getElementById('item-editor-form');
  if (editorForm) {
    editorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!currentEditorContext) return;

      const { entity, id } = currentEditorContext;

      if (entity === 'experience') {
        const company = document.getElementById('f-company').value.trim();
        const role = document.getElementById('f-role').value.trim();
        const period = document.getElementById('f-period').value.trim();
        const logo = document.getElementById('f-logo') ? sanitizeAdminUrl(document.getElementById('f-logo').value.trim()) : '';
        const respText = document.getElementById('f-responsibilities').value;
        const responsibilities = respText.split('\n').map(s => s.trim()).filter(Boolean);

        if (id) {
          const item = appData.experiences.find(x => x.id === id);
          if (item) {
            item.company = company;
            item.role = role;
            item.period = period;
            item.logo = logo || item.logo || '';
            item.responsibilities = responsibilities;
          }
        } else {
          appData.experiences.unshift({
            id: 'exp-' + Date.now(),
            company,
            role,
            period,
            logo,
            responsibilities
          });
        }
        showToast('Pengalaman kerja berhasil disimpan!');
      } 
      else if (entity === 'skill') {
        const category = document.getElementById('f-category').value.trim();
        const items = document.getElementById('f-items').value.split(',').map(s => s.trim()).filter(Boolean);

        if (id) {
          const item = appData.skills.find(x => x.id === id);
          if (item) {
            item.category = category;
            item.items = items;
          }
        } else {
          appData.skills.push({
            id: 'skill-' + Date.now(),
            category,
            items
          });
        }
        showToast('Kategori keahlian berhasil disimpan!');
      }
      else if (entity === 'education') {
        const level = document.getElementById('f-level').value.trim();
        const institution = document.getElementById('f-institution').value.trim();
        const period = document.getElementById('f-period').value.trim();
        const notes = document.getElementById('f-notes').value.trim() || '-';

        if (id) {
          const item = appData.education.find(x => x.id === id);
          if (item) {
            item.level = level;
            item.institution = institution;
            item.period = period;
            item.notes = notes;
          }
        } else {
          appData.education.unshift({
            id: 'edu-' + Date.now(),
            level,
            institution,
            period,
            notes
          });
        }
        showToast('Data pendidikan berhasil disimpan!');
      }
      else if (entity === 'certificate') {
        const name = document.getElementById('f-name').value.trim();
        const issuer = document.getElementById('f-issuer').value.trim();
        const link = sanitizeAdminUrl(document.getElementById('f-link').value.trim());

        if (id) {
          const item = appData.certificates.find(x => x.id === id);
          if (item) {
            item.name = name;
            item.issuer = issuer;
            item.link = link || item.link;
          }
        } else {
          appData.certificates.push({
            id: 'cert-' + Date.now(),
            name,
            issuer,
            link: link || '#'
          });
        }
        showToast('Sertifikat berhasil disimpan!');
      }

      saveData();
      closeItemEditor();
    });
  }

  const closeItemEditorBtn = document.getElementById('close-item-editor');
  const cancelItemEditorBtn = document.getElementById('cancel-item-editor');
  if (closeItemEditorBtn) closeItemEditorBtn.addEventListener('click', closeItemEditor);
  if (cancelItemEditorBtn) cancelItemEditorBtn.addEventListener('click', closeItemEditor);

  // Update PIN Form (Supports both cms-pin-form and legacy change-pin-form)
  const cmsPinForm = document.getElementById('cms-pin-form') || document.getElementById('change-pin-form');
  if (cmsPinForm) {
    cmsPinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPinInput = document.getElementById('cms-new-pin') || document.getElementById('new-pin-input');
      const newPin = newPinInput ? newPinInput.value.trim() : '';

      if (!/^\d{4,8}$/.test(newPin)) {
        alert('PIN baru harus berupa angka (4 hingga 8 digit).');
        return;
      }

      await setAdminPin(newPin);
      cmsPinForm.reset();
      showToast('PIN keamanan admin berhasil dienkripsi dan diperbarui!');
    });
  }

  // Reset to Default Reference Data Button (Supports both cms-reset-data-btn and legacy reset-default-btn)
  const resetBtn = document.getElementById('cms-reset-data-btn') || document.getElementById('reset-default-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('PERINGATAN: Seluruh perubahan kustom akan dikembalikan ke data awal sesuai portfolio-reference.md. Lanjutkan?')) {
        appData = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
        saveData();
        showToast('Data telah direset ke versi awal dokumen referensi.');
      }
    });
  }
}

// Initialize Admin when DOM is ready
document.addEventListener('DOMContentLoaded', initAdmin);
