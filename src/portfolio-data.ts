import fallback from './data.json';

/**
 * Çalışma zamanı veri deposu (canlı mağaza).
 *
 * - Başlangıç değeri build'e gömülü `data.json`'dur (sunucu yoksa/erişilemezse fallback).
 * - `loadData()` çağrıldığında admin panelinin yazdığı SQLite'tan `/api/data` üzerinden
 *   güncel veri çekilir ve tüm export'lar (canlı binding) tazelenir.
 *
 * ÖNEMLİ: Bu export'lar `let` olduğu için canlı binding'dir; ancak render işlemi
 * `await loadData()` sonrasına ertelenmelidir (bkz. main.ts / pages.ts).
 */

type SiteData = typeof fallback;

const FALLBACK = fallback as SiteData;
let data: SiteData = FALLBACK;

export let ui = data.ui;
export let profile = data.profile;
export let metrics = data.metrics;
export let focusAreas = data.focusAreas;
export let skills = data.skills;
export let skillCategories = data.skillCategories;
export let experiences = data.experiences;
export let educations = data.educations;
export let languages = data.languages;
export let projects = data.projects;

/** Mevcut (çalışma zamanı) verinin tamamı. */
export function getData(): SiteData {
  return data;
}

/** Veriyi değiştirir ve tüm canlı binding'leri tazeler. */
export function applyData(next: Partial<SiteData>): void {
  data = { ...FALLBACK, ...next } as SiteData;

  ui = data.ui;
  profile = data.profile;
  metrics = data.metrics;
  focusAreas = data.focusAreas;
  skills = data.skills;
  skillCategories = data.skillCategories;
  experiences = data.experiences;
  educations = data.educations;
  languages = data.languages;
  projects = data.projects;

  window.dispatchEvent(new CustomEvent('datachange'));
}

/**
 * Admin panelinin yazdığı canlı veriyi API'den çeker.
 * Hata durumunda sessizce gömülü (build) veriyle devam eder — statik barındırma için gereklidir.
 */
export async function loadData(): Promise<void> {
  // Ayrı bir alan adında barındırılıyorsa VITE_API_BASE ile API kökü verilebilir.
  const base = (import.meta.env?.VITE_API_BASE as string | undefined) ?? '';
  try {
    const res = await fetch(`${base}/api/data`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    if (payload?.success && payload.data) {
      applyData(payload.data as Partial<SiteData>);
    }
  } catch (err) {
    console.warn('[portfolio] Canlı veri alınamadı; gömülü veri kullanılıyor.', err);
  }
}
