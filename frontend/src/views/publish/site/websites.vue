<template>
  <el-card shadow="hover" v-loading="loading">
    <template #header>
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button :icon="Refresh" @click="fetchList">刷新</el-button>
          <el-button type="danger" plain :disabled="!selectedIds.length" @click="batchDelete">
            删除
          </el-button>
          <el-button type="primary" @click="openAdd">添加站点</el-button>
        </div>
        <span class="hint">绑定企业官网，通过 API 将 AI 文章自动发布至站点并优化 SEO</span>
      </div>
    </template>

    <el-table :data="list" @selection-change="onSelect">
      <el-table-column type="selection" width="48" />
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="siteName" label="站点名称" min-width="140" />
      <el-table-column prop="siteUrl" label="官网地址" min-width="200" show-overflow-tooltip />
      <el-table-column label="CMS" width="110">
        <template #default="{ row }">
          <el-tag :type="cmsTag(row.cmsType)" size="small">{{ row.cmsType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="连接状态" width="100">
        <template #default="{ row }">
          <el-tag :type="connectType(row.connectStatus)" size="small">
            {{ connectLabel(row.connectStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="SEO评分" width="100">
        <template #default="{ row }">
          <el-progress
            :percentage="row.seoScore ?? 0"
            :stroke-width="8"
            :color="seoColor(row.seoScore)"
            style="width: 72px"
          />
        </template>
      </el-table-column>
      <el-table-column label="发布状态" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.publishEnabled"
            @change="(v: boolean) => onTogglePublish(row.id, v)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="testConn(row.id)">测试连接</el-button>
          <el-button type="primary" link @click="editRow(row)">编辑</el-button>
          <el-button type="danger" link @click="removeOne(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="mt-4"
      v-model:current-page="page"
      v-model:page-size="pageSize"
      :total="total"
      layout="total, sizes, prev, pager, next"
      @change="fetchList"
    />
  </el-card>

  <SiteEditDialog
    v-model="showDialog"
    :mode="dialogMode"
    :loading="saving"
    :cms-types="cmsTypes"
    :initial="dialogInitial"
    @submit="onDialogSubmit"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import SiteEditDialog, { type SiteForm } from '@/components/site/SiteEditDialog.vue'
import { CMS_TAG_TYPE, CONNECT_STATUS_MAP, SITE_CMS_TYPES } from '@/constants/site'
import {
  getSiteWebsites,
  createSiteWebsite,
  updateSiteWebsite,
  toggleSitePublish,
  testSiteConnection,
  deleteSiteWebsites,
} from '@/api/site'

const loading = ref(false)
const saving = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const cmsTypes = ref<string[]>([...SITE_CMS_TYPES])
const selectedIds = ref<number[]>([])
const showDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('edit')
const editId = ref<number | null>(null)
const dialogInitial = ref<Partial<SiteForm>>({})

function cmsTag(t: string) {
  return CMS_TAG_TYPE[t] || 'info'
}

function connectLabel(s: string) {
  return CONNECT_STATUS_MAP[s]?.label || s || '—'
}

function connectType(s: string) {
  return CONNECT_STATUS_MAP[s]?.type || 'info'
}

function seoColor(score: number) {
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#e6a23c'
  return '#f56c6c'
}

function onSelect(rows: any[]) {
  selectedIds.value = rows.map((r) => r.id)
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getSiteWebsites({ page: page.value, pageSize: pageSize.value })
    if (res.code === 1) {
      list.value = res.data?.list || []
      total.value = res.data?.total || 0
      if (res.data?.cmsTypes?.length) cmsTypes.value = res.data.cmsTypes
    }
  } finally {
    loading.value = false
  }
}

function rowToForm(row: any): Partial<SiteForm> {
  return {
    siteName: row.siteName ?? '',
    siteUrl: row.siteUrl ?? '',
    cmsType: row.cmsType ?? 'WordPress',
    apiEndpoint: row.apiEndpoint ?? '',
    apiKey: row.apiKey ?? '',
    sitemapUrl: row.sitemapUrl ?? '',
    maxDailyPublish: row.maxDailyPublish ?? 5,
    remark: row.remark ?? '',
  }
}

function openAdd() {
  editId.value = null
  dialogMode.value = 'add'
  dialogInitial.value = {
    siteName: '',
    siteUrl: '',
    cmsType: 'WordPress',
    apiEndpoint: '',
    apiKey: '',
    sitemapUrl: '',
    maxDailyPublish: '5',
    remark: '',
  }
  showDialog.value = true
}

function editRow(row: any) {
  editId.value = row.id
  dialogMode.value = 'edit'
  dialogInitial.value = rowToForm(row)
  showDialog.value = true
}

async function onDialogSubmit(form: SiteForm) {
  if (!form.siteName.trim() || !form.siteUrl.trim()) {
    ElMessage.warning('请填写站点名称和官网地址')
    return
  }
  const maxDaily = Number(form.maxDailyPublish)
  if (!maxDaily || maxDaily < 1) {
    ElMessage.warning('请填写有效的每日发布最大量')
    return
  }

  saving.value = true
  try {
    const payload = {
      siteName: form.siteName.trim(),
      siteUrl: form.siteUrl.trim(),
      cmsType: form.cmsType,
      apiEndpoint: form.apiEndpoint?.trim() || undefined,
      apiKey: form.apiKey?.trim() || undefined,
      sitemapUrl: form.sitemapUrl?.trim() || undefined,
      maxDailyPublish: maxDaily,
      remark: form.remark?.trim() || undefined,
    }
    const res = editId.value
      ? await updateSiteWebsite(editId.value, payload)
      : await createSiteWebsite(payload)
    if (res.code === 1) {
      ElMessage.success(editId.value ? '更新成功' : '添加成功')
      showDialog.value = false
      fetchList()
    }
  } finally {
    saving.value = false
  }
}

async function onTogglePublish(id: number, enabled: boolean) {
  await toggleSitePublish(id, enabled)
}

async function testConn(id: number) {
  const res = await testSiteConnection(id)
  if (res.code === 1) {
    ElMessage.success(res.msg || '连接成功')
    fetchList()
  } else {
    ElMessage.warning(res.msg || '连接失败')
  }
}

async function removeOne(id: number) {
  await ElMessageBox.confirm('确定删除该站点？', '提示', { type: 'warning' })
  const res = await deleteSiteWebsites([id])
  if (res.code === 1) {
    ElMessage.success('已删除')
    fetchList()
  }
}

async function batchDelete() {
  await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 个站点？`, '提示', {
    type: 'warning',
  })
  const res = await deleteSiteWebsites(selectedIds.value)
  if (res.code === 1) {
    ElMessage.success('已删除')
    selectedIds.value = []
    fetchList()
  }
}

onMounted(fetchList)
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hint {
  font-size: 13px;
  color: #909399;
}

.mt-4 {
  margin-top: 16px;
}
</style>
