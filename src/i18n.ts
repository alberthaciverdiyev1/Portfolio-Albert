export type Lang = 'az' | 'en' | 'tr';

const STORAGE_KEY = 'portfolio_lang';
const DEFAULT_LANG: Lang = 'az';

export function getLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY) as Lang;
  if (saved && ['az', 'en', 'tr'].includes(saved)) {
    return saved;
  }
  const nav = navigator.language.toLowerCase();
  if (nav.startsWith('az')) return 'az';
  if (nav.startsWith('tr')) return 'tr';
  if (nav.startsWith('en')) return 'en';
  return DEFAULT_LANG;
}

export function setLang(lang: Lang) {
  if (['az', 'en', 'tr'].includes(lang)) {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }
}

export function t<T>(obj: Record<Lang, T> | T | undefined): T {
  if (!obj) return '' as unknown as T;
  if (typeof obj === 'object' && obj !== null && ('az' in obj || 'en' in obj || 'tr' in obj)) {
    const lang = getLang();
    const map = obj as Record<Lang, T>;
    return map[lang] ?? map['en'] ?? map['az'] ?? map['tr'];
  }
  return obj as T;
}

export function renderLangSwitcher(): string {
  const current = getLang();
  return `
    <div class="lang-switcher" role="group" aria-label="Language Selector">
      <button class="lang-btn ${current === 'az' ? 'active' : ''}" data-set-lang="az">AZ</button>
      <button class="lang-btn ${current === 'en' ? 'active' : ''}" data-set-lang="en">EN</button>
      <button class="lang-btn ${current === 'tr' ? 'active' : ''}" data-set-lang="tr">TR</button>
    </div>
  `;
}

export function initLangSwitcher(onLangChange?: () => void) {
  document.querySelectorAll<HTMLButtonElement>('[data-set-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetLang = btn.getAttribute('data-set-lang') as Lang;
      if (targetLang && targetLang !== getLang()) {
        setLang(targetLang);
        if (onLangChange) {
          onLangChange();
        } else {
          window.location.reload();
        }
      }
    });
  });
}
