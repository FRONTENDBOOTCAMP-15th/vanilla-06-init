import { getAxios } from '../../utils/axios.ts';

const axios = getAxios();

// URL에서 postId 가져오기 (▶ 숫자로 변환)
const params = new URLSearchParams(window.location.search);
const postId = Number(params.get('postId')); // ⭐ 핵심 수정

// 타입 정의
// interface Author {
//   _id: number;
//   name: string;
//   image: string;
// }

// 최근 본 글 저장 함수
function saveRecent(id: string) {
  const list = JSON.parse(localStorage.getItem('recent') || '[]') as string[];
  const filtered = list.filter(v => v !== id);
  filtered.unshift(id);

  localStorage.setItem('recent', JSON.stringify(filtered.slice(0, 10)));
}

// API 함수들
async function getPostDetail(id: number) {
  const { data } = await axios.get(`/posts/${id}`);
  return data;
}

async function getMyLike(postId: number) {
  try {
    const { data } = await axios.get(`/bookmarks/post/${postId}`);
    return data.item;
  } catch {
    return null;
  }
}

async function getMySubscribe(userId: number) {
  try {
    const { data } = await axios.get(`/bookmarks/user/${userId}`);
    return data.item;
  } catch {
    return null;
  }
}

async function toggleLike(postId: number, bookmarkId: number | null) {
  try {
    if (!bookmarkId) {
      const body = { target_id: postId, is_like: true };
      const { data } = await axios.post('/bookmarks/post', body);
      return data.item?._id;
    } else {
      await axios.delete(`/bookmarks/${bookmarkId}`, {
        data: { target_id: postId },
      });
      return null;
    }
  } catch (err) {
    console.error('좋아요 토글 실패:', err);
    return bookmarkId;
  }
}

async function toggleSubscribe(userId: number, bookmarkId: number | null) {
  try {
    if (!bookmarkId) {
      const body = { target_id: userId, is_like: true };
      const { data } = await axios.post('/bookmarks/user', body);
      return data.item?._id;
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

async function refreshLikes(postId: number) {
  const { data } = await axios.get(`/posts/${postId}`);
  return data.item.likes;
}

async function getSubscriberCount(userId: number) {
  const { data } = await axios.get(`/users/${userId}/bookmarks`);
  return data.item.byUser.length;
}

// 상세 페이지 렌더링
async function renderDetail() {
  if (!postId) return;

  try {
    const data = await getPostDetail(postId);
    const post = data.item;

    // DOM 요소 찾기
    const likeInput = document.querySelector(
      '.detail_like_input',
    ) as HTMLInputElement;
    const likeLabel = document.querySelector('.detail_like_label')!;
    const subBtn = document.querySelector('.detail_btn_subs')!;
    const likeCountEl = document.querySelector('.detail_like_count')!;
    const subCountEl = document.querySelector('.detail_author_subscriber')!;

    // UI 초기화
    likeInput.checked = false;
    subBtn.textContent = '+ 구독';
    subBtn.classList.remove('active');

    likeCountEl.textContent = '0';
    subCountEl.textContent = '0';

    // 상세 기본 정보 렌더링
    document.querySelector('.detail_title')!.textContent = post.title;
    document.querySelector('.detail_subtitle')!.textContent =
      post.extra.subTitle;
    document.querySelector('.editor_render_area')!.innerHTML = post.content;

    document.querySelector('.detail_author')!.textContent = post.user.name;
    document.querySelector('.detail_author_name')!.textContent = post.user.name;

    document
      .querySelector('.detail_author_img')!
      .setAttribute('src', post.user.image);

    // 좋아요 / 구독 상태 조회
    let myLike = await getMyLike(post._id);
    let myLikeId = myLike?._id || null;

    let mySub = await getMySubscribe(post.user._id);
    let mySubId = mySub?._id || null;

    const subscriberCount = await getSubscriberCount(post.user._id);

    // UI 적용
    likeInput.checked = !!myLikeId;
    likeCountEl.textContent = post.likes.toString();
    subCountEl.textContent = subscriberCount.toString();

    if (mySubId) {
      subBtn.textContent = '구독중';
      subBtn.classList.add('active');
    } else {
      subBtn.textContent = '+ 구독';
      subBtn.classList.remove('active');
    }

    // 좋아요 클릭 이벤트
    likeLabel.addEventListener('click', async () => {
      myLikeId = await toggleLike(post._id, myLikeId);

      likeInput.checked = !!myLikeId;

      const updatedLikes = await refreshLikes(post._id);
      likeCountEl.textContent = updatedLikes.toString();
    });

    // 구독 클릭 이벤트
    subBtn.addEventListener('click', async () => {
      mySubId = await toggleSubscribe(post.user._id, mySubId);

      if (mySubId) {
        subBtn.textContent = '구독중';
        subBtn.classList.add('active');
      } else {
        subBtn.textContent = '+ 구독';
        subBtn.classList.remove('active');
      }

      const updatedSubs = await getSubscriberCount(post.user._id);
      subCountEl.textContent = updatedSubs.toString();
    });

    // 최근 본 글 저장
    saveRecent(String(postId)); // 문자열로 저장
  } catch (err) {
    console.error('상세 조회 실패:', err);
  }
}

// 실행
renderDetail();
