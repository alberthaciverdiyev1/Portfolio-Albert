import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { apiRouter } from './routes/api.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const WEB_URL = process.env.WEB_URL || 'http://localhost:8500';

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve static images directly from public/images
app.use('/images', express.static(path.resolve(process.cwd(), 'public/images')));

// API routes
app.use('/api', apiRouter);

// Serve admin client
const adminDir = path.resolve(process.cwd(), 'server/public');
app.use('/admin', express.static(adminDir));
app.use('/', express.static(adminDir));

// Fallback for admin
app.use((req, res, next) => {
  if (req.path.startsWith('/admin')) {
    return res.sendFile(path.join(adminDir, 'index.html'));
  }
  next();
});

// '::' ile hem IPv6 (::1) hem IPv4 (127.0.0.1) üzerinden erişilebilir (dual-stack).
app.listen(PORT, '::', () => {
  console.log(`\n======================================================`);
  console.log(`⚡ Express TypeScript Admin Server is running!`);
  console.log(`👉 Admin Panel:    http://localhost:${PORT}/admin`);
  console.log(`👉 API Endpoints:  http://localhost:${PORT}/api/data`);
  console.log(`👉 Portfolio Site: ${WEB_URL}/`);
  console.log(`======================================================\n`);
});
