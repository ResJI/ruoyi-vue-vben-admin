<script setup lang="ts">
import type { Props } from './types';

import { Page, VbenAvatar } from '@vben/common-ui';
import { preferences } from '@vben/preferences';

import { ElCard, ElDivider } from 'element-plus';

defineOptions({
  name: 'ProfileUI',
});

withDefaults(defineProps<Props>(), {
  title: '关于项目',
  tabs: () => [],
});

const tabsValue = defineModel<string>('modelValue');
</script>
<template>
  <Page auto-content-height>
    <div class="flex h-full w-full">
      <ElCard
        class="w-[270px] flex-none"
        shadow="never"
        body-style="padding: 0"
      >
        <div class="mt-4 flex h-40 flex-col items-center justify-center gap-4">
          <VbenAvatar
            :src="userInfo?.avatar ?? preferences.app.defaultAvatar"
            class="size-20"
          />
          <span class="text-lg font-semibold">
            {{ userInfo?.realName ?? '' }}
          </span>
          <span class="text-sm text-foreground/80">
            {{ userInfo?.username ?? '' }}
          </span>
        </div>
        <ElDivider class="!my-4" />
        <div class="m-4">
          <div class="grid w-full grid-cols-1 bg-card">
            <div
              v-for="tab in tabs"
              :key="tab.value"
              class="flex-center h-12 cursor-pointer justify-start rounded-md px-4 text-sm text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              :data-state="tabsValue === tab.value ? 'active' : 'inactive'"
              @click="tabsValue = tab.value"
            >
              {{ tab.label }}
            </div>
          </div>
        </div>
      </ElCard>
      <ElCard
        class="ml-2 w-0 flex-1 flex-auto p-8"
        shadow="never"
        body-style="padding: 0"
      >
        <slot name="content"></slot>
      </ElCard>
    </div>
  </Page>
</template>
