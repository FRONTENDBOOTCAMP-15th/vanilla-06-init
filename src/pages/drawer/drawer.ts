/*
  drawer.ts
  - API 데이터 연동
  - HTML 클래스 구조(brunch_...)에 맞춘 렌더링
  - URL 파라미터(userId, postId) 연결
  - 더미 데이터 자동 삭제 후 렌더링
*/

const CLIENT_ID = 'febc15-vanilla06-ecad';
const API_BASE_URL = 'https://fesp-api.koyeb.app/market';

// -----------------------
// 타입 정의
// -----------------------
interface Author {
  _id: string;
  image: string;
  name: string;
}

interface Post {
  _id: string;
  image: string;
  title: string;
  name: string;
}

interface MyPost {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}

// -----------------------
// 유틸리티
// -----------------------
const getToken = (): string | null => localStorage.getItem('accessToken');

const truncateContent = (content: string, limit = 20): string =>
  content.length > limit ? content.substring(0, limit) + '...' : content;

// -----------------------
// 공통 API 함수
// -----------------------
async function apiGet<T>(path: string, needAuth = false): Promise<T | null> {
  const headers: Record<string, string> = { 'client-id': CLIENT_ID };
  if (needAuth) {
    const token = getToken();
    if (!token) return null;
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { headers });
    if (!res.ok) {
      // 401 인증 에러 등은 조용히 넘어가거나 로그만 남김
      return null;
    }
    return (await res.json()) as T;
  } catch (e) {
    console.error('API 통신 실패:', e);
    return null;
  }
}

// -----------------------
// 데이터 정규화
// -----------------------
function normalizeAuthor(raw: any): Author {
  return {
    _id: raw._id ?? raw.targetId ?? String(raw.id ?? ''),
    image: raw.image ?? '/public/icons/user-placeholder.svg',
    name: raw.name ?? raw.nickname ?? '이름 없음',
  };
}

function normalizePost(raw: any): Post {
  return {
    _id: raw._id ?? raw.targetId ?? String(raw.id ?? ''),
    image: raw.image ?? '', // 이미지가 없으면 CSS 처리 혹은 빈 문자열
    title: raw.title ?? raw.name ?? '제목 없음',
    name: raw.name ?? raw.authorName ?? '정보 없음',
  };
}

function normalizeMyPost(raw: any): MyPost {
  return {
    _id: raw._id ?? String(raw.id ?? ''),
    title: raw.title ?? '제목 없음',
    content: raw.content ?? '',
    createdAt: raw.createdAt ?? raw.date ?? '',
  };
}

// -----------------------
// 템플릿 함수 (기존 CSS 클래스 유지)
// -----------------------

// 1. 관심 작가 템플릿 (경로: /src/pages/author/author.html?userId=...)
const authorTemplate = (author: Author) => `
  <a href="/src/pages/author/author.html?userId=${author._id}" class="brunch_author_link">
    <img src="${author.image}" alt="${author.name}" class="thumb" />
    <span class="name">${author.name}</span>
  </a>
`;

// 2. 게시글 템플릿 (경로: /src/pages/posts/detail.html?postId=...)
const postTemplate = (post: Post) => `
  <a class="brunch_link" href="/src/pages/posts/detail.html?postId=${post._id}">
    <div class="brunch_book">
      <div class="txt_box">
        <b class="ttl">${post.title}</b>
        <span class="name">${post.name}</span>
      </div>
    </div>
    <div class="brunch_txt">
      <b class="ttl">${post.title}</b>
      <span class="name">
        <span class="by">by</span>
        ${post.name}
      </span>
    </div>
  </a>
`;

// 3. 내 브런치 템플릿
const myPostTemplate = (post: MyPost) => `
  <a href="/src/pages/posts/detail.html?postId=${post._id}" class="mybrunch_link">
    <div class="mybrunch_card">
      <b class="ttl">${post.title}</b>
      <p class="desc">${truncateContent(post.content, 30)}</p>
      <time class="date">${post.createdAt}</time>
    </div>
  </a>
`;

