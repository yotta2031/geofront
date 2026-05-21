<template>
  <div class="diagnosis-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>AI可见度诊断</span>
        </div>
      </template>

      <el-form :model="form" label-width="120px" class="diagnosis-form">
        <el-form-item label="选择AI平台">
          <el-checkbox-group v-model="form.platforms">
            <el-checkbox label="deepseek">DeepSeek</el-checkbox>
            <el-checkbox label="doubao">豆包</el-checkbox>
            <el-checkbox label="yuanbao">元宝</el-checkbox>
            <el-checkbox label="tongyi">通义</el-checkbox>
            <el-checkbox label="wenxin">文心</el-checkbox>
            <el-checkbox label="nano">纳米</el-checkbox>
            <el-checkbox label="zhipu">智普</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="品牌名称">
          <el-input
            v-model="form.brand"
            placeholder="请输入品牌名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="行业关键词">
          <el-input
            v-model="form.keywords"
            placeholder="最多3个关键词，用逗号分隔"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="优化建议">
          <el-switch
            v-model="form.needOptimize"
            active-text="需要"
            inactive-text="不需要"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleSubmit"
          >
            开始诊断
          </el-button>
          <el-button size="large" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 诊断报告列表 -->
    <el-card shadow="hover" class="mt-4">
      <template #header>
        <div class="card-header">
          <span>诊断记录</span>
          <el-button type="primary" link @click="$router.push('/diagnosis/reports')">
            查看全部
          </el-button>
        </div>
      </template>
      <el-table :data="reports" style="width: 100%">
        <el-table-column prop="brand" label="品牌" />
        <el-table-column prop="platforms" label="平台">
          <template #default="{ row }">
            <el-tag v-for="p in row.platforms" :key="p" size="small" class="mr-1">
              {{ p }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewReport(row.id)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { createDiagnosis, getDiagnosisList } from '@/api/diagnosis'

const loading = ref(false)
const reports = ref([])

const form = reactive({
  platforms: ['deepseek', 'doubao'],
  brand: '',
  keywords: '',
  needOptimize: true
})

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

async function handleSubmit() {
  if (!form.brand) {
    ElMessage.warning('请输入品牌名称')
    return
  }
  if (form.platforms.length === 0) {
    ElMessage.warning('请至少选择一个AI平台')
    return
  }

  loading.value = true
  try {
    const keywords = form.keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k)
      .slice(0, 3)

    const res = await createDiagnosis({
      brand: form.brand,
      platforms: form.platforms,
      keywords: keywords.length > 0 ? keywords : undefined,
      needOptimize: form.needOptimize
    })

    if (res.code === 1) {
      ElMessage.success('诊断任务已创建')
      resetForm()
      fetchReports()
    }
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.platforms = ['deepseek', 'doubao']
  form.brand = ''
  form.keywords = ''
  form.needOptimize = true
}

function viewReport(id: string) {
  // TODO: 查看报告详情
}

async function fetchReports() {
  try {
    const res = await getDiagnosisList({ page: 1, pageSize: 5 })
    if (res.code === 1) {
      reports.value = res.data?.list || []
    }
  } catch (error) {
    // 错误已在拦截器处理
  }
}

onMounted(() => {
  fetchReports()
})
</script>

<style scoped>
.diagnosis-form {
  max-width: 600px;
  padding: 20px 0;
}

.mt-4 {
  margin-top: 20px;
}

.mr-1 {
  margin-right: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>