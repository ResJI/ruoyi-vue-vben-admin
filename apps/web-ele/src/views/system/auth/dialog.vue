<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

import { ref, useTemplateRef } from 'vue';

import { cloneDeep } from 'lodash-es';
import QuestionFiled from '~icons/ep/question-filled';

withDefaults(
  defineProps<{
    authTree: any[];
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
  menuId: number;
  parentId: number;
  menuName: string;
  orderNum: number;
  perms: string;
}

const visible = ref(false);

const formType = ref<FormType>(FormType.CREATE);
const formRef = useTemplateRef<FormInstance>('formRef');
const formData = ref<Partial<FormData>>({
  orderNum: 0,
  perms: '',
});

const formRules: FormRules = {
  parentId: [{ required: true, message: '上级权限不能为空', trigger: 'blur' }],
  menuName: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
  orderNum: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
};

function open(data?: FormData, create: boolean = true) {
  formType.value = create ? FormType.CREATE : FormType.EDIT;
  if (formType.value === FormType.EDIT) {
    formData.value = cloneDeep(data as FormData);
  } else {
    formData.value.parentId = data?.menuId;
  }
  visible.value = true;
}

function close() {
  formData.value = {
    orderNum: 0,
    perms: '',
  };
  formRef.value?.resetFields();
  visible.value = false;
}

async function onSubmit() {
  try {
    await formRef.value?.validate();
    const baseData = {
      menuType: 'F',
      parentId: formData.value.parentId,
      menuName: formData.value.menuName,
      orderNum: formData.value.orderNum,
      perms: formData.value.perms,
    };
    if (formType.value === FormType.CREATE) {
      emits('create', baseData);
    } else {
      emits('edit', { ...baseData, menuId: formData.value.menuId });
    }
  } catch {}
}

defineExpose({ open, close });
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="formType === FormType.CREATE ? '添加权限' : '修改权限'"
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
        <el-col :span="24">
          <el-form-item label="上级权限" prop="parentId">
            <el-tree-select
              v-model="formData.parentId"
              :data="authTree"
              :props="{
                value: 'menuId',
                label: 'menuName',
                children: 'children',
              }"
              value-key="menuId"
              placeholder="选择上级菜单"
              check-strictly
            />
          </el-form-item>
        </el-col>
        <el-col :span="15">
          <el-form-item label="名称" prop="menuName">
            <el-input v-model="formData.menuName" placeholder="请输入名称" />
          </el-form-item>
        </el-col>
        <el-col :span="9">
          <el-form-item label="显示排序" prop="orderNum">
            <el-input-number
              v-model="formData.orderNum"
              controls-position="right"
              :min="0"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item prop="perms">
            <el-input
              v-model="formData.perms"
              placeholder="请输入权限标识"
              maxlength="100"
            />
            <template #label>
              <span>
                <el-tooltip
                  content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)"
                  placement="top"
                >
                  <el-icon><QuestionFiled /></el-icon>
                </el-tooltip>
                权限字符
              </span>
            </template>
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
