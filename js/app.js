/**
 * APP LOGIC & PUBLIC VIEW RENDERER
 * Lutfi Esa Prasetyo Portfolio Website (Cyan & Electric Blue Aesthetic)
 * Security Hardened: Input sanitization, safe URL schema checks, DOM XSS prevention.
 */

let appData = null;

/**
 * Security Utility: HTML Entity Escaping (Prevents DOM XSS)
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Security Utility: URL Protocol Sanitization (Blocks javascript: / vbscript: / data: URI attacks)
 */
function sanitizeUrl(url) {
  if (!url) return '#';
  const trimmed = String(url).trim();
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }
  return '#';
}

/**
 * Data Persistence with LocalStorage
 */
function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      appData = JSON.parse(saved);
      let dataChanged = false;
      // Sinkronisasi otomatis alamat default lama ke "DKI Jakarta"
      if (appData.profile && (appData.profile.address === "Harapan Mulya, Kemayoran, Jakarta Pusat" || !appData.profile.address)) {
        appData.profile.address = "DKI Jakarta";
        dataChanged = true;
      }
      // Sinkronisasi profil GitHub
      if (appData.profile) {
        if (!appData.profile.githubUrl) {
          appData.profile.githubUrl = DEFAULT_PORTFOLIO_DATA.profile.githubUrl;
          dataChanged = true;
        }
        if (!appData.profile.github || appData.profile.github === 'Lutfiesa' || appData.profile.github.startsWith('github.com/')) {
          appData.profile.github = 'Lutfi Esa Prasetyo';
          dataChanged = true;
        }
      }
      // Sinkronisasi logo default untuk pengalaman kerja
      if (Array.isArray(appData.experiences)) {
        appData.experiences.forEach(exp => {
          if (!exp.logo) {
            const def = DEFAULT_PORTFOLIO_DATA.experiences.find(d => d.id === exp.id || d.company === exp.company);
            if (def) {
              exp.logo = def.logo;
              exp.companyShort = def.companyShort;
              exp.brandColor = def.brandColor;
              dataChanged = true;
            }
          }
        });
      }
      // Sinkronisasi link sertifikat terbaru dari referensi
      if (Array.isArray(appData.certificates)) {
        appData.certificates.forEach(c => {
          if (c.id === 'cert-1' && c.link.includes('folders')) {
            c.link = "https://drive.google.com/file/d/149wTMGcNp6A0f52QRigRy1Kn2hVwPvEi/view?usp=sharing";
            dataChanged = true;
          }
          if (c.id === 'cert-5' && c.link.includes('UC-3cf92fc3-3b79-42b8-af9c-1d89107ceec2')) {
            c.link = "https://www.udemy.com/certificate/UC-80181f26-350d-4276-982a-58a636a9fc31/";
            dataChanged = true;
          }
        });
      }
      if (dataChanged) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
      }
    } catch(e) {
      console.error("Gagal membaca dari localStorage, fallback ke data referensi.", e);
      appData = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
    }
  } else {
    appData = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  renderAll();
  if (typeof renderCmsAll === 'function') {
    renderCmsAll();
  }
}

/**
 * Toast Notification System (Cyan / Blue Styled, XSS Escaped)
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClass = type === 'success' 
    ? 'bg-[#0a1426] border-cyan-500/40 text-cyan-200' 
    : 'bg-rose-950/90 border-rose-700/60 text-rose-200';
  
  toast.className = `p-4 rounded-xl border ${bgClass} shadow-xl shadow-black/50 text-xs font-semibold flex items-center justify-between gap-3 pointer-events-auto transition-all transform translate-y-2 opacity-0 backdrop-blur-md`;
  toast.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="${type === 'success' ? 'text-cyan-400' : 'text-rose-400'} font-bold">${type === 'success' ? '✓' : '✕'}</span>
      <span>${escapeHtml(message)}</span>
    </div>
  `;
  container.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * 1. Render Profile (Hero, About, & Contact info)
 */
