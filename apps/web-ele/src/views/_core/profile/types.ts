import type { BasicUserInfo } from '@vben/types';

export interface Props {
  title?: string;
  userInfo: BasicUserInfo | null;
  tabs: {
    label: string;
    value: string;
  }[];
}

export interface BasicInfoForm {
  nickName: string;
  phoneNumber: string;
  email: string;
  sex: string;
}

export interface PasswordForm {
  oldPassword: string;
  newPassword: string;
}
