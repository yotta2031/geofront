<template>
  <div class="profile-page">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="user-info">
            <el-avatar :size="80" :src="userStore.avatar || defaultAvatar" />
            <h3>{{ userStore.nickname || userStore.username }}</h3>
            <p class="user-role">普通会员</p>
            <el-divider />
            <div class="user-stats">
              <div class="stat-item">
                <div class="stat-value">{{ userStore.score }}</div>
                <div class="stat-label">剩余点数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">¥{{ userStore.balance }}</div>
                <div class="stat-label">账户余额</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>个人设置</span>
            </div>
          </template>
          <el-form :model="form" label-width="100px">
            <el-form-item label="昵称">
              <el-input v-model="form.nickname" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="form.email" />
            </el-form-item>
            <el-form-item label="手机">
              <el-input v-model="form.phone" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveProfile" :loading="saving">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="hover" class="mt-4">
          <template #header>
            <div class="card-header">
              <span>会员信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="会员等级">普通会员</el-descriptions-item>
            <el-descriptions-item label="有效期">2027-01-15</el-descriptions-item>
            <el-descriptions-item label="存储空间">304M / 1000M</el-descriptions-item>
            <el-descriptions-item label="会员状态">
              <el-tag type="success">正常</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const saving = ref(false)
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

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
  // 初始化表单数据
  if (userStore.userInfo) {
    form.nickname = userStore.userInfo.nickname || ''
    form.email = userStore.userInfo.email || ''
    form.phone = userStore.userInfo.phone || ''
  }
})
</script>

<style scoped>
.user-info {
  text-align: center;
  padding: 20px 0;
}

.user-info h3 {
  margin: 16px 0 8px;
  font-size: 18px;
}

.user-role {
  color: #999;
  font-size: 14px;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #4b17d3;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mt-4 {
  margin-top: 20px;
}
</style>