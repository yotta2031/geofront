<template>
  <div class="tools-page">
    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header>
            <div class="page-card-header">
              <span>关键词指数查询</span>
            </div>
          </template>
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
            <el-descriptions :column="1" border>
              <el-descriptions-item label="关键词">{{ zhishuResult.keyword }}</el-descriptions-item>
              <el-descriptions-item label="指数">
                <el-rate :model-value="zhishuResult.index / 20" disabled show-score />
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12" class="tools-col-second">
        <el-card shadow="hover">
          <template #header>
            <div class="page-card-header">
              <span>AI拓词</span>
            </div>
          </template>
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
            <el-tag
              v-for="word in tuociResult"
              :key="word"
              class="mr-2 mb-2"
              type="primary"
              effect="plain"
            >
              {{ word }}
            </el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>手动拓词工具</span>
            </div>
          </template>
          <el-form :model="manualForm" label-width="100px">
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
              <el-table-column type="index" width="60" />
              <el-table-column prop="word" label="拓词结果" />
              <el-table-column prop="relevance" label="相关度" width="120">
                <template #default="{ row }">
                  <el-progress :percentage="row.relevance" :stroke-width="6" />
                </template>
              </el-table-column>
            </el-table>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
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
.tools-col-second {
  margin-top: 20px;
}

@media (min-width: 768px) {
  .tools-col-second {
    margin-top: 0;
  }
}

.mt-4 {
  margin-top: 20px;
}

.result-box {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.mr-2 {
  margin-right: 8px;
}

.mb-2 {
  margin-bottom: 8px;
}
</style>