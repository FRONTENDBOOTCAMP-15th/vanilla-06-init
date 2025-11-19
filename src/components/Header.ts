import type { User } from '../types/user';

class HeaderComponent extends HTMLElement {
  connectedCallback() {
    this.render();
    this.unwrap();
  }

  render() {
    console.log('header');
    const user = this.getUser();

    this.innerHTML = `
      <header id="header" class="header">
        <div class="inner">
          <a class="gnb_logo" href="/">
            <span class="sr_only">brunchstory</span>
          </a>
          ${
            user.name
              ? `
              <a href="#" class="link_notice">
                <span class="sr_only">알림설정</span>
              </a>
              <a href="/src/pages/discover/discover.html" class="link_search">
                <span class="sr_only">검색하기</span>
              </a>
              <a href="/src/pages/drawer/drawer.html" class="link_profile">
                <img class="profile" src="${user.image}" alt=""/>
                <span class="sr_only">프로필</span>
              </a>
            `
              : `
              <a href="/src/pages/discover/discover.html" class="link_search">
                <span class="sr_only">검색하기</span>
              </a>
              <a href="/src/pages/auth/login.html" class="btn_dark">
                시작하기
              </a>
            `
          }
        </div>
      </header>
    `;
  }

  private unwrap(): void {
    const parent = this.parentNode;
    if (!parent) return;

    while (this.firstChild) {
      parent.insertBefore(this.firstChild, this);
    }
    parent.removeChild(this);
  }

  private getUser(): User {
    const user: User = JSON.parse(localStorage.getItem('currentUser') || '{}');

    return user;
  }
}

customElements.define('init-header', HeaderComponent);
