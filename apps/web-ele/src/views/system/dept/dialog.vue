<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

import type { Dict } from '#/api/ruoyi/type';

import { ref, useTemplateRef } from 'vue';

withDefaults(
  defineProps<{
    departmentTree: any[];
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
  deptId: number;
  parentId: number;
  deptName: string;
  orderNum: number;
  leader: string;
  phone: string;
  email: string;
  status: string;
}

const visible = ref(false);

const formType = ref<FormType>(FormType.CREATE);
const formRef = useTemplateRef<FormInstance>('formRef');
const formData = ref<Partial<FormData>>({
  status: '0',
  orderNum: 0,
});

const formRules: FormRules = {
  parentId: [{ required: true, message: '上级部门不能为空', trigger: 'blur' }],
  deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
  orderNum: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
  email: [
    {
      type: 'email',
      message: '请输入正确的邮箱地址',
      trigger: ['blur', 'change'],
    },
  ],
  phone: [
    {
      pattern: /^1[3-9|]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur',
    },
  ],
};

function open(data?: FormData, create: boolean = true) {
  formType.value = create ? FormType.CREATE : FormType.EDIT;
  if (formType.value === FormType.EDIT) {
    formData.value = data!;
  } else {
    formData.value.parentId = data?.deptId;
  }
  visible.value = true;
}

function close() {
  formData.value = {
    status: '0',
    orderNum: 0,
  };
  formRef.value?.resetFields();
  visible.value = false;
}

async function onSubmit() {
  try {
    await formRef.value!.validate();
    const baseData = {
      parentId: formData.value.parentId,
      deptName: formData.value.deptName,
      orderNum: formData.value.orderNum,
      leader: formData.value.leader,
      phone: formData.value.phone,
      email: formData.value.email,
      status: formData.value.status,
    };
    if (formType.value === FormType.CREATE) {
      emits('create', baseData);
    } else {
      emits('edit', { ...baseData, deptId: formData.value.deptId });
    }
  } catch {}
}

defineExpose({ open, close });
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="formType === FormType.CREATE ? '添加部门' : '修改部门'"
    width="600px"
    @closed="close"
  >
    <el-form
      :model="formData"
      :rules="formRules"
      ref="formRef"
      label-width="auto"
    >
      <el-row>
        <el-col :span="24" v-if="formData.parentId !== 0">
          <el-form-item label="上级部门" prop="parentId">
            <el-tree-select
              v-model="formData.parentId"
              :data="departmentTree"
              :props="{
                value: 'deptId',
                label: 'deptName',
                children: 'children',
              }"
              value-key="deptId"
              placeholder="选择上级部门"
              check-strictly
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门名称" prop="deptName">
            <el-input
              v-model="formData.deptName"
              placeholder="请输入部门名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示排序" prop="orderNum">
            <el-input-number
              v-model="formData.orderNum"
              controls-position="right"
              :min="0"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="负责人" prop="leader">
            <el-input
              v-model="formData.leader"
              placeholder="请输入负责人"
              maxlength="20"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input
              v-model="formData.phone"
              placeholder="请输入联系电话"
              maxlength="11"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="formData.email"
              placeholder="请输入邮箱"
              maxlength="50"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门状态">
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
        </el-col>
      </el-row>
    </el-form>
    <div class="ml-auto w-fit">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onSubmit" :loading="submitting">
        {{ formType === FormType.EDIT ? '保存' : '添加' }}
      </el-button>
    </div>
  </el-dialog>
</template>
