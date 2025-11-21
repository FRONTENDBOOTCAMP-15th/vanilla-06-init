import type {
  PostItem,
  PostId,
  BookmarkPost,
  MyPostItem,
} from '../../types/post';
import type { BookmarkUser } from '../../types/user';
import { getAllPost } from '../../utils/allPost.ts';
import { getAxios } from '../../utils/axios';
import { formatDate } from '../../utils/formatDate.ts';

interface CurrentObj {
  _id: number;
  email: string;
  name: string;
  type: 'user';
  loginType: string;
  image: string;
  extra: {
    job: string;
    biography: string;
  };
  createdAt: string;
  updatedAt: string;
  notifications: string[];
  token: {
    accessToken: string;
    refreshToken: string;
  };
}

const brunchAuthorListEl = document.querySelector(
  '#brunchAuthorList',
) as HTMLDivElement;
const recentBookListEl = document.querySelector(
  '#recentBookList',
) as HTMLDivElement;
const likeBookListEl = document.querySelector(
  '#likeBookList',
) as HTMLDivElement;
const mybrunchListEl = document.querySelector(
  '#mybrunchList',
) as HTMLDivElement;

const axios = getAxios();

const allPostData = await getAllPost();
const currentUserStr = localStorage.getItem('currentUser');
let currentUserObj: CurrentObj | null = null;

if (currentUserStr) {
  try {
    currentUserObj = JSON.parse(currentUserStr) as CurrentObj;
  } catch (err) {
    console.error('currentUser parsing error', err);
  }
}
const currentId = currentUserObj!._id;

function findImageById(id: number): string | null {
  const posts = allPostData.item;
  const item = posts.find((post: PostItem) => post._id === id);

  if (!item || !item.user) return null;
  return item.image ?? null;
}

async function getBookmarkTarget() {
  try {
    const { data } = await axios.get(`/users/${currentId}/bookmarks`);
    return data;
  } catch (err) {
    console.log(err);
  }
}

const dataBookmark = await getBookmarkTarget();

function getBookmarkUser() {
  return dataBookmark.item.user;
}
function getBookmarkPost() {
  return dataBookmark.item.post;
}

function renderAuthor(author: BookmarkUser[]) {
  const result = author.map(item => {
    return `
      <a href="/src/pages/author/author.html?userId=${item.user._id}" class="brunch_author_link">
        <img
          src="${item.user.image}"
          alt="" class="thumb" />
        <span class="name">${item.user.name}</span>
      </a>
    `;
  });

  if (result.length) {
    brunchAuthorListEl.innerHTML = result.join('');
  } else {
    brunchAuthorListEl.innerHTML = '관심 작가가 없습니다.';
  }
}

function authorInit() {
  const data = getBookmarkUser();
  renderAuthor(data);
}
authorInit();

async function getRecentPost() {
  try {
    const historyJson = localStorage.getItem('recent');
    if (!historyJson) return [];

    const ids: string[] = JSON.parse(historyJson);
    if (!Array.isArray(ids) || ids.length === 0) return [];

    const posts = await Promise.all(
      ids.map(async id => {
        const { data } = await axios.get(`/posts/${id}`);
        return data.item;
      }),
    );

    return posts;
  } catch (err) {
    console.error(err);
    return [];
  }
}

function renderRecentPost(posts: PostId[]) {
  const result = posts.map(item => {
    return `
      <a class="brunch_link" href="/src/pages/posts/detail.html?postId=${item._id}">
        <div class="brunch_book">
          <img class="bg" src="${findImageById(item._id)}" alt="">
          <div class="txt_box">
            <b class="ttl">${item.title}</b>
            <span class="name">${item.user.name}</span>
          </div>
        </div>
        <div class="brunch_txt">
          <b class="ttl">${item.title}</b>
          <span class="name">
            <span class="by">by</span>
            ${item.user.name}
          </span>
        </div>
      </a>
    `;
  });

  if (result.length) {
    recentBookListEl.innerHTML = result.join('');
  } else {
    recentBookListEl.innerHTML = '최근 본 글이 없습니다.';
  }
}

async function recentInit() {
  const data = await getRecentPost();

  renderRecentPost(data);
}
recentInit();

function likePostInit() {
  const data = getBookmarkPost();
  renderPost(data);
}
likePostInit();

function renderPost(post: BookmarkPost[]) {
  const result = post.map(item => {
    return `
      <a class="brunch_link" href="/src/pages/posts/detail.html?postId=${item.post._id}">
        <div class="brunch_book">
        <img class="bg" src="${item.post.image}" alt="">
          <div class="txt_box">
            <b class="ttl">${item.post.title}</b>
            <span class="name">${item.post.user.name}</span>
          </div>
        </div>  
        <div class="brunch_txt">
          <b class="ttl">${item.post.title}</b>
          <span class="name">
            <span class="by">by</span>
            ${item.post.user.name}
          </span>
        </div>
      </a>
    `;
  });

  if (result.length) {
    likeBookListEl.innerHTML = result.join('');
  } else {
    likeBookListEl.innerHTML = '관심 글이 없습니다.';
  }
}

async function getMyPost() {
  try {
    const { data } = await axios.get('/posts/users');
    return data;
  } catch (err) {
    console.log(err);
  }
}

async function myPostInit() {
  const data = await getMyPost();
  if (data?.ok) {
    renderMyPost(data.item);
  }
}
myPostInit();

function renderMyPost(post: MyPostItem[]) {
  const result = post.map(item => {
    const { datetime, display } = formatDate(item.updatedAt);
    return `
      <a href="/src/pages/posts/detail.html?postId=${item._id}" class="mybrunch_link">
        <div class="mybrunch_card">
          <b class="ttl">${item.title}</b>
          <p class="desc">${item.extra.subTitle}</p>
          <time class="date" datetime="${datetime}">${display}</time>
        </div>
      </a>
    `;
  });

  if (result.length) {
    mybrunchListEl.innerHTML = result.join('');
  } else {
    mybrunchListEl.innerHTML =
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;내가 작성한 글이 없습니다.';
  }
}
