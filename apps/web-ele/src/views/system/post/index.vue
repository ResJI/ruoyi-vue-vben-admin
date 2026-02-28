<script setup lang="ts">
import type { ElForm } from 'element-plus';

import { computed, onMounted, reactive, ref, useTemplateRef } from 'vue';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { ElMessage, ElMessageBox } from 'element-plus';
import Delete from '~icons/ep/delete';
import Edit from '~icons/ep/edit';
import Refresh from '~icons/ep/refresh';
import Search from '~icons/ep/search';

import { getDict } from '#/api/ruoyi';
import { getMenuTreeApi } from '#/api/system/menu';
import {
  addPostApi,
  deletePostApi,
  getListPostApi,
  updatePostApi,
} from '#/api/system/post';
import DictTag from '#/components/dict-tag/index.vue';
import TableToolbar from '#/components/table-toolbar/index.vue';

import Dialog from './dialog.vue';

const { hasAccessByCodes, hasAccessByRoles } = useAccess();

const loading = ref(false);
const pageInfo = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});
const tableData = ref<any[]>([]);

const tableSelections = ref<any[]>([]);

const toolbarConfig = reactive({
  create: { show: true, disabled: false, accessCodes: ['system:post:add'] },
  update: {
    show: true,
    disabled: computed(() => tableSelections.value.length !== 1),
    accessCodes: ['system:post:edit'],
  },
  delete: {
    show: true,
    disabled: computed(() => tableSelections.value.length === 0),
    accessCodes: ['system:post:remove'],
  },
  import: { show: false },
  export: { show: false },
  search: { show: true, isVisible: true },
  filter: {
    columns: [
      { label: '岗位编号', field: 'postId', visible: true },
      { label: '岗位编码', field: 'postCode', visible: true },
      { label: '岗位名称', field: 'postName', visible: true },
      { label: '岗位排序', field: 'postSort', visible: true },
      { label: '状态', field: 'status', visible: true },
      { label: '创建时间', field: 'createTime', visible: true },
    ],
  },
});

const columnVisible = computed(() => {
  const map = new Map<string, boolean>();
  toolbarConfig.filter.columns.forEach((it) => {
    map.set(it.field, it.visible);
  });
  return map;
});

const dialogRef = useTemplateRef<typeof Dialog>('dialogRef');
const searchFormRef = useTemplateRef<typeof ElForm>('searchFormRef');
const searchData = reactive({
  postCode: undefined,
  postName: undefined,
  status: undefined,
});
const options = reactive<{ statusOptions: any[] }>({
  statusOptions: [],
});

function onReset() {
  searchData.postCode = undefined;
  searchData.postName = undefined;
  searchData.status = undefined;
  searchFormRef.value!.resetFields();
  onQuery();
}

const menuTree = ref<any[]>([]);

function onCreate() {
  dialogRef.value?.open();
}

async function onCreateConfirm(data: any) {
  await addPostApi(data);
  await onQuery();
  dialogRef.value?.close();
  ElMessage.success('岗位添加成功');
}

async function onUpdate(data: any) {
  dialogRef.value?.open(data);
}

async function onUpdateConfirm(data: any) {
  await updatePostApi(data);
  await onQuery();
  dialogRef.value?.close();
  ElMessage.success('岗位修改成功');
}

async function onDelete(data: any[]) {
  const names = data.map((it: any) => `[${it.postName}]`).join('，');
  ElMessageBox.confirm(`是否确认删除岗位"${names}"？`, '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const ids = data.map((it: any) => it.postId);
      await deletePostApi(ids);
      await onQuery();
      ElMessage.success('岗位删除成功');
    })
    .catch();
}

function onSearchVisible(visible: boolean) {
  toolbarConfig.search.isVisible = visible;
}

async function onQuery() {
  const res = await getListPostApi({
    postCode: searchData.postCode,
    postName: searchData.postName,
    status: searchData.status,
    pageNum: pageInfo.value.currentPage,
    pageSize: pageInfo.value.pageSize,
  });
  tableData.value = res.rows;
  pageInfo.value.total = res.total;
}

function onColumnFilterChange({
  field,
  status,
}: {
  field: string;
  status: boolean;
}) {
  const data = toolbarConfig.filter.columns.find((it) => it.field === field);
  data!.visible = status;
}

function onSelectChange(selection: any) {
  tableSelections.value = selection;
}

onMounted(async () => {
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
        <el-form-item label="岗位编码" prop="postCode">
          <el-input
            v-model="searchData.postCode"
            placeholder="请输入岗位编码"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="岗位名称" prop="postName">
          <el-input
            v-model="searchData.postName"
            placeholder="请输入岗位名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="searchData.status"
            placeholder="岗位状态"
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
        :filter-config="toolbarConfig.filter"
        @create="onCreate"
        @update="onUpdate(tableSelections[0])"
        @delete="onDelete(tableSelections)"
        @refresh="onQuery"
        @search-visible="onSearchVisible"
        @filter-change="onColumnFilterChange"
      />

      <el-table
        v-loading="loading"
        :data="tableData"
        show-overflow-tooltip
        @selection-change="onSelectChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column
          v-if="columnVisible.get('postId')"
          label="岗位编号"
          prop="postId"
          align="center"
        />
        <el-table-column
          v-if="columnVisible.get('postCode')"
          label="岗位编码"
          prop="postCode"
          align="center"
        />
        <el-table-column
          v-if="columnVisible.get('postName')"
          label="岗位名称"
          prop="postName"
          align="center"
        />
        <el-table-column
          v-if="columnVisible.get('postSort')"
          label="岗位排序"
          prop="postSort"
          align="center"
        />
        <el-table-column
          v-if="columnVisible.get('status')"
          label="状态"
          align="center"
          width="100"
        >
          <template #default="{ row }: any">
            <DictTag
              :dict-value="row.status"
              :dict-list="options.statusOptions"
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnVisible.get('createTime')"
          label="创建时间"
          align="center"
          prop="createTime"
        />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-tooltip
              content="修改"
              placement="top"
              v-if="scope.row.roleId !== 1"
            >
              <el-button
                v-if="
                  hasAccessByCodes(['system:post:edit']) ||
                  hasAccessByRoles(['admin'])
                "
                link
                type="primary"
                :icon="Edit"
                @click="onUpdate(scope.row)"
              />
            </el-tooltip>
            <el-tooltip
              content="删除"
              placement="top"
              v-if="scope.row.roleId !== 1"
            >
              <el-button
                v-if="
                  hasAccessByCodes(['system:post:remove']) ||
                  hasAccessByRoles(['admin'])
                "
                link
                type="primary"
                :icon="Delete"
                @click="onDelete([scope.row])"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pageInfo.currentPage"
        v-model:page-size="pageInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 30, 50]"
        :background="true"
        :total="pageInfo.total"
        :pager-count="5"
        class="float-right mt-5"
        @size-change="onQuery"
        @current-change="onQuery"
      />
    </ElCard>
    <Dialog
      ref="dialogRef"
      :status-options="options.statusOptions"
      @create="onCreateConfirm"
      @edit="onUpdateConfirm"
    />
  </Page>
</template>
