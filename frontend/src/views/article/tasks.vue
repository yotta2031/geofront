<template>
  <div class="tasks-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">AI 写作任务</h1>
        <p class="page-subtitle">配置批量生成规则，自动产出高质量内容</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="showAddDialog = true">创建任务</el-button>
    </header>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">任务列表</h2>
          <p class="panel-desc">共 {{ total }} 个任务</p>
        </div>
      </div>

      <div class="page-table-wrap">
        <el-table :data="tasks" style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="任务名称" min-width="160" />
          <el-table-column prop="articleTypeId" label="文章类型" width="120">
            <template #default="{ row }">
              <el-tag size="small" effect="light">{{ row.articleTypeId }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="imageCount" label="图片数" width="80" />
          <el-table-column prop="maxCount" label="最大生成" width="100" />
          <el-table-column prop="status" label="状态" width="110">
            <template #default="{ row }">
              <span class="status-pill" :class="`status-${row.status}`">
                <span class="status-dot"></span>
                {{ getStatusText(row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="runTask(row)">执行</el-button>
              <el-button link @click="editTask(row)">编辑</el-button>
              <el-button type="danger" link @click="deleteTask(row.id)">删除</el-button>
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
        @size-change="fetchTasks"
        @current-change="fetchTasks"
      />
    </section>

    <el-dialog v-model="showAddDialog" title="创建 AI 写作任务" width="600px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="任务名称">
          <el-input v-model="form.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="文章类型">
          <el-select v-model="form.articleTypeId" placeholder="请选择文章类型">
            <el-option
              v-for="type in articleTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-select v-model="form.keywordId" placeholder="请选择关键词">
            <el-option
              v-for="kw in keywords"
              :key="kw.id"
              :label="kw.keyword"
              :value="kw.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="图片数量">
          <el-input-number v-model="form.imageCount" :min="0" :max="10" />
        </el-form-item>
        <el-form-item label="间隔时间(秒)">
          <el-input-number v-model="form.intervalTime" :min="0" :step="60" />
        </el-form-item>
        <el-form-item label="最大生成数量">
          <el-input-number v-model="form.maxCount" :min="1" :max="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getAiTasks, createAiTask } from '@/api/article'

const loading = ref(false)
const submitting = ref(false)
const tasks = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showAddDialog = ref(false)
const articleTypes = ref<any[]>([])
const keywords = ref<any[]>([])

const form = reactive({
  name: '',
  articleTypeId: undefined as number | undefined,
  keywordId: undefined as number | undefined,
  imageCount: 0,
  intervalTime: 0,
  maxCount: 10
})

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待执行',
    running: '执行中',
    completed: '已完成',
    failed: '失败',
    paused: '已暂停'
  }
  return map[status] || status
}

function runTask(row: any) {
  ElMessage.info('执行任务: ' + row.name)
}

function editTask(row: any) {
  ElMessage.info('编辑任务: ' + row.id)
}

async function deleteTask(_id: number) {
  try {
    await ElMessageBox.confirm('确定要删除这个任务吗？', '提示', { type: 'warning' })
    ElMessage.success('删除成功')
    fetchTasks()
  } catch {
    // 用户取消
  }
}

async function submitForm() {
  if (!form.name) {
    ElMessage.warning('请输入任务名称')
    return
  }

  submitting.value = true
  try {
    const res = await createAiTask(form)
    if (res.code === 1) {
      ElMessage.success('任务创建成功')
      showAddDialog.value = false
      fetchTasks()
    }
  } finally {
    submitting.value = false
  }
}

async function fetchTasks() {
  loading.value = true
  try {
    const res = await getAiTasks({ page: page.value, pageSize: pageSize.value })
    if (res.code === 1) {
      tasks.value = res.data?.list || []
      total.value = res.data?.total || 0
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
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
  color: var(--app-text-3);
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

.status-paused {
  background: rgba(124, 58, 237, 0.08);
  color: var(--el-color-primary);
}
.status-paused .status-dot {
  background: var(--el-color-primary);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
