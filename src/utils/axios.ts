// src/utils/axios.ts
import axios from 'axios';

const API_SERVER = 'https://fesp-api.koyeb.app/market';

// 로그인 필요한 페이지 목록
const AUTH_REQUIRED_PAGES = ['/src/pages/details/write.html'];

console.log(AUTH_REQUIRED_PAGES);
const currentPath = window.location.pathname;
const needAuth = AUTH_REQUIRED_PAGES.some(page => currentPath.includes(page));

export function getAxios() {
  const instance = axios.create({
    baseURL: API_SERVER,
    headers: {
      'Client-Id': 'febc15-vanilla06-ecad',
    },
  });

  // 요청 인터셉터
  instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');

    console.log(token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  // 응답 인터셉터 — 401 자동 로그인 이동
  instance.interceptors.response.use(
    res => res,
    err => {
      if (err.response?.status === 401) {
        alert('로그인이 필요한 기능입니다.');
        window.location.href = '/src/pages/auth/login.html';
      }
      return Promise.reject(err);
    },
  );

  return instance;
}
