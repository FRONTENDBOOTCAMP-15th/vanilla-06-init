// ------------ 타입 정의 ---------------- //
interface Author {
  _id: number;
  name: string;
  image: string;
  extra?: {
    job?: string;
    biography?: string;
  };
}

interface PostDetail {
  _id: number;
  title: string;
  extra: { subTitle: string };
  content: string;
  user: Author;
}

interface PostDetailResponse {
  ok: number;
  item: PostDetail;
}

// ------------ 기능 시작 ---------------- //

const params = new URLSearchParams(window.location.search);
const postId = params.get("postId");

const baseURL = "https://fesp-api.koyeb.app/market";
const token = localStorage.getItem("token");

// API 요청
async function getPostDetail(id: string): Promise<PostDetailResponse> {
  // 공통 헤더 세팅
const headers: Record<string, string> = {
  "client-id": "brunch",  // 👉 서버가 요구하는 기본 헤더
};

// 토큰이 있으면 Authorization 추가
if (token) {
  headers["Authorization"] = `Bearer ${token}`;
}

// 최종 fetch 요청
const res = await fetch(`${baseURL}/posts/${id}`, {
  headers,
});

  return res.json();
}

// 최근 본 글 기록
function saveRecent(id: string) {
  const list = JSON.parse(localStorage.getItem("recent") || "[]") as string[];
  const filtered = list.filter((v) => v !== id);
  filtered.unshift(id);
  localStorage.setItem("recent", JSON.stringify(filtered.slice(0, 10)));
}

// 렌더링
async function renderDetail() {
  if (!postId) return;

  const data = await getPostDetail(postId);
  const post = data.item;

  // 제목
  document.querySelector(".detail_title")!.textContent = post.title;

  // 부제
  document.querySelector(".detail_subtitle")!.textContent =
    post.extra.subTitle ?? "";

  // 작성자 이름 (상단)
  document.querySelector(".detail_author")!.textContent = post.user.name;

  // 작성자 이름 (아래쪽)
  document.querySelector(".detail_author_name")!.textContent =
    post.user.name ?? "";

  // 작성자 직업
  document.querySelector(".detail_author_job")!.textContent =
    post.user.extra?.job ?? "";

  // 작성자 소개
  document.querySelector(".detail_author_desc")!.textContent =
    post.user.extra?.biography ?? "";

  // 작성자 이미지
  document
    .querySelector(".detail_author_img")!
    .setAttribute("src", post.user.image);

  // 본문
  document.querySelector(".editor_render_area")!.innerHTML = post.content;

  saveRecent(postId);
}

renderDetail();

console.log("postId =", postId);
console.log("token =", token);
