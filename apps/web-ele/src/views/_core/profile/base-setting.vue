<script setup lang="ts">
import type { BasicInfoForm } from '#/views/_core/profile/types';

import { ref, watch } from 'vue';

import { useUserStore } from '@vben/stores';

import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElRadio,
  ElRadioGroup,
} from 'element-plus';

const emits = defineEmits<{
  (e: 'submit', data: BasicInfoForm): void;
}>();

const userStore = useUserStore();
const form = ref<BasicInfoForm>({
  nickName: '',
  phoneNumber: '',
  email: '',
  sex: '',
});

watch(
  () => userStore.userInfo,
  (info) => {
    form.value = {
      nickName: info?.realName ?? '',
      phoneNumber: info?.phoneNumber ?? '',
      email: info?.email ?? '',
      sex: info?.sex ?? '0',
    };
  },
  { immediate: true },
);

async function handleSubmit() {
  emits('submit', form.value);
}
</script>

<template>
  <div class="flex w-full">
    <ElForm
      :model="form"
      label-width="80px"
      label-suffix="："
      style="width: 100%"
      @submit.prevent="handleSubmit"
    >
      <ElFormItem label="昵 称">
        <ElInput v-model="form.nickName" placeholder="请输入你的名称" />
      </ElFormItem>
      <ElFormItem label="手机号">
        <ElInput v-model="form.phoneNumber" placeholder="请输入你的手机号" />
      </ElFormItem>
      <ElFormItem label="邮箱">
        <ElInput v-model="form.email" placeholder="请输入你的邮箱" />
      </ElFormItem>
      <ElFormItem>
        <ElRadioGroup v-model="form.sex" size="small">
          <ElRadio value="0" border class="mr-[15px]"> 男 </ElRadio>
          <ElRadio value="1" border> 女 </ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem>
        <ElButton type="primary" native-type="submit"> 更新基本信息 </ElButton>
      </ElFormItem>
    </ElForm>
  </div>
</template>
