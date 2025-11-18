import type { PostItem } from '../../types/post.ts';
import type { UserItem } from '../../types/user.ts';
import { getAxios } from '../../utils/axios.ts';
import { formatDate } from '../../utils/formatDate.ts';
import { summaryContent } from '../../utils/summaryContent.ts';

const STORAGE_KEY = 'recentSearch';
const formEl = document.querySelector('#searchForm') as HTMLFormElement;
const searchEl = document.querySelector('#searchInput') as HTMLInputElement;
const searchInitEl = document.querySelector(
  '#searchInitPanel',
) as HTMLDivElement;
const searchResultEl = document.querySelector(
  '#searchResultPanel',
) as HTMLDivElement;
const searchEls = document.querySelectorAll<HTMLDivElement>('.search_panel');
const postAreaEl = document.querySelector('#postArea') as HTMLDivElement;
const authorAreaEl = document.querySelector('#authorArea') as HTMLDivElement;
const searchTabEls = document.querySelectorAll<HTMLButtonElement>(
  '.search_tab_area .search_tab',
);
const searchRecentListEl = document.querySelector(
  '#searchInitPanel .search_recent_list',
) as HTMLUListElement;

const emptyHTML = `
      <div class="empty_box">
        <p class="txt">검색 결과가 없습니다.</p>
      </div>
      `;

let timer: number | undefined;
searchEl.addEventListener('input', () => {
  clearTimeout(timer);

  timer = window.setTimeout(() => {
    changeSearch();
  }, 300);
});

// formEl.addEventListener('submit', (e: Event) => {
//   e.preventDefault();

//   changeSearch();
// });

function activeCheckTab(val: string) {
  let activeIndex = -1;
  searchTabEls.forEach((el, index) => {
    if (el.classList.contains('active')) {
      activeIndex = index;
    }
  });

  if (activeIndex === 0) {
    matchingPost(val);
  } else if (activeIndex === 1) {
    matchingAuthor(val);
  }
}

function activeTab() {
  searchTabEls.forEach((el, index) => {
    el.addEventListener('click', () => {
      [...searchTabEls, postAreaEl, authorAreaEl].forEach(el =>
        el.classList.remove('active'),
      );
      console.log('click');
      el.classList.add('active');
      if (index === 0) {
        postAreaEl.classList.add('active');
      } else if (index === 1) {
        authorAreaEl.classList.add('active');
      }
      changeSearch();
    });
  });
}
activeTab();

async function matchingPost(val: string) {
  const axios = getAxios();

  const body = {
    type: 'brunch',
    keyword: val,
  };

  try {
    const { data } = await axios.get('/posts', {
      params: body,
    });
    console.log('필터링된 데이터:', data);
    renderPost(data.item, val);
  } catch (err) {
    console.error(err);
  }
}
async function matchingAuthor(val: string) {
  const axios = getAxios();

  try {
    const { data } = await axios.get('/users');
    console.log('필터링된 작가 데이터:', data);
    renderAuthor(data.item, val);
  } catch (err) {
    console.error(err);
  }
}

function changeSearch() {
  const val = searchEl.value;

  searchEls.forEach(t => t.classList.remove('active'));
  if (val === '') {
    searchInitEl.classList.add('active');
  } else {
    searchResultEl.classList.add('active');
  }

  activeCheckTab(val);
}

// 정규식 특수문자 이스케이프
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 텍스트 내에서 키워드와 일치하는 부분을 <span class="color_mint">로 감싸서 반환
 * @param content - 원본 텍스트
 * @param keyword - 하이라이트할 키워드
 * @returns 하이라이트된 HTML 문자열
 */
function highlight(content: string, keyword: string): string {
  if (!keyword) return content; // 빈 키워드일 경우 원본 반환

  const escapedKeyword = escapeRegExp(keyword);
  const regex = new RegExp(`(${escapedKeyword})`, 'gi');

  return content.replace(regex, '<span class="fw_400 color_mint">$1</span>');
}

function renderPost(posts: PostItem[], val: string) {
  const result = posts.map(post => {
    const { datetime, display } = formatDate(post.createdAt);

    return `
      <article class="post_card">
        <a href="#" class="post_link">
          <h3 class="post_ttl">
            ${highlight(post.title, val)}
          </h3>
          <p class="post_excerpt">
            ${highlight(summaryContent(post.content), val)}
          </p>
          <time class="date" datetime="${datetime}">${display}</time>
          <div class="author_box">
            <span class="by">by</span>
            <span class="author">${post.user.name}</span>
          </div>
          <img
            class="thumb"
            src="${post.image}"
            alt=""
          />
        </a>
      </article>
    `;
  });

  if (posts.length) {
    postAreaEl.innerHTML = result.join('');
  } else {
    postAreaEl.innerHTML = emptyHTML;
  }
}

function renderAuthor(posts: UserItem[], val: string) {
  console.log(posts);

  const filtered = posts.filter(item => {
    return item.name.includes(val);
  });

  const result = filtered.map(item => {
    return `
      <article class="author_card">
        <a href="#" class="author_link">
          <img
            class="thumb"
            src="${item.image}"
            alt=""
          />
          <h3 class="author_ttl">${item.name}</h3>
          <p class="author_excerpt">
            ${summaryContent(item.extra?.statusMsg || '')}
          </p>
          </a>
          <div class="keyword_area">
          ${
            item.extra?.keyword === undefined
              ? ''
              : item.extra?.keyword
                  ?.map(text => {
                    return `<a href="/src/pages/discover/discover.html?search=${text}" class="keyword">${text}</a>`;
                  })
                  .join('')
          }
          </div>
      </article>
    `;
  });

  if (filtered.length) {
    authorAreaEl.innerHTML = result.join('');
  } else {
    authorAreaEl.innerHTML = emptyHTML;
  }
}

function saveRecentSearch(keyword: string) {
  const stored = localStorage.getItem(STORAGE_KEY);
  let list = stored ? JSON.parse(stored) : [];

  list = list.filter((item: String) => item !== keyword);

  list.unshift(keyword);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function getRecentSearch() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function renderRecentSearch() {
  const keywords = getRecentSearch();

  const results = keywords.map((keyword: string) => {
    return `
      <li class="search_recent_item">
        <a href="/src/pages/discover/discover.html?search=${keyword}" class="search_recent_link">${keyword}</a>
        <button
          type="button"
          class="btn_remove"
          aria-label="검색어 삭제"
        ></button>
      </li>
    `;
  });

  searchRecentListEl.innerHTML = results.join('');
}

function init() {
  renderRecentSearch();
}
init();
