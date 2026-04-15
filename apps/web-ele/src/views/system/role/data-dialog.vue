<script setup lang="ts">
import type { ElTree, FormInstance } from 'element-plus';

import { nextTick, ref, useTemplateRef } from 'vue';

withDefaults(
  defineProps<{
    deptTree: any[];
    submitting?: boolean;
  }>(),
  {
    submitting: false,
  },
);

const emits = defineEmits<{
  (e: 'save', data: any): void;
}>();

interface FormData {
  roleId: number;
  roleName: string;
  roleKey: string;
  dataScope: string;
  deptIds: number[];
}

const visible = ref(false);

const formRef = useTemplateRef<FormInstance>('formRef');
const treeRef = useTemplateRef<typeof ElTree>('treeRef');
const formData = ref<Partial<FormData>>({
  dataScope: '1',
});
const checkStrictly = ref(false);
const checkAll = ref(false);
const expandAll = ref(true);
const treeShow = ref(true);
const dataScopeOptions = ref([
  { value: '1', label: '全部数据权限' },
  { value: '2', label: '自定数据权限' },
  { value: '3', label: '本部门数据权限' },
  { value: '4', label: '本部门及以下数据权限' },
  { value: '5', label: '仅本人数据权限' },
]);

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

function onDataScopeSelectChange(data: string) {
  if (data !== '2') {
    treeRef.value?.setCheckedKeys([]);
    formData.value.deptIds = [];
  }
}

function open(data: FormData) {
  formData.value = data as FormData;
  nextTick(() => {
    treeRef.value?.setCheckedKeys(formData.value.deptIds);
  });
  treeShow.value = true;
  visible.value = true;
}

function close() {
  formData.value = {
    dataScope: '1',
  };
  checkStrictly.value = false;
  checkAll.value = false;
  expandAll.value = true;
  treeShow.value = false;
  formRef.value?.resetFields();
  visible.value = false;
}

async function onSubmit() {
  try {
    await formRef.value?.validate();
    let data = {};
    if (formData.value.dataScope === '2') {
      const selectedIds = treeRef.value?.getCheckedKeys() as number[];
      const halfSelectedIds = treeRef.value?.getHalfCheckedKeys() as number[];
      selectedIds.unshift(...halfSelectedIds);
      data = {
        roleId: formData.value.roleId,
        dataScope: formData.value.dataScope,
        deptIds: selectedIds,
      };
    } else {
      data = {
        roleId: formData.value.roleId,
        dataScope: formData.value.dataScope,
        deptIds: [],
      };
    }
    emits('save', data);
  } catch {}
}

defineExpose({ open, close });
</script>

<template>
  <el-dialog
    v-model="visible"
    title="分配数据权限"
    width="560px"
    :close-on-click-modal="true"
    @closed="close"
  >
    <el-form :model="formData" ref="formRef" label-width="auto">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="formData.roleName" :disabled="true" />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input v-model="formData.roleKey" :disabled="true" />
      </el-form-item>
      <el-form-item label="权限范围" prop="dataScope">
        <el-select
          v-model="formData.dataScope"
          @change="onDataScopeSelectChange"
        >
          <el-option
            v-for="item in dataScopeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.dataScope === '2'" label="数据权限">
        <div class="w-full">
          <div class="mx-auto w-fit">
            <el-checkbox v-model="expandAll" @change="onExpandAllChange">
              展开/折叠
            </el-checkbox>
            <el-checkbox
              v-model="checkAll"
              @change="treeRef?.setCheckedNodes($event ? deptTree : [])"
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
              :data="deptTree"
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
    </el-form>

    <div class="flex w-full justify-end">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onSubmit" :loading="submitting">
        保存
      </el-button>
    </div>
  </el-dialog>
</template>
