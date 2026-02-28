<script setup lang="ts">
import type { FormInstance } from 'element-plus';

import type { Dict } from '#/api/ruoyi/type';

import { ref, useTemplateRef } from 'vue';

import Refresh from '~icons/ep/refresh';
import Search from '~icons/ep/search';

import DictTag from '#/components/dict-tag/index.vue';

withDefaults(
  defineProps<{
    loading?: boolean;
    pageInfo: {
      currentPage: number;
      pageSize: number;
      total: number;
    };
    statusOptions: Dict[];
    submitting?: boolean;
    tableData: any[];
  }>(),
  {
    loading: false,
    submitting: false,
  },
);

const emits = defineEmits<{
  (e: 'save', data: any): void;
  (e: 'query', data: any): void;
  (e: 'currentPageChange', data: number): void;
  (e: 'pageSizeChange', data: number): void;
}>();

interface SearchData {
  userName: string;
  phonenumber: string;
}

const visible = ref(false);

const searchFormRef = useTemplateRef<FormInstance>('searchFormRef');
const searchData = ref<Partial<SearchData>>({
  userName: undefined,
  phonenumber: undefined,
});

function open() {
  visible.value = true;
  onQuery();
}

function close() {
  searchData.value = {
    userName: undefined,
    phonenumber: undefined,
  };
  searchFormRef.value?.resetFields();
  visible.value = false;
}

const tableSelections = ref<any[]>([]);
function onSelectChange(selection: any) {
  tableSelections.value = selection;
}

async function onSubmit() {
  try {
    await searchFormRef.value!.validate();
    emits('save', tableSelections.value);
  } catch {}
}

function onReset() {
  searchData.value = {
    userName: undefined,
    phonenumber: undefined,
  };
  searchFormRef.value!.resetFields();
  onQuery();
}

function onQuery() {
  emits('query', {
    ...searchData.value,
  });
}

function onCurrentPageChange(data: number) {
  emits('currentPageChange', data);
}

function onPageSizeChange(data: number) {
  emits('pageSizeChange', data);
}

defineExpose({ open, close });
</script>

<template>
  <el-dialog
    v-model="visible"
    title="选择用户"
    width="860px"
    :close-on-click-modal="true"
    @closed="close"
  >
    <el-form
      :model="searchData"
      ref="searchFormRef"
      label-width="auto"
      @submit.prevent="onQuery"
    >
      <div class="flex justify-between">
        <div class="mr-4 flex">
          <el-form-item label="用户名称" prop="userName" class="mr-4">
            <el-input
              v-model="searchData.userName"
              placeholder="请输入用户名称"
              clearable
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="手机号码" prop="phonenumber">
            <el-input
              v-model="searchData.phonenumber"
              placeholder="请输入手机号码"
              clearable
              style="width: 180px"
            />
          </el-form-item>
        </div>
        <el-form-item>
          <el-button type="primary" :icon="Search" native-type="submit">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </div>
    </el-form>

    <el-table
      v-loading="loading"
      :data="tableData"
      height="300px"
      show-overflow-tooltip
      @selection-change="onSelectChange"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="用户名称" prop="userName" />
      <el-table-column label="用户昵称" prop="nickName" />
      <el-table-column label="邮箱" prop="email" />
      <el-table-column label="手机" prop="phonenumber" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <DictTag :dict-list="statusOptions" :dict-value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      />
    </el-table>
    <el-pagination
      :current-page="pageInfo.currentPage"
      :page-size="pageInfo.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :page-sizes="[10, 20, 30, 50]"
      :background="true"
      :total="pageInfo.total"
      :pager-count="5"
      class="ml-auto mt-5 w-fit"
      @size-change="onQuery"
      @current-change="onQuery"
      @update:current-page="onCurrentPageChange($event)"
      @update:page-size="onPageSizeChange($event)"
    />

    <div class="mt-4 flex w-full justify-end">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onSubmit" :loading="submitting">
        保存
      </el-button>
    </div>
  </el-dialog>
</template>
