interface BasicOption {
  label: string;
  value: string;
}

type SelectOption = BasicOption;

type TabOption = BasicOption;

enum Sex {
  FEMALE = '1',
  MALE = '0',
}

interface BasicUserInfo {
  /**
   * 头像
   */
  avatar: string;
  email: string;
  phoneNumber: string;
  /**
   * 用户昵称
   */
  realName: string;
  /**
   * 用户角色
   */
  roles?: string[];
  sex: Sex;
  /**
   * 用户id
   */
  userId: string;
  /**
   * 用户名
   */
  username: string;
}

type ClassType = Array<object | string> | object | string;

export type {
  BasicOption,
  BasicUserInfo,
  ClassType,
  SelectOption,
  Sex,
  TabOption,
};
