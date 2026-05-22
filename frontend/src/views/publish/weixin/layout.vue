<template>
  <div class="weixin-layout">
    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="账号授权" name="accounts" />
      <el-tab-pane label="发布任务" name="tasks" />
      <el-tab-pane label="发布记录" name="records" />
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
  accounts: '/publish/weixin',
  tasks: '/publish/weixin/tasks',
  records: '/publish/weixin/records',
}

const activeTab = computed({
  get() {
    if (route.path.includes('/tasks')) return 'tasks'
    if (route.path.includes('/records')) return 'records'
    return 'accounts'
  },
  set() {},
})

function onTabChange(name: string | number) {
  router.push(tabPaths[String(name)] || tabPaths.accounts)
}
</script>

<style scoped>
.weixin-layout :deep(.el-tabs__header) {
  margin-bottom: 16px;
  background: #fff;
  padding: 0 16px;
  border-radius: 8px;
}
</style>
