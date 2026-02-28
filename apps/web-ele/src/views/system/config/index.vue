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
import {
  addConfigApi,
  deleteConfigApi,
  getConfigListApi,
  refreshConfigCacheApi,
  updateConfigApi,
} from '#/api/system/config';
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
  create: { show: true, disabled: false, accessCodes: ['system:config:add'] },
  update: {
    show: true,
    disabled: computed(() => tableSelections.value.length !== 1),
    accessCodes: ['system:config:edit'],
  },
  delete: {
    show: true,
    disabled: computed(() => tableSelections.value.length === 0),
    accessCodes: ['system:config:remove'],
  },
  import: { show: false },
  export: { show: false },
  search: { show: true, isVisible: true },
  filter: {
    columns: [
      { label: '参数主键', field: 'configId', visible: true },
      { label: '参数名称', field: 'configName', visible: true },
      { label: '参数键名', field: 'configKey', visible: true },
      { label: '参数键值', field: 'configValue', visible: true },
      { label: '系统内置', field: 'configType', visible: true },
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
  configName: undefined,
  configKey: undefined,
  configType: undefined,
  dateRange: [null, null],
});
const options = reactive<{ systemBuildInOptions: any[] }>({
  systemBuildInOptions: [],
});

function onReset() {
  searchData.configName = undefined;
  searchData.configKey = undefined;
  searchData.configType = undefined;
  searchFormRef.value!.resetFields();
  onQuery();
}

function onCreate() {
  dialogRef.value?.open();
}

async function onCreateConfirm(data: any) {
  await addConfigApi(data);
  await onQuery();
  dialogRef.value?.close();
  ElMessage.success('参数添加成功');
}

async function onUpdate(data: any) {
  dialogRef.value?.open(data);
}

async function onUpdateConfirm(data: any) {
  await updateConfigApi(data);
  await onQuery();
  dialogRef.value?.close();
  ElMessage.success('参数修改成功');
}

async function onDelete(data: any[]) {
  const names = data.map((it: any) => `[${it.configName}]`).join('，');
  ElMessageBox.confirm(`是否确认删除参数"${names}"？`, '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const ids = data.map((it: any) => it.configId);
      await deleteConfigApi(ids);
      await onQuery();
      ElMessage.success('参数删除成功');
    })
    .catch();
}

function onSearchVisible(visible: boolean) {
  toolbarConfig.search.isVisible = visible;
}

async function onQuery() {
  const res = await getConfigListApi({
    configName: searchData.configName,
    configKey: searchData.configKey,
    configType: searchData.configType,
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
  data!.visible = status;
}

async function onRefreshCache() {
  await refreshConfigCacheApi();
  ElMessage.success('缓存刷新成功');
}

function onSelectChange(selection: any) {
  tableSelections.value = selection;
}

onMounted(async () => {
  options.systemBuildInOptions = await getDict('sys_yes_no');
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
        <el-form-item label="参数名称" prop="configName">
          <el-input
            v-model="searchData.configName"
            placeholder="请输入参数名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input
            v-model="searchData.configKey"
            placeholder="请输入参数键名"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="系统内置" prop="configType">
          <el-select
            v-model="searchData.configType"
            placeholder="系统内置"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in options.systemBuildInOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
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
            hasAccessByCodes(['system:config:remove']) ||
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
          v-if="columnVisible.get('configId')"
          label="参数主键"
          prop="configId"
          align="center"
        />
        <el-table-column
          v-if="columnVisible.get('configName')"
          label="参数名称"
          prop="configName"
          align="center"
        />
        <el-table-column
          v-if="columnVisible.get('configKey')"
          label="参数键名"
          prop="configKey"
          align="center"
        />
        <el-table-column
          v-if="columnVisible.get('configValue')"
          label="参数键值"
          prop="configValue"
          align="center"
        />
        <el-table-column
          v-if="columnVisible.get('configType')"
          label="系统内置"
          align="center"
          width="100"
        >
          <template #default="{ row }: any">
            <DictTag
              :dict-value="row.configType"
              :dict-list="options.systemBuildInOptions"
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
          min-width="180"
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
      :system-build-in-options="options.systemBuildInOptions"
      @create="onCreateConfirm"
      @edit="onUpdateConfirm"
    />
  </Page>
</template>
