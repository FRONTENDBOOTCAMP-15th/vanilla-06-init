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
