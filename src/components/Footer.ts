class FooterComponent extends HTMLElement {
  connectedCallback() {
    this.render();
    this.unwrap();
  }

  render() {
    this.innerHTML = `
      <footer id="footer" class="footer">
        <div class="inner">
          <div class="share_area">
            <ul class="share_list">
              <li class="share_item">
                <a class="share_link ico_kakao" href="#"></a>
              </li>
              <li class="share_item">
                <a class="share_link ico_facebook" href="#"></a>
              </li>
              <li class="share_item">
                <a class="share_link ico_twitter_x" href="#"></a>
              </li>
            </ul>
          </div>
          <div class="policy_area">
            <ul class="policy_list">
              <li class="policy_item">
                <a href="#" class="policy_link">이용약관</a>
              </li>
              <li class="policy_item">
                <a href="#" class="policy_link">이전 이용약관</a>
              </li>
              <li class="policy_item">
                <a href="#" class="policy_link">카카오 유료서비스 이용약관</a>
              </li>
              <li class="policy_item">
                <a href="#" class="policy_link color_light_gray">카카오 개인정보 처리방침</a>
              </li>
              <li class="policy_item">
                <a href="#" class="policy_link">청소년 보호정책</a>
              </li>
              <li class="policy_item">
                <a href="#" class="policy_link">운영정책</a>
              </li>
            </ul>
            </div>
            <a class="footer_logo" href="/">
              <span class="sr_only">brunchstory</span>
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
