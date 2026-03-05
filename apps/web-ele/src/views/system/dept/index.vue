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

import { getDict } from '#/api/ruoyi';
import {
  addDeptApi,
  deleteDeptApi,
  getListDeptApi,
  updateDeptApi,
} from '#/api/system/dept';
import { getMenuTreeApi } from '#/api/system/menu';
import DictTag from '#/components/dict-tag/index.vue';
import TableToolbar from '#/components/table-toolbar/index.vue';
import { listToTree } from '#/utils';

import Dialog from './dialog.vue';

const { hasAccessByCodes, hasAccessByRoles } = useAccess();

const refreshTable = ref(true);
const loading = ref(false);
const isExpandAll = ref(true);
const tableData = ref<any[]>([]);
const departmentTree = ref<any[]>([]);

const tableSelections = ref<any[]>([]);

const toolbarConfig = reactive({
  create: { show: true, disabled: false, accessCodes: ['system:dept:add'] },
  update: { show: false },
  delete: { show: false },
  import: { show: false },
  export: { show: false },
  search: { show: true, isVisible: true },
});

const dialogRef = useTemplateRef<typeof Dialog>('dialogRef');
const searchFormRef = useTemplateRef<typeof ElForm>('searchFormRef');
const searchData = reactive({
  deptName: undefined,
  status: undefined,
});
const options = reactive<{ statusOptions: any[] }>({
  statusOptions: [],
});

function onReset() {
  searchData.deptName = undefined;
  searchData.status = undefined;
  searchFormRef.value!.resetFields();
  onQuery();
}

const menuTree = ref<any[]>([]);

function onCreate(data?: any) {
  dialogRef.value?.open(data);
}

async function onCreateConfirm(data: any) {
  await addDeptApi(data);
  await onQuery();
  dialogRef.value?.close();
  ElMessage.success('部门添加成功');
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
  await updateDeptApi(data);
  await onQuery();
  dialogRef.value?.close();
  ElMessage.success('部门修改成功');
}

async function onDelete(data: any) {
  ElMessageBox.confirm(`是否确认删除部门"${data?.deptName}"？`, '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deleteDeptApi(data.deptId);
      await onQuery();
      ElMessage.success('部门删除成功');
    })
    .catch();
}

function onSearchVisible(visible: boolean) {
  toolbarConfig.search.isVisible = visible;
}

async function onQuery() {
  loading.value = true;
  const data = await getListDeptApi({
    deptName: searchData.deptName,
    status: searchData.status,
  }).finally(() => {
    loading.value = false;
  });
  tableData.value = listToTree(data, 'deptId');
}

onMounted(async () => {
  departmentTree.value = listToTree(await getListDeptApi(), 'deptId');
  options.statusOptions = await getDict('sys_normal_disable');
  menuTree.value = await getMenuTreeApi();

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
        <el-form-item label="部门名称" prop="deptName">
          <el-input
            v-model="searchData.deptName"
            placeholder="请输入部门名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="searchData.status"
            placeholder="用户状态"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="it in options.statusOptions"
              :key="it.id"
              :label="it.label"
              :value="it.value"
            />
          </el-select>
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
        @create="onCreate()"
        @update="onUpdate(tableSelections[0])"
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
        row-key="deptId"
        show-overflow-tooltip
      >
        <el-table-column label="部门名称" prop="deptName" min-width="260" />
        <el-table-column label="排序" prop="orderNum" min-width="260" />
        <el-table-column label="状态" align="center" min-width="100">
          <template #default="{ row }: any">
            <DictTag
              :dict-value="row.status"
              :dict-list="options.statusOptions"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="创建时间"
          align="center"
          prop="createTime"
          min-width="200"
        />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button
                v-if="
                  hasAccessByCodes(['system:dept:edit']) ||
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
                  hasAccessByCodes(['system:dept:add']) ||
                  hasAccessByRoles(['admin'])
                "
                link
                type="primary"
                :icon="Plus"
                @click="onCreate(scope.row)"
              />
            </el-tooltip>
            <el-tooltip
              content="删除"
              placement="top"
              v-if="scope.row.parentId !== 0"
            >
              <el-button
                v-if="
                  hasAccessByCodes(['system:dept:remove']) ||
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
      <Dialog
        ref="dialogRef"
        :department-tree="departmentTree"
        :status-options="options.statusOptions"
        @create="onCreateConfirm"
        @edit="onUpdateConfirm"
      />
    </ElCard>
  </Page>
</template>
