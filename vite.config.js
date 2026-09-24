import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Admin/API sunucusunun adresi (dev ve preview proxy'si buraya yönlenir).
const API_TARGET = process.env.API_TARGET || 'http://localhost:3001';

const proxy = {
  '/api': API_TARGET,
  '/admin': API_TARGET
};

export default defineConfig({
  server: { proxy },
  preview: { proxy },
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        projects: resolve(import.meta.dirname, 'projects.html'),
        experience: resolve(import.meta.dirname, 'experience.html'),
        about: resolve(import.meta.dirname, 'about.html'),
        contact: resolve(import.meta.dirname, 'contact.html')
      }
    }
  }
});
