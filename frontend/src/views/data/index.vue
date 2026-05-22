<template>
  <div class="data-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">AI 数据中心</h1>
        <p class="page-subtitle">全局数据统计与趋势分析</p>
      </div>
      <el-radio-group v-model="timeRange" size="small">
        <el-radio-button label="week">本周</el-radio-button>
        <el-radio-button label="month">本月</el-radio-button>
        <el-radio-button label="year">本年</el-radio-button>
      </el-radio-group>
    </header>

    <el-row :gutter="16">
      <el-col :xs="24" :md="12">
        <section class="panel chart-panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">诊断统计</h2>
              <p class="panel-desc">各平台诊断次数分布</p>
            </div>
          </div>
          <div ref="chartRef1" class="chart-box"></div>
        </section>
      </el-col>
      <el-col :xs="24" :md="12" class="mt-4 mt-lg-0">
        <section class="panel chart-panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">发布统计</h2>
              <p class="panel-desc">每日发布文章数量趋势</p>
            </div>
          </div>
          <div ref="chartRef2" class="chart-box"></div>
        </section>
      </el-col>
    </el-row>

    <section class="panel mt-4">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">操作记录</h2>
          <p class="panel-desc">最近的诊断与查询历史</p>
        </div>
      </div>
      <div class="page-table-wrap">
        <el-table :data="records" style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="type" label="类型" width="120">
            <template #default="{ row }">
              <el-tag :type="row.type === 'diagnosis' ? 'primary' : 'success'" size="small" effect="light">
                {{ row.type === 'diagnosis' ? '诊断' : '收录查询' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="keyword" label="关键词" min-width="140" />
          <el-table-column prop="platform" label="平台" width="120" />
          <el-table-column prop="result" label="结果" min-width="160" />
          <el-table-column prop="createdAt" label="时间" width="180" />
        </el-table>
      </div>

      <el-pagination
        class="mt-4"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :layout="paginationLayout"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import { useBreakpoint } from '@/composables/useBreakpoint'

const { isMobile } = useBreakpoint()
const loading = ref(false)
const paginationLayout = computed(() =>
  isMobile.value ? 'prev, pager, next' : 'total, prev, pager, next'
)
const timeRange = ref('week')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const records = ref([])
const chartRef1 = ref<HTMLElement>()
const chartRef2 = ref<HTMLElement>()
let chart1: echarts.ECharts | null = null
let chart2: echarts.ECharts | null = null

function handleResize() {
  chart1?.resize()
  chart2?.resize()
}

onMounted(() => {
  if (chartRef1.value) {
    chart1 = echarts.init(chartRef1.value)
    chart1.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, left: 'center', itemWidth: 12, itemHeight: 12 },
      series: [{
        type: 'pie',
        radius: ['45%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 600 } },
        data: [
          { value: 35, name: 'DeepSeek', itemStyle: { color: '#7c3aed' } },
          { value: 25, name: '豆包', itemStyle: { color: '#a375f2' } },
          { value: 20, name: '通义', itemStyle: { color: '#c4b5fd' } },
          { value: 15, name: '文心', itemStyle: { color: '#ddd6fe' } },
          { value: 5, name: '其他', itemStyle: { color: '#ede9fe' } }
        ]
      }]
    })
  }

  if (chartRef2.value) {
    chart2 = echarts.init(chartRef2.value)
    chart2.setOption({
      tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: '#ececf2', borderWidth: 1, textStyle: { color: '#1f2024' } },
      grid: { left: 8, right: 12, top: 24, bottom: 8, containLabel: true },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
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
      series: [{
        data: [12, 18, 15, 22, 28, 20, 25],
        type: 'bar',
        barWidth: '50%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#7c3aed' },
              { offset: 1, color: '#a375f2' }
            ]
          },
          borderRadius: [6, 6, 0, 0]
        }
      }]
    })
  }
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart1?.dispose()
  chart2?.dispose()
})
</script>

<style scoped>
.chart-panel {
  height: 100%;
  min-height: 320px;
}

.chart-box {
  height: 260px;
  width: 100%;
  min-height: 220px;
}
</style>
