<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { ElMessage, ElTable } from 'element-plus';

import { getAuthRoleApi, updateAuthRoleApi } from '#/api/system/user';

const route = useRoute();
const router = useRouter();
const roleList = ref<any[]>([]);
const userInfo = ref<Record<string, any>>({});
const tableRef = useTemplateRef<typeof ElTable>('tableRef');

const pageInfo = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

const loading = ref(false);

function tableIndex(index: number) {
  return (pageInfo.value.currentPage - 1) * pageInfo.value.pageSize + index + 1;
}

async function onQuery() {
  const userId = route.params.userId as string;
  if (userId !== null && userId !== undefined) {
    loading.value = true;
    const data = await getAuthRoleApi(userId).finally(() => {
      loading.value = false;
    });
    roleList.value = data.roles;
    userInfo.value = data.user;
    pageInfo.value.total = data.roles.length;
    await nextTick(() => {
      roleList.value.forEach((row) => {
        row.flag && tableRef.value?.toggleRowSelection(row, true);
      });
    });
  }
}

function checkSelectable(row: any) {
  return row.status === '0';
}

const tableSelections = ref<any[]>([]);
function onSelectChange(selection: any) {
  tableSelections.value = selection;
}
function onRowClick(row: any) {
  checkSelectable(row) && tableRef.value?.toggleRowSelection(row);
}

function close() {
  router.replace({ name: 'UserList' });
  // tabbarStore.closeTab(route, router);
}

async function onSubmit() {
  await updateAuthRoleApi({
    userId: userInfo.value.userId,
    roleIds: tableSelections.value.map((row: any) => row.roleId).join(','),
  });
  ElMessage.success('授权成功');
  close();
}

onMounted(() => {
  onQuery();
});
</script>

<template>
  <Page auto-content-height>
    <ElCard shadow="never" class="h-full">
      <h4 class="form-header h4">基本信息</h4>
      <ElDivider class="!my-4" />
      <el-form :model="userInfo" label-width="80px">
        <el-row>
          <el-col :span="8" :offset="2">
            <el-form-item label="用户姓名" prop="nickName">
              <el-input v-model="userInfo.nickName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8" :offset="2">
            <el-form-item label="登录账号" prop="userName">
              <el-input v-model="userInfo.userName" disabled />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <h4 class="form-header h4">角色信息</h4>
      <ElDivider class="!my-4" />
      <ElTable
        ref="tableRef"
        v-loading="loading"
        class="select-none"
        :row-key="(row) => row.roleId"
        @row-click="onRowClick"
        @selection-change="onSelectChange"
        :data="
          roleList.slice(
            (pageInfo.currentPage - 1) * pageInfo.pageSize,
            pageInfo.currentPage * pageInfo.pageSize,
          )
        "
      >
        <el-table-column
          type="selection"
          :reserve-selection="true"
          :selectable="checkSelectable"
          width="55"
        />
        <el-table-column
          type="index"
          :index="tableIndex"
          label="序号"
          align="center"
          width="60"
        />
        <el-table-column label="角色编号" align="center" prop="roleId" />
        <el-table-column label="角色名称" align="center" prop="roleName" />
        <el-table-column label="权限字符" align="center" prop="roleKey" />
        <el-table-column
          label="创建时间"
          align="center"
          prop="createTime"
          width="180"
        />
      </ElTable>

      <el-pagination
        v-model:current-page="pageInfo.currentPage"
        v-model:page-size="pageInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 30, 50]"
        :background="true"
        :total="pageInfo.total"
        :pager-count="5"
        class="ml-auto mt-5 w-fit"
        @size-change="onQuery"
        @current-change="onQuery"
      />

      <el-form label-width="100px">
        <div style="margin-top: 30px; margin-left: -120px; text-align: center">
          <el-button type="primary" @click="onSubmit()">提交</el-button>
          <el-button @click="close()">返回</el-button>
        </div>
      </el-form>
    </ElCard>
  </Page>
</template>
