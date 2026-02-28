<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

import type { Dict } from '#/api/ruoyi/type';

import { ref, useTemplateRef } from 'vue';

import { cloneDeep } from 'lodash-es';

withDefaults(
  defineProps<{
    submitting?: boolean;
    systemBuildInOptions: Dict[];
  }>(),
  {
    submitting: false,
  },
);

const emits = defineEmits<{
  (e: 'create', data: any): void;
  (e: 'edit', data: any): void;
}>();

enum FormType {
  // eslint-disable-next-line no-unused-vars
  CREATE,
  // eslint-disable-next-line no-unused-vars
  EDIT,
}

interface FormData {
  configId: number;
  configName: string;
  configKey: string;
  configValue: string;
  configType: string;
  remark: string;
}

const visible = ref(false);

const formType = ref<FormType>(FormType.CREATE);
const formRef = useTemplateRef<FormInstance>('formRef');
const formData = ref<Partial<FormData>>({});

const formRules: FormRules = {
  configName: [
    { required: true, message: '参数名称不能为空', trigger: 'blur' },
  ],
  configKey: [{ required: true, message: '参数键名不能为空', trigger: 'blur' }],
  configValue: [
    { required: true, message: '参数键值不能为空', trigger: 'blur' },
  ],
};

function open(data?: FormData) {
  formType.value = data ? FormType.EDIT : FormType.CREATE;
  if (formType.value === FormType.EDIT) {
    formData.value = cloneDeep(data!);
  }
  visible.value = true;
}

function close() {
  formData.value = {};
  formRef.value?.resetFields();
  visible.value = false;
}

async function onSubmit() {
  try {
    await formRef.value!.validate();
    const baseData = {
      configName: formData.value.configName,
      configKey: formData.value.configKey,
      configValue: formData.value.configValue,
      configType: formData.value.configType,
      remark: formData.value.remark,
    };
    if (formType.value === FormType.CREATE) {
      emits('create', baseData);
    } else {
      emits('edit', { ...baseData, configId: formData.value.configId });
    }
  } catch {}
}

defineExpose({ open, close });
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="formType === FormType.CREATE ? '添加参数' : '修改参数'"
    width="500px"
    @closed="close"
  >
    <el-form
      :model="formData"
      :rules="formRules"
      ref="formRef"
      label-width="auto"
    >
      <el-form-item label="参数名称" prop="configName">
        <el-input v-model="formData.configName" placeholder="请输入参数名称" />
      </el-form-item>
      <el-form-item label="参数键名" prop="configKey">
        <el-input v-model="formData.configKey" placeholder="请输入参数键名" />
      </el-form-item>
      <el-form-item label="参数键值" prop="configValue">
        <el-input
          v-model="formData.configValue"
          type="textarea"
          placeholder="请输入参数键值"
        />
      </el-form-item>
      <el-form-item label="系统内置" prop="configType">
        <el-radio-group v-model="formData.configType">
          <el-radio
            v-for="dict in systemBuildInOptions"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入内容"
        />
      </el-form-item>
    </el-form>
    <div class="ml-auto w-fit">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onSubmit" :loading="submitting">
        {{ formType === FormType.EDIT ? '保存' : '添加' }}
      </el-button>
    </div>
  </el-dialog>
</template>
