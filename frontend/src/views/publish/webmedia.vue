<template>
  <div class="publish-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">文章发布</h1>
        <p class="page-subtitle">多渠道分发管理，一键触达目标平台</p>
      </div>
    </header>

    <section class="panel">
      <el-steps :active="activeStep" finish-status="success" align-center>
        <el-step title="选择文章" />
        <el-step title="选择渠道" />
        <el-step title="配置参数" />
        <el-step title="确认发布" />
      </el-steps>

      <div v-if="activeStep === 0" class="step-content">
        <div class="step-header">
          <h3 class="step-title">选择要发布的文章</h3>
          <p class="step-desc">支持批量选择，一次发布多篇内容</p>
        </div>
        <el-table
          :data="articles"
          style="width: 100%"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="title" label="文章标题" min-width="200" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <span class="status-pill" :class="`status-${row.status}`">
                <span class="status-dot"></span>
                {{ row.status === 'draft' ? '草稿' : '已发布' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
        </el-table>
        <div class="step-actions">
          <el-button type="primary" @click="nextStep" :disabled="selectedArticles.length === 0">
            下一步
          </el-button>
        </div>
      </div>

      <div v-if="activeStep === 1" class="step-content">
        <div class="step-header">
          <h3 class="step-title">选择发布渠道</h3>
          <p class="step-desc">根据内容类型选择合适的分发平台</p>
        </div>
        <div class="channel-grid">
          <label
            v-for="ch in channels"
            :key="ch.value"
            class="channel-card"
            :class="{ active: selectedChannel === ch.value }"
          >
            <input
              type="radio"
              :value="ch.value"
              v-model="selectedChannel"
              class="channel-input"
            />
            <div class="channel-icon">
              <el-icon :size="24"><component :is="ch.icon" /></el-icon>
            </div>
            <div class="channel-name">{{ ch.label }}</div>
            <div class="channel-desc">{{ ch.desc }}</div>
          </label>
        </div>
        <div class="step-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep" :disabled="!selectedChannel">
            下一步
          </el-button>
        </div>
      </div>

      <div v-if="activeStep === 2" class="step-content">
        <div class="step-header">
          <h3 class="step-title">配置发布参数</h3>
          <p class="step-desc">设置发布时间与账号信息</p>
        </div>
        <el-form :model="publishConfig" label-width="120px" class="config-form">
          <el-form-item label="发布时间">
            <el-radio-group v-model="publishConfig.publishType">
              <el-radio label="immediate">立即发布</el-radio>
              <el-radio label="scheduled">定时发布</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="定时时间" v-if="publishConfig.publishType === 'scheduled'">
            <el-date-picker
              v-model="publishConfig.scheduledTime"
              type="datetime"
              placeholder="选择发布时间"
            />
          </el-form-item>
          <el-form-item label="发布账号" v-if="selectedChannel === 'weixin'">
            <el-select v-model="publishConfig.account" placeholder="选择发布账号">
              <el-option label="公众号 1" value="account1" />
              <el-option label="公众号 2" value="account2" />
            </el-select>
          </el-form-item>
        </el-form>
        <div class="step-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep">下一步</el-button>
        </div>
      </div>

      <div v-if="activeStep === 3" class="step-content">
        <div class="step-header">
          <h3 class="step-title">确认发布信息</h3>
          <p class="step-desc">请仔细核对以下信息</p>
        </div>
        <div class="confirm-box">
          <div class="confirm-row">
            <span class="confirm-label">选中文章</span>
            <span class="confirm-value">{{ selectedArticles.length }} 篇</span>
          </div>
          <div class="confirm-row">
            <span class="confirm-label">发布渠道</span>
            <span class="confirm-value">{{ getChannelName(selectedChannel) }}</span>
          </div>
          <div class="confirm-row">
            <span class="confirm-label">发布方式</span>
            <span class="confirm-value">
              {{ publishConfig.publishType === 'immediate' ? '立即发布' : '定时发布' }}
            </span>
          </div>
          <div class="confirm-row">
            <span class="confirm-label">预计消耗</span>
            <span class="confirm-value highlight">{{ selectedArticles.length * 10 }} 点数</span>
          </div>
        </div>
        <div class="step-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="handlePublish" :loading="publishing">
            确认发布
          </el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, UserFilled, ChatDotRound, Monitor } from '@element-plus/icons-vue'
import { getArticles } from '@/api/article'
import { publishToWebmedia, publishToZimedia, publishToWeixin, publishToSite } from '@/api/publish'

const loading = ref(false)
const publishing = ref(false)
const activeStep = ref(0)
const articles = ref([])
const selectedArticles = ref<any[]>([])
const selectedChannel = ref('')

const channels = [
  { value: 'webmedia', label: '网站媒体', desc: '新闻站点、行业门户', icon: Document },
  { value: 'zimedia', label: '自媒体大V', desc: '头部账号代发', icon: UserFilled },
  { value: 'weixin', label: '个人自媒体', desc: '公众号、小红书', icon: ChatDotRound },
  { value: 'site', label: 'AI 官网 SEO', desc: '企业站点优化', icon: Monitor }
]

const publishConfig = reactive({
  publishType: 'immediate',
  scheduledTime: null as Date | null,
  account: ''
})

function getChannelName(channel: string) {
  const found = channels.find(c => c.value === channel)
  return found ? found.label : channel
}

function handleSelectionChange(selection: any[]) {
  selectedArticles.value = selection
}

function nextStep() {
  if (activeStep.value < 3) {
    activeStep.value++
  }
}

function prevStep() {
  if (activeStep.value > 0) {
    activeStep.value--
  }
}

async function handlePublish() {
  publishing.value = true
  try {
    const articleIds = selectedArticles.value.map(a => a.id)
    const data = {
      articleIds,
      ...publishConfig
    }

    let res
    switch (selectedChannel.value) {
      case 'webmedia':
        res = await publishToWebmedia(data)
        break
      case 'zimedia':
        res = await publishToZimedia(data)
        break
      case 'weixin':
        res = await publishToWeixin(data)
        break
      case 'site':
        res = await publishToSite(data)
        break
      default:
        ElMessage.warning('请选择发布渠道')
        return
    }

    if (res.code === 1) {
      ElMessage.success('发布任务已创建')
      activeStep.value = 0
      selectedArticles.value = []
      selectedChannel.value = ''
    }
  } finally {
    publishing.value = false
  }
}

async function fetchArticles() {
  loading.value = true
  try {
    const res = await getArticles({ page: 1, pageSize: 50, status: 'draft' })
    if (res.code === 1) {
      articles.value = res.data?.list || []
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.step-content {
  margin-top: 32px;
}

.step-header {
  margin-bottom: 20px;
}

.step-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 6px;
  color: var(--app-text-1);
}

.step-desc {
  font-size: 13px;
  color: var(--app-text-muted);
  margin: 0;
}

.channel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin: 24px 0;
}

.channel-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.channel-card:hover {
  border-color: var(--app-border-strong);
  background: #faf8ff;
}

.channel-card.active {
  border-color: var(--el-color-primary);
  background: rgba(124, 58, 237, 0.04);
}

.channel-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.channel-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f5f0fe;
  color: var(--el-color-primary);
  margin-bottom: 12px;
}

.channel-card.active .channel-icon {
  background: var(--el-color-primary);
  color: #fff;
}

.channel-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--app-text-1);
  margin-bottom: 4px;
}

.channel-desc {
  font-size: 12px;
  color: var(--app-text-muted);
  text-align: center;
}

.config-form {
  max-width: 560px;
  margin: 24px 0;
}

.confirm-box {
  max-width: 560px;
  margin: 24px 0;
  padding: 20px;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  background: #fafafd;
}

.confirm-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--app-divider);
}

.confirm-row:last-child {
  border-bottom: none;
}

.confirm-label {
  font-size: 13px;
  color: var(--app-text-3);
}

.confirm-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--app-text-1);
}

.confirm-value.highlight {
  color: var(--el-color-primary);
  font-weight: 600;
}

.step-actions {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  gap: 12px;
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

.status-draft {
  background: rgba(124, 58, 237, 0.08);
  color: var(--el-color-primary);
}
.status-draft .status-dot {
  background: var(--el-color-primary);
}

.status-published {
  background: rgba(16, 185, 129, 0.1);
  color: #047857;
}
.status-published .status-dot {
  background: var(--app-success);
}

@media (max-width: 768px) {
  .channel-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .channel-grid {
    grid-template-columns: 1fr;
  }
}
</style>
