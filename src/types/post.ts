export interface PostItem {
  _id: number;
  type: string;
  product_id: number; // 사용 X
  seller_id: number; // 사용 X
  user: {
    _id: number;
    name: string;
  };
  title: string;
  content: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  product: {
    name: string;
    image: {
      url: string;
      name: string;
    };
  };
  bookmarks: number; // 사용 X
  myBookmarkId: number; // 사용 X
  repliesCount: number; // 사용 X
}

export interface PostId {
  _id: number;
  type: string; // "qna"
  product_id: number;
  seller_id: number;
  user: {
    _id: number;
    name: string;
    email: string;
    image: string;
  };
  title: string;
  content: string;
  replies: {
    _id: number;
    user_id: number;
    user: {
      _id: number;
      name: string;
      email: string;
      image: string;
    };
    content: string;
    like: number;
    createdAt: string;
    updatedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkPost {
  _id: number;
  createdAt: string;
  user_id: number;
  memo: string;
  post: {
    _id: number;
    extra: {
      subTitle: string;
    };
    image: string;
    type: 'brunch';
    title: string;
    user: {
      _id: number;
      name: string;
      image: string;
    };
  };
}

export interface MyPostItem {
  _id: number;
  createdAt: string;
  updatedAt: string;
  type: string;
  title: string;
  extra: {
    subTitle: string;
  };
  content: string;
  views: number;
  user: {
    _id: number;
    name: string;
    image: string;
  };
  bookmarks: number;
  likes: number;
  repliesCount: number;
  product: {
    image: string | null;
  };
}

export interface AllPostItem {
  _id: number;
  createdAt: string;
  updatedAt: string;
  type: string;
  title: string;
  extra: {
    subTitle: string;
  };
  content: string;
  views: number;
  user: {
    _id: number;
    name: string;
    image: string;
  };
  bookmarks: number;
  likes: number;
  repliesCount: number;
  product: {
    image: string | null;
  };
}
