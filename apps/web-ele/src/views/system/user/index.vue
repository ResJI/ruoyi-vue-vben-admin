<script setup lang="ts">
import type { Dict } from '#/api/ruoyi/type';

import { onMounted, ref, useTemplateRef } from 'vue';

import { Page } from '@vben/common-ui';

import { ElMessage, ElMessageBox } from 'element-plus';
import { Pane, Splitpanes } from 'splitpanes';

import { getDict } from '#/api/ruoyi';
import {
  changeUserStatusApi,
  createUserApi,
  deleteUserApi,
  getDepartmentTree,
  getPositionsAndRolesApi,
  getUserByIdApi,
  getUserListApi,
  resetUserPasswordApi,
  updateUserApi,
} from '#/api/system/user';

import UserLeft from './left.vue';
import UserRight from './right.vue';
import UserDialog from './user-dialog.vue';

import 'splitpanes/dist/splitpanes.css';

const userLeftRef = useTemplateRef('userLeftRef');
const userDialogRef = useTemplateRef('userDialogRef');
const departmentTree = ref<any[]>([]);
const enabledDepartmentTree = ref<any[]>([]);
const tableData = ref<any[]>([]);
const dataTotal = ref(0);
const loading = ref(false);
const selectedDepartment = ref<any>();
const queryData = ref<any>({});
const statusOptions = ref<Dict[]>([]);
const genderOptions = ref<Dict[]>([]);
const positionOptions = ref<any[]>([]);
const roleOptions = ref<any[]>([]);
const pageInfo = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

async function onNodeClick(data: any) {
  selectedDepartment.value = data;
  await query();
}

async function onQuery(data: any) {
  queryData.value = data;
  await query();
}

async function query() {
  loading.value = true;
  const res = await getUserListApi({
    ...queryData.value,
    deptId: selectedDepartment.value?.id,
    pageNum: pageInfo.value.currentPage,
    pageSize: pageInfo.value.pageSize,
  }).finally(() => {
    loading.value = false;
  });
  tableData.value = res.rows;
  dataTotal.value = res.total;
}

async function onReset() {
  selectedDepartment.value = null;
  userLeftRef.value!.reset();
}

async function onCreate() {
  const { posts, roles } = await getPositionsAndRolesApi();
  positionOptions.value = posts;
  roleOptions.value = roles;
  userDialogRef.value!.open();
}

async function onEdit(d: any) {
  const { posts, roles, data, postIds, roleIds } = await getUserByIdApi(
    d.userId,
  );
  positionOptions.value = posts;
  roleOptions.value = roles;
  userDialogRef.value!.open({ ...data, postIds, roleIds });
}

function onDelete(data: any[]) {
  const names = data.map((it: any) => `[${it.nickName}]`).join('，');
  ElMessageBox.confirm(`是否确认删除用户"${names}"的数据项？`, '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const userIds = data.map((it: any) => it.userId);
      await deleteUserApi(userIds);
      ElMessage.success('用户删除成功');
      userDialogRef.value!.close();
      await query();
    })
    .catch();
}

function onResetPassword(data: any) {
  ElMessageBox.prompt(`请输入"${data.nickName}"的新密码`, '修改密码', {
    confirmButtonText: '修改',
    cancelButtonText: '取消',
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: '用户密码长度5-20字符之间',
  })
    .then(({ value }: any) => {
      resetUserPasswordApi({
        userId: data.userId,
        password: value,
      });
      ElMessage.success('密码修改成功');
    })
    .catch();
}

async function create(data: any) {
  await createUserApi(data);
  ElMessage.success('用户创建成功');
  userDialogRef.value!.close();
  await query();
}

async function edit(data: any) {
  await updateUserApi(data);
  ElMessage.success('用户修改成功');
  userDialogRef.value!.close();
  await query();
}

async function onStatusChange({
  userId,
  status,
}: {
  status: '0' | '1';
  userId: number;
}) {
  await changeUserStatusApi({ userId, status });
  await query();
}

async function getOptions() {
  statusOptions.value = await getDict('sys_normal_disable');
  genderOptions.value = await getDict('sys_user_sex');
}

/** 过滤禁用的部门 */
function filterDisabledDept(deptList: any[]) {
  return deptList.filter((dept) => {
    if (dept.disabled) {
      return false;
    }
    if (dept.children && dept.children.length > 0) {
      dept.children = filterDisabledDept(dept.children);
    }
    return true;
  });
}

onMounted(async () => {
  departmentTree.value = await getDepartmentTree();
  enabledDepartmentTree.value = filterDisabledDept(departmentTree.value);
  await getOptions();
  await query();
});
</script>

<template>
  <Page auto-content-height>
    <ElCard shadow="never" class="h-full">
      <Splitpanes class="default-theme">
        <Pane size="18">
          <UserLeft
            ref="userLeftRef"
            :department-tree="departmentTree"
            class="mr-[20px]"
            @node-click="onNodeClick"
          />
        </Pane>
        <Pane size="82">
          <UserRight
            :table-data="tableData"
            :data-total="dataTotal"
            :loading="loading"
            :status-options="statusOptions"
            :page-info="pageInfo"
            class="ml-[20px]"
            @query="onQuery"
            @reset="onReset"
            @status-change="onStatusChange"
            @create="onCreate"
            @update="onEdit"
            @delete="onDelete"
            @current-page-change="pageInfo.currentPage = $event"
            @page-size-change="pageInfo.pageSize = $event"
            @reset-password="onResetPassword"
          />
        </Pane>
      </Splitpanes>
    </ElCard>
    <UserDialog
      ref="userDialogRef"
      :department-tree="enabledDepartmentTree"
      :gender-options="genderOptions"
      :position-options="positionOptions"
      :role-options="roleOptions"
      :status-options="statusOptions"
      @create="create"
      @edit="edit"
    />
  </Page>
</template>

<style lang="scss">
.splitpanes__pane {
  background-color: unset !important;
}

.splitpanes__splitter {
  @apply bg-card !important;

  border-left: 1px solid hsl(var(--border)) !important;

  &::before,
  &::after {
    @apply bg-border !important;
  }
}
</style>
