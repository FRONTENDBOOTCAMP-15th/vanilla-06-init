import './utils/accessPages.ts';
import './styles/main.css';
import './components/Header.ts';
import './components/Footer.ts';
import './components/Navigation.ts';
import './components/SubscribeButtonComponent.ts'; // 구독 컴포넌트 import
import './pages/drawer/drawer.ts'; // 드로어 페이지 import

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
