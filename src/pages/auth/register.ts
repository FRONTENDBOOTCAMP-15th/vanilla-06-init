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

const jobArr = [
  '개발자',
  '자기탐구인문학 크리에이터',
  '가수',
  '디자이너',
  '기획자',
  '마케터',
  '영상편집자',
  '일러스트레이터',
  'UX/UI 디자이너',
  '데이터 분석가',
  '인공지능 연구원',
  '작가',
  '번역가',
  '세무사',
  '회계사',
  '요리사',
  '바리스타',
  '강사',
  '컨설턴트',
  '프로젝트 매니저',
  '제품 매니저',
  '경영지원 담당자',
  '영업 담당자',
  '사회복지사',
  '건축가',
];

const statusMsgArr = [
  '오늘도 차분하게 나아가 보겠습니다. 작은 실수에도 자책하지 않고 스스로를 다독이며 하루를 이어갑니다.',
  '지금 이 순간에 온전히 집중합니다. 과거의 후회나 미래의 걱정 대신 현재 할 수 있는 일에 최선을 다합니다.',
  '작은 변화가 큰 차이를 만듭니다. 한 걸음 한 걸음의 노력이 쌓이면 결국 큰 성과로 돌아옵니다.',
  '천천히 가도 결국 도착합니다. 조급함에 흔들리지 않고 꾸준함을 유지하며 나만의 속도로 걸어갑니다.',
  '나에게 필요한 속도를 찾습니다. 남과 비교하지 않고 내 페이스를 존중하며 하루를 계획합니다.',
  '생각을 정리하며 하루를 이어갑니다. 혼란스러운 마음을 글이나 메모로 풀어내며 마음을 정돈합니다.',
  '감정의 흐름을 조용히 바라봅니다. 화나거나 슬픈 순간에도 감정을 억누르지 않고 자연스럽게 받아들입니다.',
  '지금 할 수 있는 일에 집중합니다. 미루거나 걱정하지 않고 현재 손에 잡히는 일부터 차근히 해결합니다.',
  '완벽보다 꾸준함을 선택합니다. 실수하더라도 포기하지 않고 반복하며 점점 더 나아지는 자신을 믿습니다.',
  '오늘의 목표를 차근히 진행합니다. 큰 목표도 작은 단계로 나누어 계획하고 하나씩 성취해 나갑니다.',
  '넘어져도 다시 일어나면 됩니다. 실패에 좌절하지 않고 경험으로 삼아 한층 더 성장할 기회로 만듭니다.',
  '가볍게 한 걸음을 내딛습니다. 두려움이나 망설임보다는 행동을 먼저 선택하며 가능성을 만들어갑니다.',
  '나에게 친절한 하루가 되길 바랍니다. 스스로에게 격려와 위로를 전하며 마음의 평화를 지켜갑니다.',
  '새로운 시도를 두려워하지 않습니다. 실패할 가능성보다 배움과 성장의 기회를 먼저 생각합니다.',
  '마음의 여유를 천천히 채워갑니다. 바쁘고 복잡한 일상 속에서도 작은 휴식과 평화를 잊지 않습니다.',
  '작은 성취에도 스스로를 칭찬합니다. 눈에 보이는 결과뿐만 아니라 과정 속 노력도 인정합니다.',
  '오늘도 나를 믿고 움직여봅니다. 스스로의 선택과 판단을 신뢰하며 한 걸음씩 나아갑니다.',
  '기회를 스스로 만들어갑니다. 운에 맡기지 않고 능동적으로 선택하고 행동하며 길을 개척합니다.',
  '할 수 있다는 마음을 지켜냅니다. 불안과 두려움 속에서도 자신감과 희망을 잃지 않습니다.',
  '불필요한 걱정을 내려놓아봅니다. 과거와 미래에 얽매이지 않고 지금 여기에서 할 수 있는 것에 집중합니다.',
  '편안한 마음으로 시작해봅니다. 아침을 가볍게 맞이하며 마음과 몸 모두를 준비합니다.',
  '지금의 나를 있는 그대로 인정합니다. 부족함도 장점도 모두 받아들이며 자기 자신에게 솔직합니다.',
  '오늘도 배움의 태도를 유지합니다. 경험과 실수 속에서도 항상 배우려는 마음을 잃지 않습니다.',
  '하루의 균형을 차근히 맞춰갑니다. 일과 휴식, 마음과 몸의 균형을 의식적으로 유지합니다.',
  '나답게 살아가는 방법을 찾습니다. 남의 기준보다 내 가치와 기준에 맞춰 선택하고 행동합니다.',
];

function getRandom(arr: string[]): string {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

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

    registerMsg1.closest('.register_msg')!.classList.add('d_flex');
    if (data.length === 0) {
      registerMsg1.textContent = '사용할 수 있는 별명입니다.';
      registerMsg1.closest('.register_msg')!.classList.add('d_flex');
      registerMsg1.classList.add('color_mint');
      registerMsg1.classList.remove('color_red');
    } else {
      registerMsg1.textContent = '중복된 별명입니다.';
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

    registerMsg2.closest('.register_msg')!.classList.add('d_flex');
    if (data.length === 0) {
      registerMsg2.textContent = '사용할 수 있는 이메일입니다.';
      registerMsg2.closest('.register_msg')!.classList.add('d_flex');
      registerMsg2.classList.add('color_mint');
      registerMsg2.classList.remove('color_red');
    } else {
      registerMsg2.textContent = '중복된 이메일입니다.';
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
      extra: {
        job: getRandom(jobArr),
        biography: getRandom(statusMsgArr),
      },
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
