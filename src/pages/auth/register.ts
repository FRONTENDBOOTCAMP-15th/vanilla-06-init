// src/pages/user/register.ts
const SIGNUP_URL = 'https://fesp-api.koyeb.app/market/users';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector<HTMLFormElement>('.register_action')!;
  const nicknameInput = document.querySelector<HTMLInputElement>('#nickname')!;
  const emailInput = document.querySelector<HTMLInputElement>('#email')!;
  const pwdInput = document.querySelector<HTMLInputElement>('#userPwd')!;
  const pwdCheckInput =
    document.querySelector<HTMLInputElement>('#userPwdConfirm')!;
  const submitBtn =
    document.querySelector<HTMLButtonElement>('.register_submit')!;

  if (
    !form ||
    !nicknameInput ||
    !emailInput ||
    !pwdInput ||
    !pwdCheckInput ||
    !submitBtn
  ) {
    console.log('입력 요소를 찾을 수 없음');
    return;
  }

  // 닉네임 2~20자
  function checkNickname(nickname: string): boolean {
    if (nickname.length < 2) return false;
    if (nickname.length > 20) return false;
    return true;
  }

  // 이메일 형식 : aaa@gmail.com (정규식 사용)
  function checkEmail(email: string): boolean {
    const emailPattern = /^[^@]+@[^@]+\.[^@]+$/;
    return emailPattern.test(email);
  }

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

    const bodyData = {
      email,
      password: pwd,
      name: nickname,
      type: 'user',
      loginType: 'email',
    };

    try {
      const response = await fetch(SIGNUP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'client-id': 'brunch',
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
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
});
