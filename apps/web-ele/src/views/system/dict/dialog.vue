<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

import type { Dict } from '#/api/ruoyi/type';

import { ref, useTemplateRef } from 'vue';

import { cloneDeep } from 'lodash-es';

withDefaults(
  defineProps<{
    statusOptions: Dict[];
    submitting?: boolean;
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
  CREATE,
  EDIT,
}

interface FormData {
  dictId: number;
  dictName: string;
  dictType: string;
  status: string;
  remark: string;
}

const visible = ref(false);

const formType = ref<FormType>(FormType.CREATE);
const formRef = useTemplateRef<FormInstance>('formRef');
const formData = ref<Partial<FormData>>({
  status: '0',
});

const formRules: FormRules = {
  dictName: [{ required: true, message: '字典名称不能为空', trigger: 'blur' }],
  dictType: [{ required: true, message: '字典类型不能为空', trigger: 'blur' }],
};

function open(data?: FormData) {
  formType.value = data ? FormType.EDIT : FormType.CREATE;
  if (formType.value === FormType.EDIT) {
    formData.value = cloneDeep(data as FormData);
  }
  visible.value = true;
}

function close() {
  formData.value = {
    status: '0',
  };
  formRef.value?.resetFields();
  visible.value = false;
}

async function onSubmit() {
  try {
    await formRef.value?.validate();
    const baseData = {
      dictName: formData.value.dictName,
      dictType: formData.value.dictType,
      status: formData.value.status,
      remark: formData.value.remark,
    };
    if (formType.value === FormType.CREATE) {
      emits('create', baseData);
    } else {
      emits('edit', { ...baseData, dictId: formData.value.dictId });
    }
  } catch {}
}

defineExpose({ open, close });
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="formType === FormType.CREATE ? '添加字典类型' : '修改字典类型'"
    width="500px"
    @closed="close"
  >
    <el-form
      :model="formData"
      :rules="formRules"
      ref="formRef"
      label-width="auto"
    >
      <el-form-item label="字典名称" prop="dictName">
        <el-input v-model="formData.dictName" placeholder="请输入字典名称" />
      </el-form-item>
      <el-form-item label="字典类型" prop="dictType">
        <el-input v-model="formData.dictType" placeholder="请输入字典类型" />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in statusOptions"
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
