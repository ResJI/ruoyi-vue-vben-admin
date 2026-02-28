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
  // eslint-disable-next-line no-unused-vars
  CREATE,
  // eslint-disable-next-line no-unused-vars
  EDIT,
}

interface FormData {
  dictCode: number;
  dictType: number;
  dictLabel: string;
  dictValue: string;
  dictSort: number;
  listClass: string;
  status: string;
  remark: string;
}

const visible = ref(false);

const formType = ref<FormType>(FormType.CREATE);
const formRef = useTemplateRef<FormInstance>('formRef');
const formData = ref<Partial<FormData>>({
  status: '0',
  dictSort: 0,
});

const formRules: FormRules = {
  dictLabel: [{ required: true, message: '数据标签不能为空', trigger: 'blur' }],
  dictValue: [{ required: true, message: '数据键值不能为空', trigger: 'blur' }],
  dictSort: [{ required: true, message: '数据顺序不能为空', trigger: 'blur' }],
};

const listClassOptions = ref([
  { value: 'default', label: '默认' },
  { value: 'primary', label: '主要' },
  { value: 'success', label: '成功' },
  { value: 'info', label: '信息' },
  { value: 'warning', label: '警告' },
  { value: 'danger', label: '危险' },
]);

function open(data?: FormData) {
  formType.value =
    data?.dictCode === undefined ? FormType.CREATE : FormType.EDIT;
  if (formType.value === FormType.CREATE) {
    formData.value.dictType = data?.dictType;
  } else {
    formData.value = cloneDeep(data!);
  }
  visible.value = true;
}

function close() {
  formData.value = {
    status: '0',
    dictSort: 0,
  };
  formRef.value?.resetFields();
  visible.value = false;
}

async function onSubmit() {
  try {
    await formRef.value!.validate();
    const baseData = {
      dictType: formData.value.dictType,
      dictLabel: formData.value.dictLabel,
      dictValue: formData.value.dictValue,
      dictSort: formData.value.dictSort,
      listClass: formData.value.listClass,
      status: formData.value.status,
      remark: formData.value.remark,
    };
    if (formType.value === FormType.CREATE) {
      emits('create', baseData);
    } else {
      emits('edit', { ...baseData, dictCode: formData.value.dictCode });
    }
  } catch {}
}

defineExpose({ open, close });
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="formType === FormType.CREATE ? '添加字典数据' : '修改字典数据'"
    width="500px"
    @closed="close"
  >
    <el-form
      :model="formData"
      :rules="formRules"
      ref="formRef"
      label-width="auto"
    >
      <el-form-item label="字典类型" prop="dictType">
        <el-input v-model="formData.dictType" disabled />
      </el-form-item>
      <el-form-item label="数据标签" prop="dictLabel">
        <el-input v-model="formData.dictLabel" placeholder="请输入数据标签" />
      </el-form-item>
      <el-form-item label="数据键值" prop="dictValue">
        <el-input v-model="formData.dictValue" placeholder="请输入数据键值" />
      </el-form-item>
      <el-form-item label="显示排序" prop="dictSort">
        <el-input-number
          v-model="formData.dictSort"
          controls-position="right"
          :min="0"
        />
      </el-form-item>
      <el-form-item label="回显样式" prop="listClass">
        <el-select v-model="formData.listClass">
          <el-option
            v-for="item in listClassOptions"
            :key="item.value"
            :label="`${item.label}(${item.value})`"
            :value="item.value"
          />
        </el-select>
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
