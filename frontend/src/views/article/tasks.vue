<template>
  <div class="tasks-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>AI写作任务</span>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>创建任务
          </el-button>
        </div>
      </template>

      <el-table :data="tasks" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="任务名称" />
        <el-table-column prop="articleTypeId" label="文章类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.articleTypeId }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="imageCount" label="图片数" width="80" />
        <el-table-column prop="maxCount" label="最大生成数" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
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
    </el-card>

    <!-- 创建任务弹窗 -->
    <el-dialog v-model="showAddDialog" title="创建AI写作任务" width="600px">
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
const articleTypes = ref([])
const keywords = ref([])

const form = reactive({
  name: '',
  articleTypeId: undefined as number | undefined,
  keywordId: undefined as number | undefined,
  imageCount: 0,
  intervalTime: 0,
  maxCount: 10
})

function getStatusType(status: string) {
  const map: Record<string, string> = {
    pending: 'info',
    running: 'warning',
    completed: 'success',
    failed: 'danger',
    paused: ''
  }
  return map[status] || 'info'
}

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
  // TODO: 调用执行任务API
}

function editTask(row: any) {
  // TODO: 编辑任务
  ElMessage.info('编辑任务: ' + row.id)
}

async function deleteTask(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除这个任务吗？', '提示', { type: 'warning' })
    // TODO: 调用删除API
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
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mt-4 {
  margin-top: 20px;
}
</style>