function renderProfile() {
  const p = appData.profile;

  // Header & Hero (Using textContent to safely prevent XSS)
  const navBrandName = document.getElementById('nav-brand-name');
  if (navBrandName) navBrandName.textContent = p.name;
  
  const heroName = document.getElementById('hero-name');
  if (heroName) heroName.textContent = p.name;
  
  const heroRoleBadge = document.getElementById('hero-role-badge');
  if (heroRoleBadge) heroRoleBadge.textContent = p.statusBadge || 'Tersedia untuk Peran Baru • DKI Jakarta';

  const heroTagline = document.getElementById('hero-tagline');
  if (heroTagline) heroTagline.textContent = p.tagline;

  // Quick Contacts in Hero
  const heroEmailVal = document.getElementById('hero-email-val');
  const heroLinkEmail = document.getElementById('hero-link-email');
  if (heroEmailVal && heroLinkEmail) {
    heroEmailVal.textContent = p.email;
    heroLinkEmail.href = sanitizeUrl(`mailto:${p.email}`);
  }

  const heroPhoneVal = document.getElementById('hero-phone-val');
  const heroLinkPhone = document.getElementById('hero-link-phone');
  if (heroPhoneVal && heroLinkPhone) {
    heroPhoneVal.textContent = p.phone;
    heroLinkPhone.href = sanitizeUrl(`tel:${p.phone.replace(/[^0-9]/g, '')}`);
  }

  const heroLinkedinVal = document.getElementById('hero-linkedin-val');
  const heroLinkLinkedin = document.getElementById('hero-link-linkedin');
  if (heroLinkedinVal && heroLinkLinkedin) {
    heroLinkedinVal.textContent = p.linkedin.replace(/^https?:\/\/(www\.)?/, '');
    const lUrl = p.linkedinUrl.startsWith('http') ? p.linkedinUrl : `https://${p.linkedinUrl}`;
    heroLinkLinkedin.href = sanitizeUrl(lUrl);
  }

  // GitHub in Hero
  const heroGithubVal = document.getElementById('hero-github-val');
  const heroLinkGithub = document.getElementById('hero-link-github');
  if (heroGithubVal && heroLinkGithub) {
    const ghUrl = p.githubUrl || 'https://github.com/Lutfiesa';
    let ghDisplay = p.github || 'Lutfi Esa Prasetyo';
    ghDisplay = ghDisplay.replace(/^https?:\/\/github\.com\//, '').replace(/^github\.com\//, '');
    heroGithubVal.textContent = ghDisplay;
    const finalGh = ghUrl.startsWith('http') ? ghUrl : `https://${ghUrl}`;
    heroLinkGithub.href = sanitizeUrl(finalGh);
  }

  // 2. About Section
  const aboutName = document.getElementById('about-name');
  if (aboutName) aboutName.textContent = p.name;

  const aboutBirth = document.getElementById('about-birth');
  if (aboutBirth) aboutBirth.textContent = p.birthInfo;

  const aboutAddrEl = document.getElementById('about-address');
  if (aboutAddrEl) aboutAddrEl.textContent = p.address;

  const aboutRole = document.getElementById('about-role');
  if (aboutRole) aboutRole.textContent = p.role;

  const aboutLinkEmail = document.getElementById('about-link-email');
  if (aboutLinkEmail) {
    aboutLinkEmail.textContent = p.email;
    aboutLinkEmail.href = sanitizeUrl(`mailto:${p.email}`);
  }

  const aboutLinkPhone = document.getElementById('about-link-phone');
  if (aboutLinkPhone) {
    aboutLinkPhone.textContent = p.phone;
    aboutLinkPhone.href = sanitizeUrl(`tel:${p.phone.replace(/[^0-9]/g, '')}`);
  }

  const aboutBioText = document.getElementById('about-bio-text');
  if (aboutBioText) aboutBioText.textContent = p.about || p.tagline;

  // 7. Footer & Contact
  const footerEmail = document.getElementById('footer-email');
  const contactEmailCard = document.getElementById('contact-email-card');
  if (footerEmail && contactEmailCard) {
    footerEmail.textContent = p.email;
    contactEmailCard.href = sanitizeUrl(`mailto:${p.email}`);
  }

  const footerPhone = document.getElementById('footer-phone');
  const contactWaCard = document.getElementById('contact-wa-card');
  if (footerPhone && contactWaCard) {
    footerPhone.textContent = p.phone;
    contactWaCard.href = sanitizeUrl(`https://wa.me/62${p.phone.replace(/^0/, '')}`);
  }

  const contactLinkedinCard = document.getElementById('contact-linkedin-card');
  if (contactLinkedinCard) {
    const lUrl = p.linkedinUrl.startsWith('http') ? p.linkedinUrl : `https://${p.linkedinUrl}`;
    contactLinkedinCard.href = sanitizeUrl(lUrl);
  }

  const footerAddress = document.getElementById('footer-address');
  if (footerAddress) footerAddress.textContent = p.address;

  // GitHub in Footer
  const footerGithub = document.getElementById('footer-github');
  const contactGithubCard = document.getElementById('contact-github-card');
  if (footerGithub && contactGithubCard) {
    const ghUrl = p.githubUrl || 'https://github.com/Lutfiesa';
    let ghDisplay = p.github || 'Lutfi Esa Prasetyo';
    ghDisplay = ghDisplay.replace(/^https?:\/\/github\.com\//, '').replace(/^github\.com\//, '');
    footerGithub.textContent = ghDisplay;
    const finalGh = ghUrl.startsWith('http') ? ghUrl : `https://${ghUrl}`;
    contactGithubCard.href = sanitizeUrl(finalGh);
  }
}

/**
 * Helper: Company Logo / Avatar Badge (HTML Escaped)
 */
function getCompanyLogoHtml(exp) {
  const shortName = escapeHtml(exp.companyShort || exp.company.replace(/^(PT\.?\s*)/i, '').slice(0, 3).toUpperCase());
  const brandColor = escapeHtml(exp.brandColor || '#0284c7');
  const logoUrl = exp.logo ? sanitizeUrl(exp.logo) : '';

  if (logoUrl && logoUrl !== '#') {
    return `
      <div class="w-12 h-12 rounded-xl bg-white dark:bg-[#070c14] border border-slate-300/80 dark:border-cyan-500/20 flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-sm relative group/logo">
        <img src="${logoUrl}" 
             alt="${escapeHtml(exp.company)} Logo" 
             loading="lazy" 
             width="48"
             height="48"
             class="w-full h-full object-contain transition-transform group-hover/logo:scale-110" 
             onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');" />
        <div class="hidden w-full h-full flex items-center justify-center rounded-lg text-white font-extrabold text-xs tracking-wider" style="background-color: ${brandColor}">
          ${shortName}
        </div>
      </div>
    `;
  }

  return `
    <div class="w-12 h-12 rounded-xl border border-slate-300/80 dark:border-cyan-500/20 flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-sm text-white font-extrabold text-xs tracking-wider" style="background-color: ${brandColor}">
      ${shortName}
    </div>
  `;
}

/**
 * 3. Render Experience (Timeline) - XSS Sanitized
 */
function renderExperience() {
  const container = document.getElementById('experience-list');
  if (!container) return;
  container.innerHTML = '';

  appData.experiences.forEach((exp) => {
    const item = document.createElement('div');
    item.className = 'relative pl-10 sm:pl-16 group';

    const bulletsHtml = exp.responsibilities.map(resp => `
      <li class="flex items-start gap-2.5 text-slate-800 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
        <span class="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 mt-2 shrink-0"></span>
        <span>${escapeHtml(resp)}</span>
      </li>
    `).join('');

    item.innerHTML = `
      <!-- Milestone Marker Dot -->
      <div class="absolute left-4 sm:left-8 -translate-x-1/2 top-1.5 w-4 h-4 rounded-full bg-white dark:bg-[#070c14] border-2 border-cyan-600 dark:border-cyan-500 group-hover:scale-125 group-hover:bg-cyan-500 transition-all shadow-md shadow-cyan-500/40"></div>

      <!-- Card Content -->
      <div class="theme-card p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0c1424]/80 border border-slate-300/80 dark:border-cyan-500/20 hover:border-cyan-500/50 transition-all shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-3.5">
            ${getCompanyLogoHtml(exp)}
            <div>
              <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-snug">${escapeHtml(exp.company)}</h3>
              <div class="text-xs sm:text-sm font-bold text-cyan-700 dark:text-cyan-400">${escapeHtml(exp.role)}</div>
            </div>
          </div>
          <span class="inline-flex self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#101b30] text-slate-800 dark:text-cyan-300 border border-slate-300 dark:border-cyan-500/20 shrink-0">
            ${escapeHtml(exp.period)}
          </span>
        </div>

        <ul class="space-y-2 mt-4 pt-3 border-t border-slate-200 dark:border-cyan-500/10">
          ${bulletsHtml}
        </ul>
      </div>
    `;
    container.appendChild(item);
  });
}

/**
 * 4. Render Skills - XSS Sanitized
 */
function renderSkills() {
  const container = document.getElementById('skills-grid');
  if (!container) return;
  container.innerHTML = '';

  appData.skills.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'theme-card p-5 rounded-2xl bg-white dark:bg-[#0c1424]/80 border border-slate-300/80 dark:border-cyan-500/20 hover:border-cyan-500/45 transition-all flex flex-col justify-between shadow-sm';

    const tagsHtml = cat.items.map(skill => `
      <span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#101c33] text-slate-800 dark:text-cyan-300 border border-slate-300/80 dark:border-cyan-500/20">
        ${escapeHtml(skill)}
      </span>
    `).join('');

    card.innerHTML = `
      <div>
        <div class="flex items-center gap-2 mb-3.5">
          <span class="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-500 shadow-sm shadow-cyan-500/50"></span>
          <h3 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">${escapeHtml(cat.category)}</h3>
        </div>
        <div class="flex flex-wrap gap-1.5">
          ${tagsHtml}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

/**
 * 5. Render Education - XSS Sanitized
 */
function renderEducation() {
  const container = document.getElementById('education-grid');
  if (!container) return;
  container.innerHTML = '';

  appData.education.forEach(edu => {
    const card = document.createElement('div');
    card.className = 'theme-card p-6 rounded-2xl bg-white dark:bg-[#0c1424]/80 border border-slate-300/80 dark:border-cyan-500/20 hover:border-cyan-500/45 transition-all flex flex-col justify-between shadow-sm';
    
    card.innerHTML = `
      <div>
        <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center mb-4">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 14l9-5-9-5-9 5 9 5z"/>
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
          </svg>
        </div>
        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-[#101c33] text-slate-800 dark:text-cyan-300 border border-slate-300 dark:border-cyan-500/20 mb-2 inline-block">
          ${escapeHtml(edu.period)}
        </span>
        <h3 class="text-base font-bold text-slate-900 dark:text-white mt-1">${escapeHtml(edu.level)}</h3>
        <p class="text-xs sm:text-sm text-cyan-700 dark:text-cyan-400 font-bold mt-1">${escapeHtml(edu.institution)}</p>
      </div>
      ${edu.notes && edu.notes !== '-' ? `<div class="mt-4 pt-3 border-t border-slate-200 dark:border-cyan-500/10 text-xs text-slate-600 dark:text-slate-400">${escapeHtml(edu.notes)}</div>` : ''}
    `;
    container.appendChild(card);
  });
}

/**
 * 6. Render Certificates - XSS & Safe URL Sanitized
 */
function renderCertificates() {
  const container = document.getElementById('certificates-grid');
  if (!container) return;
  container.innerHTML = '';

  appData.certificates.forEach(cert => {
    const card = document.createElement('div');
    card.className = 'theme-card p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0c1424]/80 border border-slate-300/80 dark:border-cyan-500/20 hover:border-cyan-500/45 transition-all flex flex-col justify-between group shadow-sm';

    const safeCertLink = sanitizeUrl(cert.link);

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 dark:bg-[#0f213d] text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30">
            ${escapeHtml(cert.issuer || 'Sertifikasi')}
          </span>
          <svg class="w-5 h-5 text-slate-400 dark:text-cyan-500/60 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        </div>
        <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
          ${escapeHtml(cert.name)}
        </h3>
      </div>

      <div class="mt-5 pt-4 border-t border-slate-200 dark:border-cyan-500/10">
        <a href="${safeCertLink}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 group-hover:underline">
          <span>Lihat Sertifikat</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        </a>
      </div>
    `;
    container.appendChild(card);
  });
}

/**
 * Re-render all public sections
 */
function renderAll() {
  renderProfile();
  renderExperience();
  renderSkills();
  renderEducation();
  renderCertificates();
}

/**
 * Theme Manager (Dark / Light)
 */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const sunIcon = document.getElementById('theme-icon-sun');
  const moonIcon = document.getElementById('theme-icon-moon');

  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add('dark');
      if (moonIcon) moonIcon.classList.add('hidden');
      if (sunIcon) sunIcon.classList.remove('hidden');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      if (moonIcon) moonIcon.classList.remove('hidden');
      if (sunIcon) sunIcon.classList.add('hidden');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }

  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme === 'light' ? false : true);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isCurrentlyDark = document.documentElement.classList.contains('dark');
      applyTheme(!isCurrentlyDark);
    });
  }
}

