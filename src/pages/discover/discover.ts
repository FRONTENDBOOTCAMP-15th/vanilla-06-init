import type { PostItem } from '../../types/post.ts';
import { getAxios } from '../../utils/axios.ts';

async function getData() {
  const axios = getAxios();

  try {
    const { data } = await axios.get<PostItem>('/posts?type=brunch');
    console.log(data);
  } catch (err) {
    console.log(err);
  }
}

const data = await getData();
console.log('반환된 값:', data);

// submit 시 HTML 가져오기
const form = document.querySelector<HTMLFormElement>('#searchForm')!;
const searchEl = document.querySelector<HTMLInputElement>('#searchInput')!;
form.addEventListener('submit', (e: Event) => {
  e.preventDefault();

  submitPost();
});

async function submitPost() {
  const axios = getAxios();

  const val = searchEl.value;
  console.log('전송할 value:', val);

  const body = {
    type: 'brunch',
    keyword: val,
  };

  try {
    const { data } = await axios.get('/posts', {
      params: body,
    });
    console.log('저장 완료:', data);
  } catch (err) {
    console.error(err);
  }
}
