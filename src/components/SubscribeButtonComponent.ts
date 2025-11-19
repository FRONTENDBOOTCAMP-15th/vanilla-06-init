// html에서 <subscribe-button author-id="user id"></subscribe-button> 바로 사용 가능.
// CLIENT_ID 수정해야할 부분
// 현재(25.11.18) issue 401 오류 해결에 있어 코드 6번 줄로 해결 완.

const API_BASE_URL = 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = 'febc15-vanilla06-ecad';

class SubscribeButtonComponent extends HTMLElement {
  private authorId: string = "";
  private isSubscribed: boolean = false;
  private bookmarkId: string | null = null;
  private token: string | null = null;
  // 💡 추가: 현재 로그인된 사용자 ID를 저장
  private userId: string | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  // 초기 데이터 로드(컴포넌트가 DOM에 추가될 때 실행)
  async connectedCallback() {
    this.authorId = this.getAttribute("author-id") || "";
    this.token = localStorage.getItem("accessToken");
    // 💡 추가: 현재 로그인된 사용자 ID를 로드
    this.userId = localStorage.getItem("userId");

    // 내가 나 자신을 구독하는 경우 (버튼을 숨겨야 함)
    if (this.authorId && this.userId && this.authorId === this.userId) {
      // 💡 내가 나 자신을 구독하는 경우 아무것도 렌더링하지 않거나, display: none 처리
      this.style.display = 'none';
      return;
    }

    await this.fetchSubscribeStatus();
    this.render();
    this.setEvents();
  }

  // 구독 여부 조회
  async fetchSubscribeStatus() {
    // 토큰이 없으면 API 호출 없이 종료
    if (!this.token) return;

    const res = await fetch(`${API_BASE_URL}/bookmarks/user`, {
      headers: {
        Authorization: `Bearer ${this.token}`, // 인증용
        'client-id': CLIENT_ID,
      },
    });

    if (!res.ok) return;

    const rawData = await res.json();
    // 💡 수정: 응답 객체에서 실제 배열인 item을 추출
    const list = rawData.item && Array.isArray(rawData.item) ? rawData.item : rawData;

    // 💡 수정: list가 배열이 아니면 처리하지 않고 종료
    if (!Array.isArray(list)) return;

    // targetId가 현재 작가 ID와 일치하는지 확인
    const found = list.find((x: any) => x.targetId === this.authorId);

    if (found) {
      this.isSubscribed = true;
      this.bookmarkId = found._id;
    }
  }

  // 구독하기
  async subscribe() {
    const res = await fetch(`${API_BASE_URL}/bookmarks/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
        'client-id': CLIENT_ID,
      },
      body: JSON.stringify({ targetId: this.authorId }),
    });

    if (!res.ok) return alert("구독 실패");

    const data = await res.json();
    this.isSubscribed = true;
    this.bookmarkId = data.bookmark?._id || data._id; // 응답 구조에 따라 bookmark._id 또는 _id 사용

    this.dispatchEvent(new CustomEvent("subscribe-change", { detail: 1 }));
    this.render();
    this.setEvents();
  }

  // 구독 취소
  async unsubscribe() {
    if (!this.bookmarkId) return;

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

    this.dispatchEvent(new CustomEvent("subscribe-change", { detail: -1 }));
    this.render();
    this.setEvents();
  }

  // 버튼 클릭 이벤트
  setEvents() {
    const btn = this.shadowRoot?.querySelector("button");
    if (!btn) return;
    btn.onclick = () => {
      if (this.isSubscribed) this.unsubscribe();
      else this.subscribe();
    };
  }

  // 렌더링 (디자인 포함)
  render() {
    // 토큰이 없거나 작가ID가 없으면 렌더링하지 않음
    if (!this.token || !this.authorId || (this.authorId && this.userId && this.authorId === this.userId)) {
      // 내가 나 자신을 구독하는 경우 connectedCallback에서 이미 return 되었으므로 여기서는 안전 장치 역할
      this.shadowRoot!.innerHTML = ``;
      this.style.display = 'none';
      return;
    }

    const active = this.isSubscribed;
    const c = "#00C6BE"; // 메인 컬러

    this.shadowRoot!.innerHTML = `
    <style>
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 9px 18px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 500;
      border: 2px solid ${c};
      cursor: pointer;
      transition: all 0.25s ease;
      user-select: none;
    }
    .btn.inactive {
      background: #ffffff;
      color: ${c};
    }

    .btn.active {
    background: ${c};
    color: #ffffff;
    } 
    .btn:hover {
    transform: translateY(-1px);
    opacity: 0.9;
    } 
    .icon {
    font-size: 16px;
    font-weight: bold;
    }
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