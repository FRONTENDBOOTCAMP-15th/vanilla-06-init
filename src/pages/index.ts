import { getAxios } from '../utils/axios';
import { summaryContent } from '../utils/summaryContent';

interface User {
  name?: string;
  image?: string;
}

interface Extra {
  job: string;
  biography: string;
}

interface Post {
  _id: string;
  name: string;
  job?: string;
  title?: string;
  image?: string;
  content?: string;
  extra: Extra;
  user: User;
}

async function getposts() {
  const axios = getAxios();
  try {
    const response = await axios.get(
      '/posts?type=brunch&sort={"likes": -1}&limit=10',
    );
    console.log(response.data.item);
    return response.data.item;
  } catch (err) {
    console.error('목록 조회 실패.', err);
    return [];
  }
}

const data = await getposts();
console.log(data);

const list = document.querySelector<HTMLOListElement>('.mainpage_list');

function loadPosts() {
  if (data) {
    const sortedPosts = data.map((item: Post, index: number) => {
      return `
              <li class="mainpage_item">
              <a href="./src/pages/posts/detail.html?id=${item._id}">
              <span class="mainpage_num">${index + 1}</span>
              <div class="mainpage_text">
              <h2 class="mainpage_secondtitle">${item.title || ''}</h2>
              <span class="mainpage_gray_by">by</span>
              <span class="mainpage_name">${item.user.name || ''}</span>
              <p class="mainpage_desc">
                ${summaryContent(item.content || '', 30)}
              </p>
            </div>
            

            <div class="mainpage_book">
              <img
                src="${item?.image}"
                class="mainpage_bookimg"
              />
              <div class="mainpage_overay">
                <p class="mainpage_overay_title">
                  ${item.title || ''}
                </p>
                <p class="mainpage_overay_name">${item.user.name || ''}</p>
              </div>
              <img
                src="/public/icons/logo/logo-white.png"
                class="mainpage_book_logo"
              />
            </div>
            </a>
          </li>
         
`;
    });
    return sortedPosts;
  }
}
if (list) {
  list.innerHTML = loadPosts().join('');
}

async function getAuthors() {
  const axios = getAxios();
  try {
    const response = await axios.get(
      '/users?sort={"bookmarkedBy.users": -1}&limit=4',
    );
    console.log(response.data.item);
    return response.data.item;
  } catch (err) {
    console.error('작가 목록 조회 실패.', err);
    return [];
  }
}

const author = await getAuthors();
console.log(author);

const div = document.querySelector<HTMLDivElement>('.mainpage_author_group');

function loadAuthors() {
  if (author) {
    const sortedAuthors = author.map((item: Post) => {
      return `<a href="./src/pages/author/author.html?id=${item._id}">
      <div class="mainpage_author">
      <img src="${item.image}" class="naimpage_pic" />
      <div class="mainpage_info">
      <span class="mainpage_author_name">${item.name || ''}</span>
      <span class="mainpage_author_job">${item.extra?.job || ''}</span>
      </div>
      <p class="mainpage_author_desc">
      ${summaryContent(item.extra?.biography || '', 20)}
      </p>
      </div>
      </a>
      `;
    });
    return sortedAuthors;
  }
}

if (div) {
  div.innerHTML = loadAuthors().join('');
}
