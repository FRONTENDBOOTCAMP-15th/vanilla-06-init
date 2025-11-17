interface Post {
  _id: number;
  title: string;
  content: string;
  image?: string;
  thumbnail?: string;
  user: PostUser;
  views: number;
}

interface PostUser {
  name: string;
  image: string;
}

interface Author {
  _id: number;
  postViews: number;
  image: string;
  name: string;
  extra: extrainfo;
}

interface extrainfo {
  job: string;
  biography: string;
}

async function loadPosts() {
  try {
    const respons = await fetch(
      'https://fesp-api.koyeb.app/market/posts?type=brunch&sort={"likes": -1}&limit=10',
      {
        headers: { 'client-id': 'brunch' },
      },
    );
    const data = await respons.json();
    console.log(data);
    renderPosts(data.item);
  } catch (err) {
    console.error('목록을 찾을 수 없습니다.', err);
  }
}

function renderPosts(posts: Post[]) {
  console.log(posts);
  const list = document.querySelector('.mainpage_list');
  if (!list) return;

  list.innerHTML = '';

  posts.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'mainpage_item';

    li.innerHTML = `
    <li class="mainpage_item">
          <span class="mainpage_num">${index + 1}</span>
          <div class="mainpage_text">
            <h2 class="mainpage_secondtitle"><a href='/posts/${item._id}'>${item.title || ''}</a></h2>
            <span class="mainpage_gray_by">by</span>
            <span class="mainpage_name">${item.user.name || ''}</span>
            <p class="mainpage_desc">
              <a href='/posts/${item._id}'>${shortenText(item.content || '', 30)}</a>
            </p>
          </div>

          <div class="mainpage_book">
            <a href='/posts/${item._id}'><img
              src=${item.user.image || item.thumbnail || ''}
              class="mainpage_bookimg"
            /></a>
            <div class="mainpage_overay">
              <p class="mainpage_overay_title">
               ${item.title || ''}
              </p>
              <p class="mainpage_overay_name">${item.user.name || ''}</p>
            </div>
            <img
              src=/icons/logo/logo-white.png
              class="mainpage_book_logo"
            />
          </div>
        </li>
    `;
    list.appendChild(li);
  });
}

async function loadAuthors() {
  try {
    const response = await fetch(
      'https://fesp-api.koyeb.app/market/users?sort={"bookmarkedBy.users": -1}&limit=4',
      {
        headers: { 'client-id': 'brunch' },
      },
    );
    const data = await response.json();
    console.log(data);
    renderAuthours(data.item);
  } catch (err) {
    console.error('작가들의 목록을 찾지 못했습니다.', err);
  }
}

function renderAuthours(authors: Author[]) {
  const divs = document.querySelector('.mainpage_author_group');
  if (!divs) return;

  divs.innerHTML = '';

  authors.forEach(item => {
    const div = document.createElement('div');
    div.className = 'mainpage_author';

    div.innerHTML = `
           <div class="mainpage_author">
            <a href='/posts/${item._id}'><img src=${item.image || ''} class="naimpage_pic" /></a>
            <div class="mainpage_info">
              <a href='/posts/${item._id}'><span class="mainpage_author_name">${item.name || ''}</span></a>
              <a href='/posts/${item._id}'><span class="mainpage_author_job">${item?.extra?.job || ''}</span></a>
            </div>
            <a href='/posts/${item._id}'><p class="mainpage_author_desc">
              ${shortenText(item.extra?.biography || '', 30)}
            </p></a>
          </div>
  `;
    divs.appendChild(div);
  });
}

function shortenText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

document.addEventListener('DOMContentLoaded', () => {
  loadPosts();
  loadAuthors();
});
