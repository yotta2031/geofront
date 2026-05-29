<template>
  <el-dialog
    v-model="visible"
    :show-close="false"
    width="520px"
    class="account-auth-dialog"
    align-center
    destroy-on-close
    @closed="onClosed"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">{{ title }}</span>
        <div class="window-actions">
          <button type="button" class="win-btn" aria-label="关闭" @click="visible = false">×</button>
        </div>
      </div>
    </template>

    <el-form :model="form" label-width="120px" class="auth-form" @submit.prevent>
      <el-form-item label="账号名" required>
        <el-input v-model="form.accountName" placeholder="森林响起的鸟鸣" clearable />
      </el-form-item>
      <el-form-item label="每日发布最大量" required>
        <el-input
          v-model="form.maxDailyPublish"
          placeholder="5"
          inputmode="numeric"
          @input="onDailyInput"
        />
      </el-form-item>
      <el-form-item label="IP+端口">
        <el-input
          v-model="form.proxyIpPort"
          placeholder="ip+端口, 格式: 232.33.1.1:16817"
          clearable
        />
      </el-form-item>
      <el-form-item label="IP账号+密码">
        <el-input
          v-model="form.proxyAuth"
          placeholder="填写代理ip账号密码,格式: 34123:55332"
          clearable
        />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="5"
          placeholder="备注,最多500字符"
          maxlength="500"
          show-word-limit
          resize="vertical"
        />
      </el-form-item>
      <el-form-item v-if="showPlatform" label="自媒体" required>
        <el-select v-model="form.platform" placeholder="选择平台" style="width: 100%">
          <el-option v-for="p in platforms" :key="p" :label="p" :value="p" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button class="btn-confirm" type="primary" :loading="loading" @click="submit">
          确定
        </el-button>
        <el-button class="btn-reset" @click="reset">重置</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

export interface AccountAuthForm {
  accountName: string
  maxDailyPublish: string
  proxyIpPort: string
  proxyAuth: string
  remark: string
  platform?: string
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mode?: 'add' | 'edit'
    loading?: boolean
    platforms?: string[]
    initial?: Partial<AccountAuthForm>
  }>(),
  {
    mode: 'edit',
    loading: false,
    platforms: () => [],
    initial: () => ({}),
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: AccountAuthForm]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const title = computed(() => (props.mode === 'add' ? '添加' : '编辑'))
const showPlatform = computed(() => props.mode === 'add')

const form = reactive<AccountAuthForm>({
  accountName: '',
  maxDailyPublish: '5',
  proxyIpPort: '',
  proxyAuth: '',
  remark: '',
  platform: '',
})

const snapshot = ref<AccountAuthForm | null>(null)

function applyInitial(src?: Partial<AccountAuthForm>) {
  form.accountName = src?.accountName ?? ''
  form.maxDailyPublish =
    src?.maxDailyPublish !== undefined && src?.maxDailyPublish !== null
      ? String(src.maxDailyPublish)
      : '5'
  form.proxyIpPort = src?.proxyIpPort ?? ''
  form.proxyAuth = src?.proxyAuth ?? ''
  form.remark = src?.remark ?? ''
  form.platform = src?.platform ?? ''
  snapshot.value = { ...form }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) applyInitial(props.initial)
  }
)

watch(
  () => props.initial,
  () => {
    if (props.modelValue) applyInitial(props.initial)
  },
  { deep: true }
)

function onDailyInput(val: string) {
  form.maxDailyPublish = val.replace(/\D/g, '')
}

function reset() {
  if (snapshot.value) {
    Object.assign(form, snapshot.value)
    return
  }
  applyInitial(props.initial)
}

function onClosed() {
  snapshot.value = null
}

function submit() {
  emit('submit', { ...form })
}
</script>

<style scoped>
:deep(.account-auth-dialog) {
  padding: 0;
  border-radius: 4px;
  overflow: hidden;
}

:deep(.account-auth-dialog .el-dialog__header) {
  margin: 0;
  padding: 0;
}

:deep(.account-auth-dialog .el-dialog__body) {
  padding: 24px 28px 8px;
}

:deep(.account-auth-dialog .el-dialog__footer) {
  padding: 12px 28px 24px;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: linear-gradient(90deg, #5b8cff 0%, #7b5cff 45%, #9b6bff 100%);
  color: #fff;
}

.dialog-title {
  font-size: 15px;
  font-weight: 600;
}

.window-actions {
  display: flex;
  gap: 6px;
}

.win-btn {
  width: 28px;
  height: 22px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  border-radius: 2px;
}

.win-btn:hover {
  background: rgba(255, 255, 255, 0.28);
}

.auth-form :deep(.el-form-item__label) {
  color: #333;
  font-weight: 400;
}

.auth-form :deep(.el-input__wrapper),
.auth-form :deep(.el-textarea__inner) {
  border-radius: 2px;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-confirm {
  min-width: 88px;
  background: linear-gradient(135deg, #4b6fff, #7b5cff);
  border: none;
}

.btn-confirm:hover {
  background: linear-gradient(135deg, #3d5fe6, #6a4de6);
}

.btn-reset {
  min-width: 88px;
  background: #e8e8e8;
  border: none;
  color: #333;
}

.btn-reset:hover {
  background: #dcdcdc;
  color: #333;
}
</style>
