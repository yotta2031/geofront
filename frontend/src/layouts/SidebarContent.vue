<template>
  <div class="sidebar-inner">
    <div class="logo">
      <img src="/favicon.svg" alt="logo" />
      <span>析探GEO</span>
    </div>
    <el-menu
      :default-active="activeMenu"
      router
      class="sidebar-menu"
      background-color="transparent"
      text-color="#4b4f57"
      active-text-color="#7c3aed"
      @select="onSelect"
    >
      <template v-for="route in menuRoutes">
        <el-menu-item v-if="!route.children" :key="route.path" :index="route.path">
          <el-icon><component :is="route.meta?.icon" /></el-icon>
          <span>{{ route.meta?.title }}</span>
        </el-menu-item>

        <el-sub-menu v-else :key="`sub-${route.path}`" :index="route.path">
          <template #title>
            <el-icon><component :is="route.meta?.icon" /></el-icon>
            <span>{{ route.meta?.title }}</span>
          </template>
          <el-menu-item
            v-for="child in route.children"
            :key="child.path"
            :index="child.path"
          >
            {{ child.meta?.title }}
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
    <div class="sidebar-footer">
      <span>v1.0.0</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const emit = defineEmits<{ navigate: [] }>()
const route = useRoute()
const activeMenu = computed(() => route.path)

const menuRoutes = computed(() => {
  const layout = route.matched.find((r) => r.path === '/')
  if (!layout) return []
  return layout.children?.filter((r) => r.meta?.title) || []
})

function onSelect() {
  emit('navigate')
}
</script>

<style scoped>
.sidebar-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 10px;
  border-bottom: 1px solid var(--app-border);
  flex-shrink: 0;
}

.logo img {
  width: 28px;
  height: 28px;
}

.logo span {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
  background: linear-gradient(135deg, #7c3aed, #a375f2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
  flex: 1;
  overflow-y: auto;
  padding: 8px 10px;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  height: 40px;
  line-height: 40px;
  border-radius: 8px;
  margin-bottom: 2px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--app-text-2);
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background: rgba(124, 58, 237, 0.06) !important;
  color: var(--el-color-primary) !important;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: rgba(124, 58, 237, 0.08) !important;
  color: var(--el-color-primary) !important;
  font-weight: 600;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  height: 36px;
  line-height: 36px;
  font-size: 13px;
  padding-left: 44px !important;
}

.sidebar-menu :deep(.el-icon) {
  font-size: 16px;
}

.sidebar-footer {
  padding: 12px 20px;
  font-size: 12px;
  color: var(--app-text-faint);
  border-top: 1px solid var(--app-border);
  text-align: center;
}
</style>
