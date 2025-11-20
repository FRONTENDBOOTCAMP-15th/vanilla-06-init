// src/pages/user/register.ts
import { getAxios } from '../../utils/axios';

const form = document.querySelector('.register_action') as HTMLFormElement;
const nicknameInput = document.querySelector('#nickname') as HTMLInputElement;
const emailInput = document.querySelector('#email') as HTMLInputElement;
const pwdInput = document.querySelector('#userPwd') as HTMLInputElement;
const pwdCheckInput = document.querySelector(
  '#userPwdConfirm',
) as HTMLInputElement;
const submitBtn = document.querySelector(
  '.register_submit',
) as HTMLButtonElement;
const nicknameCheckBtn = document.querySelector(
  '#nicknameCheckBtn',
) as HTMLButtonElement;
const emailCheckBtn = document.querySelector(
  '#emailCheckBtn',
) as HTMLButtonElement;
const registerMsg1 = document.querySelector(
  '#registerMsg1',
) as HTMLParagraphElement;
const registerMsg2 = document.querySelector(
  '#registerMsg2',
) as HTMLParagraphElement;

console.log('test');

if (
  !form ||
  !nicknameInput ||
  !emailInput ||
  !pwdInput ||
  !pwdCheckInput ||
  !submitBtn ||
  !nicknameCheckBtn ||
  !emailCheckBtn
) {
  console.log('입력 요소를 찾을 수 없음');
}

// 닉네임 2~20자
function checkNickname(nickname: string): boolean {
  if (nickname.length < 2) return false;
  if (nickname.length > 20) return false;
  return true;
}

nicknameCheckBtn.addEventListener('click', async () => {
  const nickname = nicknameInput.value.trim();
  console.log(nickname);

  if (!checkNickname(nickname)) {
    registerMsg1.textContent = '2자 이상 20자 이하만 가능합니다.';
    registerMsg1.closest('.register_msg')!.classList.add('d_flex');
    registerMsg1.classList.add('color_red');
    registerMsg1.classList.remove('color_mint');
    return;
  }

  const axios = getAxios();
  try {
    const response = await axios.get(`/users/?name=${nickname}`);
    console.log(response.data.item);
    const data = response.data.item;
    console.log(data);
    console.log(data.length === 0);

    if (data.length === 0) {
      registerMsg1.textContent = '사용할 수 있는 별명입니다.';
      registerMsg1.closest('.register_msg')!.classList.add('d_flex');
      registerMsg1.classList.add('color_mint');
      registerMsg1.classList.remove('color_red');
    } else {
      registerMsg1.textContent = '중복된 별명입니다.';
      registerMsg1.closest('.register_msg')!.classList.add('d_flex');
      registerMsg1.classList.add('color_red');
      registerMsg1.classList.remove('color_mint');
    }
  } catch (err) {
    console.error('목록 조회 실패.', err);
  }
});

// 이메일 형식 : aaa@gmail.com (정규식 사용)
function checkEmail(email: string): boolean {
  const emailPattern = /^[^@]+@[^@]+\.[^@]+$/;
  return emailPattern.test(email);
}

emailCheckBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  console.log(email);

  if (!checkEmail(email)) {
    registerMsg2.textContent = '올바른 이메일 형식이 아닙니다.';
    registerMsg2.closest('.register_msg')!.classList.add('d_flex');
    registerMsg2.classList.add('color_red');
    registerMsg2.classList.remove('color_mint');
    return;
  }

  const axios = getAxios();
  try {
    const response = await axios.get(`/users/?email=${email}`);
    console.log(response.data.item);
    const data = response.data.item;
    console.log(data);

    if (data.length === 0) {
      registerMsg2.textContent = '사용할 수 있는 이메일입니다.';
      registerMsg2.closest('.register_msg')!.classList.add('d_flex');
      registerMsg2.classList.add('color_mint');
      registerMsg2.classList.remove('color_red');
    } else {
      registerMsg2.textContent = '중복된 이메일입니다.';
      registerMsg2.closest('.register_msg')!.classList.add('d_flex');
      registerMsg2.classList.add('color_red');
      registerMsg2.classList.remove('color_mint');
    }
  } catch (err) {
    console.error('목록 조회 실패.', err);
  }
});

// 비밀번호 = 비밀번호 확인
function checkPasswordMatch(pwd: string, pwdCheck: string): boolean {
  return pwd === pwdCheck;
}

// 비밀번호 규칙: 대문자+소문자+숫자 포함, 8자 이상(정규식 사용)
function checkPasswordRule(pwd: string): boolean {
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const longEnough = pwd.length >= 8;

  return hasUpper && hasLower && hasNumber && longEnough;
}

// 모든 조건 검사 → 버튼 활성/비활성
function validateAll() {
  const nickname = nicknameInput.value.trim();
  const email = emailInput.value.trim();
  const pwd = pwdInput.value;
  const pwdCheck = pwdCheckInput.value;

  const isNicknameValid = checkNickname(nickname);
  const isEmailValid = checkEmail(email);
  const isPwdRuleValid = checkPasswordRule(pwd);
  const isPwdSame = checkPasswordMatch(pwd, pwdCheck);

  if (isNicknameValid && isEmailValid && isPwdRuleValid && isPwdSame) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}

// 칸마다 입력할 시 검사
nicknameInput.addEventListener('input', validateAll);
emailInput.addEventListener('input', validateAll);
pwdInput.addEventListener('input', validateAll);
pwdCheckInput.addEventListener('input', validateAll);

// 폼 제출
form.addEventListener('submit', async event => {
  event.preventDefault(); // 새로고침을 막아주는 내장함수
  const nickname = nicknameInput.value.trim();
  const email = emailInput.value.trim();
  const pwd = pwdInput.value;
  const pwdCheck = pwdCheckInput.value;

  // 최종 검사
  if (!checkNickname(nickname)) {
    alert('닉네임은 2자 이상 20자 이하입니다.');
    return;
  }
  if (!checkEmail(email)) {
    alert('올바른 이메일 형식이 아닙니다.');
    return;
  }
  if (!checkPasswordRule(pwd)) {
    alert('비밀번호는 대소문자 + 숫자 포함 8자 이상이어야 합니다.');
    return;
  }
  if (!checkPasswordMatch(pwd, pwdCheck)) {
    alert('비밀번호가 다릅니다.');
    return;
  }

  const axios = getAxios();

  try {
    const { data } = await axios.post('users', {
      email,
      password: pwd,
      name: nickname,
      type: 'user',
      loginType: 'email',
    });

    console.log(data);

    if (!data.ok) {
      alert('회원가입 실패.');
      return;
    }

    alert('회원가입 성공!');
    window.location.href = '/index.html';
  } catch (err) {
    console.log(err);
    alert('네트워크 에러 발생.');
  }
});

const eyeCheckboxBtns = document.querySelectorAll<HTMLLabelElement>(
  '.eye_checkbox .icon',
);

eyeCheckboxBtns.forEach(btn => {
  btn.addEventListener('click', (e: Event) => {
    const el = e.currentTarget as HTMLElement;
    const field = el.closest('.register_field') as HTMLElement | null;
    if (!field) return;

    const input = field.querySelector('input') as HTMLInputElement | null;
    if (!input) return;

    input.type = input.type === 'password' ? 'text' : 'password';
  });
});
