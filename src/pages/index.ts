import Swiper from 'swiper/bundle';
import 'swiper/swiper-bundle.css';
import { getAxios } from '../utils/axios';
import { summaryContent } from '../utils/summaryContent';
import { getAllPost } from '../utils/allPost.ts';
import type { PostItem, AllPostItem } from '../types/post.ts';

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
  likes?: string;
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
const allPostData = await getAllPost();
const likeData = await getLikeRank();
renderVisual(likeData);

const list = document.querySelector<HTMLOListElement>('.mainpage_list');

function loadPosts() {
  if (data) {
    const sortedPosts = data.map((item: Post, index: number) => {
      return `
            <li class="mainpage_item">
              <a href="./src/pages/posts/detail.html?postId=${item._id}">
                <span class="mainpage_num">${index + 1}</span>
                <div class="mainpage_text">
                  <h2 class="mainpage_secondtitle">${item.title || ''}</h2>
                  <span class="mainpage_gray_by">by</span>
                  <span class="mainpage_name">${item.user.name || ''}</span>
                  <p class="mainpage_desc">
                    ${summaryContent(item.content || '', 30)}
                  </p>
                </div>

                <div class="mainpage_book test">
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
                    src="/icons/logo/logo-white.png"
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
      return `<a href="./src/pages/author/author.html?userId=${item._id}">
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

async function getLikeRank() {
  const sorted: AllPostItem[] = allPostData.item
    .slice()
    .sort((a: AllPostItem, b: AllPostItem) => b.likes - a.likes)
    .slice(0, 6);

  return sorted;
}

function findImageById(id: number): string | null {
  const posts = allPostData.item;
  const item = posts.find((post: PostItem) => post._id === id);

  if (!item || !item.user) return null;
  return item.image ?? null;
}

function renderVisual(posts: AllPostItem[]) {
  const visualEl = document.querySelector('#visual') as HTMLDivElement;
  const wrapperEl = visualEl.querySelector('.swiper-wrapper') as HTMLDivElement;

  const result = posts.map(item => {
    return `
      <div class="swiper-slide">
        <a class="brunch_link" href="/src/pages/posts/detail.html?postId=${item._id}">
          <div class="brunch_txt">
            <b class="ttl">${item.title}</b>
            <span class="name">
              <span class="by">by</span>
              ${item.user.name}
            </span>
          </div>
          <div class="brunch_book">
            <img class="bg" src="${findImageById(item._id)}" alt="">
            <div class="txt_box">
              <b class="ttl">${item.title}</b>
              <span class="name">${item.user.name}</span>
            </div>
          </div>
          <span class="cheering"> ${item.likes}명이 응원</span>
        </a>
      </div>
    `;
  });

  if (result.length) {
    wrapperEl.innerHTML = result.join('');
  }

  visualSwiper(result.length);
}

function visualSwiper(num: number) {
  const visualEl = document.querySelector('#visual') as HTMLDivElement;
  const barEl = document.querySelector('.bar') as HTMLDivElement;

  barEl.style.width = `${100 / num}%`;

  const swiper = new Swiper('.visual .swiper', {
    loop: true,
    speed: 500,
    autoplay: {
      delay: 4500,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.pagination_area .swiper-pagination',
      type: 'fraction',
    },
    on: {
      slideChange: function (swiperInstance) {
        const realIndex = swiperInstance.realIndex;
        const percent = (realIndex / num) * 100;
        barEl.style.left = `${percent}%`;
      },
    },
  });

  visualEl.addEventListener('mouseenter', () => swiper.autoplay.stop());
  visualEl.addEventListener('mouseleave', () => swiper.autoplay.start());
}
