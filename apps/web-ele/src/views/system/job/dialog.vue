<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

import type { Dict } from '#/api/ruoyi/type';

import { ref, useTemplateRef } from 'vue';

import { cloneDeep } from 'lodash-es';
import IconQuestion from '~icons/ep/question-filled';

withDefaults(
  defineProps<{
    jobGroupOptions: Dict[];
    statusOptions: Dict[];
    submitting?: boolean;
  }>(),
  {
    submitting: false,
  },
);

const emits = defineEmits<{
  (e: 'create', data: any): void;
  (e: 'edit', data: any): void;
}>();

enum FormType {
  CREATE,
  EDIT,
}

interface FormData {
  jobId: number;
  jobName: string;
  jobGroup: string;
  invokeTarget: string;
  cronExpression: string;
  status: string;
  misfirePolicy: string;
  concurrent: string;
}

const visible = ref(false);

const formType = ref<FormType>(FormType.CREATE);
const formRef = useTemplateRef<FormInstance>('formRef');
const formData = ref<Partial<FormData>>({
  status: '0',
  misfirePolicy: '1',
  concurrent: '1',
});

const formRules: FormRules = {
  jobName: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
  invokeTarget: [
    { required: true, message: '调用目标字符串不能为空', trigger: 'blur' },
  ],
  cronExpression: [
    { required: true, message: 'cron执行表达式不能为空', trigger: 'change' },
  ],
};

function open(data?: FormData) {
  formType.value = data ? FormType.EDIT : FormType.CREATE;
  if (formType.value === FormType.EDIT) {
    formData.value = cloneDeep(data as FormData);
  }
  visible.value = true;
}

function close() {
  formData.value = {
    status: '0',
    misfirePolicy: '1',
    concurrent: '1',
  };
  formRef.value?.resetFields();
  visible.value = false;
}

async function onSubmit() {
  try {
    await formRef.value?.validate();
    const baseData = {
      jobName: formData.value.jobName,
      jobGroup: formData.value.jobGroup,
      invokeTarget: formData.value.invokeTarget,
      cronExpression: formData.value.cronExpression,
      status: formData.value.status,
      misfirePolicy: formData.value.misfirePolicy,
      concurrent: formData.value.concurrent,
    };
    if (formType.value === FormType.CREATE) {
      emits('create', baseData);
    } else {
      emits('edit', { ...baseData, jobId: formData.value.jobId });
    }
  } catch {}
}

defineExpose({ open, close });
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="formType === FormType.CREATE ? '添加任务' : '修改任务'"
    width="700px"
    @closed="close"
  >
    <el-form
      :model="formData"
      :rules="formRules"
      ref="formRef"
      label-width="auto"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="任务名称" prop="jobName">
            <el-input v-model="formData.jobName" placeholder="请输入任务名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="任务分组" prop="jobGroup">
            <el-select v-model="formData.jobGroup" placeholder="请选择任务分组">
              <el-option
                v-for="dict in jobGroupOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item prop="invokeTarget">
            <template #label>
              <span>
                调用方法
                <el-tooltip placement="top">
                  <template #content>
                    <div>
                      Bean调用示例：ryTask.ryParams('ry')
                      <br />Class类调用示例：com.ruoyi.quartz.task.RyTask.ryParams('ry')
                      <br />参数说明：支持字符串，布尔类型，长整型，浮点型，整型
                    </div>
                  </template>
                  <el-icon><IconQuestion /></el-icon>
                </el-tooltip>
              </span>
            </template>
            <el-input
              v-model="formData.invokeTarget"
              placeholder="请输入调用目标字符串"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="cron表达式" prop="cronExpression">
            <el-input
              v-model="formData.cronExpression"
              placeholder="请输入cron执行表达式"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formData.jobId !== undefined">
          <el-form-item label="状态">
            <el-radio-group v-model="formData.status">
              <el-radio
                v-for="dict in statusOptions"
                :key="dict.value"
                :value="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item label="执行策略" prop="misfirePolicy">
            <el-radio-group v-model="formData.misfirePolicy">
              <el-radio-button value="1">立即执行</el-radio-button>
              <el-radio-button value="2">执行一次</el-radio-button>
              <el-radio-button value="3">放弃执行</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="是否并发" prop="concurrent">
            <el-radio-group v-model="formData.concurrent">
              <el-radio-button value="0">允许</el-radio-button>
              <el-radio-button value="1">禁止</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="ml-auto w-fit">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onSubmit" :loading="submitting">
        {{ formType === FormType.EDIT ? '保存' : '添加' }}
      </el-button>
    </div>
  </el-dialog>
</template>
