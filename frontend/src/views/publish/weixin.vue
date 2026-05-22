<template>
  <div class="empty-page">
    <section class="panel empty-panel">
      <el-empty description="功能开发中，敬请期待">
        <template #image>
          <div class="empty-icon">
            <el-icon :size="64" color="#c4c8cf"><Tools /></el-icon>
          </div>
        </template>
      </el-empty>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Tools } from '@element-plus/icons-vue'
</script>

<style scoped>
.empty-panel {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  margin-bottom: 16px;
}
</style>
