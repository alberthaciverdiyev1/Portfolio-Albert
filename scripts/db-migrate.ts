/**
 * Tek seferlik migration: seed.json (veya src/data.json) -> SQLite.
 * Mevcut veritabanının üzerine yazar.
 *
 *   npm run db:migrate
 */
import fs from 'node:fs';
import { DB_PATH, SEED_PATH, DATA_JSON_PATH, replaceAllData, readAllData } from '../server/db.js';

const source = fs.existsSync(SEED_PATH) ? SEED_PATH : DATA_JSON_PATH;
if (!fs.existsSync(source)) {
  console.error(`✗ Kaynak JSON bulunamadı: ${source}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(source, 'utf-8')) as Record<string, unknown>;
replaceAllData(data);

const check = readAllData();
console.log(`✓ Veriler SQLite'a taşındı: ${DB_PATH}`);
console.log(`  Kaynak: ${source}`);
console.log(`  projects: ${(check.projects as unknown[]).length}, experiences: ${(check.experiences as unknown[]).length}, skills: ${(check.skills as unknown[]).length}`);
