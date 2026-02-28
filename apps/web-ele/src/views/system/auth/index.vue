<script setup lang="ts">
import type { ElForm } from 'element-plus';

import { nextTick, onMounted, reactive, ref, useTemplateRef } from 'vue';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { ElMessage, ElMessageBox } from 'element-plus';
import Delete from '~icons/ep/delete';
import Edit from '~icons/ep/edit';
import Plus from '~icons/ep/plus';
import Refresh from '~icons/ep/refresh';
import Search from '~icons/ep/search';
import Sort from '~icons/ep/sort';

import {
  addAuthApi,
  deleteAuthApi,
  getAuthListApi,
  updateAuthApi,
} from '#/api/system/auth';
import TableToolbar from '#/components/table-toolbar/index.vue';
import { listToTree } from '#/utils';

import Dialog from './dialog.vue';

const { hasAccessByCodes, hasAccessByRoles } = useAccess();

const refreshTable = ref(true);
const isExpandAll = ref(false);
const loading = ref(false);
const tableData = ref<any[]>([]);

const tableSelections = ref<any[]>([]);

const toolbarConfig = reactive({
  create: { show: true, disabled: false, accessCodes: ['system:menu:add'] },
  update: { show: false },
  delete: { show: false },
  import: { show: false },
  export: { show: false },
  search: { show: true, isVisible: true },
});

const dialogRef = useTemplateRef<typeof Dialog>('dialogRef');
const searchFormRef = useTemplateRef<typeof ElForm>('searchFormRef');
const searchData = reactive({
  menuName: undefined,
});
const options = reactive<{ authTree: any[] }>({
  authTree: [],
});

function onReset() {
  searchData.menuName = undefined;
  searchFormRef.value!.resetFields();
  onQuery();
}

async function onCreate(data: any) {
  const res = await getAuthListApi();
  options.authTree = [
    {
      menuId: 0,
      menuName: '根节点',
      children: listToTree(res, 'menuId'),
    },
  ];
  dialogRef.value?.open(data);
}

async function onCreateConfirm(data: any) {
  await addAuthApi(data);
  await onQuery();
  dialogRef.value?.close();
  ElMessage.success('权限添加成功');
}

/** 展开/折叠操作 */
function onToggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}

async function onUpdate(data: any) {
  dialogRef.value?.open(data, false);
}

async function onUpdateConfirm(data: any) {
  await updateAuthApi(data);
  await onQuery();
  dialogRef.value?.close();
  ElMessage.success('权限修改成功');
}

async function onDelete(data: any) {
  ElMessageBox.confirm(`是否确认删除权限"${data.menuName}"？`, '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deleteAuthApi(data.menuId);
      await onQuery();
      ElMessage.success('权限删除成功');
    })
    .catch();
}

function onSearchVisible(visible: boolean) {
  toolbarConfig.search.isVisible = visible;
}

async function onQuery() {
  const data = await getAuthListApi({
    menuName: searchData.menuName,
  });
  tableData.value = listToTree(data, 'menuId');
}

onMounted(async () => {
  await onQuery();
});
</script>

<template>
  <Page auto-content-height>
    <ElCard shadow="never" class="h-full">
      <el-form
        :model="searchData"
        ref="searchFormRef"
        :inline="true"
        v-show="toolbarConfig.search.isVisible"
        @submit.prevent="onQuery"
      >
        <el-form-item label="权限名称" prop="menuName">
          <el-input
            v-model="searchData.menuName"
            placeholder="请输入权限名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" native-type="submit">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>

      <TableToolbar
        :create-config="toolbarConfig.create"
        :update-config="toolbarConfig.update"
        :delete-config="toolbarConfig.delete"
        :import-config="toolbarConfig.import"
        :export-config="toolbarConfig.export"
        :search-config="toolbarConfig.search"
        @create="onCreate"
        @update="onUpdate(tableSelections[0])"
        @delete="onDelete(tableSelections)"
        @refresh="onQuery"
        @search-visible="onSearchVisible"
      >
        <el-button type="info" plain :icon="Sort" @click="onToggleExpandAll">
          展开/折叠
        </el-button>
      </TableToolbar>

      <el-table
        v-if="refreshTable"
        v-loading="loading"
        :data="tableData"
        :default-expand-all="isExpandAll"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        row-key="menuId"
        show-overflow-tooltip
      >
        <el-table-column label="权限名称" prop="menuName" align="left" />
        <el-table-column label="权限标识" prop="perms" align="center" />
        <el-table-column label="排序" prop="orderNum" align="center" />
        <el-table-column
          label="创建时间"
          prop="createTime"
          align="center"
          min-width="180"
        />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button
                v-if="
                  hasAccessByCodes(['system:menu:edit']) ||
                  hasAccessByRoles(['admin'])
                "
                link
                type="primary"
                :icon="Edit"
                @click="onUpdate(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="新增" placement="top">
              <el-button
                v-if="
                  hasAccessByCodes(['system:menu:add']) ||
                  hasAccessByRoles(['admin'])
                "
                link
                type="primary"
                :icon="Plus"
                @click="onCreate(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                v-if="
                  hasAccessByCodes(['system:menu:remove']) ||
                  hasAccessByRoles(['admin'])
                "
                link
                type="primary"
                :icon="Delete"
                @click="onDelete(scope.row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </ElCard>
    <Dialog
      ref="dialogRef"
      :auth-tree="options.authTree"
      @create="onCreateConfirm"
      @edit="onUpdateConfirm"
    />
  </Page>
</template>
