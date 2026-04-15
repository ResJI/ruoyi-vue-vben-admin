<script setup lang="ts">
import type { ElForm } from 'element-plus';

import type { Dict } from '#/api/ruoyi/type';

import { computed, onMounted, reactive, ref, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { ElMessage, ElMessageBox } from 'element-plus';
import Delete from '~icons/ep/delete';
import Edit from '~icons/ep/edit';
import Refresh from '~icons/ep/refresh';
import Search from '~icons/ep/search';
import Log from '~icons/mynaui/terminal';
import Play from '~icons/solar/play-linear';

import { getDict } from '#/api/ruoyi';
import {
  addJobApi,
  changeJobStatusApi,
  deleteJobApi,
  getJobListApi,
  runJobApi,
  updateJobApi,
} from '#/api/system/job';
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
  create: { show: true, disabled: false, accessCodes: ['monitor:job:add'] },
  update: {
    show: true,
    disabled: computed(() => tableSelections.value.length !== 1),
    accessCodes: ['monitor:job:edit'],
  },
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
      { label: '任务编号', field: 'jobId', visible: true },
      { label: '任务名称', field: 'jobName', visible: true },
      { label: '任务组名', field: 'jobGroup', visible: true },
      { label: '调用目标字符串', field: 'invokeTarget', visible: true },
      { label: 'cron执行表达式', field: 'cronExpression', visible: true },
      { label: '状态', field: 'status', visible: true },
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
  jobName: undefined,
  jobGroup: undefined,
  status: undefined,
});
const options = reactive<{ jobGroupOptions: Dict[]; statusOptions: any[] }>({
  statusOptions: [],
  jobGroupOptions: [],
});

function onReset() {
  searchData.jobName = undefined;
  searchData.jobGroup = undefined;
  searchData.status = undefined;
  searchFormRef.value?.resetFields();
  onQuery();
}

function onCreate() {
  dialogRef.value?.open();
}

async function onCreateConfirm(data: any) {
  await addJobApi(data);
  await onQuery();
  dialogRef.value?.close();
  ElMessage.success('任务添加成功');
}

async function onUpdate(data: any) {
  dialogRef.value?.open(data);
}

async function onUpdateConfirm(data: any) {
  await updateJobApi(data);
  await onQuery();
  dialogRef.value?.close();
  ElMessage.success('任务修改成功');
}

async function onRun(data: any) {
  ElMessageBox.confirm(`确定执行任务"${data.jobName}"？`, '警告', {
    confirmButtonText: '执行',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await runJobApi({
        jobId: data.jobId,
        jobGroup: data.jobGroup,
      });
      await onQuery();
      ElMessage.success('任务执行成功');
    })
    .catch();
}

async function onDelete(data: any[]) {
  const names = data.map((it: any) => `[${it.jobName}]`).join('，');
  ElMessageBox.confirm(`是否确认删除任务"${names}"？`, '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const ids = data.map((it: any) => it.jobId);
      await deleteJobApi(ids);
      await onQuery();
      ElMessage.success('任务删除成功');
    })
    .catch();
}

async function onLog(jobId?: number) {
  await router.push({
    name: 'JobLog',
    params: { jobId },
  });
}

function onSearchVisible(visible: boolean) {
  toolbarConfig.search.isVisible = visible;
}

async function onQuery() {
  const res = await getJobListApi({
    jobName: searchData.jobName,
    jobGroup: searchData.jobGroup,
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
  data && (data.visible = status);
}

function onSelectChange(selection: any) {
  tableSelections.value = selection;
}

async function onStatusChange(jobId: number, status: '0' | '1') {
  await changeJobStatusApi({
    jobId,
    status,
  });
  await onQuery();
  ElMessage.success('状态修改成功');
}

onMounted(async () => {
  options.statusOptions = await getDict('sys_normal_disable');
  options.jobGroupOptions = await getDict('sys_job_group');

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
          <el-input
            v-model="searchData.jobGroup"
            placeholder="请选择任务组名"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="任务状态" prop="status">
          <el-select
            v-model="searchData.status"
            placeholder="请选择任务状态"
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
      >
        <el-button
          v-if="
            hasAccessByCodes(['monitor:job:query']) ||
            hasAccessByRoles(['admin'])
          "
          type="info"
          plain
          :icon="Log"
          @click="onLog()"
        >
          日志
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
          v-if="columnVisible.get('jobId')"
          label="任务编号"
          prop="jobId"
          align="center"
          min-width="80"
        />
        <el-table-column
          v-if="columnVisible.get('jobName')"
          label="任务名称"
          prop="jobName"
          align="center"
          min-width="80"
        />
        <el-table-column
          v-if="columnVisible.get('jobGroup')"
          label="任务组名"
          align="center"
          min-width="80"
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
          min-width="160"
        />
        <el-table-column
          v-if="columnVisible.get('cronExpression')"
          label="cron执行表达式"
          prop="cronExpression"
          align="center"
          min-width="160"
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
                  scope.row.jobId,
                  scope.row.status === '0' ? '1' : '0',
                )
              "
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button
                v-if="
                  hasAccessByCodes(['monitor:job:edit']) ||
                  hasAccessByRoles(['admin'])
                "
                link
                type="primary"
                :icon="Edit"
                @click="onUpdate(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="执行一次" placement="top">
              <el-button
                v-if="
                  hasAccessByCodes(['monitor:job:changeStatus']) ||
                  hasAccessByRoles(['admin'])
                "
                link
                type="primary"
                :icon="Play"
                @click="onRun(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                v-if="
                  hasAccessByCodes(['monitor:job:remove']) ||
                  hasAccessByRoles(['admin'])
                "
                link
                type="primary"
                :icon="Delete"
                @click="onDelete([scope.row])"
              />
            </el-tooltip>
            <el-tooltip content="调度日志" placement="top">
              <el-button
                v-if="
                  hasAccessByCodes(['monitor:job:query']) ||
                  hasAccessByRoles(['admin'])
                "
                link
                type="primary"
                :icon="Log"
                @click="onLog(scope.row.jobId)"
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
      :job-group-options="options.jobGroupOptions"
      @create="onCreateConfirm"
      @edit="onUpdateConfirm"
    />
  </Page>
</template>
