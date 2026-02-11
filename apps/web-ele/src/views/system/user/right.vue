<script setup lang="ts">
import type { ElForm } from 'element-plus';

import type { Dict } from '#/api/ruoyi/type';

import { computed, reactive, ref, useTemplateRef } from 'vue';

import { useAccess } from '@vben/access';

import CircleCheck from '~icons/ep/circle-check';
import Delete from '~icons/ep/delete';
import Edit from '~icons/ep/edit';
import Key from '~icons/ep/key';
import Refresh from '~icons/ep/refresh';
import Search from '~icons/ep/search';

import TableToolbar from '#/components/table-toolbar/index.vue';

defineOptions({
  name: 'UserRight',
});

withDefaults(
  defineProps<{
    loading?: boolean;
    pageInfo?: {
      currentPage: number;
      pageSize: number;
      total: number;
    };
    statusOptions?: Dict[];
    tableData: any[];
  }>(),
  {
    statusOptions: () => [],
    loading: false,
    pageInfo: () => ({
      currentPage: 1,
      pageSize: 10,
      total: 0,
    }),
  },
);

const emits = defineEmits<{
  (e: 'query', data: any): void;
  (e: 'create'): void;
  (e: 'update', data: any): void;
  (e: 'delete', data: any[]): void;
  (e: 'resetPassword', data: any[]): void;
  (e: 'distributeRole', data: any[]): void;
  (e: 'import'): void;
  (e: 'export'): void;
  (e: 'reset'): void;
  (e: 'statusChange', data: { status: '0' | '1'; userId: number }): void;
  (e: 'currentPageChange', data: number): void;
  (e: 'pageSizeChange', data: number): void;
}>();

const { hasAccessByCodes, hasAccessByRoles } = useAccess();

const tableSelections = ref<any[]>([]);

