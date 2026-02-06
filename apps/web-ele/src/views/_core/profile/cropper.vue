<script setup lang="ts">
import type {
  CropperCanvas,
  CropperCrosshair,
  CropperGrid,
  CropperHandle,
  CropperImage,
  CropperSelection,
  CropperShade,
} from 'cropperjs';

import { nextTick, ref, useTemplateRef, watch } from 'vue';

import { debounce } from 'lodash-es';

import 'cropperjs';

const props = defineProps<{
  src: string;
}>();

const emits = defineEmits<{
  (e: 'selectionChanged', data: string): void;
}>();

const show = ref(true);
let imgUrl: null | string = null;
const selectionRef = useTemplateRef<CropperSelection>('selectionRef');
const imageRef = useTemplateRef<CropperImage>('imageRef');

const reset = () => {
  show.value = false;
  nextTick(() => {
    show.value = true;
  });
};

async function getSelectionBlob() {
  const canvas = await selectionRef.value!.$toCanvas();
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((d) => {
      resolve(d);
    });
  });
}

function rotate(deg: number) {
  imageRef.value!.$rotate(`${deg}deg`);
  onchange();
}

function zoom(zoom: number) {
  imageRef.value!.$zoom(zoom);
  onchange();
}

const onchange = debounce(async () => {
  const canvas = await selectionRef.value!.$toCanvas();
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((d) => {
      resolve(d);
    });
  });
  if (blob) {
    if (imgUrl) {
      URL.revokeObjectURL(imgUrl);
    }
    imgUrl = URL.createObjectURL(blob);
    emits('selectionChanged', imgUrl);
  }
}, 100);

watch(() => props.src, onchange);

defineExpose({ reset, getSelectionBlob, rotate, zoom });
</script>

<template>
  <cropper-canvas v-if="show" background style="height: 100%" :scale-step="0">
    <cropper-image
      ref="imageRef"
      :src="src"
      rotatable
      scalable
      translatable
      crossorigin="anonymous"
    />
    <cropper-shade hidden />
    <cropper-handle action="select" plain />
    <cropper-selection
      ref="selectionRef"
      initial-coverage="0.95"
      :aspect-ratio="1"
      movable
      resizable
      @change="onchange"
    >
      <cropper-grid role="grid" bordered covered />
      <cropper-crosshair centered />
      <cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)" />
      <cropper-handle action="n-resize" />
      <cropper-handle action="e-resize" />
      <cropper-handle action="s-resize" />
      <cropper-handle action="w-resize" />
      <cropper-handle action="ne-resize" />
      <cropper-handle action="nw-resize" />
      <cropper-handle action="se-resize" />
      <cropper-handle action="sw-resize" />
    </cropper-selection>
  </cropper-canvas>
</template>
