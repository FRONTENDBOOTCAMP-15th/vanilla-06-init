// import { getAxios } from './axios';

function accessPages() {
  // 로그인 필요한 페이지 목록
  const AUTH_REQUIRED_PAGES = [
    '/src/pages/posts/write.html',
    '/src/pages/posts/detail.html',
    '/src/pages/drawer/drawer.html',
    '/src/pages/author/author.html',
  ];

  console.log(AUTH_REQUIRED_PAGES);
  const currentPath = window.location.pathname;
  const needAuth = AUTH_REQUIRED_PAGES.some(page => currentPath.includes(page));
  const accessToken = localStorage.getItem('accessToken');

  if (needAuth && !accessToken) {
    // getAxios().post('/bookmarks/user/-1');

    alert('로그인이 필요한 기능입니다.');
    window.location.href = '/src/pages/auth/login.html';
  }
}

accessPages();
