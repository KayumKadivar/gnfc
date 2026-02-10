import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import fs from 'fs'

// Helper to get all HTML files in src/pages
const getPages = () => {
    const pagesDir = resolve(__dirname, 'src/pages');
    if (!fs.existsSync(pagesDir)) return {};
    
    const files = fs.readdirSync(pagesDir);
    const pages = {};
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const name = file.replace('.html', '');
            pages[name] = resolve(pagesDir, file);
        }
    });
    return pages;
};

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...getPages()
      }
    }
  }
})
