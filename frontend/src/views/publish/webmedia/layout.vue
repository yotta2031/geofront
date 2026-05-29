<template>
  <div class="webmedia-layout">
    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="媒体库" name="index" />
      <el-tab-pane label="单条发布" name="single" />
      <el-tab-pane label="AI智能发布" name="tasks" />
      <el-tab-pane label="投稿记录" name="records" />
      <el-tab-pane label="收藏分组" name="favorites" />
    </el-tabs>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabPaths: Record<string, string> = {
  index: '/publish/webmedia',
  single: '/publish/webmedia/single',
  tasks: '/publish/webmedia/tasks',
  records: '/publish/webmedia/records',
  favorites: '/publish/webmedia/favorites',
}

const activeTab = computed({
  get() {
    if (route.path.includes('/single')) return 'single'
    if (route.path.includes('/tasks')) return 'tasks'
    if (route.path.includes('/records')) return 'records'
    if (route.path.includes('/favorites')) return 'favorites'
    return 'index'
  },
  set() {},
})

function onTabChange(name: string | number) {
  const path = tabPaths[String(name)] || tabPaths.index
  router.push(path)
}
</script>

<style scoped>
.webmedia-layout :deep(.el-tabs__header) {
  margin-bottom: 16px;
  background: #fff;
  padding: 0 16px;
  border-radius: 8px;
}
</style>
