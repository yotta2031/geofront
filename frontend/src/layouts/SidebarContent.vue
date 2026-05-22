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
      text-color="#333"
      active-text-color="#4b17d3"
      @select="onSelect"
    >
      <template v-for="route in menuRoutes" :key="route.path">
        <el-menu-item v-if="!route.children" :index="route.path">
          <el-icon><component :is="route.meta?.icon" /></el-icon>
          <span>{{ route.meta?.title }}</span>
        </el-menu-item>

        <el-sub-menu v-else :index="route.path">
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
  padding: 0 16px;
  gap: 10px;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.logo img {
  width: 32px;
  height: 32px;
}

.logo span {
  font-size: 17px;
  font-weight: 600;
  background: linear-gradient(135deg, #4b17d3, #8b5fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
  flex: 1;
  overflow-y: auto;
}
</style>
