import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getUserInfo } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<any>(null)
  
  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')
  const nickname = computed(() => userInfo.value?.nickname || '')
  const avatar = computed(() => userInfo.value?.avatar || '')
  const score = computed(() => userInfo.value?.score || 0)
  const balance = computed(() => userInfo.value?.balance || 0)
  
  // Actions
  async function loginAction(username: string, password: string) {
    const res = await login({ username, password })
    if (res.code === 1) {
      token.value = res.data.token
      localStorage.setItem('token', res.data.token)
      await fetchUserInfo()
      return true
    }
    return false
  }
  
  async function fetchUserInfo() {
    const res = await getUserInfo()
    if (res.code === 1) {
      userInfo.value = res.data
      return res.data
    }
    return null
  }
  
  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }
  
  return {
    token,
    userInfo,
    isLoggedIn,
    username,
    nickname,
    avatar,
    score,
    balance,
    loginAction,
    fetchUserInfo,
    logout
  }
})
