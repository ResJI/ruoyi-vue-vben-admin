import type { UserInfoRaw } from '@vben/types';

import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    account?: string;
    password?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

interface LoginResultInternal {
  code: number;
  token: string;
  msg: string;
}
/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient
    .post<LoginResultInternal>('/login', data, { responseReturn: 'body' })
    .then((res): AuthApi.LoginResult => {
      return {
        accessToken: res.token,
      };
    });
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient
    .get<UserInfoRaw>('/getInfo', { responseReturn: 'body' })
    .then((data) => data.permissions);
}
