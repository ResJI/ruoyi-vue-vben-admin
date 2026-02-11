<script setup lang="ts">
import type { ElTree } from 'element-plus';

import { ref, useTemplateRef, watch } from 'vue';

import Search from '~icons/ep/search';

defineOptions({
  name: 'UserLeft',
});

defineProps<{
  departmentTree: any[];
}>();

const emits = defineEmits<{
  (e: 'nodeClick', data: any): void;
}>();

const treeRef = useTemplateRef<typeof ElTree>('treeRef');
const deptName = ref('');

watch(deptName, (value) => {
  // eslint-disable-next-line unicorn/no-array-callback-reference
  treeRef.value!.filter(value);
});

function nodeFilter(value: any, data: any) {
  if (!value) return true;
  return data.label.includes(value);
}

function onNodeClick(data: any) {
  emits('nodeClick', data);
}

function reset() {
  deptName.value = '';
  treeRef.value!.setCurrentKey(null);
}

defineExpose({ reset });
</script>

<template>
  <div>
    <el-input
      v-model="deptName"
      placeholder="请输入部门名称"
      clearable
      :prefix-icon="Search"
      style="margin-bottom: 20px"
    />
    <el-tree
      ref="treeRef"
      :data="departmentTree"
      :props="{ label: 'label', children: 'children' }"
      :expand-on-click-node="false"
      :filter-node-method="nodeFilter"
      node-key="id"
      highlight-current
      default-expand-all
      @node-click="onNodeClick"
    />
  </div>
</template>
