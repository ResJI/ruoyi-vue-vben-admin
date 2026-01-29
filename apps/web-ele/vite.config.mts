import { defineConfig } from '@vben/vite-config';

import ElementPlus from 'unplugin-element-plus/vite';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      plugins: [
        ElementPlus({
          format: 'esm',
        }),
      ],
      server: {
        proxy: {
          '/dev-api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/dev-api/, ''),
            // mock代理目标地址
            target: 'http://192.168.32.58:8086/',
            // target: 'http://localhost:5320/api',
            ws: true,
          },
        },
      },
    },
  };
});
