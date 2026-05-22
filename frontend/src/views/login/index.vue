<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-header">
        <img src="/favicon.svg" alt="logo" class="logo" />
        <h2>析探GEO智能优化系统</h2>
        <p>专业地理定向 SEO优化解决方案</p>
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
          <el-checkbox v-model="form.remember">记住我</el-checkbox>
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
        <el-link type="primary">用户协议</el-link>
        <span class="divider">|</span>
        <span>© 2026 析探GEO</span>
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
  padding: 16px;
  background: linear-gradient(168deg, #8788ff, #8b5fff, #326eff, #9ca7ff);
}

.login-box {
  width: 100%;
  max-width: 420px;
  padding: clamp(24px, 5vw, 40px);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.login-header h2 {
  font-size: clamp(18px, 4.5vw, 24px);
  color: #333;
  margin-bottom: 8px;
  line-height: 1.35;
  word-break: break-word;
}

.login-header p {
  font-size: 14px;
  color: #666;
}

.login-form {
  margin-top: 20px;
}

.login-btn {
  width: 100%;
  background: linear-gradient(135deg, #4b17d3, #8b5fff);
  border: none;
}

.login-btn:hover {
  background: linear-gradient(135deg, #3a12a8, #7a4de6);
}

.login-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: #999;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4px 8px;
}

.divider {
  margin: 0 8px;
}
</style>
