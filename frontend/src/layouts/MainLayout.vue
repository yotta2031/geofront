<template>
  <el-container class="main-layout">
    <!-- 桌面侧边栏 -->
    <el-aside v-if="!isMobile" width="220px" class="sidebar">
      <SidebarContent />
    </el-aside>

    <el-container class="main-container">
      <el-header class="header">
        <div class="header-left">
          <el-button
            v-if="isMobile"
            class="menu-btn"
            :icon="Expand"
            circle
            @click="drawerVisible = true"
          />
          <el-breadcrumb class="breadcrumb" separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute.meta?.title">
              {{ currentRoute.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <div class="header-tags">
            <span class="header-chip">
              <span class="chip-dot chip-dot--warn"></span>
              <span class="chip-label">点数</span>
              <span class="chip-value">{{ userStore.score }}</span>
            </span>
            <span class="header-chip">
              <span class="chip-dot chip-dot--ok"></span>
              <span class="chip-label">余额</span>
              <span class="chip-value">¥{{ userStore.balance }}</span>
            </span>
          </div>
          <el-dropdown class="user-dropdown">
            <span class="el-dropdown-link">
              <span class="user-avatar">{{ avatarChar }}</span>
              <span class="user-name">{{ userStore.nickname || userStore.username }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/profile')">
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>

    <!-- 移动端抽屉菜单 -->
    <el-drawer
      v-model="drawerVisible"
      direction="ltr"
      size="260px"
      :with-header="false"
      class="mobile-drawer"
    >
      <div class="sidebar drawer-sidebar">
        <SidebarContent @navigate="drawerVisible = false" />
      </div>
    </el-drawer>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { ArrowDown, Expand } from '@element-plus/icons-vue'
import SidebarContent from './SidebarContent.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { isMobile } = useBreakpoint()
const drawerVisible = ref(false)

const currentRoute = computed(() => route)

const avatarChar = computed(() => {
  const name = userStore.nickname || userStore.username || ''
  return name.charAt(0).toUpperCase() || 'U'
})

watch(() => route.path, () => {
  drawerVisible.value = false
})

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

.main-container {
  min-width: 0;
  flex: 1;
}

.sidebar {
  background: #fbfbfd;
  border-right: 1px solid var(--app-border);
  flex-shrink: 0;
}

.drawer-sidebar {
  height: 100%;
  border-right: none;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #fff;
  border-bottom: 1px solid var(--app-border);
  padding: 0 20px;
  height: 56px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.menu-btn {
  flex-shrink: 0;
}

.breadcrumb {
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
}

.breadcrumb :deep(.el-breadcrumb__inner) {
  color: var(--app-text-3);
  font-weight: 400;
}

.breadcrumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--app-text-1);
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.header-tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--app-border);
  border-radius: 999px;
  font-size: 12px;
  background: #fff;
  color: var(--app-text-3);
}

.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.chip-dot--warn {
  background: var(--app-warning);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.12);
}

.chip-dot--ok {
  background: var(--app-success);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}

.chip-label {
  color: var(--app-text-muted);
}

.chip-value {
  color: var(--app-text-1);
  font-weight: 500;
  font-feature-settings: 'tnum';
}

.user-dropdown {
  cursor: pointer;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--app-text-2);
  font-size: 13px;
  outline: none;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7c3aed, #a375f2);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.user-name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  color: var(--app-text-1);
}

.main-content {
  background: var(--app-bg);
  padding: 20px;
  overflow-x: hidden;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .header {
    padding: 0 12px;
  }

  .header-tags {
    display: none;
  }

  .user-name {
    max-width: 72px;
  }

  .main-content {
    padding: 14px;
  }

  :deep(.el-breadcrumb) {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .breadcrumb :deep(.el-breadcrumb__item:first-child) {
    display: none;
  }
}
</style>
