<script setup lang="ts">
import type { Dict } from '#/api/ruoyi/type';

import { computed } from 'vue';

const props = defineProps<{
  dictList: Dict[];
  dictValue: string;
}>();

const currentDict = computed(() =>
  props.dictList.find((it) => it.value === props.dictValue),
);
</script>

<template>
  <el-tag :type="currentDict?.type ?? 'primary'">
    {{ currentDict?.label }}
  </el-tag>
</template>
