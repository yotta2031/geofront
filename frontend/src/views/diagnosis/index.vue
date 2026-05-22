<template>
  <div class="diagnosis-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">AI 可见度诊断</h1>
        <p class="page-subtitle">检测您的品牌在主流大模型中的曝光情况</p>
      </div>
    </header>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="14">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">新建诊断</h2>
              <p class="panel-desc">选择平台与品牌，一键生成可见度报告</p>
            </div>
          </div>

          <el-form :model="form" :label-width="formLabelWidth" class="diagnosis-form responsive-form">
            <el-form-item label="选择 AI 平台">
              <div class="platform-grid">
                <label
                  v-for="p in platforms"
                  :key="p.value"
                  class="platform-card"
                  :class="{ active: form.platforms.includes(p.value) }"
                >
                  <input
                    type="checkbox"
                    :value="p.value"
                    v-model="form.platforms"
                    class="platform-input"
                  />
                  <img :src="p.logo" :alt="p.label" class="platform-logo" />
                  <!-- <span class="platform-name">{{ p.label }}</span> -->
                  <!-- <span class="platform-check">
                    <el-icon v-if="form.platforms.includes(p.value)"><Check /></el-icon>
                  </span> -->
                </label>
              </div>
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
                placeholder="最多 3 个关键词，用逗号分隔"
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
        </section>
      </el-col>

      <el-col :xs="24" :lg="10" class="mt-4 mt-lg-0">
        <section class="panel tip-panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">诊断说明</h2>
              <p class="panel-desc">了解 AI 可见度评分的工作机制</p>
            </div>
          </div>
          <ul class="tip-list">
            <li>
              <span class="tip-num">01</span>
              <div>
                <div class="tip-title">多平台并行查询</div>
                <div class="tip-text">同时向所选 AI 平台发起品牌相关问题，记录其回答覆盖度</div>
              </div>
            </li>
            <li>
              <span class="tip-num">02</span>
              <div>
                <div class="tip-title">智能评分</div>
                <div class="tip-text">从提及频率、内容准确性、推荐倾向多维度打分</div>
              </div>
            </li>
            <li>
              <span class="tip-num">03</span>
              <div>
                <div class="tip-title">优化建议</div>
                <div class="tip-text">根据评分给出可执行的内容投放建议</div>
              </div>
            </li>
          </ul>
        </section>
      </el-col>
    </el-row>

    <section class="panel mt-4">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">诊断记录</h2>
          <p class="panel-desc">最近 5 条诊断历史</p>
        </div>
        <el-button type="primary" link @click="$router.push('/diagnosis/reports')">
          查看全部
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div class="page-table-wrap">
        <el-table :data="reports" style="width: 100%">
          <el-table-column prop="brand" label="品牌" min-width="120" />
          <el-table-column prop="platforms" label="平台" min-width="200">
            <template #default="{ row }">
              <el-tag v-for="p in row.platforms" :key="p" size="small" effect="light" class="mr-1">
                {{ p }}
              </el-tag>
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
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="viewReport(row.id)">
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, ArrowRight } from '@element-plus/icons-vue'
import { createDiagnosis, getDiagnosisList } from '@/api/diagnosis'
import { useBreakpoint } from '@/composables/useBreakpoint'

const { isMobile } = useBreakpoint()
const formLabelWidth = computed(() => (isMobile.value ? 'auto' : '120px'))
const loading = ref(false)
const reports = ref([])

import deepseekLogo from '@/assets/logo/deepseek.png'
import geminiLogo from '@/assets/logo/gemini.png'
import gptLogo from '@/assets/logo/gpt.png'
import kimiLogo from '@/assets/logo/kimi.png'
import yuanbaoLogo from '@/assets/logo/yuanbao.png'
import doubao from '@/assets/logo/doubao.png'
import qianwen from '@/assets/logo/qianwen.png';

const platforms = [
  { value: 'deepseek', label: 'DeepSeek', logo: deepseekLogo },
  { value: 'gemini', label: 'Gemini', logo: geminiLogo },
  { value: 'gpt', label: 'GPT', logo: gptLogo },
  { value: 'kimi', label: 'Kimi', logo: kimiLogo },
  { value: 'yuanbao', label: '元宝', logo: yuanbaoLogo },
  {valude: 'doubao', label: '豆包' ,logo: doubao},
  {valude: 'qianwen', label: '千问', logo: qianwen}
]

const form = reactive({
  platforms: ['deepseek', 'gpt'],
  brand: '',
  keywords: '',
  needOptimize: true
})

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
    ElMessage.warning('请至少选择一个 AI 平台')
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

function viewReport(_id: string) {
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
  max-width: 640px;
  padding-top: 4px;
}

.platform-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  width: 100%;
}

.platform-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  color: var(--app-text-2);
  transition: all 0.2s ease;
  user-select: none;
  height: 54px;

}

.platform-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
  flex-shrink: 0;
}

.platform-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.platform-card:hover {
  border-color: var(--app-border-strong);
  background: #faf8ff;
}

.platform-card.active {
  border-color: var(--el-color-primary);
  background: rgba(124, 58, 237, 0.04);
  color: var(--el-color-primary);
  font-weight: 500;
}

.platform-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.platform-check {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
}

.tip-panel {
  height: 100%;
}

.tip-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip-list li {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.tip-num {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.4px;
  border-radius: 8px;
  background: #f5f0fe;
  color: var(--el-color-primary);
  font-feature-settings: 'tnum';
}

.tip-title {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--app-text-1);
  margin-bottom: 4px;
}

.tip-text {
  font-size: 12.5px;
  color: var(--app-text-muted);
  line-height: 1.6;
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

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
