import Quill from 'quill';
import 'quill/dist/quill.snow.css';

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

  // HTML + 이미지(Base64)
  const content = editor.root.innerHTML;
  console.log('전송할 HTML:', content);

  // fetch/axios로 서버 전송 가능
});
