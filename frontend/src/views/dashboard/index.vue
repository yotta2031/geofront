<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <header class="page-header">
      <div>
        <h1 class="page-title">概览</h1>
        <p class="page-subtitle">欢迎回来，这里是您的内容运营全景。</p>
      </div>
    </header>

    <!-- 数据卡片 -->
    <el-row :gutter="16">
      <el-col :xs="24" :sm="12" :md="6" v-for="(item, idx) in statCards" :key="item.title">
        <div class="stat-card" :style="{ '--delay': idx * 60 + 'ms' }">
          <div class="stat-head">
            <span class="stat-title">{{ item.title }}</span>
            <span class="stat-icon">
              <el-icon :size="16"><component :is="item.icon" /></el-icon>
            </span>
          </div>
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-foot">
            <span class="stat-trend" :class="item.trend > 0 ? 'up' : 'down'">
              <el-icon :size="12">
                <component :is="item.trend > 0 ? CaretTop : CaretBottom" />
              </el-icon>
              {{ Math.abs(item.trend) }}%
            </span>
            <span class="stat-hint">较上周</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="mt-4">
      <el-col :xs="24" :lg="16">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">数据趋势</h2>
              <p class="panel-desc">最近一段时间的内容生产与发布情况</p>
            </div>
            <el-radio-group v-model="chartPeriod" size="small">
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="chartRef" class="chart-box"></div>
        </section>
      </el-col>
      <el-col :xs="24" :lg="8" class="mt-4 mt-lg-0">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">任务状态</h2>
              <p class="panel-desc">当前各类任务执行进度</p>
            </div>
          </div>
          <div class="task-stats">
            <div v-for="task in taskStats" :key="task.name" class="task-item">
              <div class="task-row">
                <span class="task-name">{{ task.name }}</span>
                <span class="task-percent">{{ task.percentage }}%</span>
              </div>
              <div class="task-bar">
                <div
                  class="task-bar-fill"
                  :class="task.status"
                  :style="{ width: task.percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </section>
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <el-row :gutter="16" class="mt-4">
      <el-col :span="24">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">快捷操作</h2>
              <p class="panel-desc">常用入口一键直达</p>
            </div>
          </div>
          <div class="quick-actions">
            <button
              v-for="action in quickActions"
              :key="action.name"
              class="quick-action"
              @click="$router.push(action.path)"
            >
              <span class="quick-action-icon">
                <el-icon :size="18"><component :is="action.icon" /></el-icon>
              </span>
              <span class="quick-action-text">
                <span class="quick-action-name">{{ action.name }}</span>
                <span class="quick-action-desc">{{ action.desc }}</span>
              </span>
              <el-icon class="quick-action-arrow" :size="14"><ArrowRight /></el-icon>
            </button>
          </div>
        </section>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  Document,
  TrendCharts,
  Search,
  EditPen,
  Promotion,
  Tools,
  ArrowRight,
  CaretTop,
  CaretBottom
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null
const chartPeriod = ref('week')

const statCards = ref([
  { title: '文章总数', value: 128, icon: Document, trend: 12 },
  { title: '诊断次数', value: 56, icon: Search, trend: 8 },
  { title: '发布成功', value: 89, icon: Promotion, trend: -3 },
  { title: '剩余点数', value: 390, icon: TrendCharts, trend: 5 }
])

const taskStats = ref([
  { name: 'AI 写作任务', percentage: 75, status: 'primary' },
  { name: '发布任务', percentage: 60, status: 'primary' },
  { name: '诊断任务', percentage: 90, status: 'success' },
  { name: '拓词任务', percentage: 30, status: 'warning' }
])

const quickActions = ref([
  { name: 'AI 诊断', desc: '一键检测内容质量', icon: Search, path: '/diagnosis' },
  { name: '创建文章', desc: '智能生成原创内容', icon: EditPen, path: '/article/tasks' },
  { name: '发布文章', desc: '多平台分发管理', icon: Promotion, path: '/publish' },
  { name: '关键词拓词', desc: '挖掘长尾关键词', icon: Tools, path: '/tools' }
])

