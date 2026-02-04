<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';
import type { PasswordForm } from '#/views/_core/profile/types';

import { computed } from 'vue';

import { ProfilePasswordSetting, z } from '@vben/common-ui';

const emits = defineEmits<{
  (e: 'submit', data: PasswordForm): void;
}>();

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      fieldName: 'oldPassword',
      label: '旧密码',
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: '请输入旧密码',
      },
    },
    {
      fieldName: 'newPassword',
      label: '新密码',
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: '请输入新密码',
      },
    },
    {
      fieldName: 'confirmPassword',
      label: '确认密码',
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: '请再次输入新密码',
      },
      dependencies: {
        rules(values) {
          const { newPassword } = values;
          return z
            .string({ required_error: '请再次输入新密码' })
            .min(1, { message: '请再次输入新密码' })
            .refine((value) => value === newPassword, {
              message: '两次输入的密码不一致',
            });
        },
        triggerFields: ['newPassword'],
      },
    },
  ];
});

function handleSubmit(data: Record<string, string>) {
  emits('submit', {
    oldPassword: data.oldPassword ?? '',
    newPassword: data.newPassword ?? '',
  });
}
</script>
<template>
  <ProfilePasswordSetting
    class="w-full"
    :form-schema="formSchema"
    @submit="handleSubmit"
  />
</template>
