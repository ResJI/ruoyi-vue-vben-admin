<script setup lang="ts">
import type { BasicInfoForm, PasswordForm } from '#/views/_core/profile/types';

import { ref } from 'vue';

import { useUserStore } from '@vben/stores';

import { ElMessage } from 'element-plus';

import { resetPasswordApi, updateUserInfoApi } from '#/api';

import ProfileBase from './base-setting.vue';
import ProfilePasswordSetting from './password-setting.vue';
import Profile from './profile.vue';

const userStore = useUserStore();

const tabsValue = ref<string>('basic');

const tabs = ref([
  {
    label: '基本设置',
    value: 'basic',
  },
  {
    label: '修改密码',
    value: 'password',
  },
]);

async function updateUser(data: BasicInfoForm) {
  const requestData = {
    ...data,
    phonenumber: data.phoneNumber,
  };
  Reflect.deleteProperty(requestData, 'phoneNumber');
  await updateUserInfoApi(requestData);
  ElMessage.success('基本信息更新成功');
}

async function resetPassword(data: PasswordForm) {
  await resetPasswordApi(data);
  ElMessage.success('密码修改成功');
}
</script>
<template>
  <Profile
    v-model:model-value="tabsValue"
    title="个人中心"
    :user-info="userStore.userInfo"
    :tabs="tabs"
  >
    <template #content>
      <ProfileBase v-if="tabsValue === 'basic'" @submit="updateUser" />
      <ProfilePasswordSetting
        v-if="tabsValue === 'password'"
        @submit="resetPassword"
      />
    </template>
  </Profile>
</template>
