import { profile, ui, projects } from './portfolio-data';
import { t, renderLangSwitcher, initLangSwitcher } from './i18n';

/** Satır içi (inline) SVG ikonlar — emoji yerine temiz, tek renkli çizgi ikonlar. */
export function icon(name: 'mail' | 'phone' | 'github' | 'linkedin' | 'pin', size = 15): string {
  const paths: Record<string, string> = {
    mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 7 9 6 9-6"/>',
    phone:
      '<path d="M21 16.9v2.6a2 2 0 0 1-2.2 2 19.6 19.6 0 0 1-8.5-3 19.3 19.3 0 0 1-6-6A19.6 19.6 0 0 1 1.3 4a2 2 0 0 1 2-2.2H6a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L7 9.3a16 16 0 0 0 6 6l1.2-1.1a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2.1Z"/>',
    github:
      '<path d="M9 19c-4.3 1.3-4.3-2.2-6-2.6m12 5v-3.5a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6a4.7 4.7 0 0 0-1.3-3.2 4.4 4.4 0 0 0-.1-3.3s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6.2 0C6.3 1.8 5.3 2.1 5.3 2.1a4.4 4.4 0 0 0-.1 3.3A4.7 4.7 0 0 0 3.9 8.6c0 4.7 2.8 5.7 5.5 6a3 3 0 0 0-.8 2.3V21"/>',
    linkedin:
      '<path d="M4 9h3v11H4zM5.5 4.2a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4zM10 9h2.9v1.5a3.3 3.3 0 0 1 3-1.6c3 0 3.6 2 3.6 4.5V20h-3v-5.1c0-1.2 0-2.7-1.7-2.7s-1.9 1.3-1.9 2.7V20h-3z"/>',
    pin: '<path d="M20 10.5c0 5.5-8 11.5-8 11.5s-8-6-8-11.5a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10.5" r="3"/>'
  };
  return `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}

export function header(active = '') {
  const item = (href: string, label: string, key: string) =>
    `<a ${active === key ? 'aria-current="page"' : ''} href="${href}">${label}</a>`;

  return `
    <header class="nav-wrap">
      <nav class="nav container">
        <a class="brand" href="/">AH<span>.</span></a>
        <div class="nav-links" id="nav-links">
          ${item('/projects.html', t(ui.nav.projects), 'projects')}
          ${item('/experience.html', t(ui.nav.experience), 'experience')}
          ${item('/about.html', t(ui.nav.about), 'about')}
          ${item('/contact.html', t(ui.nav.contact), 'contact')}
        </div>
        <div class="nav-right">
          ${renderLangSwitcher()}
          <a class="nav-social-link" href="${profile.githubUrl}" target="_blank" rel="noreferrer" title="GitHub">
            GitHub
          </a>
          <a class="nav-social-link" href="${profile.linkedinUrl}" target="_blank" rel="noreferrer" title="LinkedIn">
            LinkedIn
          </a>
          <a class="nav-cta" href="${profile.cvPdf}" target="_blank" rel="noreferrer">
            <span>${t(ui.nav.cvButton)}</span>
            <span class="icon">↗</span>
          </a>
          <button class="menu-button" aria-label="Menü" aria-expanded="false">
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>
    </header>
  `;
}

export function contactSection() {
  return `
    <section class="cta-section">
      <div class="container">
        <div class="cta-card">
          <div class="cta-content">
            <span class="eyebrow">${t(ui.cta.eyebrow)}</span>
            <h2>${t(ui.cta.title)}</h2>
            <p>${t(ui.cta.desc)}</p>
          </div>
          <div class="cta-actions">
            <a class="button primary" href="/contact.html">${t(ui.cta.contactBtn)}</a>
            <a class="button ghost" href="mailto:${profile.email}">${t(ui.cta.emailBtn)}</a>
            <a class="button secondary" href="tel:${profile.phoneRaw}">${t(ui.cta.callBtn)}</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function footer() {
  return `
    <footer class="footer container">
      <div class="footer-left">
        <span class="footer-name">${profile.name}</span>
        <span class="footer-copy">© ${new Date().getFullYear()} · ${t(profile.role)} · ${t(profile.location)}</span>
      </div>
      <div class="footer-links">
        <a href="${profile.githubUrl}" target="_blank" rel="noreferrer">GitHub ↗</a>
        <a href="${profile.linkedinUrl}" target="_blank" rel="noreferrer">LinkedIn ↗</a>
        <a href="mailto:${profile.email}">${t(ui.footer.email)} ↗</a>
        <a href="tel:${profile.phoneRaw}">${t(ui.footer.phone)} ↗</a>
      </div>
    </footer>
  `;
}

export function projectModalHtml() {
  return `
    <div id="project-modal" class="project-modal" aria-hidden="true" role="dialog">
      <div class="modal-dialog">
        <button class="modal-close" aria-label="${t(ui.modal.close)}">&times;</button>
        <div class="modal-body">
          <span class="project-card-type" id="modal-type">${t(ui.modal.defaultCategory)}</span>
          <h2 id="modal-title"></h2>
          <p class="modal-intro" id="modal-intro"></p>
          
          <div class="modal-block">
            <span class="eyebrow">${t(ui.projects.challengeLabel)}</span>
            <p id="modal-challenge"></p>
          </div>

          <div class="modal-block">
            <span class="eyebrow">${t(ui.projects.contributionsLabel)}</span>
            <ul class="contributions-list" id="modal-contributions"></ul>
          </div>

          <div class="modal-block">
            <span class="eyebrow">${t(ui.projects.stackLabel)}</span>
            <div class="project-card-stack" id="modal-stack"></div>
          </div>

          <div class="modal-footer">
            <a class="button primary" id="modal-repo-link" href="#" target="_blank" rel="noreferrer">
              ${t(ui.projects.githubView)} ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initProjectModal() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  document.querySelectorAll<HTMLElement>('[data-project-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-project-id');
      const p = projects.find(x => x.id === id);
      if (!p) return;

      const titleEl = modal.querySelector('#modal-title')!;
      const typeEl = modal.querySelector('#modal-type')!;
      const introEl = modal.querySelector('#modal-intro')!;
      const challengeEl = modal.querySelector('#modal-challenge')!;
      const contribEl = modal.querySelector('#modal-contributions')!;
      const stackEl = modal.querySelector('#modal-stack')!;
      const repoBtn = modal.querySelector<HTMLAnchorElement>('#modal-repo-link')!;

      titleEl.textContent = t(p.title);
      typeEl.textContent = t(p.type);
      introEl.textContent = t(p.intro) || t((p as any).description) || '';
      const contribs = t(p.contributions) || t((p as any).highlights) || [];
      const contribList: string[] = Array.isArray(contribs) ? contribs : [];
      contribEl.innerHTML = contribList.map((c: string) => `<li>${c}</li>`).join('');
      const pAny = p as any;
      const stackList = Array.isArray(pAny.stack) ? pAny.stack : Array.isArray(pAny.tags) ? pAny.tags : [];
      stackEl.innerHTML = stackList.map((s: string) => `<span>${s}</span>`).join('');
      const liveUrl = pAny.liveUrl || '';
      const githubUrl = pAny.githubUrl || '';
      const modalFooter = modal.querySelector<HTMLElement>('.modal-footer')!;
      let buttonsHtml = '';
      if (liveUrl) {
        buttonsHtml += `<a class="button primary" href="${liveUrl}" target="_blank" rel="noreferrer">Siteyə Git ↗</a>`;
      }
      if (githubUrl) {
        buttonsHtml += `<a class="button secondary" href="${githubUrl}" target="_blank" rel="noreferrer">GitHub Repo ↗</a>`;
      }
      if (!buttonsHtml) {
        buttonsHtml = `<a class="button primary" href="#" target="_blank" rel="noreferrer">Detail ↗</a>`;
      }
      modalFooter.innerHTML = buttonsHtml;

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  modal.querySelector('.modal-close')?.addEventListener('click', () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });
}

export function initNavigation(pageName = 'home') {
  const b = document.querySelector<HTMLButtonElement>('.menu-button');
  const n = document.querySelector<HTMLDivElement>('.nav-links');
  b?.addEventListener('click', () => {
    const o = b.getAttribute('aria-expanded') === 'true';
    b.setAttribute('aria-expanded', String(!o));
    n?.classList.toggle('open', !o);
  });

  // Set document title from data.json
  const metaObj = (ui as any)?.meta?.[pageName];
  if (metaObj?.title) {
    document.title = t(metaObj.title);
  }

  initLangSwitcher();
  initProjectModal();
}
