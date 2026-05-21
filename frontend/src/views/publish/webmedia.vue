<template>
  <div class="publish-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>文章发布</span>
        </div>
      </template>

      <el-steps :active="activeStep" finish-status="success" simple>
        <el-step title="选择文章" />
        <el-step title="选择渠道" />
        <el-step title="配置参数" />
        <el-step title="确认发布" />
      </el-steps>

      <!-- 步骤1: 选择文章 -->
      <div v-if="activeStep === 0" class="step-content">
        <el-table
          :data="articles"
          style="width: 100%"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="title" label="文章标题" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'draft' ? 'info' : 'success'" size="small">
                {{ row.status === 'draft' ? '草稿' : '已发布' }}
              </el-tag>
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

      <!-- 步骤2: 选择渠道 -->
      <div v-if="activeStep === 1" class="step-content">
        <el-radio-group v-model="selectedChannel" class="channel-group">
          <el-radio-button label="webmedia">
            <el-icon><Document /></el-icon>
            <div>网站媒体</div>
          </el-radio-button>
          <el-radio-button label="zimedia">
            <el-icon><UserFilled /></el-icon>
            <div>自媒体大V</div>
          </el-radio-button>
          <el-radio-button label="weixin">
            <el-icon><ChatDotRound /></el-icon>
            <div>个人自媒体</div>
          </el-radio-button>
          <el-radio-button label="site">
            <el-icon><Monitor /></el-icon>
            <div>AI官网SEO</div>
          </el-radio-button>
        </el-radio-group>
        <div class="step-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep" :disabled="!selectedChannel">
            下一步
          </el-button>
        </div>
      </div>

      <!-- 步骤3: 配置参数 -->
      <div v-if="activeStep === 2" class="step-content">
        <el-form :model="publishConfig" label-width="120px">
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
              <el-option label="公众号1" value="account1" />
              <el-option label="公众号2" value="account2" />
            </el-select>
          </el-form-item>
        </el-form>
        <div class="step-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep">下一步</el-button>
        </div>
      </div>

      <!-- 步骤4: 确认发布 -->
      <div v-if="activeStep === 3" class="step-content">
        <el-descriptions title="发布确认" :column="1" border>
          <el-descriptions-item label="选中文章">
            {{ selectedArticles.length }} 篇
          </el-descriptions-item>
          <el-descriptions-item label="发布渠道">
            {{ getChannelName(selectedChannel) }}
          </el-descriptions-item>
          <el-descriptions-item label="发布方式">
            {{ publishConfig.publishType === 'immediate' ? '立即发布' : '定时发布' }}
          </el-descriptions-item>
          <el-descriptions-item label="预计消耗">
            {{ selectedArticles.length * 10 }} 点数
          </el-descriptions-item>
        </el-descriptions>
        <div class="step-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="handlePublish" :loading="publishing">
            确认发布
          </el-button>
        </div>
      </div>
    </el-card>
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

const publishConfig = reactive({
  publishType: 'immediate',
  scheduledTime: null as Date | null,
  account: ''
})

function getChannelName(channel: string) {
  const map: Record<string, string> = {
    webmedia: '网站媒体',
    zimedia: '自媒体大V',
    weixin: '个人自媒体',
    site: 'AI官网SEO'
  }
  return map[channel] || channel
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
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-content {
  margin-top: 30px;
}

.channel-group {
  display: flex;
  gap: 20px;
  justify-content: center;
  padding: 40px 0;
}

.channel-group :deep(.el-radio-button__inner) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 30px 40px;
  font-size: 16px;
}

.step-actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>