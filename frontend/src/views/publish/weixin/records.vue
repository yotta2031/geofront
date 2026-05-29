<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">
        <span>发布记录</span>
        <div class="filters">
          <el-select v-model="platform" placeholder="平台" clearable style="width: 120px" @change="fetchList">
            <el-option v-for="p in platforms" :key="p" :label="p" :value="p" />
          </el-select>
          <el-select v-model="status" placeholder="状态" clearable style="width: 120px" @change="fetchList">
            <el-option label="待处理" value="pending" />
            <el-option label="已发布" value="published" />
            <el-option label="失败" value="failed" />
          </el-select>
        </div>
      </div>
    </template>
    <el-table :data="list" v-loading="loading">
      <el-table-column prop="title" label="文章标题" min-width="160" />
      <el-table-column prop="accountName" label="账号" width="140" />
      <el-table-column label="平台" width="100">
        <template #default="{ row }">
          <el-tag :type="platformTag(row.platform)" size="small">{{ row.platform }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="链接" width="100">
        <template #default="{ row }">
          <el-link v-if="row.publishUrl" :href="row.publishUrl" target="_blank" type="primary">查看</el-link>
          <span v-else>—</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="mt-4"
      v-model:current-page="page"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="fetchList"
    />
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PLATFORM_TAG_TYPE, WEIXIN_PLATFORMS } from '@/constants/weixin'
import { getWeixinRecords } from '@/api/weixin'

const loading = ref(false)
const list = ref<any[]>([])
const page = ref(1)
const total = ref(0)
const status = ref('')
const platform = ref('')
const platforms = [...WEIXIN_PLATFORMS]

function platformTag(p: string) {
  return PLATFORM_TAG_TYPE[p] || 'info'
}

function statusType(s: string) {
  const m: Record<string, string> = { pending: 'warning', published: 'success', failed: 'danger' }
  return m[s] || 'info'
}

function statusText(s: string) {
  const m: Record<string, string> = { pending: '待处理', published: '已发布', failed: '失败' }
  return m[s] || s
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getWeixinRecords({
      page: page.value,
      pageSize: 20,
      status: status.value || undefined,
      platform: platform.value || undefined,
    })
    if (res.code === 1) {
      list.value = res.data?.list || []
      total.value = res.data?.total || 0
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchList)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.filters {
  display: flex;
  gap: 8px;
}
.mt-4 {
  margin-top: 16px;
}
</style>
