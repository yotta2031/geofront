<template>
  <div class="tools-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">关键词工具</h1>
        <p class="page-subtitle">指数查询与智能拓词，挖掘长尾流量</p>
      </div>
    </header>

    <el-row :gutter="16">
      <el-col :xs="24" :md="12">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">关键词指数查询</h2>
              <p class="panel-desc">查看关键词热度与竞争度</p>
            </div>
          </div>
          <el-form :model="zhishuForm" label-width="100px">
            <el-form-item label="关键词">
              <el-input v-model="zhishuForm.keyword" placeholder="请输入关键词">
                <template #append>
                  <el-button @click="queryZhishu" :loading="zhishuLoading">
                    <el-icon><Search /></el-icon>查询
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
          <div v-if="zhishuResult" class="result-box">
            <div class="result-item">
              <span class="result-label">关键词</span>
              <span class="result-value">{{ zhishuResult.keyword }}</span>
            </div>
            <div class="result-item">
              <span class="result-label">指数</span>
              <div class="result-score">
                <div class="score-bar">
                  <div class="score-bar-fill" :style="{ width: (zhishuResult.index / 100 * 100) + '%' }"></div>
                </div>
                <span class="score-num">{{ zhishuResult.index }}</span>
              </div>
            </div>
          </div>
        </section>
      </el-col>

      <el-col :xs="24" :md="12" class="mt-4 mt-lg-0">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">AI 拓词</h2>
              <p class="panel-desc">基于语义自动扩展相关词</p>
            </div>
          </div>
          <el-form :model="tuociForm" label-width="100px">
            <el-form-item label="关键词">
              <el-input v-model="tuociForm.keyword" placeholder="请输入关键词">
                <template #append>
                  <el-button @click="queryTuoci" :loading="tuociLoading">
                    <el-icon><Search /></el-icon>拓词
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
          <div v-if="tuociResult.length > 0" class="result-box">
            <div class="tag-cloud">
              <el-tag
                v-for="word in tuociResult"
                :key="word"
                class="tag-item"
                effect="light"
              >
                {{ word }}
              </el-tag>
            </div>
          </div>
        </section>
      </el-col>
    </el-row>

    <section class="panel mt-4">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">手动拓词工具</h2>
          <p class="panel-desc">自定义规则批量生成关键词组合</p>
        </div>
      </div>
      <el-form :model="manualForm" label-width="100px" class="manual-form">
        <el-form-item label="关键词">
          <el-input v-model="manualForm.keyword" placeholder="请输入关键词" />
        </el-form-item>
        <el-form-item label="拓词规则">
          <el-select v-model="manualForm.rule" placeholder="选择拓词规则">
            <el-option label="前缀匹配" value="prefix" />
            <el-option label="后缀匹配" value="suffix" />
            <el-option label="组合匹配" value="combine" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="manualExpand" :loading="manualLoading">
            开始拓词
          </el-button>
        </el-form-item>
      </el-form>
      <div v-if="manualResult.length > 0" class="result-box">
        <div class="page-table-wrap">
          <el-table :data="manualResult" style="width: 100%">
            <el-table-column type="index" width="60" label="#" />
            <el-table-column prop="word" label="拓词结果" min-width="200" />
            <el-table-column prop="relevance" label="相关度" width="180">
              <template #default="{ row }">
                <div class="relevance-cell">
                  <div class="relevance-bar">
                    <div class="relevance-bar-fill" :style="{ width: row.relevance + '%' }"></div>
                  </div>
                  <span class="relevance-num">{{ row.relevance }}%</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getKeywordIndex, getExpandWords, manualExpandWords } from '@/api/tools'

const zhishuLoading = ref(false)
const tuociLoading = ref(false)
const manualLoading = ref(false)

const zhishuForm = reactive({ keyword: '' })
const tuociForm = reactive({ keyword: '' })
const manualForm = reactive({ keyword: '', rule: 'prefix' })

const zhishuResult = ref<any>(null)
const tuociResult = ref<string[]>([])
const manualResult = ref<any[]>([])

async function queryZhishu() {
  if (!zhishuForm.keyword) {
    ElMessage.warning('请输入关键词')
    return
  }
  zhishuLoading.value = true
  try {
    const res = await getKeywordIndex(zhishuForm.keyword)
    if (res.code === 1) {
      zhishuResult.value = res.data
    }
  } finally {
    zhishuLoading.value = false
  }
}

async function queryTuoci() {
  if (!tuociForm.keyword) {
    ElMessage.warning('请输入关键词')
    return
  }
  tuociLoading.value = true
  try {
    const res = await getExpandWords(tuociForm.keyword)
    if (res.code === 1) {
      tuociResult.value = res.data?.words || []
    }
  } finally {
    tuociLoading.value = false
  }
}

async function manualExpand() {
  if (!manualForm.keyword) {
    ElMessage.warning('请输入关键词')
    return
  }
  manualLoading.value = true
  try {
    const res = await manualExpandWords(manualForm)
    if (res.code === 1) {
      manualResult.value = res.data?.words || []
    }
  } finally {
    manualLoading.value = false
  }
}
</script>

<style scoped>
.manual-form {
  max-width: 560px;
}

.result-box {
  margin-top: 20px;
  padding: 16px;
  background: #fafafd;
  border: 1px solid var(--app-border);
  border-radius: 10px;
}

.result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--app-divider);
}

.result-item:last-child {
  border-bottom: none;
}

.result-label {
  font-size: 13px;
  color: var(--app-text-3);
}

.result-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--app-text-1);
}

.result-score {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  max-width: 240px;
}

.score-bar {
  flex: 1;
  height: 6px;
  background: #f3f3f7;
  border-radius: 999px;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a375f2);
  border-radius: 999px;
  transition: width 0.4s ease;
}

.score-num {
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text-1);
  font-feature-settings: 'tnum';
  min-width: 32px;
  text-align: right;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  font-size: 13px;
}

.relevance-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.relevance-bar {
  flex: 1;
  height: 6px;
  background: #f3f3f7;
  border-radius: 999px;
  overflow: hidden;
}

.relevance-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a375f2);
  border-radius: 999px;
  transition: width 0.4s ease;
}

.relevance-num {
  font-size: 12px;
  font-weight: 500;
  color: var(--app-text-3);
  font-feature-settings: 'tnum';
  min-width: 36px;
  text-align: right;
}
</style>
