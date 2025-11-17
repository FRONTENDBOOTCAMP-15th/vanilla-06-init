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
