import { getAxios } from '../../utils/axios';

const axios = getAxios();

// URL에서 userId 추출
const params = new URLSearchParams(window.location.search);
const userId = Number(params.get('userId'));

// 타입 선언
interface AuthorInfo {
  _id: number;
  name: string;
  job?: string;
  image: string;
}

interface AuthorPost {
  _id: number;
  title: string;
  content: string;
  extra: { subTitle: string };
  comments?: number;
  createdAt: string;
  user: AuthorInfo;
}

interface BookmarkCounts {
  subscribers: number;
  followingAuthors: number;
}

// API 호출 함수들

async function getAuthorInfo(id: number): Promise<AuthorInfo> {
  const { data } = await axios.get(`/users/${id}`);
  return data.item;
}

async function getMySubscribe(userId: number) {
  try {
    const { data } = await axios.get(`/bookmarks/user/${userId}`);
    return data.item;
  } catch {
    return null;
  }
}

async function toggleSubscribe(
  userId: number,
  bookmarkId: number | null,
): Promise<number | null> {
  try {
    if (!bookmarkId) {
      const body = { target_id: userId, is_like: true };
      const { data } = await axios.post('/bookmarks/user', body);
      return data.item?._id ?? null;
    } else {
      await axios.delete(`/bookmarks/${bookmarkId}`, {
        data: { target_id: userId },
      });
      return null;
    }
  } catch (err) {
    console.error('구독 토글 실패:', err);
    return bookmarkId;
  }
}

async function getBookmarkCounts(userId: number): Promise<BookmarkCounts> {
  const { data } = await axios.get(`/users/${userId}/bookmarks`);

  const byUser = data.item.byUser ?? [];
  const byTarget = data.item.byTarget ?? [];

  return {
    subscribers: byUser.length,
    followingAuthors: byTarget.length,
  };
}

async function getAuthorPosts(userId: number): Promise<AuthorPost[]> {
  try {
    // 서버 전체 글 목록 조회
    const { data } = await axios.get(`/posts?type=brunch`);

    const allPosts = data.item ?? [];

    // 작성자가 쓴 글만 필터링
    return allPosts.filter((post: AuthorPost) => post.user._id === userId);
  } catch (err) {
    console.error('작성자 글 목록 조회 실패:', err);
    return [];
  }
}

// 렌더링 함수

async function renderAuthorPage() {
  if (!userId || Number.isNaN(userId)) {
    alert('잘못된 접근입니다. 작가 정보를 찾을 수 없습니다.');
    window.location.href = '/';
    return;
  }

  // (2) 작가 정보 로딩
  let authorData: AuthorInfo;
  try {
    authorData = await getAuthorInfo(userId);
  } catch (err) {
    console.error('❌ getAuthorInfo 에러:', err);
    alert('존재하지 않는 작가입니다.');
    window.location.href = '/';
    return;
  }

  // DOM 요소
  const nameEl = document.querySelector('.author_name')!;
  const jobEl = document.querySelector('.author_job')!;
  const profileEl = document.querySelector('.author_profile')!;
  const subsBtn = document.querySelector('.author_subs_btn')!;
  const statsEls = document.querySelectorAll('.author_stat_value')!;
  const postContainer = document.querySelector('.author_posts')!;

  // (3) 작가 기본 정보 렌더링
  nameEl.textContent = authorData.name;
  jobEl.textContent = authorData.job ?? '';
  profileEl.setAttribute('src', authorData.image);

  // (4) 구독 상태
  let mySub = await getMySubscribe(userId);
  let mySubId = mySub?._id ?? null;

  if (mySubId) {
    subsBtn.textContent = '구독중';
    subsBtn.classList.add('active');
  } else {
    subsBtn.textContent = '+ 구독';
    subsBtn.classList.remove('active');
  }

  // (5) 구독자 수, 관심 작가 수
  const { subscribers, followingAuthors } = await getBookmarkCounts(userId);
  statsEls[0].textContent = subscribers.toString();
  statsEls[1].textContent = followingAuthors.toString();

  // (6) 게시글 목록 렌더링
  const posts = await getAuthorPosts(userId);

  if (posts.length === 0) {
    postContainer.innerHTML = `<p class="no_posts">작성한 게시글이 없습니다.</p>`;
  } else {
    postContainer.innerHTML = posts
      .map(
        (post: AuthorPost) => `
      <article class="author_post" data-id="${post._id}">
        <span class="author_post_tag">${post.extra.subTitle}</span>

        <h3 class="author_post_title">${post.title}</h3>

        <span class="author_post_text">
          ${post.content.replace(/<[^>]+>/g, '').slice(0, 30)}...
        </span>

        <div class="author_post_meta">
          <span class="author_post_comment">댓글 ${post.comments ?? 0}</span>
          <span class="author_post_date">${post.createdAt}</span>
        </div>
      </article>
    `,
      )
      .join('');
  }

  // (7) 게시글 클릭 → 상세페이지 이동
  postContainer.addEventListener('click', e => {
    const item = (e.target as HTMLElement).closest('.author_post');
    if (!item) return;

    const id = item.getAttribute('data-id');
    window.location.href = `/src/pages/posts/detail.html?postId=${id}`;
  });

  // (8) 구독 버튼 토글
  subsBtn.addEventListener('click', async () => {
    mySubId = await toggleSubscribe(userId, mySubId);

    if (mySubId) {
      subsBtn.textContent = '구독중';
      subsBtn.classList.add('active');
    } else {
      subsBtn.textContent = '+ 구독';
      subsBtn.classList.remove('active');
    }

    const updated = await getBookmarkCounts(userId);
    statsEls[0].textContent = updated.subscribers.toString();
  });
}

renderAuthorPage();
