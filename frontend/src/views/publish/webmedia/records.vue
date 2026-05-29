<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">
        <span>投稿记录</span>
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 140px" @change="fetchRecords">
          <el-option label="待处理" value="pending" />
          <el-option label="已发布" value="published" />
          <el-option label="失败" value="failed" />
        </el-select>
      </div>
    </template>
    <el-table :data="records" v-loading="loading">
      <el-table-column prop="title" label="文章标题" min-width="200" />
      <el-table-column prop="mediaName" label="媒体" width="160" />
      <el-table-column prop="mediaPortal" label="门户" width="120" />
      <el-table-column prop="price" label="消耗点数" width="100">
        <template #default="{ row }">¥{{ row.price }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="submittedAt" label="提交时间" width="180" />
      <el-table-column label="发布链接" min-width="120">
        <template #default="{ row }">
          <el-link v-if="row.publishUrl" :href="row.publishUrl" target="_blank" type="primary">查看</el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="mt-4"
      v-model:current-page="page"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="fetchRecords"
    />
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSubmissions } from '@/api/webmedia'

const loading = ref(false)
const records = ref<any[]>([])
const page = ref(1)
const total = ref(0)
const statusFilter = ref('')

function statusType(s: string) {
  const map: Record<string, string> = {
    pending: 'warning',
    published: 'success',
    failed: 'danger',
  }
  return map[s] || 'info'
}

function statusText(s: string) {
  const map: Record<string, string> = {
    pending: '待处理',
    published: '已发布',
    failed: '失败',
  }
  return map[s] || s
}

async function fetchRecords() {
  loading.value = true
  try {
    const res = await getSubmissions({
      page: page.value,
      pageSize: 20,
      status: statusFilter.value || undefined,
    })
    if (res.code === 1) {
      records.value = res.data?.list || []
      total.value = res.data?.total || 0
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchRecords)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mt-4 {
  margin-top: 16px;
}
</style>
