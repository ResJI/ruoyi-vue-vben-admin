<script setup lang="ts">
import type { ElForm } from 'element-plus';

import type { Dict } from '#/api/ruoyi/type';

import { computed, onMounted, reactive, ref, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { ElMessage, ElMessageBox } from 'element-plus';
import Close from '~icons/ep/close';
import Refresh from '~icons/ep/refresh';
import Search from '~icons/ep/search';
import Brush from '~icons/ph/paint-brush-household-light';

import { getDict } from '#/api/ruoyi';
import {
  cleanJobLogApi,
  deleteJobLogApi,
  getJobById,
  getJobLogListApi,
} from '#/api/system/job';
import DictTag from '#/components/dict-tag/index.vue';
import TableToolbar from '#/components/table-toolbar/index.vue';

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
  create: { show: false },
  update: { show: false },
  delete: {
    show: true,
    disabled: computed(() => tableSelections.value.length === 0),
    accessCodes: ['monitor:job:remove'],
  },
  import: { show: false },
  export: { show: false },
  search: { show: true, isVisible: true },
  filter: {
    columns: [
      { label: '日志编号', field: 'jobLogId', visible: true },
      { label: '任务名称', field: 'jobName', visible: true },
      { label: '任务组名', field: 'jobGroup', visible: true },
      { label: '调用目标字符串', field: 'invokeTarget', visible: true },
      { label: '日志信息', field: 'jobMessage', visible: true },
      { label: '执行状态', field: 'status', visible: true },
      { label: '执行时间', field: 'createTime', visible: true },
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
  jobName: undefined,
  jobGroup: undefined,
  status: undefined,
  dateRange: [null, null],
});
const options = reactive<{ jobGroupOptions: Dict[]; statusOptions: Dict[] }>({
  statusOptions: [],
  jobGroupOptions: [],
});

function onReset() {
  searchData.jobName = undefined;
  searchData.jobGroup = undefined;
  searchData.status = undefined;
  searchData.dateRange = [null, null];
  searchFormRef.value?.resetFields();
  onQuery();
}

async function onDelete(data: any[]) {
  const names = data.map((it: any) => `[${it.jobLogId}]`).join('，');
  ElMessageBox.confirm(`是否确认删除日志"${names}"？`, '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const ids = data.map((it: any) => it.dictCode);
      await deleteJobLogApi(ids);
      await onQuery();
      ElMessage.success('日志数据删除成功');
    })
    .catch();
}

async function onClean() {
  ElMessageBox.confirm('确认清空所有调度日志数据项?', '警告', {
    confirmButtonText: '清空',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await cleanJobLogApi();
      await onQuery();
      ElMessage.success('调度日志数据清除成功');
    })
    .catch();
}

function onSearchVisible(visible: boolean) {
  toolbarConfig.search.isVisible = visible;
}

async function onQuery() {
  const res = await getJobLogListApi({
    jobName: searchData.jobName,
    jobGroup: searchData.jobGroup,
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
  data && (data.visible = status);
}

function onSelectChange(selection: any) {
  tableSelections.value = selection;
}

function onClose() {
  router.replace({ name: 'JobList' });
}

onMounted(async () => {
  options.statusOptions = await getDict('sys_normal_disable');
  options.jobGroupOptions = await getDict('sys_job_group');
  if (route.params.jobId) {
    const jobId = Number.parseInt(route.params.jobId as string);
    const info = await getJobById(jobId);
    searchData.jobName = info.jobName;
    searchData.jobGroup = info.jobGroup;
  }
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
        <el-form-item label="任务名称" prop="jobName">
          <el-input
            v-model="searchData.jobName"
            placeholder="请输入任务名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="任务组名" prop="jobGroup">
          <el-select
            v-model="searchData.jobGroup"
            placeholder="请选择任务组名"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="it in options.jobGroupOptions"
              :key="it.id"
              :label="it.label"
              :value="it.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="执行状态" prop="status">
          <el-select
            v-model="searchData.status"
            placeholder="请选择执行状态"
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
        <el-form-item label="执行时间" style="width: 308px">
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
        @delete="onDelete(tableSelections)"
        @refresh="onQuery"
        @search-visible="onSearchVisible"
        @filter-change="onColumnFilterChange"
      >
        <el-button
          v-if="
            hasAccessByCodes(['monitor:job:remove']) ||
            hasAccessByRoles(['admin'])
          "
          type="danger"
          plain
          :icon="Brush"
          @click="onClean"
        >
          清空
        </el-button>
        <el-button type="warning" plain :icon="Close" @click="onClose">
          关闭
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
          v-if="columnVisible.get('jobLogId')"
          label="日志编号"
          prop="jobLogId"
          align="center"
          min-width="100"
        />
        <el-table-column
          v-if="columnVisible.get('jobName')"
          label="任务名称"
          prop="jobName"
          align="center"
          min-width="100"
        />
        <el-table-column
          v-if="columnVisible.get('jobGroup')"
          label="任务组名"
          align="center"
          min-width="100"
        >
          <template #default="{ row }: any">
            <DictTag
              :dict-value="row.jobGroup"
              :dict-list="options.jobGroupOptions"
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnVisible.get('invokeTarget')"
          label="调用目标字符串"
          prop="invokeTarget"
          align="center"
          min-width="180"
        />
        <el-table-column
          v-if="columnVisible.get('jobMessage')"
          label="日志信息"
          prop="jobMessage"
          align="center"
          min-width="100"
        />
        <el-table-column
          v-if="columnVisible.get('status')"
          label="执行状态"
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
          label="执行时间"
          prop="createTime"
          align="center"
          min-width="180"
        />
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
  </Page>
</template>
