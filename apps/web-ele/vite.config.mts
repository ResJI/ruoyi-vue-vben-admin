import { defineConfig } from '@vben/vite-config';

import ElementPlus from 'unplugin-element-plus/vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      plugins: [
        ElementPlus({
          format: 'esm',
        }),
        Icons({ compiler: 'vue3' })
      ],
      server: {
        proxy: {
          '/dev-api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/dev-api/, ''),
            // mock代理目标地址
            target: 'http://localhost:8088',
            ws: true,
          },
        },
      },
    },
  };
});
