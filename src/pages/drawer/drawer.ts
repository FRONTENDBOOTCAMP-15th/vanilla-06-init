/*
  drawer.ts
  - 공통 API 핸들러(apiGet)
  - 공통 렌더러(renderList)
  - 템플릿 분리
  - 데이터 정규화(normalize)
  - 안전한 초기화
  - 기존 recordViewedPost 유지
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

// 저장 관련: 최근 본 글 기록 (기존 함수 유지)
export function recordViewedPost(postId: string) {
  const historyJson = localStorage.getItem('recentViewedPosts') || '[]';
  let history: string[];

  try {
    history = JSON.parse(historyJson);
  } catch (e) {
    history = [];
    console.error('최근 본 글 기록 파싱 오류:', e);
  }

  history = history.filter((id) => id !== postId);
  history.unshift(postId);
  history = history.slice(0, 10);
  localStorage.setItem('recentViewedPosts', JSON.stringify(history));
}

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
      console.error(`API 오류 ${res.status} ${path}`);
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
    name: raw.name ?? raw.nickname ?? `작가_${raw._id ?? raw.targetId ?? 'unknown'}`,
  };
}

function normalizePost(raw: any): Post {
  return {
    _id: raw._id ?? raw.targetId ?? String(raw.id ?? ''),
    image: raw.image ?? '/public/icons/book-placeholder.svg',
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
// 템플릿 함수
// -----------------------
const authorTemplate = (author: Author) => `
  <a href="/author/${author._id}" class="drawer_author_item">
    <div class="drawer_author_image" style="background-image: url(${author.image}); background-size: cover;"></div>
    <div class="drawer_author_name">${author.name}</div>
  </a>
`;

const postTemplate = (post: Post) => `
  <a href="/post/${post._id}" class="drawer_book_item">
    <div class="drawer_book_cover" style="background-image: url(${post.image}); background-size: cover;"></div>
    <div class="drawer_book_title">${post.title}</div>
    <div class="drawer_book_author">${post.name}</div>
  </a>
`;

const myPostTemplate = (post: MyPost) => `
  <a href="/post/${post._id}" class="drawer_brunch_item">
    <div class="drawer_brunch_title">${post.title}</div>
    <div class="drawer_brunch_info">${truncateContent(post.content)}</div>
    <div class="drawer_brunch_info">${post.createdAt}</div>
  </a>
`;

// -----------------------
// 범용 렌더러
// -----------------------
function renderList<T>(selector: string, items: T[], emptyMessage: string, template: (item: T) => string) {
  const container = document.querySelector(selector);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `<p class="drawer_no_data">${emptyMessage}</p>`;
    return;
  }

  container.innerHTML = items.map(template).join('');
}

// -----------------------
// 개별 fetch + render 함수들
// -----------------------
async function fetchInterestAuthors(): Promise<Author[]> {
  const data = await apiGet<any[]>('/bookmarks/user', true);
  if (!data) return [];
  // API 스펙에 따라 매핑
  return data.map(normalizeAuthor);
}

async function fetchInterestPosts(): Promise<Post[]> {
  const data = await apiGet<any[]>('/bookmarks/post', true);
  if (!data) return [];
  return data.map(normalizePost);
}

async function fetchRecentlyViewedPosts(): Promise<Post[]> {
  const historyJson = localStorage.getItem('recentViewedPosts') || '[]';
  let postIds: string[];
  try {
    postIds = JSON.parse(historyJson);
  } catch (e) {
    postIds = [];
    console.error('최근 본 글 파싱 오류:', e);
  }

  if (!postIds || postIds.length === 0) return [];

  // ids 쿼리 길이 제한에 주의. 여기선 단순 호출
  const res = await apiGet<any[]>(`/posts/list/by-ids?ids=${postIds.join(',')}`);
  if (!res) {
    // API 실패 시에도 사용자가 볼 수 있게 임시 id 기반 데이터를 반환
    return postIds.map((id) => ({ _id: id, image: '/public/icons/book-placeholder.svg', title: `임시 제목 (${id})`, name: '정보 없음' } as Post));
  }

  // API가 반환한 순서가 보장되지 않으면 postIds 순서에 맞춰 정렬할 수 있음
  const normalized = res.map(normalizePost);
  // 순서 맞추기 (postIds 기준)
  const byId = new Map(normalized.map((p) => [p._id, p]));
  return postIds.map((id) => byId.get(id) ?? { _id: id, image: '/public/icons/book-placeholder.svg', title: `임시 제목 (${id})`, name: '정보 없음' });
}

async function fetchMyPosts(): Promise<MyPost[]> {
  // 현재는 하드코딩된 예시. 실제 API가 생기면 apiGet 사용
  const sample = [
    { _id: 'my1', title: 'D-70, 30주', content: '별과 만나기까지 100일간의 기록', createdAt: 'Feb 05 / 2024' },
    { _id: 'my2', title: '6 윤희 - 2', content: '낙원', createdAt: 'Jan 20 / 2024' },
  ];
  return sample.map(normalizeMyPost);
}

// -----------------------
// 렌더링 호출부
// -----------------------
function renderInterestAuthors(authors: Author[]) {
  renderList('.drawer_author_list', authors, '관심 작가가 없습니다.', authorTemplate);
}

function renderRecentlyViewedPosts(posts: Post[]) {
  renderList('.drawer_book_list', posts, '최근 본 글이 없습니다.', postTemplate);
}

function renderInterestPosts(posts: Post[]) {
  renderList('.drawer_post_list', posts, '관심 글이 없습니다.', postTemplate);
}

function renderMyPosts(posts: MyPost[]) {
  const sectionSelector = '.drawer_my_brunch_section';
  const section = document.querySelector(sectionSelector);
  if (!section) return;

  // 기존 아이템 제거 (안정성)
  const existingItems = section.querySelectorAll('.drawer_brunch_item');
  existingItems.forEach((it) => it.remove());

  if (!posts || posts.length === 0) {
    section.insertAdjacentHTML('beforeend', `<p class="drawer_no_data">작성한 글이 없습니다.</p>`);
    return;
  }

  const html = posts.map(myPostTemplate).join('');
  section.insertAdjacentHTML('beforeend', html);
}

// -----------------------
// 초기화
// -----------------------
export async function initializeDrawer(): Promise<void> {
  const [authors, recent, interest, myPosts] = await Promise.all([
    fetchInterestAuthors(),
    fetchRecentlyViewedPosts(),
    fetchInterestPosts(),
    fetchMyPosts(),
  ]);

  renderInterestAuthors(authors ?? []);
  renderRecentlyViewedPosts(recent ?? []);
  renderInterestPosts(interest ?? []);
  renderMyPosts(myPosts ?? []);

  console.log('Drawer UI 초기화 완료.');
  if (!getToken()) {
    console.warn('⚠️ 액세스 토큰이 없어 관심 작가/글 데이터는 빈 목록이 표시됩니다.');
  }
}

// 자동 초기화 (페이지 로드 시)
initializeDrawer().catch((e) => console.error('초기화 중 오류:', e));
