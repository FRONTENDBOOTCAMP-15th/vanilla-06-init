import { getAxios } from '../../utils/axios';

document.addEventListener('DOMContentLoaded', () => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    alert('이미 로그인 상태입니다.');
    window.location.href = '/index.html';
  }

  const emailInput = document.querySelector<HTMLInputElement>('#userEmail');
  const passwordInput = document.querySelector<HTMLInputElement>('#userPwd');
  const loginButton = document.querySelector<HTMLButtonElement>('.login_btn');
  const signupButton =
    document.querySelector<HTMLButtonElement>('.login_member');
  const rememberCheckbox = document.querySelector<HTMLInputElement>('#login');

  if (!emailInput || !passwordInput || !loginButton) {
    return;
  }

  const savedEmail = localStorage.getItem('savedLoginEmail');
  const savedRemember = localStorage.getItem('savedLoginRemember');

  if (savedEmail && rememberCheckbox) {
    emailInput.value = savedEmail;
    rememberCheckbox.checked = savedRemember === 'true';
  }

  loginButton.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email) {
      alert('이메일을 입력하세요.');
      emailInput.focus();
      return;
    }

    if (!password) {
      alert('비밀번호를 입력하세요.');
      passwordInput.focus();
      return;
    }

    const axios = getAxios();

    try {
      loginButton.disabled = true;
      loginButton.textContent = '로그인 중...';

      const { data } = await axios.post('users/login', {
        email: email,
        password: password,
      });

      if (!data.ok) {
        alert(data.message || '로그인에 실패했습니다.');
        window.location.href = './login.html';
        return;
      }

      const item = data.item;

      if (item && item.token) {
        localStorage.setItem('accessToken', item.token.accessToken);
        localStorage.setItem('refreshToken', item.token.refreshToken);
      }

      localStorage.setItem('currentUser', JSON.stringify(item));

      if (rememberCheckbox && rememberCheckbox.checked) {
        localStorage.setItem('savedLoginEmail', email);
        localStorage.setItem('savedLoginRemember', 'true');
      } else {
        localStorage.removeItem('savedLoginEmail');
        localStorage.removeItem('savedLoginRemember');
      }

      alert(`${item.name}님, 환영합니다!`);

      window.location.href = '/index.html';
    } catch (err) {
      console.error('로그인 중 에러: ', err);
      alert('로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      window.location.href = './login.html';
    }
  });

  if (signupButton) {
    signupButton.addEventListener('click', () => {
      window.location.href = './register.html';
    });
  }

  emailInput.addEventListener('input', checkFormValid);
  passwordInput.addEventListener('input', checkFormValid);
  checkFormValid();

  // 값 체크 함수
  function checkFormValid() {
    const email = emailInput?.value.trim();
    const password = passwordInput?.value.trim();

    const isValid = email !== '' && password !== '';

    loginButton!.disabled = !isValid;
  }
});
