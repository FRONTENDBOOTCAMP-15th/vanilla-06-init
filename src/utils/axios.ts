// src/utils/axios.ts
import axios from 'axios';

export function getAxios() {
  const instance = axios.create({
    baseURL: 'https://fesp-api.koyeb.app/market',
    headers: {
      'client-id': 'brunch',
    },
  });

  // 요청 보내기 전에 실행되는 interceptor
  instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  return instance;
}
