<template>
  <div class="reports-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">诊断报告</h1>
        <p class="page-subtitle">查看历史诊断记录与可见度评分</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="$router.push('/diagnosis')">
        新建诊断
      </el-button>
    </header>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">报告列表</h2>
          <p class="panel-desc">共 {{ total }} 条记录</p>
        </div>
      </div>

      <div class="page-table-wrap">
        <el-table :data="reports" style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="brand" label="品牌" min-width="120" />
          <el-table-column prop="platforms" label="诊断平台" min-width="180">
            <template #default="{ row }">
              <el-tag v-for="p in row.platforms" :key="p" size="small" effect="light" class="mr-1">
                {{ p }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="可见度评分" width="160">
            <template #default="{ row }">
              <div class="score-cell">
                <div class="score-value">{{ row.score }}</div>
                <div class="score-bar">
                  <div class="score-bar-fill" :style="{ width: row.score + '%' }"></div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="110">
            <template #default="{ row }">
              <span class="status-pill" :class="`status-${row.status}`">
                <span class="status-dot"></span>
                {{ getStatusText(row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="viewDetail(row)">查看</el-button>
              <el-button type="danger" link @click="deleteReport(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

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
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getDiagnosisList } from '@/api/diagnosis'

const loading = ref(false)
const reports = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

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
  ElMessage.info('查看报告详情: ' + row.id)
}

async function deleteReport(_id: string) {
  try {
    await ElMessageBox.confirm('确定要删除这条诊断报告吗？', '提示', { type: 'warning' })
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
.score-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.score-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text-1);
  font-feature-settings: 'tnum';
  min-width: 28px;
}

.score-bar {
  flex: 1;
  height: 6px;
  background: #f3f3f7;
  border-radius: 999px;
  overflow: hidden;
  min-width: 80px;
}

.score-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a375f2);
  border-radius: 999px;
  transition: width 0.4s ease;
}

.mr-1 {
  margin-right: 4px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  font-size: 12px;
  border-radius: 999px;
  font-weight: 500;
  background: #f3f3f7;
  color: var(--app-text-3);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--app-text-faint);
}

.status-pending {
  background: #f3f3f7;
}

.status-running {
  background: rgba(245, 158, 11, 0.1);
  color: #b45309;
}
.status-running .status-dot {
  background: var(--app-warning);
  animation: pulse 1.6s ease-in-out infinite;
}

.status-completed {
  background: rgba(16, 185, 129, 0.1);
  color: #047857;
}
.status-completed .status-dot {
  background: var(--app-success);
}

.status-failed {
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;
}
.status-failed .status-dot {
  background: var(--app-danger);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
