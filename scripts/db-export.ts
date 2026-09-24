/**
 * SQLite -> src/data.json (frontend build çıktısı).
 * Veritabanı boşsa önce seed.json'dan doldurur.
 *
 *   npm run db:export
 */
import { ensureSeeded, exportToJson, DATA_JSON_PATH } from '../server/db.js';

const seeded = ensureSeeded();
if (seeded) console.log('ℹ Veritabanı seed.json\'dan başlatıldı.');
exportToJson();
console.log(`✓ src/data.json veritabanından üretildi: ${DATA_JSON_PATH}`);
