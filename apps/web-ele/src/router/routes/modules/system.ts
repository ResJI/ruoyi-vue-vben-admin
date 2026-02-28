import type { RouteRecordRaw } from 'vue-router';

import IconShield from '~icons/bi/shield-lock';
import IconUser from '~icons/ep/user';
import IconPost from '~icons/gis/position-man';
import IconBranch from '~icons/icon-park-solid/branch-one';
import IconConfig from '~icons/lucide/file-cog';
import IconDict from '~icons/streamline/dictionary-language-book';
import IconGroup from '~icons/streamline/user-multiple-group';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ep:setting',
      order: -1,
      title: '系统管理',
      authority: ['admin', 'system'],
    },
    name: 'System',
    path: '/system',
    children: [
      {
        name: 'User',
        path: 'user',
        meta: {
          icon: IconUser,
          title: '用户管理',
          authority: ['admin', 'system:user:list'],
          hideChildrenInMenu: true,
        },
        children: [
          {
            name: 'UserList',
            path: '',
            component: () => import('#/views/system/user/index.vue'),
            meta: {
              icon: IconUser,
              title: '用户管理',
              authority: ['admin', 'system:user:list'],
            },
          },
          {
            name: 'UserAuth',
            path: String.raw`user-auth/:userId(\d+)`,
            component: () => import('#/views/system/user/auth-role/index.vue'),
            meta: {
              icon: IconUser,
              title: '分配角色',
              hideInMenu: true,
              hideInTab: true,
              hideInBreadcrumb: true,
              activePath: '/system/user',
            },
          },
        ],
      },
      {
        name: 'Role',
        path: 'role',
        meta: {
          icon: IconGroup,
          title: '角色管理',
          authority: ['admin', 'system:role:list'],
          hideChildrenInMenu: true,
        },
        children: [
          {
            name: 'RoleList',
            path: '',
            component: () => import('#/views/system/role/index.vue'),
            meta: {
              icon: IconGroup,
              title: '角色管理',
              authority: ['admin', 'system:role:list'],
            },
          },
          {
            name: 'AuthUser',
            path: String.raw`/auth-user/:roleId(\d+)`,
            component: () => import('#/views/system/role/auth-user/index.vue'),
            meta: {
              icon: IconGroup,
              title: '分配用户',
              hideInMenu: true,
              hideInTab: true,
              hideInBreadcrumb: true,
              activePath: '/system/role',
            },
          },
        ],
      },

      {
        name: 'AuthConfig',
        path: '/auth-config',
        component: () => import('#/views/system/auth/index.vue'),
        meta: {
          icon: IconShield,
          title: '权限管理',
          authority: ['admin', 'system:menu:list'],
        },
      },
      {
        name: 'Dept',
        path: '/dept',
        component: () => import('#/views/system/dept/index.vue'),
        meta: {
          icon: IconBranch,
          title: '部门管理',
          authority: ['admin', 'system:dept:list'],
        },
      },
      {
        name: 'Post',
        path: '/post',
        component: () => import('#/views/system/post/index.vue'),
        meta: {
          icon: IconPost,
          title: '岗位管理',
          authority: ['admin', 'system:post:list'],
        },
      },
      {
        name: 'Dict',
        path: 'dict',
        meta: {
          icon: IconDict,
          title: '字典管理',
          authority: ['admin', 'system:dict:list'],
          hideChildrenInMenu: true,
        },
        children: [
          {
            name: 'DictList',
            path: '',
            component: () => import('#/views/system/dict/index.vue'),
            meta: {
              icon: IconDict,
              title: '字典管理',
              authority: ['admin', 'system:dict:list'],
            },
          },
          {
            name: 'DictData',
            path: String.raw`/dict-data/:dictId(\d+)`,
            component: () => import('#/views/system/dict/data/index.vue'),
            meta: {
              icon: IconDict,
              title: '字典数据',
              hideInMenu: true,
              hideInTab: true,
              hideInBreadcrumb: true,
              activePath: '/system/dict',
            },
          },
        ],
      },
      {
        name: 'Config',
        path: '/config',
        component: () => import('#/views/system/config/index.vue'),
        meta: {
          icon: IconConfig,
          title: '参数设置',
          authority: ['admin', 'system:config:list'],
        },
      },
    ],
  },
];

export default routes;
