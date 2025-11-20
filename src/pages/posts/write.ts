import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { getAxios } from '../../utils/axios.ts';

const ttlInput = document.querySelector('#formTtl') as HTMLInputElement;
const subTtlInput = document.querySelector('#formSubTtl') as HTMLInputElement;
const submitBtn = document.querySelector('#editorSubmit') as HTMLButtonElement;
const previewInput = document.querySelector('#imgInput') as HTMLInputElement;
const previewEl = document.querySelector('#preview') as HTMLImageElement;
const previewAreaEl = document.querySelector('.preview_area') as HTMLDivElement;
const MAX_SIZE = 3 * 1024 * 1024;

// 에디터 초기화
const editor = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'], // 글자 스타일
      ['link', 'image'], // 링크 & 이미지
      [{ list: 'ordered' }, { list: 'bullet' }], // 목록
      [{ align: [] }],
      ['clean'],
    ],
  },
});

// submit 시 HTML 가져오기
const form = document.querySelector<HTMLFormElement>('#postForm')!;
form.addEventListener('submit', (e: Event) => {
  e.preventDefault();

  const content = editor.root.innerHTML;
  console.log('전송할 HTML:', content);

  submitPost();
});

async function imageUpload() {
  const axios = getAxios();
  const file = previewInput.files?.[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('attach', file);
  try {
    const { data } = await axios.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('업로드 완료:', data);
    return data;
  } catch (err) {
    console.error(err);
  }
}

async function submitPost() {
  const axios = getAxios();

  const ttlVal = ttlInput.value.trim();
  const subTtlVal = subTtlInput.value.trim();
  const content = editor.root.innerHTML;
  const preview = await imageUpload();

  const body = {
    type: 'brunch',
    title: ttlVal,
    extra: {
      subTitle: subTtlVal,
    },
    content,
    image: preview.item[0].path,
  };

  try {
    const { data } = await axios.post('/posts', body);
    console.log('저장 완료:', data);
    alert('글이 작성되었습니다');
    location.reload();
  } catch (err) {
    console.error(err);
  }
}

// 값 체크 함수
function checkFormValid() {
  const title = ttlInput.value.trim();
  const subtitle = subTtlInput.value.trim();
  const content = editor.root.innerText.trim();
  const preview = previewInput.value.trim();

  const isValid =
    title !== '' && subtitle !== '' && content !== '' && preview !== '';

  submitBtn.disabled = !isValid;
}

previewInput.addEventListener('change', () => {
  const file = previewInput.files?.[0];
  if (!file) return;

  if (file.size > MAX_SIZE) {
    alert('3MB 미만의 이미지만 업로드할 수 있습니다.');
    previewInput.value = '';
    previewEl.src = '';
    return;
  }

  const url = URL.createObjectURL(file);

  previewEl.src = url;
  previewAreaEl.classList.add('active');
});

ttlInput.addEventListener('input', checkFormValid);
subTtlInput.addEventListener('input', checkFormValid);
editor.on('text-change', checkFormValid);
previewInput.addEventListener('input', checkFormValid);

const btnClose = document.querySelector('.btn_close') as HTMLButtonElement;
btnClose?.addEventListener('click', () => {
  const isLeave = confirm('페이지를 떠나시겠습니까?');

  if (isLeave) {
    history.back();
  }
});
