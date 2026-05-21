import api from './request'

export function login(data: { username: string; password: string }) {
  return api.post('/auth/login', data)
}

export function register(data: { username: string; password: string; nickname?: string }) {
  return api.post('/auth/register', data)
}

export function getUserInfo() {
  return api.get('/users/me')
}

export function refreshToken() {
  return api.post('/auth/refresh')
}
