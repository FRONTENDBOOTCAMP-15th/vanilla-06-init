export interface User {
  name: string;
  image: string;
}

export interface UserItem {
  _id: number;
  email: string;
  name: string;
  phone: string;
  address: string;
  type: 'user' | 'seller' | 'admin';
  loginType: 'email' | 'kakao';
  image: string;
  createdAt: string;
  updatedAt: string;
  extra: {
    birthday: string;
    biography: string;
    membershipClass: string;
    address: [
      {
        id: number;
        name: string;
        value: string;
      },
    ];
    statusMsg: string | null;
    keyword: string[] | null;
  };
}

export interface BookmarkUser {
  _id: number;
  createdAt: string;
  user_id: number;
  memo: string;
  user: {
    _id: number;
    name: string;
    extra: {
      job: string;
      biography: string;
      keyword: string[];
    };
    loginType: 'email' | 'kakao';
    image: string;
    type: 'user' | 'seller' | 'admin';
  };
}
