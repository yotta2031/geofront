import api from './request'

export function getDeviceAuthCode() {
  return api.get('/weixin/device-auth')
}

export function refreshDeviceAuthCode() {
  return api.post('/weixin/device-auth/refresh')
}

export function getWeixinAccounts(params?: { page?: number; pageSize?: number }) {
  return api.get('/weixin/accounts', { params })
}

export function createWeixinAccount(data: {
  accountName: string
  platform: string
  avatar?: string
  platformUid?: string
  fansCount?: number
  maxDailyPublish?: number
  proxyIpPort?: string
  proxyAuth?: string
  remark?: string
}) {
  return api.post('/weixin/accounts', data)
}

export function updateWeixinAccount(id: number, data: Record<string, unknown>) {
  return api.put(`/weixin/accounts/${id}`, data)
}

export function toggleWeixinPublish(id: number, enabled: boolean) {
  return api.patch(`/weixin/accounts/${id}/publish-enabled`, { enabled })
}

export function deleteWeixinAccounts(ids: number[]) {
  return api.delete('/weixin/accounts', { data: { ids } })
}

export function getWeixinTasks(params?: { page?: number; pageSize?: number }) {
  return api.get('/weixin/tasks', { params })
}

export function createWeixinTask(data: {
  name: string
  articleIds: number[]
  accountIds: number[]
  publishType?: string
  scheduledAt?: string
}) {
  return api.post('/weixin/tasks', data)
}

export function getWeixinRecords(params?: {
  page?: number
  pageSize?: number
  status?: string
  platform?: string
}) {
  return api.get('/weixin/records', { params })
}

export function publishToWeixin(data: {
  articleIds: number[]
  accountIds: number[]
  publishType?: string
  scheduledAt?: string
}) {
  return api.post('/weixin/publish', data)
}
