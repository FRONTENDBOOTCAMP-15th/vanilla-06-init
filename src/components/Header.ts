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
          <a class="gnb-logo" href="/">
            <span class="sr-only">brunchstory</span>
          </a>
          ${
            user.name
              ? `
              <a href="#" class="link-notice">
                <span class="sr-only">알림설정</span>
              </a>
              <a href="/discover/discover.html" class="link-search">
                <span class="sr-only">검색하기</span>
              </a>
              <a href="/drawer/drawer.html" class="link-profile">
                <img class="profile" src="${user.image}" alt=""/>
                <span class="sr-only">프로필</span>
              </a>
            `
              : `
              <a href="/discover/discover.html" class="link-search">
                <span class="sr-only">검색하기</span>
              </a>
              <a href="/auth/login.html" class="btn-dark">
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
    const user: User = JSON.parse(localStorage.getItem('user') || '{}');

    return user;
  }
}

customElements.define('init-header', HeaderComponent);