/**
 * Mobile Navigation Toggle
 */
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }
}

/**
 * Quick Contact Form Triggers (WhatsApp & Email with noopener,noreferrer defense)
 */
function initContactForm() {
  const sendWaBtn = document.getElementById('send-wa-btn');
  const sendEmailBtn = document.getElementById('send-email-btn');

  if (sendWaBtn) {
    sendWaBtn.addEventListener('click', () => {
      const senderInput = document.getElementById('quick-msg-sender');
      const textInput = document.getElementById('quick-msg-text');
      const sender = (senderInput && senderInput.value.trim()) || 'Pengunjung Website';
      const text = (textInput && textInput.value.trim()) || '';
      if (!text) {
        alert('Silakan tuliskan pesan terlebih dahulu.');
        return;
      }
      const phoneDigits = appData.profile.phone.replace(/[^0-9]/g, '').replace(/^0/, '62');
      const encodedMsg = encodeURIComponent(`Halo Mas Lutfi, saya ${sender}.\n\n${text}`);
      const waUrl = `https://wa.me/${phoneDigits}?text=${encodedMsg}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  if (sendEmailBtn) {
    sendEmailBtn.addEventListener('click', () => {
      const senderInput = document.getElementById('quick-msg-sender');
      const textInput = document.getElementById('quick-msg-text');
      const sender = (senderInput && senderInput.value.trim()) || 'Pengunjung Website';
      const text = (textInput && textInput.value.trim()) || '';
      if (!text) {
        alert('Silakan tuliskan pesan terlebih dahulu.');
        return;
      }
      const subject = encodeURIComponent(`Pesan dari Portofolio oleh ${sender}`);
      const body = encodeURIComponent(`Pengirim: ${sender}\n\nPesan:\n${text}`);
      window.location.href = sanitizeUrl(`mailto:${appData.profile.email}?subject=${subject}&body=${body}`);
    });
  }
}

// App Entry Point
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderAll();
  initTheme();
  initMobileMenu();
  initContactForm();
});
