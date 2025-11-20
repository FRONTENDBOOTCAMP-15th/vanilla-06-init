import { getAxios } from '../utils/axios';

const axios = getAxios();

export async function getAllPost() {
  try {
    const { data } = await axios.get('/posts/');
    return data;
  } catch (err) {
    console.error(err);
    throw err; // 호출한 곳에서 에러 처리하도록 다시 던져주는 것이 좋음
  }
}
