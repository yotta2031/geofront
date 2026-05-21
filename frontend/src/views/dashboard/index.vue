<template>
  <div class="dashboard">
    <!-- 数据卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in statCards" :key="item.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" :style="{ background: item.gradient }">
            <el-icon :size="24" color="#fff">
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ item.value }}</div>
            <div class="stat-title">{{ item.title }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="mt-4">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>数据趋势</span>
              <el-radio-group v-model="chartPeriod" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="chartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>任务状态</span>
            </div>
          </template>
          <div class="task-stats">
            <div v-for="task in taskStats" :key="task.name" class="task-item">
              <span class="task-name">{{ task.name }}</span>
              <el-progress
                :percentage="task.percentage"
                :status="task.status"
                :stroke-width="8"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <el-row :gutter="20" class="mt-4">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button
              v-for="action in quickActions"
              :key="action.name"
              :type="action.type"
              :icon="action.icon"
              size="large"
              @click="$router.push(action.path)"
            >
              {{ action.name }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Document,
  TrendCharts,
  Search,
  EditPen,
  Promotion,
  Tools,
  Plus
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement>()
const chartPeriod = ref('week')

const statCards = ref([
  { title: '文章总数', value: 128, icon: Document, gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { title: '诊断次数', value: 56, icon: Search, gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { title: '发布成功', value: 89, icon: Promotion, gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { title: '剩余点数', value: 390, icon: TrendCharts, gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' }
])

const taskStats = ref([
  { name: 'AI写作任务', percentage: 75, status: '' },
  { name: '发布任务', percentage: 60, status: '' },
  { name: '诊断任务', percentage: 90, status: 'success' },
  { name: '拓词任务', percentage: 30, status: 'exception' }
])

const quickActions = ref([
  { name: 'AI诊断', type: 'primary', icon: Search, path: '/diagnosis' },
  { name: '创建文章', type: 'success', icon: EditPen, path: '/article/tasks' },
  { name: '发布文章', type: 'warning', icon: Promotion, path: '/publish' },
  { name: '关键词拓词', type: 'info', icon: Tools, path: '/tools' }
])

onMounted(() => {
  if (chartRef.value) {
    const chart = echarts.init(chartRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '文章数',
          type: 'line',
          smooth: true,
          data: [12, 18, 15, 22, 28, 20, 25],
          itemStyle: { color: '#4b17d3' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(75, 23, 211, 0.3)' },
                { offset: 1, color: 'rgba(75, 23, 211, 0.05)' }
              ]
            }
          }
        },
        {
          name: '发布数',
          type: 'line',
          smooth: true,
          data: [8, 12, 10, 15, 18, 14, 20],
          itemStyle: { color: '#8b5fff' }
        }
      ]
    })
  }
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.stat-title {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.mt-4 {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-stats {
  padding: 10px 0;
}

.task-item {
  margin-bottom: 16px;
}

.task-item:last-child {
  margin-bottom: 0;
}

.task-name {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.quick-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.quick-actions .el-button {
  min-width: 120px;
}
</style>
