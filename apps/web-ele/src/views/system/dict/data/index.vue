<script setup lang="ts">
import type { ElForm } from 'element-plus';

import { computed, onMounted, reactive, ref, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { ElMessage, ElMessageBox } from 'element-plus';
import Close from '~icons/ep/close';
import Delete from '~icons/ep/delete';
import Edit from '~icons/ep/edit';
import Refresh from '~icons/ep/refresh';
import Search from '~icons/ep/search';

import { getDict } from '#/api/ruoyi';
import {
  addDictDataApi,
  deleteDictDataApi,
  getDictDataListApi,
  getDictOptionSelectListApi,
  updateDictDataApi,
} from '#/api/system/dict';
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
      { label: '字典编码', field: 'dictCode', visible: true },
      { label: '字典标签', field: 'dictLabel', visible: true },
      { label: '字典键值', field: 'dictValue', visible: true },
      { label: '字典排序', field: 'dictSort', visible: true },
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
  dictType: undefined,
  dictLabel: undefined,
  status: undefined,
});
const options = reactive<{ statusOptions: any[]; typeOptions: any[] }>({
  statusOptions: [],
  typeOptions: [],
});

function onReset() {
  searchData.dictType = undefined;
  searchData.dictLabel = undefined;
  searchData.status = undefined;
  searchFormRef.value?.resetFields();
  onQuery();
}

function onCreate() {
  dialogRef.value?.open({ dictType: searchData.dictType });
}

async function onCreateConfirm(data: any) {
  await addDictDataApi(data);
  await onQuery();
  dialogRef.value?.close();
  ElMessage.success('字典数据添加成功');
}

async function onUpdate(data: any) {
  dialogRef.value?.open(data);
}

async function onUpdateConfirm(data: any) {
  await updateDictDataApi(data);
  await onQuery();
  dialogRef.value?.close();
  ElMessage.success('字典数据修改成功');
}

async function onDelete(data: any[]) {
  const names = data.map((it: any) => `[${it.dictLabel}]`).join('，');
  ElMessageBox.confirm(`是否确认删除字典数据"${names}"？`, '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const ids = data.map((it: any) => it.dictCode);
      await deleteDictDataApi(ids);
      await onQuery();
      ElMessage.success('字典数据删除成功');
    })
    .catch();
}

function onSearchVisible(visible: boolean) {
  toolbarConfig.search.isVisible = visible;
}

async function onQuery() {
  const res = await getDictDataListApi({
    dictType: searchData.dictType,
    dictLabel: searchData.dictLabel,
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

function onClose() {
  router.replace({ name: 'DictList' });
}

onMounted(async () => {
  options.statusOptions = await getDict('sys_normal_disable');
  options.typeOptions = await getDictOptionSelectListApi();
  const dictId = Number.parseInt(route.params.dictId as string);
  searchData.dictType = options.typeOptions.find(
    (it: any) => it.dictId === dictId,
  )?.dictType;
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
        <el-form-item label="字典名称" prop="dictType">
          <el-select v-model="searchData.dictType" style="width: 240px">
            <el-option
              v-for="item in options.typeOptions"
              :key="item.dictId"
              :label="item.dictName"
              :value="item.dictType"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input
            v-model="searchData.dictLabel"
            placeholder="请输入字典标签"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="searchData.status"
            placeholder="数据状态"
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
          v-if="columnVisible.get('dictCode')"
          label="字典编码"
          prop="dictCode"
          align="center"
        />
        <el-table-column
          v-if="columnVisible.get('dictLabel')"
          label="字典标签"
          prop="dictLabel"
          align="center"
        />
        <el-table-column
          v-if="columnVisible.get('dictValue')"
          label="字典键值"
          prop="dictValue"
          align="center"
        />
        <el-table-column
          v-if="columnVisible.get('dictSort')"
          label="字典排序"
          prop="dictSort"
          align="center"
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
          v-if="columnVisible.get('remark')"
          label="备注"
          prop="remark"
          align="center"
        />
        <el-table-column
          v-if="columnVisible.get('createTime')"
          label="创建时间"
          prop="createTime"
          align="center"
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
      :status-options="options.statusOptions"
      @create="onCreateConfirm"
      @edit="onUpdateConfirm"
    />
  </Page>
</template>
