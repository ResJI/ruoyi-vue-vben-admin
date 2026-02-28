<script setup lang="ts">
import type { ElForm } from 'element-plus';

import { computed, onMounted, reactive, ref, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { ElMessage, ElMessageBox } from 'element-plus';
import CircleCheck from '~icons/ep/circle-check';
import Delete from '~icons/ep/delete';
import Edit from '~icons/ep/edit';
import Refresh from '~icons/ep/refresh';
import Search from '~icons/ep/search';
import User from '~icons/ep/user';

import { getDict } from '#/api/ruoyi';
import { getMenuTreeApi } from '#/api/system/menu';
import {
  changeRoleStatusApi,
  createRoleApi,
  deleteRolesApi,
  getDeptTreeApi,
  getRoleByIdApi,
  getRoleListApi,
  getRoleMenuSelectedApi,
  updateDataScopeApi,
  updateRoleApi,
} from '#/api/system/role';
import TableToolbar from '#/components/table-toolbar/index.vue';

import DataDialog from './data-dialog.vue';
import RoleDialog from './role-dialog.vue';

const { hasAccessByCodes, hasAccessByRoles } = useAccess();

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
    show: true,
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
      { label: '角色编号', field: 'roleId', visible: true },
      { label: '角色名称', field: 'roleName', visible: true },
      { label: '权限字符', field: 'roleKey', visible: true },
      { label: '显示顺序', field: 'roleSort', visible: true },
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

const roleDialogRef = useTemplateRef<typeof RoleDialog>('roleDialogRef');
const dataDialogRef = useTemplateRef<typeof RoleDialog>('dataDialogRef');
const searchFormRef = useTemplateRef<typeof ElForm>('searchFormRef');
const searchData = reactive({
  roleName: undefined,
  roleKey: undefined,
  status: undefined,
  dateRange: [null, null],
});
const options = reactive<{ statusOptions: any[] }>({
  statusOptions: [],
});

function onReset() {
  searchData.roleName = undefined;
  searchData.roleKey = undefined;
  searchData.status = undefined;
  searchData.dateRange = [null, null];
  searchFormRef.value!.resetFields();
  onQuery();
}

const menuTree = ref<any[]>([]);
const deptTree = ref<any[]>([]);
function onCreate() {
  roleDialogRef.value?.open();
}
async function onRoleCreate(data: any) {
  await createRoleApi(data);
  await onQuery();
  ElMessage.success('角色创建成功');
  roleDialogRef.value?.close();
}
async function onRoleEdit(data: any) {
  await updateRoleApi(data);
  await onQuery();
  ElMessage.success('角色修改成功');
  roleDialogRef.value?.close();
}

async function onUpdate(data: any) {
  Promise.all([
    getRoleByIdApi(data.roleId),
    getRoleMenuSelectedApi(data.roleId),
  ]).then(([role, menuList]) => {
    roleDialogRef.value?.open({
      roleId: role.roleId,
      roleName: role.roleName,
      roleKey: role.roleKey,
      roleSort: role.roleSort,
      status: role.status,
      remark: role.remark,
      menuIds: menuList.checkedKeys,
    });
  });
}

async function onDelete(data: any[]) {
  const names = data.map((it: any) => `[${it.roleName}]`).join('，');
  ElMessageBox.confirm(`是否确认删除角色"${names}"？`, '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const ids = data.map((it: any) => it.roleId);
      await deleteRolesApi(ids);
      await onQuery();
      ElMessage.success('角色删除成功');
    })
    .catch();
}

function onSearchVisible(visible: boolean) {
  toolbarConfig.search.isVisible = visible;
}

async function onStatusChange(roleId: number, status: '0' | '1') {
  await changeRoleStatusApi({
    roleId,
    status,
  });
  await onQuery();
  ElMessage.success('状态修改成功');
}

async function onDataScope(data: any) {
  Promise.all([getRoleByIdApi(data.roleId), getDeptTreeApi(data.roleId)]).then(
    ([role, dept]) => {
      deptTree.value = dept.depts;
      dataDialogRef.value?.open({
        roleId: role.roleId,
        roleName: role.roleName,
        roleKey: role.roleKey,
        dataScope: role.dataScope,
        deptIds: dept.checkedKeys,
      });
    },
  );
}

async function onDataScopeSave(data: any) {
  await updateDataScopeApi(data);
  await onQuery();
  ElMessage.success('数据权限分配成功');
  dataDialogRef.value?.close();
}

function onDistributeRole(data: any) {
  router.push({
    name: 'AuthUser',
    params: { roleId: data.roleId },
  });
}

async function onQuery() {
  const res = await getRoleListApi({
    roleName: searchData.roleName,
    roleKey: searchData.roleKey,
    status: searchData.status,
    'params[beginTime]': searchData.dateRange[0],
    'params[endTime]': searchData.dateRange[1],
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
        <el-form-item label="角色名称" prop="roleName">
          <el-input
            v-model="searchData.roleName"
            placeholder="请输入角色名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="权限字符" prop="roleKey">
          <el-input
            v-model="searchData.roleKey"
            placeholder="请输入权限字符"
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
        <el-form-item label="创建时间" prop="dateRange" style="width: 308px">
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
          v-if="columnVisible.get('roleId')"
          label="角色编号"
          prop="roleId"
          width="120"
        />
        <el-table-column
          v-if="columnVisible.get('roleName')"
          label="角色名称"
          prop="roleName"
          width="150"
        />
        <el-table-column
          v-if="columnVisible.get('roleKey')"
          label="权限字符"
          prop="roleKey"
          width="150"
        />
        <el-table-column
          v-if="columnVisible.get('roleSort')"
          label="显示顺序"
          prop="roleSort"
          width="100"
        />
        <el-table-column
          v-if="columnVisible.get('status')"
          label="状态"
          align="center"
          width="100"
        >
          <template #default="scope">
            <el-switch
              :model-value="scope.row.status"
              active-value="0"
              inactive-value="1"
              @change="
                onStatusChange(
                  scope.row.roleId,
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
                  hasAccessByCodes(['system:role:edit']) ||
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
                  hasAccessByCodes(['system:role:remove']) ||
                  hasAccessByRoles(['admin'])
                "
                link
                type="primary"
                :icon="Delete"
                @click="onDelete([scope.row])"
              />
            </el-tooltip>
            <el-tooltip
              content="数据权限"
              placement="top"
              v-if="scope.row.roleId !== 1"
            >
              <el-button
                v-if="
                  hasAccessByCodes(['system:role:edit']) ||
                  hasAccessByRoles(['admin'])
                "
                link
                type="primary"
                :icon="CircleCheck"
                @click="onDataScope(scope.row)"
              />
            </el-tooltip>
            <el-tooltip
              content="分配用户"
              placement="top"
              v-if="scope.row.roleId !== 1"
            >
              <el-button
                v-if="
                  hasAccessByCodes(['system:role:edit']) ||
                  hasAccessByRoles(['admin'])
                "
                link
                type="primary"
                :icon="User"
                @click="onDistributeRole(scope.row)"
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
    <RoleDialog
      ref="roleDialogRef"
      :status-options="options.statusOptions"
      :menu-tree="menuTree"
      @create="onRoleCreate"
      @edit="onRoleEdit"
    />
    <DataDialog
      ref="dataDialogRef"
      :dept-tree="deptTree"
      @save="onDataScopeSave"
    />
  </Page>
</template>
