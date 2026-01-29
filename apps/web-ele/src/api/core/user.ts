import type { UserInfo, UserInfoRaw } from '@vben/types';

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
        desc: '',
        homePath: '/',
        token: '',
      };
    });
}
