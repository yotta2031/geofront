<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">
        <span>官网 SEO 发布记录</span>
        <div class="filters">
          <el-select
            v-model="siteId"
            placeholder="站点"
            clearable
            style="width: 160px"
            @change="fetchList"
          >
            <el-option
              v-for="s in siteOptions"
              :key="s.id"
              :label="s.siteName"
              :value="s.id"
            />
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
      <el-table-column prop="siteName" label="站点" width="140" />
      <el-table-column prop="siteUrl" label="官网" min-width="180" show-overflow-tooltip />
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
import { getSiteWebsites, getSiteRecords } from '@/api/site'

const loading = ref(false)
const list = ref<any[]>([])
const siteOptions = ref<any[]>([])
const page = ref(1)
const total = ref(0)
const status = ref('')
const siteId = ref<number | undefined>()

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
    const res = await getSiteRecords({
      page: page.value,
      pageSize: 20,
      status: status.value || undefined,
      siteId: siteId.value,
    })
    if (res.code === 1) {
      list.value = res.data?.list || []
      total.value = res.data?.total || 0
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const res = await getSiteWebsites({ page: 1, pageSize: 100 })
  if (res.code === 1) siteOptions.value = res.data?.list || []
  fetchList()
})
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
