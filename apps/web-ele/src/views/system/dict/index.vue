<script setup lang="ts">
import type { ElForm } from 'element-plus';

import { computed, onMounted, reactive, ref, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { ElMessage, ElMessageBox } from 'element-plus';
import Delete from '~icons/ep/delete';
import Edit from '~icons/ep/edit';
import Refresh from '~icons/ep/refresh';
import Search from '~icons/ep/search';

import { getDict } from '#/api/ruoyi';
import {
  addTypeApi,
  deleteTypeApi,
  getListTypeApi,
  refreshCacheApi,
  updateTypeApi,
} from '#/api/system/dict';
import DictTag from '#/components/dict-tag/index.vue';
import TableToolbar from '#/components/table-toolbar/index.vue';

import Dialog from './dialog.vue';

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
  create: { show: true, disabled: false, accessCodes: ['system:dict:add'] },
  update: {
    show: true,
    disabled: computed(() => tableSelections.value.length !== 1),
    accessCodes: ['system:dict:edit'],
  },
  delete: {
    show: true,
    disabled: computed(() => tableSelections.value.length === 0),
    accessCodes: ['system:dict:remove'],
  },
  import: { show: false },
  export: { show: false },
  search: { show: true, isVisible: true },
  filter: {
    columns: [
      { label: '字典编号', field: 'dictId', visible: true },
      { label: '字典名称', field: 'dictName', visible: true },
      { label: '字典类型', field: 'dictType', visible: true },
      { label: '状态', field: 'status', visible: true },
      { label: '备注', field: 'remark', visible: true },
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
  dictName: undefined,
  dictType: undefined,
  status: undefined,
  dateRange: [null, null],
});
const options = reactive<{ statusOptions: any[] }>({
  statusOptions: [],
});

function onReset() {
  searchData.dictName = undefined;
  searchData.dictType = undefined;
  searchData.status = undefined;
  searchFormRef.value?.resetFields();
  onQuery();
}

function onCreate() {
  dialogRef.value?.open();
}

async function onCreateConfirm(data: any) {
  await addTypeApi(data);
  await onQuery();
  dialogRef.value?.close();
  ElMessage.success('字典添加成功');
}

async function onUpdate(data: any) {
  dialogRef.value?.open(data);
}

async function onUpdateConfirm(data: any) {
  await updateTypeApi(data);
  await onQuery();
  dialogRef.value?.close();
  ElMessage.success('字典修改成功');
}

async function onDelete(data: any[]) {
  const names = data.map((it: any) => `[${it.dictName}]`).join('，');
  ElMessageBox.confirm(`是否确认删除字典"${names}"？`, '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const ids = data.map((it: any) => it.dictId);
      await deleteTypeApi(ids);
      await onQuery();
      ElMessage.success('字典删除成功');
    })
    .catch();
}

function onSearchVisible(visible: boolean) {
  toolbarConfig.search.isVisible = visible;
}

async function onRefreshCache() {
  await refreshCacheApi();
  ElMessage.success('缓存刷新成功');
}

async function onQuery() {
  const res = await getListTypeApi({
    dictName: searchData.dictName,
    dictType: searchData.dictType,
    status: searchData.status,
    pageNum: pageInfo.value.currentPage,
    pageSize: pageInfo.value.pageSize,
    'params[beginTime]': searchData.dateRange[0],
    'params[endTime]': searchData.dateRange[1],
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
        <el-form-item label="字典名称" prop="dictName">
          <el-input
            v-model="searchData.dictName"
            placeholder="请输入字典名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input
            v-model="searchData.dictType"
            placeholder="请输入字典类型"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="searchData.status"
            placeholder="字典状态"
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
        @refresh="onQuery"
        @search-visible="onSearchVisible"
        @filter-change="onColumnFilterChange"
      >
        <el-button
          v-if="
            hasAccessByCodes(['system:dict:remove']) ||
            hasAccessByRoles(['admin'])
          "
          type="danger"
          plain
          :icon="Refresh"
          @click="onRefreshCache"
        >
          刷新缓存
        </el-button>
      </TableToolbar>

      <el-table
        v-loading="loading"
        :data="tableData"
        show-overflow-tooltip
        @selection-change="onSelectChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column
          v-if="columnVisible.get('dictId')"
          label="字典编号"
          prop="dictId"
          align="center"
        />
        <el-table-column
          v-if="columnVisible.get('dictName')"
          label="字典名称"
          prop="dictName"
          align="center"
        />
        <el-table-column
          v-if="columnVisible.get('dictType')"
          label="字典类型"
          prop="dictType"
          align="center"
        >
          <template #default="{ row }: any">
            <span
              class="cursor-pointer font-bold text-[hsl(var(--primary))]"
              @click="
                router.push({
                  name: 'DictData',
                  params: { dictId: row.dictId },
                })
              "
            >
              {{ row.dictType }}
            </span>
          </template>
        </el-table-column>
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
          v-if="columnVisible.get('remark')"
          label="备注"
          prop="remark"
          align="center"
        />
        <el-table-column
          v-if="columnVisible.get('createTime')"
          label="创建时间"
          align="center"
          prop="createTime"
        />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button
                v-if="
                  hasAccessByCodes(['system:dict:edit']) ||
                  hasAccessByRoles(['admin'])
                "
                link
                type="primary"
                :icon="Edit"
                @click="onUpdate(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                v-if="
                  hasAccessByCodes(['system:dict:remove']) ||
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
