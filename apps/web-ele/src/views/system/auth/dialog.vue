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
  // eslint-disable-next-line no-unused-vars
  CREATE,
  // eslint-disable-next-line no-unused-vars
  EDIT,
}

interface FormData {
  menuId: number;
  parentId: number;
  menuType: string;
  menuName: string;
  orderNum: number;
  perms: string;
}

const visible = ref(false);

const formType = ref<FormType>(FormType.CREATE);
const formRef = useTemplateRef<FormInstance>('formRef');
const formData = ref<Partial<FormData>>({
  menuType: 'F',
  orderNum: 0,
});

const formRules: FormRules = {
  parentId: [{ required: true, message: '上级权限不能为空', trigger: 'blur' }],
  menuName: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
  orderNum: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
  perms: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }],
};

function open(data?: FormData, create: boolean = true) {
  formType.value = create ? FormType.CREATE : FormType.EDIT;
  if (formType.value === FormType.EDIT) {
    formData.value = cloneDeep(data!);
  } else {
    formData.value.parentId = data?.menuId;
  }
  visible.value = true;
}

function close() {
  formData.value = {
    menuType: 'F',
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
      menuType: formData.value.menuType,
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
        <el-col :span="12">
          <el-form-item label="权限类型" prop="menuType">
            <el-radio-group v-model="formData.menuType">
              <el-radio value="M"> 目录 </el-radio>
              <el-radio value="F"> 权限 </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
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
          <el-form-item label="名称" prop="menuName">
            <el-input v-model="formData.menuName" placeholder="请输入名称" />
          </el-form-item>
        </el-col>

        <el-col v-if="formData.menuType !== 'M'" :span="24">
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
