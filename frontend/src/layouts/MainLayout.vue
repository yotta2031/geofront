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
          <el-breadcrumb class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute.meta?.title">
              {{ currentRoute.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <div class="header-tags">
            <el-tag type="warning" effect="plain" size="small">
              点数: {{ userStore.score }}
            </el-tag>
            <el-tag type="success" effect="plain" size="small">
              余额: ¥{{ userStore.balance }}
            </el-tag>
          </div>
          <el-dropdown class="user-dropdown">
            <span class="el-dropdown-link">
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
  background: linear-gradient(180deg, #f8f9ff 0%, #f0f2ff 100%);
  border-right: 1px solid #e4e7ed;
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
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 0 16px;
  height: 56px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.menu-btn {
  flex-shrink: 0;
}

.breadcrumb {
  min-width: 0;
  overflow: hidden;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.header-tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-dropdown {
  cursor: pointer;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  font-size: 14px;
}

.user-name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.main-content {
  background: #f6f6f6;
  padding: 16px;
  overflow-x: hidden;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
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
    padding: 12px;
  }

  :deep(.el-breadcrumb) {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .breadcrumb :deep(.el-breadcrumb__item:first-child) {
    display: none;
  }
}
</style>
