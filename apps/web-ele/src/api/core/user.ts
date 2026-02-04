import type { Sex, UserInfo } from '@vben/types';

import type { UserInfoRaw, UserRaw } from './types';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient
    .get<UserInfoRaw>('/getInfo', { responseReturn: 'body' })
    .then((data): UserInfo => {
      return {
        avatar: data.user.avatar,
        realName: data.user.nickName,
        roles: data.roles,
        userId: String(data.user.userId),
        username: data.user.userName,
        phoneNumber: data.user.phonenumber,
        email: data.user.email,
        sex: data.user.sex as Sex,
        desc: '',
        homePath: '/',
        token: '',
      };
    });
}

export async function updateUserInfoApi(data: Partial<UserRaw>) {
  return requestClient.put<Partial<UserRaw>>('/system/user/profile', data);
}

export async function resetPasswordApi(data: {
  newPassword: string;
  oldPassword: string;
}) {
  return requestClient.put<Partial<UserRaw>>(
    '/system/user/profile/updatePwd',
    data,
  );
}
