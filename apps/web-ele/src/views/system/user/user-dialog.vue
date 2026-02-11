<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

import type { Dict } from '#/api/ruoyi/type';

import { ref, useTemplateRef } from 'vue';

withDefaults(
  defineProps<{
    departmentTree?: any[];
    genderOptions?: Dict[];
    positionOptions?: any[];
    roleOptions?: any[];
    statusOptions?: Dict[];
    submitting?: boolean;
  }>(),
  {
    departmentTree: () => [],
    genderOptions: () => [],
    positionOptions: () => [],
    roleOptions: () => [],
    statusOptions: () => [],
    submitting: false,
  },
);

const emits = defineEmits<{
  (e: 'create', data: any): void;
  (e: 'edit', data: any): void;
}>();

enum FormType {
  // eslint-disable-next-line no-unused-vars
  CREATE,
  // eslint-disable-next-line no-unused-vars
  EDIT,
}

interface FormData {
  userName: string;
  nickName: string;
  password: string;
  email: string;
  phonenumber: string;
  remark: string;
  deptId: number;
  roleIds: number[];
  userId: number;
  sex: string;
  status: string;
  postIds: number[];
}

const visible = ref(false);

const formType = ref<FormType>(FormType.CREATE);
const formRef = useTemplateRef<FormInstance>('formRef');
const formData = ref<Partial<FormData>>({
  status: '0',
});

const formRules: FormRules = {
  userName: [
    { required: true, message: '用户名称不能为空', trigger: 'blur' },
    {
      min: 2,
      max: 20,
      message: '用户名称长度2-20字符之间',
      trigger: 'blur',
    },
  ],
  nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
  password: [
    { required: true, message: '用户密码不能为空', trigger: 'blur' },
    {
      min: 5,
      max: 20,
      message: '用户密码长度2-20字符之间',
      trigger: 'blur',
    },
    {
      pattern: /^[^<>"'|\\]+$/,
      message: String.raw`不能包含非法字符：< > " ' |`,
      trigger: 'blur',
    },
  ],
  email: [
    {
      type: 'email',
      message: '请输入正确的邮箱地址',
      trigger: ['blur', 'change'],
    },
  ],
  phonenumber: [
    {
      pattern: /^1[3-9|]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur',
    },
  ],
};

function open(data?: FormData) {
  formType.value = data ? FormType.EDIT : FormType.CREATE;
  if (formType.value === FormType.EDIT) {
    formData.value = data!;
  }
  visible.value = true;
}

function close() {
  formData.value = {
    status: '0',
  };
  formRef.value?.resetFields();
  visible.value = false;
}

async function onSubmit() {
  try {
    await formRef.value!.validate();
    if (formType.value === FormType.CREATE) {
      emits('create', formData.value);
    } else {
      emits('edit', formData.value);
    }
  } catch {}
}

defineExpose({ open, close });
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="formType === FormType.CREATE ? '添加用户' : '修改用户'"
    width="560px"
    :close-on-click-modal="false"
    class="task-dialog"
    @closed="close"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
      label-position="right"
    />

    <template #footer>
      <el-form
        :model="formData"
        :rules="formRules"
        ref="formRef"
        label-width="auto"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input
                v-model="formData.nickName"
                placeholder="请输入用户昵称"
                maxlength="30"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属部门" prop="deptId">
              <el-tree-select
                v-model="formData.deptId"
                :data="departmentTree"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                value-key="id"
                placeholder="请选择归属部门"
                clearable
                check-strictly
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input
                v-model="formData.phonenumber"
                placeholder="请输入手机号码"
                maxlength="11"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="formData.email"
                placeholder="请输入邮箱"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              v-if="formData.userId === undefined"
              label="用户名称"
              prop="userName"
            >
              <el-input
                v-model="formData.userName"
                placeholder="请输入用户名称"
                maxlength="30"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="formData.userId === undefined"
              label="用户密码"
              prop="password"
            >
              <el-input
                v-model="formData.password"
                placeholder="请输入用户密码"
                type="password"
                maxlength="20"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户性别">
              <el-select v-model="formData.sex" placeholder="请选择">
                <el-option
                  v-for="dict in genderOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
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
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="岗位">
              <el-select
                v-model="formData.postIds"
                multiple
                placeholder="请选择"
              >
                <el-option
                  v-for="item in positionOptions"
                  :key="item.postId"
                  :label="item.postName"
                  :value="item.postId"
                  :disabled="item.status === 1"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select
                v-model="formData.roleIds"
                multiple
                placeholder="请选择"
              >
                <el-option
                  v-for="item in roleOptions"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId"
                  :disabled="item.status === 1"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="formData.remark"
                type="textarea"
                placeholder="请输入内容"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit" :loading="submitting">
          {{ formType === FormType.EDIT ? '保存' : '添加' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
