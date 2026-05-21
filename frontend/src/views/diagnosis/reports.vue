<template>
  <div class="reports-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>诊断报告列表</span>
        </div>
      </template>
      <el-table :data="reports" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="brand" label="品牌" />
        <el-table-column prop="platforms" label="诊断平台">
          <template #default="{ row }">
            <el-tag v-for="p in row.platforms" :key="p" size="small" class="mr-1">
              {{ p }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="可见度评分" width="120">
          <template #default="{ row }">
            <el-rate
              :model-value="row.score / 20"
              disabled
              show-score
              text-color="#ff9900"
            />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">
              查看
            </el-button>
            <el-button type="danger" link @click="deleteReport(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="mt-4"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchReports"
        @current-change="fetchReports"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDiagnosisList } from '@/api/diagnosis'

const loading = ref(false)
const reports = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

function getStatusType(status: string) {
  const map: Record<string, string> = {
    pending: 'info',
    running: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return map[status] || 'info'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '等待中',
    running: '诊断中',
    completed: '已完成',
    failed: '失败'
  }
  return map[status] || status
}

function viewDetail(row: any) {
  // TODO: 打开报告详情弹窗或跳转
  ElMessage.info('查看报告详情: ' + row.id)
}

async function deleteReport(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除这条诊断报告吗？', '提示', {
      type: 'warning'
    })
    // TODO: 调用删除API
    ElMessage.success('删除成功')
    fetchReports()
  } catch {
    // 用户取消
  }
}

async function fetchReports() {
  loading.value = true
  try {
    const res = await getDiagnosisList({
      page: page.value,
      pageSize: pageSize.value
    })
    if (res.code === 1) {
      reports.value = res.data?.list || []
      total.value = res.data?.total || 0
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReports()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mt-4 {
  margin-top: 20px;
}

.mr-1 {
  margin-right: 4px;
}
</style>