function getChartOption(period: 'week' | 'month') {
  const xData =
    period === 'week'
      ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      : Array.from({ length: 30 }, (_, i) => `${i + 1}日`)

  const articleData =
    period === 'week'
      ? [12, 18, 15, 22, 28, 20, 25]
      : Array.from({ length: 30 }, () => Math.round(10 + Math.random() * 22))
  const publishData =
    period === 'week'
      ? [8, 12, 10, 15, 18, 14, 20]
      : Array.from({ length: 30 }, () => Math.round(6 + Math.random() * 16))

  return {
    grid: { left: 8, right: 12, top: 36, bottom: 8, containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#ececf2',
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: '#1f2024', fontSize: 12 },
      extraCssText: 'box-shadow: 0 6px 24px rgba(20, 14, 56, 0.08); border-radius: 8px;'
    },
    legend: {
      data: ['文章数', '发布数'],
      right: 0,
      top: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: '#6b6f76', fontSize: 12 }
    },
    xAxis: {
      type: 'category',
      data: xData,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#ececf2' } },
      axisTick: { show: false },
      axisLabel: { color: '#9aa0a6', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9aa0a6', fontSize: 12 },
      splitLine: { lineStyle: { color: '#f3f3f7', type: 'dashed' } }
    },
    series: [
      {
        name: '文章数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        data: articleData,
        lineStyle: { width: 2, color: '#7c3aed' },
        itemStyle: { color: '#7c3aed', borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(124, 58, 237, 0.18)' },
              { offset: 1, color: 'rgba(124, 58, 237, 0)' }
            ]
          }
        }
      },
      {
        name: '发布数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        data: publishData,
        lineStyle: { width: 2, color: '#c4b5fd', type: [4, 4] },
        itemStyle: { color: '#c4b5fd', borderColor: '#fff', borderWidth: 2 }
      }
    ]
  }
}

function handleResize() {
  chartInstance?.resize()
}

onMounted(() => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    chartInstance.setOption(getChartOption(chartPeriod.value as 'week' | 'month'))
    window.addEventListener('resize', handleResize)
  }
})

watch(chartPeriod, (val) => {
  chartInstance?.setOption(getChartOption(val as 'week' | 'month'))
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<style scoped>
.dashboard {
  padding: 0;
  color: #1f2024;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.2px;
  color: #1f2024;
}

.page-subtitle {
  font-size: 13px;
  color: #8a8f98;
  margin: 6px 0 0;
}

/* 统计卡片 */
.stat-card {
  position: relative;
  padding: 18px 20px 16px;
  background: #fff;
  border: 1px solid #ececf2;
  border-radius: 12px;
  transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;
  animation: fadeUp 0.5s ease both;
  animation-delay: var(--delay, 0ms);
}

.stat-card:hover {
  border-color: #d8c4fa;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.08);
}

.stat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.stat-title {
  font-size: 13px;
  color: #8a8f98;
  letter-spacing: 0.2px;
}

.stat-icon {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f5f0fe;
  color: #7c3aed;
}

.stat-value {
  font-size: 26px;
  font-weight: 600;
  line-height: 1.2;
  color: #1f2024;
  font-feature-settings: 'tnum';
  letter-spacing: 0.5px;
}

.stat-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  font-size: 12px;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 500;
}

.stat-trend.up {
  color: #10b981;
  background: #ecfdf5;
}

.stat-trend.down {
  color: #ef4444;
  background: #fef2f2;
}

.stat-hint {
  color: #9aa0a6;
}

/* 通用面板 */
.panel {
  background: #fff;
  border: 1px solid #ececf2;
  border-radius: 12px;
  padding: 18px 20px;
  height: 100%;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: #1f2024;
}

.panel-desc {
  font-size: 12px;
  color: #9aa0a6;
  margin: 4px 0 0;
}

/* 图表 */
.chart-box {
  height: 300px;
  width: 100%;
  min-height: 240px;
}

.mt-4 {
  margin-top: 16px;
}

@media (min-width: 992px) {
  .mt-lg-0 {
    margin-top: 0 !important;
  }
}

/* 任务进度 */
.task-stats {
  padding-top: 4px;
}

.task-item {
  margin-bottom: 16px;
}

.task-item:last-child {
  margin-bottom: 0;
}

.task-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.task-name {
  font-size: 13px;
  color: #4b4f57;
}

.task-percent {
  font-size: 12px;
  color: #8a8f98;
  font-feature-settings: 'tnum';
}

.task-bar {
  height: 6px;
  background: #f3f3f7;
  border-radius: 999px;
  overflow: hidden;
}

.task-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s ease;
}

.task-bar-fill.primary {
  background: linear-gradient(90deg, #7c3aed, #a375f2);
}

.task-bar-fill.success {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.task-bar-fill.warning {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

/* 快捷入口 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.quick-action {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #ececf2;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  font-family: inherit;
  color: inherit;
}

.quick-action:hover {
  border-color: #d8c4fa;
  background: #faf8ff;
  transform: translateY(-1px);
}

.quick-action-icon {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f5f0fe;
  color: #7c3aed;
  flex-shrink: 0;
}

.quick-action:hover .quick-action-icon {
  background: #7c3aed;
  color: #fff;
}

.quick-action-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.quick-action-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2024;
}

.quick-action-desc {
  font-size: 12px;
  color: #9aa0a6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quick-action-arrow {
  color: #c4c8cf;
  flex-shrink: 0;
  transition: transform 0.2s ease, color 0.2s ease;
}

.quick-action:hover .quick-action-arrow {
  color: #7c3aed;
  transform: translateX(2px);
}

@media (max-width: 992px) {
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .quick-actions {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 20px;
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
