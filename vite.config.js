import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: 'index.html', // 메인 페이지
        login: path.resolve(__dirname, '/src/pages/auth/login.html'), // 로그인 페이지
        register: path.resolve(__dirname, '/src/pages/auth/register.html'), // 회원가입 페이지
        write: path.resolve(__dirname, '/src/pages/posts/write.html'), // 글쓰기 페이지
        detail: path.resolve(__dirname, '/src/pages/posts/detail.html'), // 상세페이지
        discover: path.resolve(__dirname, '/src/pages/discover/discover.html'), // 발견 페이지
        author: path.resolve(__dirname, '/src/pages/author/author.html'), // 작가홈 페이지
        drawer: path.resolve(__dirname, '/src/pages/drawer/drawer.html'), // 내서랍 페이지
      },
    },
  },
  appType: 'mpa', // fallback 사용안함
});
