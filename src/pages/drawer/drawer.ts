/*
  drawer.ts
  - 아 살려주세요.
*/

const CLIENT_ID = 'febc15-vanilla06-ecad';
const API_BASE_URL = 'https://fesp-api.koyeb.app/market';
const LOCAL_AUTHORS_KEY = 'subscribedAuthors';

// -----------------------
// [1] 타입 정의
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
// [2] 유틸리티 및 API
// -----------------------
const getToken = (): string | null => localStorage.getItem('accessToken');

const truncateContent = (content: string, limit = 20): string =>
  content.length > limit ? content.substring(0, limit) + '...' : content;

// 404 에러 방어를 위해 warning만 띄우고 null을 반환하도록 처리
async function apiGet<T>(path: string, needAuth = false): Promise<T | null> {
  const headers: Record<string, string> = {
    'client-id': CLIENT_ID,
    'Content-Type': 'application/json',
  };

  if (needAuth) {
    const token = getToken();
    if (!token) return null;
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { headers });
    if (res.status === 404) {
      console.warn(`[API Warning] ${path} (${res.status}) - API 경로 문제 또는 데이터 없음 (404)`);
      return null;
    }
    if (!res.ok) {
      console.warn(`[API Warning] ${path} (${res.status}) - 요청 실패`);
      return null;
    }
    return (await res.json()) as T;
  } catch (e) {
    console.error(`[API Fail] ${path}`, e);
    return null;
  }
}

// -----------------------
// [3] 데이터 정규화
// -----------------------
const DEFAULT_PROFILE_IMAGE = 'https://d2.naver.com/static/img/k2/default/img_profile_default.png';

function normalizeAuthor(raw: any): Author {
  if (!raw) return { _id: '', image: DEFAULT_PROFILE_IMAGE, name: '정보 없음' };

  const id = raw._id ?? raw.targetId ?? raw.id ?? '';
  const name = raw.name ?? raw.nickname ?? '이름 없음';

  let image = raw.image;
  if (!image || image === 'undefined' || !image.startsWith('http')) {
    image = DEFAULT_PROFILE_IMAGE;
  }

  return { _id: String(id), image, name };
}

function normalizePost(raw: any): Post {
  if (!raw) return { _id: '', image: '', title: '', name: '' };

  const id = raw._id ?? raw.targetId ?? raw.id ?? '';
  const title = raw.title ?? '제목 없음';
  // user 객체 또는 name 필드에서 작성자 이름 추출
  const authorName = raw.user?.name ?? raw.name ?? raw.authorName ?? '정보 없음';

  let image = raw.image;
  if (!image || image === 'undefined') image = '';

  return { _id: String(id), image, title, name: authorName };
}

function normalizeMyPost(raw: any): MyPost {
  if (!raw) return { _id: '', title: '', content: '', createdAt: '' };

  return {
    _id: String(raw._id ?? raw.id ?? ''),
    title: raw.title ?? '제목 없음',
    content: raw.content ? raw.content.replace(/<[^>]+>/g, '') : '',
    createdAt: raw.createdAt ?? raw.date ?? '',
  };
}

// -----------------------
// [4] HTML 템플릿
// -----------------------
const authorTemplate = (author: Author) => {
  if (!author._id) return '';
  return `
    <a href="/src/pages/author/author.html?userId=${author._id}" class="brunch_author_link">
      <img src="${author.image}" alt="${author.name}" class="thumb" style="object-fit: cover;" />
      <span class="name">${author.name}</span>
    </a>
  `;
};

const postTemplate = (post: Post) => {
  if (!post._id) return '';
  return `
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
};

const myPostTemplate = (post: MyPost) => {
  if (!post._id) return '';
  return `
    <a href="/src/pages/posts/detail.html?postId=${post._id}" class="mybrunch_link">
      <div class="mybrunch_card">
        <b class="ttl">${post.title}</b>
        <p class="desc">${truncateContent(post.content, 30)}</p>
        <time class="date">${post.createdAt.split(' ')[0]}</time>
      </div>
    </a>
  `;
};

// -----------------------
// [5] 렌더링 함수들
// -----------------------
function renderList<T>(
  selector: string,
  items: T[],
  emptyMessage: string,
  template: (item: T) => string
) {
  const container = document.querySelector(selector);
  if (!container) return;

  container.innerHTML = '';

  const validItems = items.filter(item => (item as any)._id);

  if (!validItems || validItems.length === 0) {
    container.innerHTML = `<p class="drawer_no_data" style="padding: 20px 0; text-align: center; color: #999; font-size: 13px;">${emptyMessage}</p>`;
    return;
  }
  container.innerHTML = validItems.map(template).join('');
}

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

// -----------------------
// [6] 데이터 Fetch 함수
// -----------------------
async function fetchInterestAuthors(): Promise<Author[]> {
  const token = getToken();
  if (!token) return [];

  try {
    const json = localStorage.getItem(LOCAL_AUTHORS_KEY);
    const localList = json ? JSON.parse(json) : [];

    // 로컬 데이터를 Author 타입으로 정규화
    return localList
      .map((item: any) => {
        // _id, name, image 필드가 로컬에 저장되어 있으므로 바로 정규화
        return normalizeAuthor(item);
      })
      .filter((item: Author) => item._id !== ''); // 유효한 데이터만 필터링

  } catch (e) {
    console.error("[Drawer] 로컬 구독 목록 로드 실패:", e);
    return [];
  }
}

async function fetchInterestPosts(): Promise<Post[]> {
  // GET /bookmarks/post는 404가 나지 않는다고 가정하고 API 유지
  const res = await apiGet<{ item: any[] }>('/bookmarks/post', true);
  const list = res?.item ?? [];

  return list
    .map((item) => {
      const target = item.post || item.product || item.target;
      if (!target) return null;
      return normalizePost(target);
    })
    .filter((item): item is Post => item !== null);
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

  const promises = postIds.map((id) => apiGet<{ item: any }>(`/posts/${id}`));
  const results = await Promise.all(promises);

  return results
    .filter((res) => res && res.item)
    .map((res) => normalizePost(res!.item));
}

async function fetchMyPosts(): Promise<MyPost[]> {
  return [];
}

// -----------------------
// [7] 초기화 및 실행
// -----------------------
export async function initializeDrawer(): Promise<void> {
  // 로그인 토큰만 확인하고, Drawer 콘텐츠 초기화
  if (!getToken()) {
    renderInterestAuthors([]);
    renderRecentlyViewedPosts([]);
    renderInterestPosts([]);
    renderMyPosts([]);
    return;
  }

  // DOM 존재 여부 확인
  const checkDOM = document.querySelector('.js-drawer-author');
  if (!checkDOM) return;

  // 구독 상태 변경 이벤트 리스너 추가 (subscribe-button이 dispatch 할 때마다 새로고침)
  window.addEventListener('subscribe-change', initializeDrawer as EventListener);


  try {
    // 모든 데이터 병렬로 가져오기
    const [authors, recent, interest, myPosts] = await Promise.all([
      fetchInterestAuthors(),
      fetchRecentlyViewedPosts(),
      fetchInterestPosts(),
      fetchMyPosts(),
    ]);

    // 렌더링
    renderInterestAuthors(authors);
    renderRecentlyViewedPosts(recent);
    renderInterestPosts(interest);
    renderMyPosts(myPosts);

    console.log('[Drawer] 렌더링 완료');
  } catch (error) {
    console.error('[Drawer] 실행 중 치명적 오류:', error);
  }
}

// DOM 로드 후 초기화 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDrawer);
} else {
  initializeDrawer();
}