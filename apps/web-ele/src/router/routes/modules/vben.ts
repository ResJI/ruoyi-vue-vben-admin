import type { RouteRecordRaw } from 'vue-router';

import IconUser from '~icons/ep/user';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'Profile',
    path: '/profile',
    component: () => import('#/views/_core/profile/index.vue'),
    meta: {
      icon: IconUser,
      hideInMenu: true,
      title: $t('page.auth.profile'),
    },
  },
];

export default routes;
