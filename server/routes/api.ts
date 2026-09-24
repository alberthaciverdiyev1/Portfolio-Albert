import { Router, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { readAllData, replaceAllData, writeDataJson, ensureSeeded } from '../db.js';

export const apiRouter = Router();

const BACKUPS_DIR = path.resolve(process.cwd(), 'server/backups');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public/images');

// Ensure directories exist
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Verify DB / seed on startup
const seeded = ensureSeeded();
console.log(seeded ? '✓ SQLite veritabanı seed.json\'dan dolduruldu' : '✓ SQLite veritabanı hazır');

// Setup Multer for image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const basename = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    const uniqueSuffix = Date.now();
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(png|jpe?g|webp|svg|gif|avif)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Yalnız şəkil faylları (.png, .jpg, .webp, .svg) yüklənə bilər!'));
    }
  }
});

/** Veritabanının JSON anlık görüntüsünü yedek olarak yazar. @returns dosya adı */
function createBackup(prefix = 'data'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${prefix}-${timestamp}.json`;
  writeDataJson(readAllData(), path.join(BACKUPS_DIR, filename));
  return filename;
}

/** Yedek JSON içeriğini veritabanına yükler ve src/data.json'u günceller. */
function restoreFromJson(raw: string): void {
  const data = JSON.parse(raw) as Record<string, any>;
  replaceAllData(data);
  writeDataJson(readAllData());
}

// GET /api/data - Read all data from SQLite
apiRouter.get('/data', (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: readAllData() });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Məlumat oxunarkən xəta: ' + err.message });
  }
});

// POST /api/data - Replace all data in SQLite with auto-backup
apiRouter.post('/data', (req: Request, res: Response) => {
  try {
    const newData = req.body;
    if (!newData || typeof newData !== 'object') {
      return res.status(400).json({ success: false, message: 'Yanlış JSON formatı' });
    }

    // Create automatic timestamped backup of the current state
    createBackup();

    // Persist to SQLite and regenerate the frontend JSON artifact
    replaceAllData(newData);
    writeDataJson(readAllData());

    res.json({
      success: true,
      message: 'Məlumatlar uğurla yeniləndi və ehtiyat nüsxə yaradıldı!',
      updatedAt: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Yadda saxlanarkən xəta: ' + err.message });
  }
});

// POST /api/upload - Upload an image to public/images
apiRouter.post('/upload', upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Şəkil faylı seçilməyib' });
    }
    const publicUrl = `/images/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Şəkil uğurla yükləndi',
      url: publicUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Şəkil yüklənərkən xəta: ' + err.message });
  }
});

// GET /api/backups - List backups
apiRouter.get('/backups', (_req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter(f => f.startsWith('data-') && f.endsWith('.json'))
      .map(filename => {
        const fullPath = path.join(BACKUPS_DIR, filename);
        const stats = fs.statSync(fullPath);
        return {
          filename,
          size: stats.size,
          createdAt: stats.mtime.toISOString()
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    res.json({ success: true, backups: files });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Backup siyahısı alınarkən xəta: ' + err.message });
  }
});

// POST /api/restore/:filename - Restore database from a backup
apiRouter.post('/restore/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const backupFile = path.join(BACKUPS_DIR, filename);

    if (!fs.existsSync(backupFile)) {
      return res.status(404).json({ success: false, message: 'Backup faylı tapılmadı' });
    }

    // Safety backup of current state before restoring
    createBackup('data-pre-restore');

    restoreFromJson(fs.readFileSync(backupFile, 'utf-8'));

    res.json({ success: true, message: `${filename} ehtiyat nüsxəsindən uğurla bərpa edildi!` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Bərpa edilərkən xəta: ' + err.message });
  }
});