const toolbarConfig = reactive({
  create: { show: true, disabled: false, accessCodes: ['system:user:add'] },
  update: {
    show: true,
    disabled: computed(() => tableSelections.value.length !== 1),
    accessCodes: ['system:user:edit'],
  },
  delete: {
    show: true,
    disabled: computed(() => tableSelections.value.length === 0),
    accessCodes: ['system:user:remove'],
  },
  import: { show: false, disabled: false, accessCodes: ['system:user:import'] },
  export: { show: false, disabled: false, accessCodes: ['system:user:export'] },
  search: { show: true, isVisible: true },
  filter: {
    columns: [
      { label: '用户编号', field: 'userId', visible: true },
      { label: '用户名称', field: 'userName', visible: true },
      { label: '用户昵称', field: 'nickName', visible: true },
      { label: '部门', field: 'deptName', visible: true },
      { label: '手机号码', field: 'phonenumber', visible: true },
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

const searchFormRef = useTemplateRef<typeof ElForm>('searchFormRef');
const searchData = reactive({
  userName: undefined,
  phonenumber: undefined,
  status: undefined,
  dateRange: [null, null],
});

function onReset() {
  searchData.userName = undefined;
  searchData.phonenumber = undefined;
  searchData.status = undefined;
  searchData.dateRange = [null, null];
  searchFormRef.value!.resetFields();
  emits('reset');
  onQuery();
}
// function tableIndex(index: number) {
//   return (pageInfo.value.currentPage - 1) * pageInfo.value.pageSize + index + 1;
// }

function onCreate() {
  emits('create');
}

function onUpdate(data: any) {
  emits('update', data);
}

function onDelete(data: any[]) {
  emits('delete', data);
}

function onImport() {
  emits('import');
}

function onExport() {
  emits('export');
}

function onSearchVisible(visible: boolean) {
  toolbarConfig.search.isVisible = visible;
}

function onStatusChange(userId: number, status: '0' | '1') {
  emits('statusChange', { userId, status });
}

function onResetPassword(data: any) {
  emits('resetPassword', data);
}

function onDistributeRole(data: any) {
  emits('distributeRole', data);
}

function onCurrentPageChange(data: number) {
  emits('currentPageChange', data);
}

function onPageSizeChange(data: number) {
  emits('pageSizeChange', data);
}

function onQuery() {
  emits('query', {
    userName: searchData.userName,
    phonenumber: searchData.phonenumber,
    status: searchData.status,
    'params[beginTime]': searchData.dateRange[0],
    'params[endTime]': searchData.dateRange[1],
  });
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
</script>

<template>
  <div>
    <el-form
      :model="searchData"
      ref="searchFormRef"
      :inline="true"
      v-show="toolbarConfig.search.isVisible"
      @submit.prevent="onQuery"
    >
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="searchData.userName"
          placeholder="请输入用户名称"
          clearable
          style="width: 240px"
          @keyup.enter="onQuery"
        />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
        <el-input
          v-model="searchData.phonenumber"
          placeholder="请输入手机号码"
          clearable
          style="width: 240px"
          @keyup.enter="onQuery"
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
            v-for="it in statusOptions"
            :key="it.id"
            :label="it.label"
            :value="it.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px">
        <el-date-picker
          v-model="searchData.dateRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
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
      @update="onUpdate(tableSelections[0])"
      @delete="onDelete(tableSelections)"
      @import="onImport"
      @export="onExport"
      @refresh="onQuery"
      @search-visible="onSearchVisible"
      @filter-change="onColumnFilterChange"
    />

    <el-table
      v-loading="loading"
      :data="tableData"
      @selection-change="onSelectChange"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column
        v-if="columnVisible.get('userId')"
        label="用户编号"
        align="center"
        prop="userId"
      />
      <el-table-column
        v-if="columnVisible.get('userName')"
        label="用户名称"
        align="center"
        prop="userName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="columnVisible.get('nickName')"
        label="用户昵称"
        align="center"
        prop="nickName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="columnVisible.get('deptName')"
        label="部门"
        align="center"
        prop="dept.deptName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="columnVisible.get('phonenumber')"
        label="手机号码"
        align="center"
        prop="phonenumber"
        width="120"
      />
      <el-table-column
        v-if="columnVisible.get('status')"
        label="状态"
        align="center"
      >
        <template #default="scope">
          <el-switch
            :model-value="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="
              onStatusChange(
                scope.row.userId,
                scope.row.status === '0' ? '1' : '0',
              )
            "
          />
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnVisible.get('createTime')"
        label="创建时间"
        align="center"
        prop="createTime"
        width="160"
      />
      <el-table-column
        label="操作"
        align="center"
        width="150"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-tooltip
            content="修改"
            placement="top"
            v-if="scope.row.userId !== 1"
          >
            <el-button
              v-if="
                hasAccessByCodes(['system:user:edit']) ||
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
            v-if="scope.row.userId !== 1"
          >
            <el-button
              v-if="
                hasAccessByCodes(['system:user:remove']) ||
                hasAccessByRoles(['admin'])
              "
              link
              type="primary"
              :icon="Delete"
              @click="onDelete([scope.row])"
            />
          </el-tooltip>
          <el-tooltip
            content="重置密码"
            placement="top"
            v-if="scope.row.userId !== 1"
          >
            <el-button
              v-if="
                hasAccessByCodes(['system:user:resetPwd']) ||
                hasAccessByRoles(['admin'])
              "
              link
              type="primary"
              :icon="Key"
              @click="onResetPassword(scope.row)"
            />
          </el-tooltip>
          <el-tooltip
            content="分配角色"
            placement="top"
            v-if="scope.row.userId !== 1"
          >
            <el-button
              v-if="
                hasAccessByCodes(['system:user:edit']) ||
                hasAccessByRoles(['admin'])
              "
              link
              type="primary"
              :icon="CircleCheck"
              @click="onDistributeRole(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="pageInfo.currentPage"
      :page-size="pageInfo.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :page-sizes="[10, 20, 30, 50]"
      :background="true"
      :total="pageInfo.total"
      :pager-count="5"
      class="float-right mt-5"
      @size-change="onQuery"
      @current-change="onQuery"
      @update:current-page="onCurrentPageChange($event)"
      @update:page-size="onPageSizeChange($event)"
    />
  </div>
</template>
