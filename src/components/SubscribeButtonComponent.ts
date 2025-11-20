// subscribe-button.ts

const API_BASE_URL = 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = 'febc15-vanilla06-ecad';
// 로컬 스토리지 키 정의
const LOCAL_AUTHORS_KEY = 'subscribedAuthors';

// 로컬 저장소에서 현재 구독 작가 목록
function getLocalSubscribedAuthors(): any[] {
  try {
    const json = localStorage.getItem(LOCAL_AUTHORS_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

// 로컬 저장소에 구독 작가 목록을 저장
function saveLocalSubscribedAuthors(authors: any[]) {
  try {
    localStorage.setItem(LOCAL_AUTHORS_KEY, JSON.stringify(authors));
  } catch (e) {
    console.error("로컬 스토리지 저장 실패:", e);
  }
}


class SubscribeButtonComponent extends HTMLElement {
  private authorId: string = "";
  private isSubscribed: boolean = false;
  private bookmarkId: string | null = null;
  private token: string | null = null;
  private currentUserId: string | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    this.authorId = this.getAttribute("author-id") || "";
    this.token = localStorage.getItem("accessToken");

    // 현재 로그인된 사용자 ID를 로드 (user 객체에서 _id 추출)
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.currentUserId = userData._id;
      } catch {
        this.currentUserId = null;
      }
    }

    // 비로그인 또는 자기 자신 구독 시 숨김
    if (!this.token || (this.authorId && this.currentUserId && String(this.authorId) === String(this.currentUserId))) {
      this.style.display = 'none';
      return;
    }

    await this.fetchSubscribeStatus();
    this.render();
    this.setEvents();
  }

  // 구독 여부 조회 - 로컬 캐시를 읽어와서 상태 확인
  async fetchSubscribeStatus() {
    if (!this.token) return;

    // 1. 로컬 캐시에서 먼저 확인
    const localList = getLocalSubscribedAuthors();
    // 로컬 캐시에 저장된 _id (작가ID)
    const foundLocal = localList.find((x: any) => String(x._id) === String(this.authorId));

    if (foundLocal) {
      this.isSubscribed = true;
      this.bookmarkId = foundLocal.bookmarkId; // 취소 시 사용할 bookmarkId
      return;
    }

    // 2. (선택적) 로컬에 없으면 API 호출 시도 (404 오류 때문에 실패할 가능성이 높음)
    try {
      const res = await fetch(`${API_BASE_URL}/bookmarks/user`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'client-id': CLIENT_ID,
        },
      });

      if (!res.ok) return;

      const rawData = await res.json();
      const list = rawData.item && Array.isArray(rawData.item) ? rawData.item : [];

      const found = list.find((x: any) => {
        const target = x.user?._id || x.target_id || x.targetId;
        return String(target) === String(this.authorId);
      });

      if (found) {
        this.isSubscribed = true;
        this.bookmarkId = found._id;
      }
    } catch (e) {
      console.error('구독 상태 조회 실패', e);
    }
  }

  // 구독하기 - 로컬 데이터에 작가 정보 추가
  async subscribe() {
    if (!this.token) return alert("로그인이 필요합니다.");

    // 구독 버튼을 누를 때 author-name과 author-image 속성
    const authorName = this.getAttribute('author-name') || '작가 이름';
    const authorImage = this.getAttribute('author-image') || '';

    try {
      const res = await fetch(`${API_BASE_URL}/bookmarks/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
          'client-id': CLIENT_ID,
        },
        body: JSON.stringify({
          // 서버 요구사항에 맞게 target_id 필드 사용
          target_id: Number(this.authorId) || this.authorId
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('구독 실패:', err);
        return alert("구독에 실패했습니다.");
      }

      const data = await res.json();
      this.isSubscribed = true;
      // 응답 구조에서 _id 추출 강화
      this.bookmarkId = data.item?._id || data._id;

      // 로컬 캐시에 작가 정보 저장
      const newAuthor = {
        _id: this.authorId,
        name: authorName,
        image: authorImage,
        bookmarkId: this.bookmarkId // 취소 시 사용하기 위해 저장
      };

      const authors = getLocalSubscribedAuthors();
      if (!authors.find(a => a._id === this.authorId)) {
        authors.push(newAuthor);
        saveLocalSubscribedAuthors(authors);
      }

      this.dispatchEvent(new CustomEvent("subscribe-change", { detail: { isSubscribed: true } }));
      this.render();
      this.setEvents();
      console.log(`[Subscribe] ${this.authorId} 구독 성공. Bookmark ID: ${this.bookmarkId}`);

    } catch (e) {
      console.error('구독 요청 중 오류 발생:', e);
      alert("오류가 발생했습니다.");
    }
  }

  // 💡 [수정] 구독 취소 - 로컬 데이터에서 작가 정보 삭제
  async unsubscribe() {
    // bookmarkId가 없다면 로컬 캐시에서 찾아서 DELETE 요청에 필요한 bookmarkId
    if (!this.bookmarkId || !this.token) {
      const authors = getLocalSubscribedAuthors();
      const localFound = authors.find(a => a._id === this.authorId);
      if (localFound) this.bookmarkId = localFound.bookmarkId;
      if (!this.bookmarkId) return; // 그래도 없으면 중단
    }

    try {
      const res = await fetch(`${API_BASE_URL}/bookmarks/${this.bookmarkId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.token}`,
          'client-id': CLIENT_ID,
        },
      });

      if (!res.ok) return alert("구독 취소 실패");

      this.isSubscribed = false;
      this.bookmarkId = null;

      //로컬 캐시에서 작가 정보 삭제
      let authors = getLocalSubscribedAuthors();
      authors = authors.filter(a => a._id !== this.authorId);
      saveLocalSubscribedAuthors(authors);


      this.dispatchEvent(new CustomEvent("subscribe-change", { detail: { isSubscribed: false } }));
      this.render();
      this.setEvents();
      console.log(`[Unsubscribe] ${this.authorId} 구독 취소 성공.`);
    } catch (e) {
      console.error('구독 취소 중 오류 발생:', e);
    }
  }

  // 버튼 클릭 이벤트
  setEvents() {
    const btn = this.shadowRoot?.querySelector("button");
    if (!btn) return;
    btn.onclick = (e) => {
      e.stopPropagation();
      // 중복 클릭 방지
      (btn as HTMLButtonElement).disabled = true;
      if (this.isSubscribed) this.unsubscribe().finally(() => (btn as HTMLButtonElement).disabled = false);
      else this.subscribe().finally(() => (btn as HTMLButtonElement).disabled = false);
    };
  }

  // 렌더링 (디자인 포함)
  render() {
    if (!this.token || !this.authorId || (this.authorId && this.currentUserId && String(this.authorId) === String(this.currentUserId))) {
      this.shadowRoot!.innerHTML = ``;
      this.style.display = 'none';
      return;
    }

    this.style.display = 'inline-block';

    const active = this.isSubscribed;
    const c = "#00C6BE";

    this.shadowRoot!.innerHTML = `
    <style>
    :host {
      display: inline-block;
      vertical-align: middle;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 7px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 500;
      border: 1px solid ${c}; 
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
      font-family: inherit;
      line-height: 1;
    }
    .btn.inactive { background: #ffffff; color: ${c}; }
    .btn.active { background: ${c}; color: #ffffff; border-color: ${c}; } 
    .btn:hover { opacity: 0.9; } 
    .icon { font-size: 14px; line-height: 1; }
    </style> 

    <button class="btn ${active ? "active" : "inactive"}">
      ${active
        ? `<span class="icon">✔</span> 구독중`
        : `<span class="icon">＋</span> 구독`
      }
    </button>
    `;
  }
}

customElements.define("subscribe-button", SubscribeButtonComponent);