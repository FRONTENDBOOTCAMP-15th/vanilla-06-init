import './utils/accessPages.ts';
import './styles/main.css';
import './components/Header.ts';
import './components/Footer.ts';
import './components/Navigation.ts';

console.log('main.ts');
document.addEventListener(
  'error',
  e => {
    const target = e.target as HTMLImageElement;
    if (target.tagName === 'IMG') {
      target.src = '/images/error_404.png';
    }
  },
  true,
);
