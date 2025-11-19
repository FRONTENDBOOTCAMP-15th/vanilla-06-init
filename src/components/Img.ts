class ImgComponent extends HTMLElement {
  connectedCallback() {
    const src = this.getAttribute('src') || '/public/images/error_404.png';
    const alt = this.getAttribute('alt') || '';

    const img = document.createElement('img');
    img.className = this.className;
    img.src = src;
    img.alt = alt;
    img.onerror = () => {
      img.src = '/public/images/error_404.png';
    };

    if (this.parentNode) {
      this.parentNode.insertBefore(img, this);
      this.parentNode.removeChild(this);
    }
  }
}

customElements.define('init-img', ImgComponent);
