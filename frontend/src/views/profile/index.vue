<template>
  <div class="profile-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">个人中心</h1>
        <p class="page-subtitle">管理账户信息与会员权益</p>
      </div>
    </header>

    <el-row :gutter="16">
      <el-col :xs="24" :md="8">
        <section class="panel user-card">
          <div class="user-avatar-wrap">
            <div class="user-avatar">{{ avatarChar }}</div>
          </div>
          <h3 class="user-name">{{ userStore.nickname || userStore.username }}</h3>
          <p class="user-role">普通会员</p>
          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-value">{{ userStore.score }}</div>
              <div class="stat-label">剩余点数</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value">¥{{ userStore.balance }}</div>
              <div class="stat-label">账户余额</div>
            </div>
          </div>
        </section>
      </el-col>

      <el-col :xs="24" :md="16" class="mt-4 mt-lg-0">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">个人设置</h2>
              <p class="panel-desc">修改昵称、邮箱等基本信息</p>
            </div>
          </div>
          <el-form :model="form" label-width="100px" class="profile-form">
            <el-form-item label="昵称">
              <el-input v-model="form.nickname" placeholder="请输入昵称" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="手机">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveProfile" :loading="saving">保存</el-button>
            </el-form-item>
          </el-form>
        </section>

        <section class="panel mt-4">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">会员信息</h2>
              <p class="panel-desc">当前会员等级与权益详情</p>
            </div>
          </div>
          <div class="member-grid">
            <div class="member-item">
              <span class="member-label">会员等级</span>
              <span class="member-value">普通会员</span>
            </div>
            <div class="member-item">
              <span class="member-label">有效期</span>
              <span class="member-value">2027-01-15</span>
            </div>
            <div class="member-item">
              <span class="member-label">存储空间</span>
              <span class="member-value">304M / 1000M</span>
            </div>
            <div class="member-item">
              <span class="member-label">会员状态</span>
              <span class="member-badge">
                <span class="badge-dot"></span>
                正常
              </span>
            </div>
          </div>
        </section>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const saving = ref(false)

const avatarChar = computed(() => {
  const name = userStore.nickname || userStore.username || ''
  return name.charAt(0).toUpperCase() || 'U'
})

const form = reactive({
  nickname: '',
  email: '',
  phone: ''
})

async function saveProfile() {
  saving.value = true
  try {
    // TODO: 调用更新API
    ElMessage.success('保存成功')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (userStore.userInfo) {
    form.nickname = userStore.userInfo.nickname || ''
    form.email = userStore.userInfo.email || ''
    form.phone = userStore.userInfo.phone || ''
  }
})
</script>

<style scoped>
.user-card {
  text-align: center;
  padding: 28px 20px;
}

.user-avatar-wrap {
  margin-bottom: 16px;
}

.user-avatar {
  width: 72px;
  height: 72px;
  margin: 0 auto;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7c3aed, #a375f2);
  color: #fff;
  font-size: 28px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.2);
}

.user-name {
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 6px;
  color: var(--app-text-1);
}

.user-role {
  font-size: 13px;
  color: var(--app-text-muted);
  margin: 0 0 20px;
}

.user-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--app-border);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-color-primary);
  font-feature-settings: 'tnum';
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--app-text-muted);
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--app-border);
}

.profile-form {
  max-width: 560px;
}

.member-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.member-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  background: #fafafd;
  border: 1px solid var(--app-border);
  border-radius: 10px;
}

.member-label {
  font-size: 12px;
  color: var(--app-text-muted);
}

.member-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--app-text-1);
}

.member-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #047857;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--app-success);
}

@media (max-width: 768px) {
  .member-grid {
    grid-template-columns: 1fr;
  }
}
</style>
