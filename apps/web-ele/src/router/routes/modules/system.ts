import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: '系统管理',
    },
    name: 'System',
    path: '/system',
    children: [
      {
        name: 'User',
        path: '/user',
        component: () => import('#/views/system/user/index.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:area-chart',
          title: '用户管理',
        },
      },
      {
        name: 'Workspace',
        path: '/workspace',
        component: () => import('#/views/dashboard/workspace/index.vue'),
        meta: {
          icon: 'carbon:workspace',
          title: $t('page.dashboard.workspace'),
        },
      },
    ],
  },
];

export default routes;
