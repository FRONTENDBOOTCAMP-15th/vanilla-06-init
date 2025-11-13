class FooterComponent extends HTMLElement {
  connectedCallback() {
    this.render();
    this.unwrap();
  }

  render() {
    this.innerHTML = `
      <footer id="footer" class="footer">
        <div class="inner">
          <div class="share-area">
            <ul class="share-list">
              <li class="share-item">
                <a class="share-link ico-kakao" href="#"></a>
              </li>
              <li class="share-item">
                <a class="share-link ico-facebook" href="#"></a>
              </li>
              <li class="share-item">
                <a class="share-link ico-twitter-x" href="#"></a>
              </li>
            </ul>
          </div>
          <div class="policy-area">
            <ul class="policy-list">
              <li class="policy-item">
                <a href="#" class="policy-link">이용약관</a>
              </li>
              <li class="policy-item">
                <a href="#" class="policy-link">이전 이용약관</a>
              </li>
              <li class="policy-item">
                <a href="#" class="policy-link">카카오 유료서비스 이용약관</a>
              </li>
              <li class="policy-item">
                <a href="#" class="policy-link color-light-gray">카카오 개인정보 처리방침</a>
              </li>
              <li class="policy-item">
                <a href="#" class="policy-link">청소년 보호정책</a>
              </li>
              <li class="policy-item">
                <a href="#" class="policy-link">운영정책</a>
              </li>
            </ul>
            </div>
            <a class="footer-logo" href="/">
              <span class="sr-only">brunchstory</span>
            </a>
        </div>
      </footer>
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

customElements.define('init-footer', FooterComponent);
