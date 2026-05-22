<template>
  <el-card shadow="hover" v-loading="loading">
    <template #header>
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button :icon="Refresh" @click="fetchList">刷新</el-button>
          <el-button type="danger" plain :disabled="!selectedIds.length" @click="batchDelete">
            删除
          </el-button>
          <el-button type="primary" @click="openAdd">添加大V</el-button>
        </div>
        <span class="hint">管理合作大V账号，支持多平台发布与报价记录</span>
      </div>
    </template>

    <el-table :data="list" @selection-change="onSelect">
      <el-table-column type="selection" width="48" />
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="accountName" label="大V名称" min-width="140" />
      <el-table-column label="头像" width="80">
        <template #default="{ row }">
          <el-avatar :size="40" :src="row.avatar" />
        </template>
      </el-table-column>
      <el-table-column label="自媒体" width="110">
        <template #default="{ row }">
          <el-tag :type="platformTag(row.platform)" size="small">{{ row.platform }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="领域" width="90" />
      <el-table-column label="报价(元)" width="100">
        <template #default="{ row }">
          {{ row.quotePrice ?? 0 }}
        </template>
      </el-table-column>
      <el-table-column prop="fansCount" label="粉丝数" width="100" />
      <el-table-column label="合作状态" width="100">
        <template #default="{ row }">
          <el-tag :type="coopType(row.coopStatus)" size="small">{{ coopLabel(row.coopStatus) }}</el-tag>
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
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
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

  <ZimediaAccountEditDialog
    v-model="showDialog"
    :mode="dialogMode"
    :loading="saving"
    :platforms="platforms"
    :initial="dialogInitial"
    @submit="onDialogSubmit"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import ZimediaAccountEditDialog, {
  type ZimediaAccountForm,
} from '@/components/zimedia/ZimediaAccountEditDialog.vue'
import { COOP_STATUS_MAP } from '@/constants/zimedia'
import { PLATFORM_TAG_TYPE, WEIXIN_PLATFORMS } from '@/constants/weixin'
import {
  getZimediaAccounts,
  createZimediaAccount,
  updateZimediaAccount,
  toggleZimediaPublish,
  deleteZimediaAccounts,
} from '@/api/zimedia'

const loading = ref(false)
const saving = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const platforms = ref<string[]>([...WEIXIN_PLATFORMS, 'B站'])
const selectedIds = ref<number[]>([])
const showDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('edit')
const editId = ref<number | null>(null)
const dialogInitial = ref<Partial<ZimediaAccountForm>>({})

function platformTag(p: string) {
  return PLATFORM_TAG_TYPE[p] || 'info'
}

function coopLabel(s: string) {
  return COOP_STATUS_MAP[s]?.label || s || '—'
}

function coopType(s: string) {
  return COOP_STATUS_MAP[s]?.type || 'info'
}

function onSelect(rows: any[]) {
  selectedIds.value = rows.map((r) => r.id)
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getZimediaAccounts({ page: page.value, pageSize: pageSize.value })
    if (res.code === 1) {
      list.value = res.data?.list || []
      total.value = res.data?.total || 0
      if (res.data?.platforms?.length) platforms.value = res.data.platforms
    }
  } finally {
    loading.value = false
  }
}

function rowToForm(row: any): Partial<ZimediaAccountForm> {
  return {
    accountName: row.accountName ?? '',
    category: row.category ?? '其他',
    quotePrice: row.quotePrice ?? 0,
    maxDailyPublish: row.maxDailyPublish ?? 5,
    proxyIpPort: row.proxyIpPort ?? '',
    proxyAuth: row.proxyAuth ?? '',
    remark: row.remark ?? '',
    platform: row.platform ?? '',
  }
}

function openAdd() {
  editId.value = null
  dialogMode.value = 'add'
  dialogInitial.value = {
    accountName: '',
    category: '其他',
    quotePrice: '0',
    maxDailyPublish: '5',
    proxyIpPort: '',
    proxyAuth: '',
    remark: '',
    platform: platforms.value[0] || '',
  }
  showDialog.value = true
}

function editRow(row: any) {
  editId.value = row.id
  dialogMode.value = 'edit'
  dialogInitial.value = rowToForm(row)
  showDialog.value = true
}

async function onDialogSubmit(form: ZimediaAccountForm) {
  if (!form.accountName.trim()) {
    ElMessage.warning('请填写大V名称')
    return
  }
  const maxDaily = Number(form.maxDailyPublish)
  if (!maxDaily || maxDaily < 1) {
    ElMessage.warning('请填写有效的每日发布最大量')
    return
  }
  if (dialogMode.value === 'add' && !form.platform) {
    ElMessage.warning('请选择自媒体平台')
    return
  }

  saving.value = true
  try {
    const payload = {
      accountName: form.accountName.trim(),
      category: form.category || '其他',
      quotePrice: Number(form.quotePrice) || 0,
      maxDailyPublish: maxDaily,
      proxyIpPort: form.proxyIpPort?.trim() || undefined,
      proxyAuth: form.proxyAuth?.trim() || undefined,
      remark: form.remark?.trim() || undefined,
      ...(dialogMode.value === 'add'
        ? { platform: form.platform!, fansCount: 0 }
        : {}),
    }
    const res = editId.value
      ? await updateZimediaAccount(editId.value, payload)
      : await createZimediaAccount(payload as Parameters<typeof createZimediaAccount>[0])
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
  await toggleZimediaPublish(id, enabled)
}

async function removeOne(id: number) {
  await ElMessageBox.confirm('确定删除该大V账号？', '提示', { type: 'warning' })
  const res = await deleteZimediaAccounts([id])
  if (res.code === 1) {
    ElMessage.success('已删除')
    fetchList()
  }
}

async function batchDelete() {
  await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 个大V？`, '提示', {
    type: 'warning',
  })
  const res = await deleteZimediaAccounts(selectedIds.value)
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
