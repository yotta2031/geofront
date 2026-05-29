<template>
  <el-dialog
    v-model="visible"
    :show-close="false"
    width="560px"
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
      <el-form-item label="站点名称" required>
        <el-input v-model="form.siteName" placeholder="灵雯GEO官网" clearable />
      </el-form-item>
      <el-form-item label="官网地址" required>
        <el-input v-model="form.siteUrl" placeholder="https://www.example.com" clearable />
      </el-form-item>
      <el-form-item label="CMS类型" required>
        <el-select v-model="form.cmsType" placeholder="选择 CMS" style="width: 100%">
          <el-option v-for="c in cmsTypes" :key="c" :label="c" :value="c" />
        </el-select>
      </el-form-item>
      <el-form-item label="API接口地址">
        <el-input
          v-model="form.apiEndpoint"
          placeholder="https://www.example.com/api/publish"
          clearable
        />
      </el-form-item>
      <el-form-item label="API密钥">
        <el-input
          v-model="form.apiKey"
          type="password"
          show-password
          placeholder="CMS 发布接口密钥"
          clearable
        />
      </el-form-item>
      <el-form-item label="站点地图">
        <el-input v-model="form.sitemapUrl" placeholder="https://www.example.com/sitemap.xml" clearable />
      </el-form-item>
      <el-form-item label="每日发布最大量" required>
        <el-input
          v-model="form.maxDailyPublish"
          placeholder="5"
          inputmode="numeric"
          @input="onDailyInput"
        />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="4"
          placeholder="备注,最多500字符"
          maxlength="500"
          show-word-limit
          resize="vertical"
        />
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
import { SITE_CMS_TYPES } from '@/constants/site'

export interface SiteForm {
  siteName: string
  siteUrl: string
  cmsType: string
  apiEndpoint: string
  apiKey: string
  sitemapUrl: string
  maxDailyPublish: string
  remark: string
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mode?: 'add' | 'edit'
    loading?: boolean
    cmsTypes?: string[]
    initial?: Partial<SiteForm>
  }>(),
  {
    mode: 'edit',
    loading: false,
    cmsTypes: () => [...SITE_CMS_TYPES],
    initial: () => ({}),
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: SiteForm]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const title = computed(() => (props.mode === 'add' ? '添加站点' : '编辑'))
const cmsTypes = computed(() => props.cmsTypes)

const form = reactive<SiteForm>({
  siteName: '',
  siteUrl: '',
  cmsType: 'WordPress',
  apiEndpoint: '',
  apiKey: '',
  sitemapUrl: '',
  maxDailyPublish: '5',
  remark: '',
})

const snapshot = ref<SiteForm | null>(null)

function applyInitial(src?: Partial<SiteForm>) {
  form.siteName = src?.siteName ?? ''
  form.siteUrl = src?.siteUrl ?? ''
  form.cmsType = src?.cmsType ?? 'WordPress'
  form.apiEndpoint = src?.apiEndpoint ?? ''
  form.apiKey = src?.apiKey ?? ''
  form.sitemapUrl = src?.sitemapUrl ?? ''
  form.maxDailyPublish =
    src?.maxDailyPublish !== undefined && src?.maxDailyPublish !== null
      ? String(src.maxDailyPublish)
      : '5'
  form.remark = src?.remark ?? ''
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

.auth-form :deep(.el-form-item__label) {
  color: #333;
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

.btn-reset {
  min-width: 88px;
  background: #e8e8e8;
  border: none;
  color: #333;
}
</style>
