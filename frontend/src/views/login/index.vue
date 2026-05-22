<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-wrap">
            <img src="/favicon.svg" alt="logo" class="logo" />
          </div>
          <h2 class="login-title">析探 GEO</h2>
          <p class="login-subtitle">智能优化系统</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入账号"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="form.remember">记住我</el-checkbox>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <span>© 2026 析探 GEO</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const formRef = ref()

const form = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 100, message: '长度在 6 到 100 个字符', trigger: 'blur' }
  ]
}

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const success = await userStore.loginAction(form.username, form.password)
    if (success) {
      ElMessage.success('登录成功')
      router.push('/')
    }
  } catch (error) {
    // 错误已在 request 拦截器处理
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 80%;
  height: 150%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.login-container {
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
}

.login-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  padding: 40px 36px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-wrap {
  margin-bottom: 16px;
}

.logo {
  width: 56px;
  height: 56px;
  filter: drop-shadow(0 4px 12px rgba(124, 58, 237, 0.2));
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 6px;
  color: var(--app-text-1);
  letter-spacing: 1px;
}

.login-subtitle {
  font-size: 13px;
  color: var(--app-text-muted);
  margin: 0;
  letter-spacing: 0.5px;
}

.login-form {
  margin-top: 8px;
}

.login-options {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 12px;
  color: var(--app-text-muted);
}

@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
  }

  .login-title {
    font-size: 22px;
  }
}
</style>
