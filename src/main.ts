import './styles.css';
import { profile, ui, metrics, focusAreas, experiences, skillCategories, projects, educations, languages, loadData } from './portfolio-data';
import { t } from './i18n';
import { header, footer, contactSection, projectModalHtml, initNavigation, icon } from './shared';

const app = document.querySelector<HTMLDivElement>('#app')!;

function render() {
  // Başlığın son kelimesini aksan rengiyle vurgulamak için ayır
  const titleWords = String(t(profile.title)).trim().split(' ');
  const titleTail = titleWords.length > 1 ? titleWords.pop()! : '';
  const titleHead = titleWords.join(' ');

  app.innerHTML = `
  ${header('home')}
  <main>
    <!-- ============================ HERO ============================ -->
    <section class="hero">
      <div class="container">
        <div class="hero-topline">
          <span class="hero-index">Portfolio — ${new Date().getFullYear()}</span>
          <span class="hero-avail"><span class="status-dot"></span>${t(profile.status)}</span>
        </div>

        <div class="hero-main">
          <div class="hero-copy">
            <h1 class="hero-display">${titleHead} <em>${titleTail}</em></h1>
            <p class="hero-sub">${t(profile.summary)}</p>

            <div class="hero-cta">
              <a class="button primary" href="/projects.html">${t(ui.hero.viewProjects)} <span>↗</span></a>
              <a class="button secondary" href="/contact.html">${t(ui.hero.contactMe)} <span>↗</span></a>
              <a class="button ghost" href="${profile.cvPdf}" target="_blank" rel="noreferrer">${t(ui.hero.downloadCv)}</a>
            </div>
          </div>

          <aside class="hero-portrait">
            <img src="${profile.avatar}" alt="${profile.name}" />
            <div class="portrait-meta">
              <div>
                <strong>${profile.name}</strong>
                <span>${t(profile.role)}</span>
              </div>
              <span class="portrait-pin">${icon('pin', 14)} ${t(profile.location)}</span>
            </div>
          </aside>
        </div>

        <ul class="hero-contacts">
          <li><a href="mailto:${profile.email}" title="${t(ui.contact.emailLabel)}">${icon('mail')}<span>${profile.email}</span></a></li>
          <li><a href="tel:${profile.phoneRaw}" title="${t(ui.contact.phoneLabel)}">${icon('phone')}<span>${profile.phone}</span></a></li>
          <li><a href="${profile.githubUrl}" target="_blank" rel="noreferrer">${icon('github')}<span>GitHub</span></a></li>
          <li><a href="${profile.linkedinUrl}" target="_blank" rel="noreferrer">${icon('linkedin')}<span>LinkedIn</span></a></li>
        </ul>
      </div>
    </section>

    <!-- ============================ SELECTED WORK ============================ -->
    <section class="section section-alt">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="eyebrow">${t(ui.sections.featuredProjectsEyebrow)}</span>
            <h2>${t(ui.sections.featuredProjectsTitle)}</h2>
          </div>
          <a class="text-link" href="/projects.html">${t(ui.sections.allProjectsLink)} (${projects.length}) <span>↗</span></a>
        </div>

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
            const pAny = p as any;
            const liveUrl = pAny.liveUrl || '';
            const githubUrl = pAny.githubUrl || '';
            const mainLink = liveUrl || githubUrl || '#';
            const linkLabel = liveUrl ? 'Site' : 'GitHub';
            return `
            <article class="project-card" data-category="${p.category || 'all'}">
              <div class="project-card-media" role="button" data-project-id="${p.id}" tabindex="0">
                <img src="${p.image}" alt="${t(p.title)}" loading="lazy">
                <span class="project-card-type">${t(p.type)}</span>
              </div>
              <div class="project-card-copy">
                <div class="project-card-meta">
                  <span class="project-card-num">${num}</span>
                  <a class="project-github-pill" href="${mainLink}" target="_blank" rel="noreferrer" title="${linkLabel}">
                    <span>${linkLabel}</span> ↗
                  </a>
                </div>
                <h2><a href="javascript:void(0)" data-project-id="${p.id}">${t(p.title)}</a></h2>
                <div class="project-card-stack">
                  ${(p.stack || pAny.tags || []).slice(0, 3).map((s: string) => `<span>${s}</span>`).join('')}
                </div>
                <div class="project-card-footer">
                  <button class="card-detail-btn" type="button" data-project-id="${p.id}">
                    <span>${t(ui.projects.detailBtn)}</span>
                    <span class="arrow-move">→</span>
                  </button>
                  <a class="card-repo-btn" href="${mainLink}" target="_blank" rel="noreferrer">
                    ${linkLabel} ↗
                  </a>
                </div>
              </div>
            </article>
          `;
          }).join('')}
        </div>
      </div>
    </section>

    <!-- ============================ EXPERIENCE ============================ -->
    <section class="section container">
      <div class="section-head">
        <div>
          <span class="eyebrow">${t(ui.sections.experienceEyebrow)}</span>
          <h2>${t(ui.sections.experienceTitle)}</h2>
        </div>
        <a class="text-link" href="/experience.html">${t(ui.sections.allExperienceLink)} <span>↗</span></a>
      </div>

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

    <!-- ============================ SKILLS ============================ -->
    <section class="section section-alt">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="eyebrow">${t(ui.sections.skillsEyebrow)}</span>
            <h2>${t(ui.sections.skillsTitle)}</h2>
          </div>
          <a class="text-link" href="/about.html">${t(ui.sections.aboutLink)} <span>↗</span></a>
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
    </section>

    <!-- ============================ EDUCATION & LANGUAGES ============================ -->
    <section class="section container">
      <div class="section-head">
        <div>
          <span class="eyebrow">${t(ui.sections.academicEyebrow)}</span>
          <h2>${t(ui.sections.academicTitle)}</h2>
        </div>
        <a class="text-link" href="/about.html">${t(ui.sections.aboutLink)} <span>↗</span></a>
      </div>

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

    <!-- ============================ CALL TO ACTION ============================ -->
    ${contactSection()}

    <!-- ============================ PROJECT MODAL ============================ -->
    ${projectModalHtml()}
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

  initNavigation('home');
}

// Instant initial render; async update when live API data resolves
render();
loadData().then(() => {
  render();
});

