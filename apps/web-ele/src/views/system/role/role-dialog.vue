<script setup lang="ts">
import type { ElTree, FormInstance, FormRules } from 'element-plus';

import type { Dict } from '#/api/ruoyi/type';

import { nextTick, ref, useTemplateRef } from 'vue';

import QuestionFiled from '~icons/ep/question-filled';

withDefaults(
  defineProps<{
    menuTree: any[];
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
  roleId: number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  status: string;
  remark: string;
  menuIds: number[];
}

const visible = ref(false);

const formType = ref<FormType>(FormType.CREATE);
const formRef = useTemplateRef<FormInstance>('formRef');
const treeRef = useTemplateRef<typeof ElTree>('treeRef');
const formData = ref<Partial<FormData>>({
  status: '0',
  roleSort: 0,
});
const checkStrictly = ref(false);
const checkAll = ref(false);
const expandAll = ref(false);
const treeShow = ref(true);

function onExpandAllChange() {
  const selectedIds = treeRef.value?.getCheckedKeys();
  const halfSelectedIds = treeRef.value?.getHalfCheckedKeys();
  treeShow.value = false;
  nextTick(() => {
    treeShow.value = true;
    nextTick(() => {
      treeRef.value?.setCheckedKeys(selectedIds);
      treeRef.value?.setHalfCheckedKeys(halfSelectedIds);
    });
  });
}

const formRules: FormRules = {
  roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
  roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }],
  roleSort: [{ required: true, message: '角色顺序不能为空', trigger: 'blur' }],
};

function open(data?: FormData) {
  formType.value = data ? FormType.EDIT : FormType.CREATE;
  if (formType.value === FormType.EDIT) {
    formData.value = data as FormData;
    nextTick(() => {
      treeRef.value?.setCheckedKeys(formData.value.menuIds);
    });
  }
  treeShow.value = true;
  visible.value = true;
}

function close() {
  formData.value = {
    status: '0',
    roleSort: 0,
  };
  checkStrictly.value = false;
  checkAll.value = false;
  expandAll.value = false;
  treeShow.value = false;
  formRef.value?.resetFields();
  visible.value = false;
}

async function onSubmit() {
  try {
    await formRef.value?.validate();
    const menuSelectedIds = treeRef.value?.getCheckedKeys();
    const halfSelectedIds = treeRef.value?.getHalfCheckedKeys();
    menuSelectedIds.unshift(...halfSelectedIds);
    const baseData = {
      roleName: formData.value.roleName,
      roleKey: formData.value.roleKey,
      roleSort: formData.value.roleSort,
      status: formData.value.status,
      remark: formData.value.remark,
      menuIds: menuSelectedIds,
    };
    if (formType.value === FormType.CREATE) {
      emits('create', baseData);
    } else {
      emits('edit', {
        roleId: formData.value.roleId,
        ...baseData,
      });
    }
  } catch {}
}

defineExpose({ open, close });
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="formType === FormType.CREATE ? '添加角色' : '修改角色'"
    width="560px"
    :close-on-click-modal="true"
    @closed="close"
  >
    <el-form
      :model="formData"
      :rules="formRules"
      ref="formRef"
      label-width="auto"
    >
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="formData.roleName" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item prop="roleKey">
        <template #label>
          <span>
            <el-tooltip
              content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)"
              placement="top"
            >
              <el-icon><QuestionFiled /></el-icon>
            </el-tooltip>
            权限字符
          </span>
        </template>
        <el-input v-model="formData.roleKey" placeholder="请输入权限字符" />
      </el-form-item>
      <el-form-item label="角色顺序" prop="roleSort">
        <el-input-number
          v-model="formData.roleSort"
          controls-position="right"
          :min="0"
        />
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
      <el-form-item label="菜单权限">
        <div class="w-full">
          <div class="mx-auto w-fit">
            <el-checkbox v-model="expandAll" @change="onExpandAllChange">
              展开/折叠
            </el-checkbox>
            <el-checkbox
              v-model="checkAll"
              @change="treeRef?.setCheckedNodes($event ? menuTree : [])"
            >
              全选/全不选
            </el-checkbox>
            <el-checkbox v-model="checkStrictly"> 父子联动 </el-checkbox>
          </div>
          <div
            style="border: 1px solid hsl(var(--border))"
            class="rounded-[var(--el-border-radius-base)] py-2"
          >
            <el-tree
              v-if="treeShow"
              ref="treeRef"
              :data="menuTree"
              :default-expand-all="expandAll"
              show-checkbox
              node-key="id"
              :check-strictly="!checkStrictly"
              empty-text="加载中，请稍候"
              :props="{ label: 'label', children: 'children' }"
            />
          </div>
        </div>
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入内容"
        />
      </el-form-item>
    </el-form>

    <div class="flex w-full justify-end">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onSubmit" :loading="submitting">
        {{ formType === FormType.EDIT ? '保存' : '添加' }}
      </el-button>
    </div>
  </el-dialog>
</template>
