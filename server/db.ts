import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

/**
 * SQLite veri katmanı — projenin TEK veri kaynağı (single source of truth).
 *
 * Neden belge (document) modeli? Admin panelinden düzenlenen içerik şemasızdır:
 * aynı koleksiyondaki kayıtlar farklı alanlara sahip olabilir (ör. bir proje
 * `liveUrl` taşırken bir başkası `repoName` taşır; bir deneyimin `period`'u
 * düz metin, bir diğerininki {az,en,tr} nesnesi). Sabit/ilişkisel kolonlar bu
 * veriyi bozar. Bu yüzden her kayıt JSON olarak saklanır → kayıpsız round-trip.
 *
 * `src/data.json` artık elle düzenlenen kaynak DEĞİL; bu veritabanından üretilen
 * bir build çıktısıdır (frontend onu import eder). Bkz. scripts/db-export.ts
 */

const DATA_DIR = path.resolve(process.cwd(), 'server/data');
export const DB_PATH = path.join(DATA_DIR, 'portfolio.db');
export const SEED_PATH = path.join(DATA_DIR, 'seed.json');
export const DATA_JSON_PATH = path.resolve(process.cwd(), 'src/data.json');

let db: DatabaseSync | null = null;

/** Tekil (nested) içerik blokları. */
const CONTENT_KEYS = ['ui', 'profile'] as const;

/** Liste koleksiyonları — data.json üst düzey anahtar sırasıyla birebir aynı. */
const COLLECTIONS = [
  'metrics',
  'focusAreas',
  'skills',
  'skillCategories',
  'experiences',
  'educations',
  'languages',
  'projects'
] as const;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS site_content (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS items (
  collection TEXT    NOT NULL,
  position   INTEGER NOT NULL,
  item_key   TEXT,
  data       TEXT    NOT NULL,
  PRIMARY KEY (collection, position)
);

CREATE INDEX IF NOT EXISTS idx_items_collection ON items(collection, position);
CREATE INDEX IF NOT EXISTS idx_items_key        ON items(item_key);
`;

export function getDb(): DatabaseSync {
  if (db) return db;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec(SCHEMA);
  return db;
}

/** Koleksiyondaki bir kaydın doğal kimliğini (varsa) çıkarır. */
function extractItemKey(item: unknown): string | null {
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    const id = (item as Record<string, unknown>).id;
    if (typeof id === 'string' && id.length > 0) return id;
  }
  return null;
}

/** Tüm siteyi data.json şeklinde (birebir uyumlu) döndürür. */
export function readAllData(): Record<string, unknown> {
  const database = getDb();
  const out: Record<string, unknown> = {};

  const contentRows = database.prepare('SELECT key, value FROM site_content').all() as Array<{
    key: string;
    value: string;
  }>;
  const content = new Map(contentRows.map((r) => [r.key, JSON.parse(r.value) as unknown]));
  for (const key of CONTENT_KEYS) out[key] = content.get(key) ?? {};

  const selectItems = database.prepare(
    'SELECT data FROM items WHERE collection = ? ORDER BY position'
  );
  for (const collection of COLLECTIONS) {
    const rows = selectItems.all(collection) as Array<{ data: string }>;
    out[collection] = rows.map((r) => JSON.parse(r.data) as unknown);
  }

  return out;
}

/** Tüm veriyi tek bir transaction içinde değiştirir. */
export function replaceAllData(data: Record<string, any>): void {
  const database = getDb();
  database.exec('BEGIN');
  try {
    database.exec('DELETE FROM site_content');
    const insertContent = database.prepare('INSERT INTO site_content (key, value) VALUES (?, ?)');
    for (const key of CONTENT_KEYS) insertContent.run(key, JSON.stringify(data?.[key] ?? {}));

    database.exec('DELETE FROM items');
    const insertItem = database.prepare(
      'INSERT INTO items (collection, position, item_key, data) VALUES (?, ?, ?, ?)'
    );
    for (const collection of COLLECTIONS) {
      const items: unknown[] = Array.isArray(data?.[collection]) ? data[collection] : [];
      items.forEach((item, index) => insertItem.run(collection, index, extractItemKey(item), JSON.stringify(item)));
    }

    database.exec('COMMIT');
  } catch (err) {
    database.exec('ROLLBACK');
    throw err;
  }
}

/** Veriyi diske (varsayılan: src/data.json) yazar. */
export function writeDataJson(data: Record<string, unknown>, file: string = DATA_JSON_PATH): void {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/** Veritabanını okuyup JSON dosyasına yazar. */
export function exportToJson(file: string = DATA_JSON_PATH): Record<string, unknown> {
  const data = readAllData();
  writeDataJson(data, file);
  return data;
}

/**
 * Veritabanı boşsa seed.json'dan (yoksa mevcut src/data.json'dan) doldurur.
 * @returns true ise seed işlemi yapıldı.
 */
export function ensureSeeded(): boolean {
  const database = getDb();
  const row = database.prepare('SELECT COUNT(*) AS count FROM site_content').get() as
    | { count: number }
    | undefined;
  if ((row?.count ?? 0) > 0) return false;

  const source = fs.existsSync(SEED_PATH) ? SEED_PATH : fs.existsSync(DATA_JSON_PATH) ? DATA_JSON_PATH : null;
  if (!source) return false;

  const data = JSON.parse(fs.readFileSync(source, 'utf-8')) as Record<string, any>;
  replaceAllData(data);
  return true;
}
