<template>
  <div class="site-tasks">
    <el-card shadow="hover" class="mb-4">
      <template #header><span>创建官网 SEO 发布任务</span></template>
      <el-form :model="form" label-width="120px" style="max-width: 640px">
        <el-form-item label="任务名称" required>
          <el-input v-model="form.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="发布方式">
          <el-radio-group v-model="form.publishType">
            <el-radio value="immediate">立即发布</el-radio>
            <el-radio value="scheduled">定时发布</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.publishType === 'scheduled'" label="定时时间">
          <el-date-picker
            v-model="form.scheduledAt"
            type="datetime"
            placeholder="选择时间"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="选择文章" required>
          <el-select v-model="form.articleIds" multiple placeholder="选择文章" style="width: 100%">
            <el-option v-for="a in articles" :key="a.id" :label="a.title" :value="a.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="官网站点" required>
          <el-select
            v-model="form.siteIds"
            multiple
            placeholder="仅显示已开启发布的站点"
            style="width: 100%"
          >
            <el-option
              v-for="s in enabledSites"
              :key="s.id"
              :label="`${s.siteName}（${s.cmsType}）`"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="creating" @click="createTask">创建任务</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover">
      <template #header><span>发布任务列表</span></template>
      <el-table :data="tasks" v-loading="loading">
        <el-table-column prop="name" label="任务名称" min-width="160" />
        <el-table-column prop="totalCount" label="总数" width="80" />
        <el-table-column prop="successCount" label="成功" width="80" />
        <el-table-column prop="failCount" label="失败" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
      </el-table>
      <el-pagination
        class="mt-4"
        v-model:current-page="page"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="fetchTasks"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getArticles } from '@/api/article'
import { getSiteWebsites, getSiteTasks, createSiteTask } from '@/api/site'

const loading = ref(false)
const creating = ref(false)
const tasks = ref<any[]>([])
const articles = ref<any[]>([])
const sites = ref<any[]>([])
const page = ref(1)
const total = ref(0)

const enabledSites = computed(() => sites.value.filter((s) => s.publishEnabled))

const form = reactive({
  name: '',
  articleIds: [] as number[],
  siteIds: [] as number[],
  publishType: 'immediate',
  scheduledAt: '',
})

function statusType(s: string) {
  const m: Record<string, string> = { pending: 'info', running: 'warning', completed: 'success', failed: 'danger' }
  return m[s] || 'info'
}

function statusText(s: string) {
  const m: Record<string, string> = { pending: '待处理', running: '进行中', completed: '已完成', failed: '失败' }
  return m[s] || s
}

async function fetchTasks() {
  loading.value = true
  try {
    const res = await getSiteTasks({ page: page.value, pageSize: 20 })
    if (res.code === 1) {
      tasks.value = res.data?.list || []
      total.value = res.data?.total || 0
    }
  } finally {
    loading.value = false
  }
}

async function createTask() {
  if (!form.name.trim() || !form.articleIds.length || !form.siteIds.length) {
    ElMessage.warning('请填写任务名称并选择文章和官网站点')
    return
  }
  creating.value = true
  try {
    const res = await createSiteTask({ ...form })
    if (res.code === 1) {
      ElMessage.success('任务已创建')
      form.name = ''
      form.articleIds = []
      form.siteIds = []
      fetchTasks()
    }
  } finally {
    creating.value = false
  }
}

onMounted(async () => {
  const [a, b] = await Promise.all([
    getArticles({ page: 1, pageSize: 100 }),
    getSiteWebsites({ page: 1, pageSize: 100 }),
  ])
  if (a.code === 1) articles.value = a.data?.list || []
  if (b.code === 1) sites.value = b.data?.list || []
  fetchTasks()
})
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }
.mt-4 { margin-top: 16px; }
</style>
