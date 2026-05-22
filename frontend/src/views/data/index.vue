<template>
  <div class="data-page">
    <el-card shadow="hover">
      <template #header>
        <div class="page-card-header">
          <span>AI数据中心</span>
          <el-radio-group v-model="timeRange" size="small">
            <el-radio-button label="week">本周</el-radio-button>
            <el-radio-button label="month">本月</el-radio-button>
            <el-radio-button label="year">本年</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :xs="24" :md="12">
          <div ref="chartRef1" class="chart-box"></div>
        </el-col>
        <el-col :xs="24" :md="12" class="chart-col-second">
          <div ref="chartRef2" class="chart-box"></div>
        </el-col>
      </el-row>

      <el-divider />

      <div class="page-table-wrap">
      <el-table :data="records" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 'diagnosis' ? 'primary' : 'success'" size="small">
              {{ row.type === 'diagnosis' ? '诊断' : '收录查询' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="keyword" label="关键词" />
        <el-table-column prop="platform" label="平台" width="120" />
        <el-table-column prop="result" label="结果" />
        <el-table-column prop="createdAt" label="时间" width="180" />
      </el-table>
      </div>

      <el-pagination
        class="mt-4"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :layout="paginationLayout"
        small
      />
    </el-card>
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
    chart1!.setOption({
      title: { text: '诊断统计', left: 'center' },
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 35, name: 'DeepSeek' },
          { value: 25, name: '豆包' },
          { value: 20, name: '通义' },
          { value: 15, name: '文心' },
          { value: 5, name: '其他' }
        ]
      }]
    })
  }

  if (chartRef2.value) {
    chart2 = echarts.init(chartRef2.value)
    chart2!.setOption({
      title: { text: '发布统计', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
      yAxis: { type: 'value' },
      series: [{
        data: [12, 18, 15, 22, 28, 20, 25],
        type: 'bar',
        itemStyle: { color: '#4b17d3' }
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
.chart-box {
  height: 280px;
  width: 100%;
  min-height: 220px;
}

.chart-col-second {
  margin-top: 20px;
}

@media (min-width: 768px) {
  .chart-col-second {
    margin-top: 0;
  }
}

.mt-4 {
  margin-top: 20px;
}
</style>