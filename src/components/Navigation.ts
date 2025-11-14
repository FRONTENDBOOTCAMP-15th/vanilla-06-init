class NavigationComponent extends HTMLElement {
  connectedCallback() {
    this.render();
    this.unwrap();
  }

  private render(): void {
    const path: string = location.pathname.replace(/\/$/, ''); // 끝 슬래시 제거

    const routes: { href: string; icoClass: string; text: string }[] = [
      { href: '/index.html', icoClass: 'ico-home', text: '홈' },
      {
        href: '/src/pages/discover/discover.html',
        icoClass: 'ico-discover',
        text: '발견',
      },
      {
        href: '/src/pages/posts/write.html',
        icoClass: 'ico-write',
        text: '글쓰기',
      },
      {
        href: '/src/pages/drawer/drawer.html',
        icoClass: 'ico-drawer',
        text: '내 서랍',
      },
    ];

    const navItems = routes
      .map(({ href, icoClass, text }) => {
        // 허용 경로 배열 생성
        const allowedPaths = [];

        if (href.endsWith('index.html')) {
          allowedPaths.push('/', '/index.html', '/index'); // 홈 예외
        } else {
          const base = href.replace(/\.html$/, ''); // .html 제거
          allowedPaths.push(base); // /discover/discover
          allowedPaths.push(base + '/'); // 끝 슬래시 있는 버전
          allowedPaths.push(href); // 원래 href도 포함
        }

        const isActive = allowedPaths.includes(path);
        const activeClass = isActive ? 'active' : '';
        const activeHomeClass = path === '' && text === '홈' ? 'active' : '';

        return `
          <li class="nav-item ${activeClass} ${activeHomeClass}">
            <a class="nav-link ${icoClass}" href="${href}">${text}</a>
          </li>
        `;
      })
      .join('');

    this.innerHTML = `
      <nav id="nav" class="nav">
        <ul class="nav-list">
          ${navItems}
        </ul>
      </nav>
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
}

customElements.define('init-nav', NavigationComponent);
