<script setup lang="ts">
import type { Ref } from 'vue';

import type { ToolConfig } from './type';

import { computed, ref, watch } from 'vue';

import { useAccess } from '@vben/access';

import Delete from '~icons/ep/delete';
import Download from '~icons/ep/download';
import Edit from '~icons/ep/edit';
import Filter from '~icons/ep/filter';
import Plus from '~icons/ep/plus';
import Refresh from '~icons/ep/refresh';
import Search from '~icons/ep/search';
import Upload from '~icons/ep/upload';

defineOptions({
  name: 'TableToolbar',
});

const props = withDefaults(
  defineProps<{
    createConfig?: ToolConfig;
    deleteConfig?: ToolConfig;
    exportConfig?: ToolConfig;
    filterConfig?: {
      columns: { field: string; label: string; visible: boolean }[];
    };
    importConfig?: ToolConfig;
    refreshConfig?: {
      show: boolean;
    };
    searchConfig?: {
      isVisible: boolean;
      show: boolean;
    };
    updateConfig?: ToolConfig;
  }>(),
  {
    createConfig: () => ({ show: true, disabled: false, accessCodes: [] }),
    deleteConfig: () => ({ show: true, disabled: false, accessCodes: [] }),
    exportConfig: () => ({ show: true, disabled: false, accessCodes: [] }),
    importConfig: () => ({ show: false, disabled: false, accessCodes: [] }),
    updateConfig: () => ({ show: false, disabled: false, accessCodes: [] }),
    searchConfig: () => ({ show: true, isVisible: true }),
    refreshConfig: () => ({ show: true }),
    filterConfig: () => ({ columns: [] }),
  },
);

const emits = defineEmits<{
  (e: 'create', data: any): void;
  (e: 'update', data: any): void;
  (e: 'delete', data: any): void;
  (e: 'import', data: any): void;
  (e: 'export', data: any): void;
  (e: 'searchVisible', visible: boolean): void;
  (e: 'refresh'): void;
  (e: 'filterChange', status: { field: string; status: boolean }): void;
}>();

const { hasAccessByCodes, hasAccessByRoles } = useAccess();

const fieldMap = ref<Map<string, Ref<boolean>>>();
watch(
  () => props.filterConfig.columns,
  (columns) => {
    fieldMap.value = new Map<string, Ref<boolean>>();
    columns.forEach((it) => {
      fieldMap.value!.set(it.field, ref(true));
    });
  },
);

const isIndeterminate = computed(
  () =>
    props.filterConfig.columns.some((it) => it.visible) &&
    props.filterConfig.columns.some((it) => !it.visible),
);

const allChecked = computed(() =>
  props.filterConfig.columns.every((it) => it.visible),
);

function onCreate(data: any) {
  emits('create', data);
}

function onUpdate(data: any) {
  emits('update', data);
}

function onDelete(data: any) {
  emits('delete', data);
}

function onImport(data: any) {
  emits('import', data);
}

function onExport(data: any) {
  emits('export', data);
}

function onSearchVisible() {
  emits('searchVisible', !props.searchConfig?.isVisible);
}

function onRefresh() {
  emits('refresh');
}

function filterChange(field: string, status: boolean) {
  emits('filterChange', { field, status });
}

function toggleFilterCheckAll() {
  if (props.filterConfig.columns.length > 0) {
    const haveUnchecked = props.filterConfig.columns.some((it) => !it.visible);
    props.filterConfig.columns.forEach((it) => {
      emits('filterChange', { field: it.field, status: haveUnchecked });
    });
  }
}

function getVisible(config: ToolConfig) {
  return config.accessCodes.length > 0
    ? (hasAccessByCodes(config.accessCodes) || hasAccessByRoles(['admin'])) &&
        config.show
    : config.show;
}
</script>

<template>
  <div class="flex justify-between">
    <div>
      <el-button
        v-if="getVisible(createConfig)"
        type="primary"
        plain
        :icon="Plus"
        :disabled="createConfig.disabled"
        @click="onCreate"
      >
        新增
      </el-button>
      <el-button
        v-if="getVisible(updateConfig)"
        type="success"
        plain
        :icon="Edit"
        :disabled="updateConfig.disabled"
        @click="onUpdate"
      >
        修改
      </el-button>
      <el-button
        v-if="getVisible(deleteConfig)"
        type="danger"
        plain
        :icon="Delete"
        :disabled="deleteConfig.disabled"
        @click="onDelete"
      >
        删除
      </el-button>
      <el-button
        v-if="getVisible(importConfig)"
        type="info"
        plain
        :icon="Upload"
        :disabled="importConfig.disabled"
        @click="onImport"
      >
        导入
      </el-button>
      <el-button
        v-if="getVisible(exportConfig)"
        type="warning"
        plain
        :icon="Download"
        :disabled="exportConfig.disabled"
        @click="onExport"
      >
        导出
      </el-button>
    </div>
    <div>
      <el-tooltip
        v-if="searchConfig.show"
        class="item"
        effect="dark"
        :content="searchConfig.isVisible ? '隐藏搜索' : '显示搜索'"
        placement="top"
      >
        <el-button circle :icon="Search" @click="onSearchVisible" />
      </el-tooltip>
      <el-tooltip
        v-if="refreshConfig.show"
        class="item"
        effect="dark"
        content="刷新"
        placement="top"
      >
        <el-button circle :icon="Refresh" @click="onRefresh" />
      </el-tooltip>
      <el-tooltip
        class="item"
        effect="dark"
        content="显隐列"
        placement="top"
        v-if="props.filterConfig.columns.length > 0"
      >
        <el-dropdown trigger="click" :hide-on-click="false">
          <el-button circle :icon="Filter" class="ml-[12px]" />
          <template #dropdown>
            <el-dropdown-menu>
              <!-- 全选/反选 按钮 -->
              <el-dropdown-item>
                <el-checkbox
                  :model-value="allChecked"
                  :indeterminate="isIndeterminate"
                  @change="toggleFilterCheckAll"
                >
                  列展示
                </el-checkbox>
              </el-dropdown-item>
              <el-divider class="!m-1 !w-[unset]" />
              <template v-for="item in filterConfig.columns" :key="item.field">
                <el-dropdown-item>
                  <el-checkbox
                    :model-value="item.visible"
                    @change="filterChange(item.field, $event)"
                    :label="item.label"
                  />
                </el-dropdown-item>
              </template>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-tooltip>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item) {
  padding: 0 17px;
  line-height: 30px;
}
</style>
