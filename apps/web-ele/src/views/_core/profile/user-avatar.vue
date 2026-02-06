<script setup lang="ts">
import type { UploadRawFile } from 'element-plus';

import { ref, useTemplateRef } from 'vue';

import { VbenAvatar } from '@vben/common-ui';
import { createIconifyIcon } from '@vben/icons';

import { ElMessage } from 'element-plus';

import Cropper from './cropper.vue';

const props = defineProps<{
  onUploadImage: (data: Blob) => Promise<void>;
  src: string;
}>();

const Plus = createIconifyIcon('ep:plus');
const Minus = createIconifyIcon('ep:minus');
const RefreshLeft = createIconifyIcon('ep:refresh-left');
const RefreshRight = createIconifyIcon('ep:refresh-right');
const Upload = createIconifyIcon('ep:upload');

const hoverShow = ref(false);
const cropperRef = useTemplateRef('cropperRef');
const open = ref(false);
const title = ref('修改头像');
const imgUrl = ref<null | string>(null);
const previewUrl = ref<null | string>(null);

function onSelectionChanged(url: string) {
  previewUrl.value = url;
}

/** 编辑头像 */
function editCropper() {
  open.value = true;
}
/** 打开弹出层结束时的回调 */
function modalOpened() {
  imgUrl.value = props.src;
}
/** 覆盖默认上传行为 */
function requestUpload() {}
/** 向左旋转 */
function rotateLeft() {
  if (cropperRef.value) {
    cropperRef.value.rotate(-90);
  }
}
/** 向右旋转 */
function rotateRight() {
  if (cropperRef.value) {
    cropperRef.value.rotate(90);
  }
}
/** 图片缩放 */
function changeZoom(zoom: number) {
  if (cropperRef.value) {
    cropperRef.value.zoom(zoom);
  }
}
/** 上传预处理 */
function beforeUpload(file: UploadRawFile) {
  if (file.type.includes('image/')) {
    if (imgUrl.value) {
      URL.revokeObjectURL(imgUrl.value);
    }
    imgUrl.value = URL.createObjectURL(file);
  } else {
    ElMessage.error('文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件');
  }
}
/** 上传图片 */
async function uploadImg() {
  const blob = await cropperRef.value!.getSelectionBlob();
  if (blob !== null) {
    await props.onUploadImage(blob);
    closeDialog();
  }
}
/** 关闭窗口 */
function closeDialog() {
  imgUrl.value = null;
  previewUrl.value = null;
  open.value = false;
}
</script>

<template>
  <div
    class="relative"
    @click="editCropper()"
    @mouseover="hoverShow = true"
    @mouseout="hoverShow = false"
  >
    <VbenAvatar :src="src" class="size-20" />
    <div
      v-show="hoverShow"
      class="flex-center absolute left-0 top-0 h-full w-full cursor-pointer rounded-full bg-[rgba(0,0,0,0.5)]"
    >
      <Plus class="text-white" />
    </div>

    <el-dialog
      v-model="open"
      :title="title"
      width="800px"
      append-to-body
      @opened="modalOpened"
      @close="closeDialog"
    >
      <div class="flex h-[350px] w-full select-none">
        <div class="w-1/2">
          <Cropper
            ref="cropperRef"
            v-if="imgUrl"
            :src="imgUrl"
            @selection-changed="onSelectionChanged"
          />
        </div>
        <div class="flex-center w-1/2">
          <img
            v-if="previewUrl"
            :src="previewUrl"
            alt=""
            class="h-[200px] w-[200px] overflow-hidden rounded-[50%] shadow-2xl"
          />
        </div>
      </div>
      <br />
      <el-row>
        <el-col :lg="2" :md="2">
          <el-upload
            action="#"
            :http-request="requestUpload"
            :show-file-list="false"
            :before-upload="beforeUpload"
          >
            <el-button>
              选择
              <el-icon class="el-icon--right">
                <Upload />
              </el-icon>
            </el-button>
          </el-upload>
        </el-col>
        <el-col :lg="{ span: 1, offset: 2 }" :md="2">
          <el-button :icon="Plus" @click="changeZoom(0.1)" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button :icon="Minus" @click="changeZoom(-0.1)" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button :icon="RefreshLeft" @click="rotateLeft()" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button :icon="RefreshRight" @click="rotateRight()" />
        </el-col>
        <el-col :lg="{ span: 2, offset: 6 }" :md="2">
          <el-button type="primary" @click="uploadImg()"> 提 交 </el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.user-info-head {
  position: relative;
}

.user-info-head:hover::after {
  position: absolute;
  inset: 0;
  padding-left: calc(50% - 8px);
  font-size: 24px;
  font-style: normal;
  line-height: 150px;
  color: #eee;
  cursor: pointer;
  content: '+';
  background: rgb(0 0 0 / 50%);
  border-radius: 50%;
}
</style>
