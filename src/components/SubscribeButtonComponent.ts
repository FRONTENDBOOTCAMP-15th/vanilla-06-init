// html에서 <subscribe-button author-id="12345"></subscribe-button> 바로 사용 가능.
// CLIENT_ID 수정해야할 부분
// 현재(25.11.18) issue 401 오류 해결에 있어 코드 6번 줄로 해결 완.

const API_BASE_URL = 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = 'febc15-vanilla06-ecad';

class SubscribeButtonComponent extends HTMLElement {
  private authorId: string = "";
  private isSubscribed: boolean = false;
  private bookmarkId: string | null = null;
  private token: string | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  // 초기 데이터 로드(컴포넌트가 DOM에 추가될 때 실행)
  // 인증 토큰 로드 : localStorage에서 'accessToken'을 가져옴
  // 현재 (25.11.18) 401 issue 는 이 값이 유효하지 않아 발생
  // 구독 상태 조회 및 렌더링
  async connectedCallback() {
    this.authorId = this.getAttribute("author-id") || "";
    this.token = localStorage.getItem("accessToken");
    await this.fetchSubscribeStatus();
    this.render();
    this.setEvents();
  }

  // 구독 여부 조회
  async fetchSubscribeStatus() {
    const res = await fetch(`${API_BASE_URL}/bookmarks/user`, {
      headers: {
        Authorization: `Bearer ${this.token}`, // 인증용
        'client-id': CLIENT_ID,
      },
    });

    if (!res.ok) return;

    const list = await res.json();
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
    this.bookmarkId = data.bookmark._id;

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