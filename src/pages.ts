import './styles.css';
import { profile, ui, metrics, experiences, projects, focusAreas, skillCategories, educations, languages, loadData } from './portfolio-data';
import { t } from './i18n';
import { footer, header, contactSection, projectModalHtml, initNavigation, icon } from './shared';

const app = document.querySelector<HTMLDivElement>('#app')!;
const page = document.body.dataset.page || 'projects';

const pageHero = (eyebrow: string, title: string, lead: string) => `
  <section class="page-hero container">
    <span class="eyebrow">${eyebrow}</span>
    <h1>${title}</h1>
    <p class="page-lead">${lead}</p>
  </section>
`;

function render() {
if (page === 'projects') {
  app.innerHTML = `
    ${header('projects')}
    <main>
      ${pageHero(
        t(ui.projects.eyebrow),
        t(ui.projects.title),
        t(ui.projects.lead)
      )}
      
      <section class="container project-grid-wrap">
        <div class="project-filter-bar">
          <button class="filter-btn active" data-filter="all">${t(ui.projects.categories.all)} (${projects.length})</button>
          <button class="filter-btn" data-filter="backend">${t(ui.projects.categories.backend)}</button>
          <button class="filter-btn" data-filter="dotnet">${t(ui.projects.categories.dotnet)}</button>
          <button class="filter-btn" data-filter="go">${t(ui.projects.categories.go)}</button>
          <button class="filter-btn" data-filter="ecommerce">${t(ui.projects.categories.ecommerce)}</button>
          <button class="filter-btn" data-filter="enterprise">${t(ui.projects.categories.enterprise)}</button>
          <button class="filter-btn" data-filter="tools">${t(ui.projects.categories.tools)}</button>
        </div>

        <div class="project-card-grid">
          ${projects.map((p, i) => {
            const num = (i + 1) < 10 ? `0${i + 1}` : `${i + 1}`;
            const githubUrl = (p as any).githubUrl || '';
            const liveUrl = (p as any).liveUrl || '';
            const isGithub = githubUrl.includes('github.com');
            const link = isGithub ? githubUrl : (liveUrl || githubUrl);
            const linkLabel = isGithub ? 'GitHub' : (t(ui.projects.visitSite) || 'Site');
            return `
            <article class="project-card" data-category="${p.category || 'all'}">
              <div class="project-card-media" role="button" data-project-id="${p.id}" tabindex="0">
                <img src="${p.image}" alt="${t(p.title)}" loading="lazy">
                <span class="project-card-type">${t(p.type)}</span>
              </div>
              <div class="project-card-copy">
                <div class="project-card-meta">
                  <span class="project-card-num">${num}</span>
                  <a class="project-github-pill" href="${link}" target="_blank" rel="noreferrer" title="${linkLabel}">
                    <span>${linkLabel}</span> ↗
                  </a>
                </div>
                <h2><a href="javascript:void(0)" data-project-id="${p.id}">${t(p.title)}</a></h2>
                <p>${t(p.intro) || t((p as any).description)}</p>
                <div class="project-card-stack">
                  ${(p.stack || (p as any).tags || []).slice(0, 3).map((s: string) => `<span>${s}</span>`).join('')}
                </div>
                <div class="project-card-footer">
                  <button class="card-detail-btn" type="button" data-project-id="${p.id}">
                    <span>${t(ui.projects.detailBtn)}</span>
                    <span class="arrow-move">→</span>
                  </button>
                  <a class="card-repo-btn" href="${link}" target="_blank" rel="noreferrer">
                    ${isGithub ? t(ui.projects.repoBtn) : (t(ui.projects.visitSite) || 'Site')} ↗
                  </a>
                </div>
              </div>
            </article>
          `;
          }).join('')}
        </div>
      </section>

      <!-- DYNAMIC PROJECT DETAIL MODAL (From data.json) -->
      ${projectModalHtml()}
      
      ${contactSection()}
    </main>
    ${footer()}
  `;

  // Project Category Filter Handler
  document.querySelectorAll<HTMLButtonElement>('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      document.querySelectorAll<HTMLElement>('.project-card').forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
} else if (page === 'experience') {
  app.innerHTML = `
    ${header('experience')}
    <main>
      ${pageHero(
        t(ui.experience.eyebrow),
        t(ui.experience.title),
        t(ui.experience.lead)
      )}
      
      <section class="container experience-detail-section">
        <div class="experience-detail-list">
          ${experiences.map(e => {
            const rawDetails = t(e.details) || t((e as any).achievements) || [];
            const detailsList: string[] = Array.isArray(rawDetails) ? rawDetails : [];
            const stackList: string[] = Array.isArray(e.stack) ? e.stack : Array.isArray((e as any).technologies) ? (e as any).technologies : [];
            const summaryText = t(e.summary) || t((e as any).description) || '';

            return `
            <article class="exp-detail-card">
              <div class="exp-detail-sidebar">
                <time class="exp-detail-period">${t(e.period)}</time>
                <span class="exp-detail-role">${t(e.role)}</span>
              </div>
              <div class="exp-detail-content">
                <div class="exp-detail-top">
                  <h2>${e.company}</h2>
                  <p class="exp-detail-summary">${summaryText}</p>
                </div>
                
                ${detailsList.length > 0 ? `
                <div class="exp-detail-points">
                  <span class="points-label">${t(ui.sections.responsibilitiesLabel)}</span>
                  <ul>
                    ${detailsList.map(d => `<li>${d}</li>`).join('')}
                  </ul>
                </div>
                ` : ''}

                ${stackList.length > 0 ? `
                <div class="exp-detail-stack">
                  ${stackList.map(s => `<span>${s}</span>`).join('')}
                </div>
                ` : ''}
              </div>
            </article>
          `;
          }).join('')}
        </div>
      </section>

      ${contactSection()}
    </main>
    ${footer()}
  `;
} else if (page === 'about') {
  app.innerHTML = `
    ${header('about')}
    <main>
      ${pageHero(
        t(ui.about.eyebrow),
        t(ui.about.title),
        t(ui.about.lead)
      )}

      <section class="container about-section">
        <!-- ABOUT PROFILE INTRO WITH AVATAR -->
        <div class="about-intro-card">
          <div class="intro-headline">
            <div class="about-avatar-row">
              <img src="${profile.avatar}" alt="${profile.name}" class="about-avatar-sm" />
              <div>
                <h2>${profile.name}</h2>
                <span class="about-role-tag">${t(profile.role)}</span>
              </div>
            </div>
            <div class="about-quick-meta">
              <span>${icon('pin')} ${t(profile.location)}</span>
              <span>${icon('phone')} ${profile.phone}</span>
              <span>${icon('mail')} ${profile.email}</span>
            </div>
          </div>
          <div class="intro-text">
            <span class="eyebrow">${t(ui.about.summaryHeading)}</span>
            <p>${t(profile.summary)}</p>
          </div>
        </div>

        <!-- HIGHLIGHTS / QUICK METRICS (Identical to home page, from data.json) -->
        <div class="metrics-grid" style="margin: 36px 0; border: none; padding: 0;">
          ${metrics.map(m => `
            <div class="metric-card">
              <span class="metric-num">${m.num}</span>
              <span class="metric-title">${t(m.title)}</span>
              <span class="metric-desc">${t(m.desc)}</span>
            </div>
          `).join('')}
        </div>

        <!-- 4 FOCUS AREAS (From data.json) -->
        <div class="focus-grid">
          ${focusAreas.map(fa => `
            <div class="focus-card">
              <span class="focus-icon">${fa.icon}</span>
              <h3>${t(fa.title)}</h3>
              <p>${t(fa.desc)}</p>
            </div>
          `).join('')}
        </div>

        <!-- TECHNICAL SKILLS (From data.json) -->
        <div class="about-skills-block">
          <div class="block-head">
            <span class="eyebrow">${t(ui.sections.skillsEyebrow)}</span>
            <h2>${t(ui.about.skillsHeading)}</h2>
          </div>
          <div class="skill-category-grid">
            ${skillCategories.map(cat => `
              <div class="skill-category-card">
                <h3>${t(cat.name)}</h3>
                <div class="skill-pills">
                  ${cat.skills.map(s => `<span>${s}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- ALL 5 EDUCATION ENTRIES + LANGUAGES (Identical to home page, from data.json) -->
        <div class="credentials-grid">
          <div class="credential-card">
            <span class="eyebrow">${t(ui.about.educationHeading)}</span>
            ${educations.map(ed => `
              <div class="cred-item">
                <h3>${t(ed.degree)}</h3>
                <p><strong>${ed.institution}</strong> · <span>${ed.period}</span> (${t(ed.status)})</p>
              </div>
            `).join('')}
          </div>

          <div class="credential-card">
            <span class="eyebrow">${t(ui.about.languagesHeading)}</span>
            <div class="language-list">
              ${languages.map(l => `
                <div class="lang-row">
                  <div>
                    <strong>${t(l.name)}</strong>
                    <span class="badge-sub">${t(l.badge)}</span>
                  </div>
                  <strong class="lang-level">${l.level}</strong>
                </div>
              `).join('')}
            </div>

            <div class="location-badge" style="margin-top: 28px;">
              <span class="status-dot"></span>
              <span><strong>${t(ui.about.locationLabel)}</strong> ${t(profile.location)} · ${t(ui.contact.statusDesc)}</span>
            </div>
          </div>
        </div>
      </section>

      ${contactSection()}
    </main>
    ${footer()}
  `;
} else if (page === 'contact') {
  app.innerHTML = `
    ${header('contact')}
    <main>
      ${pageHero(
        t(ui.contact.eyebrow),
        t(ui.contact.title),
        t(ui.contact.lead)
      )}

      <section class="container contact-page-section">
        <div class="contact-cards-grid">
          <a class="contact-card" href="mailto:${profile.email}?subject=${encodeURIComponent(t(ui.contact.emailSubject))}">
            <div class="contact-card-top">
              <span class="contact-tag">${t(ui.contact.emailLabel)}</span>
              <span class="contact-arrow">↗</span>
            </div>
            <h3>${profile.email}</h3>
            <p>${t(ui.contact.emailSub)}</p>
          </a>

          <a class="contact-card" href="tel:${profile.phoneRaw}">
            <div class="contact-card-top">
              <span class="contact-tag">${t(ui.contact.phoneLabel)}</span>
              <span class="contact-arrow">↗</span>
            </div>
            <h3>${profile.phone}</h3>
            <p>${t(ui.contact.phoneSub)}</p>
          </a>

          <a class="contact-card" href="${profile.githubUrl}" target="_blank" rel="noreferrer">
            <div class="contact-card-top">
              <span class="contact-tag">GitHub</span>
              <span class="contact-arrow">↗</span>
            </div>
            <h3>github.com/${profile.github}</h3>
            <p>${t(ui.contact.githubSub)}</p>
          </a>

          <a class="contact-card" href="${profile.linkedinUrl}" target="_blank" rel="noreferrer">
            <div class="contact-card-top">
              <span class="contact-tag">LinkedIn</span>
              <span class="contact-arrow">↗</span>
            </div>
            <h3>${profile.linkedin}</h3>
            <p>${t(ui.contact.linkedinSub)}</p>
          </a>

          <a class="contact-card" href="${profile.cvPdf}" target="_blank" rel="noreferrer">
            <div class="contact-card-top">
              <span class="contact-tag">${t(ui.nav.cvButton)}</span>
              <span class="contact-arrow">↗</span>
            </div>
            <h3>${t(ui.nav.cvButton)}</h3>
            <p>${t(ui.contact.cvSub)}</p>
          </a>

          <div class="contact-card">
            <div class="contact-card-top">
              <span class="contact-tag">${t(ui.about.locationLabel)}</span>
            </div>
            <h3>${t(profile.location)}</h3>
            <p>${t(ui.contact.locationSub)}</p>
          </div>
        </div>

        <div class="contact-status-box">
          <div class="status-box-content">
            <span class="status-dot"></span>
            <div>
              <h4>${t(ui.contact.statusHeading)}</h4>
              <p>${t(ui.contact.statusDesc)}</p>
            </div>
          </div>
          <a class="button primary" href="mailto:${profile.email}">${t(ui.contact.startEmailBtn)}</a>
        </div>
      </section>
    </main>
    ${footer()}
  `;
}

initNavigation(page);
}

// Canlı veriyi çek, sonra render et (admin panel değişiklikleri anında yansısın).
(async () => {
  await loadData();
  render();
})();
