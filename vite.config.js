// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: './index.html',
        sitemap: './sitemap.html',
        'auth/login': './src/pages/auth/login.html',
        'auth/register': './src/pages/auth/register.html',
        'posts/write': './src/pages/posts/write.html',
        'posts/detail': './src/pages/posts/detail.html',
        'discover/discover': './src/pages/discover/discover.html',
        'author/author': './src/pages/author/author.html',
        'drawer/drawer': './src/pages/drawer/drawer.html',
      },
    },
  },
  appType: 'mpa',
});
