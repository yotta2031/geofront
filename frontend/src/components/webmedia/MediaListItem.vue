<template>
  <div class="media-item">
    <div class="media-main">
      <div class="media-name-block">
        <span class="media-name">{{ item.name }}</span>
        <el-button size="small" plain @click="$emit('case')">案例</el-button>
      </div>

      <div class="media-meta-col">
        <div class="meta-tags">
          <el-tag v-if="item.industry" size="small" type="primary" effect="plain">{{ item.industry }}</el-tag>
          <span v-if="item.portal" class="meta-sub">{{ item.portal }}</span>
        </div>
        <div class="weight-row">
          <span class="weight-label">PC权重</span>
          <el-progress :percentage="item.pcWeight * 10" :show-text="false" :stroke-width="6" />
          <span class="weight-val">{{ item.pcWeight }}</span>
        </div>
        <div class="weight-row">
          <span class="weight-label">移动权重</span>
          <el-progress :percentage="item.mobileWeight * 10" :show-text="false" :stroke-width="6" color="#67c23a" />
          <span class="weight-val">{{ item.mobileWeight }}</span>
        </div>
      </div>

      <div class="media-stat-col">
        <div class="stat-item">
          <span class="stat-label">发稿时间</span>
          <span class="stat-value">{{ item.publishTimeText || '-' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">出稿率</span>
          <span class="stat-value">{{ item.successRate }}%</span>
        </div>
      </div>

      <div class="media-price-col">
        <span class="price-tag">¥ {{ item.price }}元</span>
        <span class="price-label">价格</span>
      </div>

      <div class="media-actions">
        <el-button
          :type="item.isFavorite ? 'warning' : 'default'"
          plain
          size="small"
          @click="$emit('favorite')"
        >
          {{ item.isFavorite ? '已收藏' : '收藏' }}
        </el-button>
        <el-button type="primary" size="small" @click="$emit('publish')">发布</el-button>
      </div>
    </div>
    <div v-if="item.remark || (item.tags && item.tags.length)" class="media-remark">
      <span v-if="item.remark">备注：{{ item.remark }}</span>
      <el-tag
        v-for="tag in item.tags"
        :key="tag"
        size="small"
        class="ml-2"
        type="danger"
        effect="plain"
      >{{ tag }}</el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  item: {
    id: number
    name: string
    industry?: string
    portal?: string
    price: number
    pcWeight: number
    mobileWeight: number
    successRate: number
    publishTimeText?: string
    remark?: string
    tags?: string[]
    isFavorite?: boolean
  }
}>()

defineEmits<{ favorite: []; publish: []; case: [] }>()
</script>

<style scoped>
.media-item {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 12px;
  transition: box-shadow 0.2s;
}

.media-item:hover {
  box-shadow: 0 2px 12px rgba(75, 23, 211, 0.08);
}

.media-main {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.media-name-block {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.media-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.media-meta-col {
  min-width: 160px;
}

.meta-tags {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.meta-sub {
  font-size: 12px;
  color: #909399;
}

.weight-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 12px;
}

.weight-label {
  width: 52px;
  color: #909399;
  flex-shrink: 0;
}

.weight-row .el-progress {
  width: 80px;
}

.weight-val {
  width: 20px;
  color: #4b17d3;
  font-weight: 600;
}

.media-stat-col {
  display: flex;
  gap: 24px;
  min-width: 180px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.media-price-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.price-tag {
  background: #fef0f0;
  color: #f56c6c;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
}

.price-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.media-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.media-remark {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #eee;
  font-size: 13px;
  color: #909399;
}

.ml-2 {
  margin-left: 8px;
}
</style>
