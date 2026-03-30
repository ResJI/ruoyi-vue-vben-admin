<script setup lang="ts">
import type { ElForm } from 'element-plus';

import { computed, onMounted, reactive, ref, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { ElMessage, ElMessageBox } from 'element-plus';
import Close from '~icons/ep/close';
import Delete from '~icons/ep/delete';
import Refresh from '~icons/ep/refresh';
import Search from '~icons/ep/search';

import { getDict } from '#/api/ruoyi';
import {
  getAllocatedUserListApi,
  getUnallocatedUserListApi,
  removeRoleUserApi,
  setRoleUserApi,
} from '#/api/system/role';
import DictTag from '#/components/dict-tag/index.vue';
import TableToolbar from '#/components/table-toolbar/index.vue';

import Dialog from './dialog.vue';

const { hasAccessByCodes, hasAccessByRoles } = useAccess();

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const pageInfo = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});
const tableData = ref<any[]>([]);

const tableSelections = ref<any[]>([]);

const toolbarConfig = reactive({
  create: { show: true, disabled: false, accessCodes: ['system:role:add'] },
  update: {
    show: false,
    disabled: computed(() => tableSelections.value.length !== 1),
    accessCodes: ['system:role:edit'],
  },
  delete: {
    show: true,
    disabled: computed(() => tableSelections.value.length === 0),
    accessCodes: ['system:role:remove'],
  },
  import: { show: false },
  export: { show: false },
  search: { show: true, isVisible: true },
  filter: {
    columns: [
      { label: '用户名称', field: 'userName', visible: true },
      { label: '用户姓名', field: 'nickName', visible: true },
      { label: '邮箱', field: 'email', visible: true },
      { label: '手机', field: 'phonenumber', visible: true },
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
  userName: undefined,
  phonenumber: undefined,
});
const options = reactive<{ statusOptions: any[] }>({
  statusOptions: [],
});

function onReset() {
  searchData.userName = undefined;
  searchData.phonenumber = undefined;
  searchFormRef.value?.resetFields();
  onQuery();
}

function onCreate() {
  dialogRef.value?.open();
}

async function onDelete(data: any[]) {
  const roleId = route.params.roleId as string;
  const names = data.map((it: any) => `[${it.nickName}]`).join('，');
  ElMessageBox.confirm(`是否确认删除用户"${names}"？`, '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const userIds = data.map((it: any) => it.userId).join(',');
      await removeRoleUserApi({
        roleId,
        userIds,
      });
      await onQuery();
      ElMessage.success('用户删除成功');
    })
    .catch();
}

function onSearchVisible(visible: boolean) {
  toolbarConfig.search.isVisible = visible;
}

async function onQuery() {
  const roleId = route.params.roleId as string;
  const res = await getAllocatedUserListApi({
    ...searchData,
    roleId,
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
  data && (data.visible = status);
}

function onSelectChange(selection: any) {
  tableSelections.value = selection;
}

onMounted(async () => {
  options.statusOptions = await getDict('sys_normal_disable');
  await onQuery();
});

const userSelectInfo = reactive({
  loading: false,
  tableData: [],
  pageInfo: {
    currentPage: 1,
    pageSize: 10,
    total: 0,
  },
});

async function onDialogQuery(data: any) {
  const roleId = route.params.roleId as string;
  userSelectInfo.loading = true;
  const res = await getUnallocatedUserListApi({
    ...data,
    roleId,
    pageNum: userSelectInfo.pageInfo.currentPage,
    pageSize: userSelectInfo.pageInfo.pageSize,
  }).finally(() => {
    userSelectInfo.loading = false;
  });
  userSelectInfo.tableData = res.rows;
  userSelectInfo.pageInfo.total = res.total;
}

async function onDialogSave(data: any) {
  const roleId = route.params.roleId as string;
  await setRoleUserApi({
    roleId,
    userIds: data.map((it: any) => it.userId).join(','),
  });
  await onQuery();
  ElMessage.success('操作成功');
  dialogRef.value?.close();
}

function onClose() {
  router.replace({ name: 'RoleList' });
}
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
        <el-form-item label="角色名称" prop="userName">
          <el-input
            v-model="searchData.userName"
            placeholder="请输入用户名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input
            v-model="searchData.phonenumber"
            placeholder="请输入手机号码"
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
        :filter-config="toolbarConfig.filter"
        @create="onCreate"
        @delete="onDelete(tableSelections)"
        @refresh="onQuery"
        @search-visible="onSearchVisible"
        @filter-change="onColumnFilterChange"
      >
        <el-button type="warning" plain :icon="Close" @click="onClose">
          关闭
        </el-button>
      </TableToolbar>

      <el-table
        v-loading="loading"
        :data="tableData"
        :show-overflow-tooltip="true"
        @selection-change="onSelectChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column
          v-if="columnVisible.get('userName')"
          label="用户名称"
          prop="userName"
        />
        <el-table-column
          v-if="columnVisible.get('nickName')"
          label="用户姓名"
          prop="nickName"
        />
        <el-table-column
          v-if="columnVisible.get('email')"
          label="邮箱"
          prop="email"
        />
        <el-table-column
          v-if="columnVisible.get('phonenumber')"
          label="手机"
          prop="phonenumber"
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
              content="删除"
              placement="top"
              v-if="scope.row.roleId !== 1"
            >
              <el-button
                v-if="
                  hasAccessByCodes(['system:role:remove']) ||
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
      <Dialog
        ref="dialogRef"
        :table-data="userSelectInfo.tableData"
        :page-info="userSelectInfo.pageInfo"
        :loading="userSelectInfo.loading"
        :status-options="options.statusOptions"
        @page-size-change="userSelectInfo.pageInfo.pageSize = $event"
        @current-page-change="userSelectInfo.pageInfo.currentPage = $event"
        @query="onDialogQuery"
        @save="onDialogSave"
      />
    </ElCard>
  </Page>
</template>
