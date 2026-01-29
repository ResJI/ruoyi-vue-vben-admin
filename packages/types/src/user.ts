import type { BasicUserInfo } from '@vben-core/typings';

/** 用户信息 */
interface UserInfo extends BasicUserInfo {
  /**
   * 用户描述
   */
  desc: string;
  /**
   * 首页地址
   */
  homePath: string;

  /**
   * accessToken
   */
  token: string;
}

export interface UserInfoRaw {
  msg: string;
  code: number;
  permissions: string[];
  roles: string[];
  user: User;
}

interface User {
  createBy: string;
  createTime: Date;
  updateBy: null;
  updateTime: null;
  remark: string;
  beginTime: null;
  endTime: null;
  userId: number;
  deptId: number;
  userName: string;
  nickName: string;
  email: string;
  phonenumber: string;
  sex: string;
  avatar: string;
  password: string;
  status: string;
  delFlag: string;
  loginIp: string;
  loginDate: Date;
  dept: Dept;
  roles: Role[];
  roleIds: null;
  postIds: null;
  roleId: null;
  admin: boolean;
}

interface Dept {
  createBy: null;
  createTime: null;
  updateBy: null;
  updateTime: null;
  remark: null;
  beginTime: null;
  endTime: null;
  deptId: number;
  parentId: number;
  ancestors: string;
  deptName: string;
  orderNum: number;
  leader: string;
  phone: null;
  email: null;
  status: string;
  delFlag: null;
  parentName: null;
  deptLevel: number;
  children: any[];
}

interface Role {
  createBy: null;
  createTime: null;
  updateBy: null;
  updateTime: null;
  remark: null;
  beginTime: null;
  endTime: null;
  roleId: number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  dataScope: string;
  menuCheckStrictly: boolean;
  deptCheckStrictly: boolean;
  status: string;
  delFlag: null;
  flag: boolean;
  menuIds: null;
  deptIds: null;
  permissions: null;
  admin: boolean;
}

export type { UserInfo, UserInfoRaw };