// -----------------------
// 범용 렌더러
// -----------------------
function renderList<T>(selector: string, items: T[], emptyMessage: string, template: (item: T) => string) {
  const container = document.querySelector(selector);
  if (!container) {
    // 아직 HTML에 클래스를 안 붙였거나 페이지가 다름
    return;
  }

  // [중요] HTML에 있던 더미 데이터(스켈레톤)를 깨끗이 지웁니다.
  container.innerHTML = '';

  if (!items || items.length === 0) {
    // 데이터가 없을 때 메시지 표시 (CSS 스타일은 필요에 따라 조정)
    container.innerHTML = `<p class="drawer_no_data" style="padding: 15px; text-align: center; color: #999; font-size: 13px;">${emptyMessage}</p>`;
    return;
  }

  // 데이터 렌더링
  container.innerHTML = items.map(template).join('');
}

// -----------------------
// 데이터 가져오기 (Fetch)
// -----------------------
async function fetchInterestAuthors(): Promise<Author[]> {
  // API 응답 형태가 { item: [...] } 인지 배열 [...] 인지에 따라 처리
  const res = await apiGet<any>('/bookmarks/user', true);
  const list = Array.isArray(res) ? res : (res?.item ?? []);
  return list.map(normalizeAuthor);
}

async function fetchInterestPosts(): Promise<Post[]> {
  const res = await apiGet<any>('/bookmarks/post', true);
  const list = Array.isArray(res) ? res : (res?.item ?? []);
  return list.map(normalizePost);
}

async function fetchRecentlyViewedPosts(): Promise<Post[]> {
  const historyJson = localStorage.getItem('recent') || '[]';
  let postIds: string[] = [];
  try {
    postIds = JSON.parse(historyJson);
  } catch {
    postIds = [];
  }

  if (postIds.length === 0) return [];

  // 최근 본 글 ID들로 실제 데이터를 불러오거나, 임시 데이터를 만듭니다.
  // 실제 구현: API에 IDs를 보내서 정보를 받아와야 함.
  // 현재는 ID만 가지고 임시 객체를 반환합니다.
  return postIds.map(id => ({
    _id: id,
    image: '',
    title: '최근 본 글',
    name: '정보 로딩 필요'
  }));
}

async function fetchMyPosts(): Promise<MyPost[]> {
  const token = getToken();
  if (!token) return [];

  // [TODO] 실제 내 글 목록 API 호출로 변경 필요
  // const res = await apiGet<any>('/posts/my'); 
  // return (res?.item ?? []).map(normalizeMyPost);

  // 임시 샘플 데이터
  const sample = [
    { _id: 'sample1', title: '글쓰기의 감각', content: '매일 조금씩 쓰는 습관을 들이며...', createdAt: '2024.05.20' },
    { _id: 'sample2', title: '개발자의 주말', content: '코딩과 휴식 사이의 균형잡기', createdAt: '2024.05.21' },
  ];
  return sample.map(normalizeMyPost);
}

// -----------------------
// 초기화 (실행부)
// -----------------------
export async function initializeDrawer(): Promise<void> {
  // 데이터를 병렬로 한 번에 가져옵니다.
  const [authors, recent, interest, myPosts] = await Promise.all([
    fetchInterestAuthors(),
    fetchRecentlyViewedPosts(),
    fetchInterestPosts(),
    fetchMyPosts(),
  ]);

  // 아까 HTML에 추가한 class(.js-drawer-...)를 찾아 렌더링합니다.
  renderInterestAuthors(authors);
  renderRecentlyViewedPosts(recent);
  renderInterestPosts(interest);
  renderMyPosts(myPosts);

  console.log('Drawer 데이터 렌더링 완료.');
}

// 각 섹션별 렌더링 함수
function renderInterestAuthors(authors: Author[]) {
  renderList('.js-drawer-author', authors, '관심 작가가 없습니다.', authorTemplate);
}

function renderRecentlyViewedPosts(posts: Post[]) {
  renderList('.js-drawer-recent', posts, '최근 본 글이 없습니다.', postTemplate);
}

function renderInterestPosts(posts: Post[]) {
  renderList('.js-drawer-interest', posts, '관심 글이 없습니다.', postTemplate);
}

function renderMyPosts(posts: MyPost[]) {
  renderList('.js-drawer-my', posts, '작성한 글이 없습니다.', myPostTemplate);
}

// 자동 실행
initializeDrawer().catch(e => console.error('Drawer Init Error:', e));