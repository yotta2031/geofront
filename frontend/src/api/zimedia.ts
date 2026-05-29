import api from './request'

export function getZimediaAccounts(params?: { page?: number; pageSize?: number }) {
  return api.get('/zimedia/accounts', { params })
}

export function createZimediaAccount(data: {
  accountName: string
  platform: string
  avatar?: string
  fansCount?: number
  category?: string
  quotePrice?: number
  maxDailyPublish?: number
  proxyIpPort?: string
  proxyAuth?: string
  remark?: string
}) {
  return api.post('/zimedia/accounts', data)
}

export function updateZimediaAccount(id: number, data: Record<string, unknown>) {
  return api.put(`/zimedia/accounts/${id}`, data)
}

export function toggleZimediaPublish(id: number, enabled: boolean) {
  return api.patch(`/zimedia/accounts/${id}/publish-enabled`, { enabled })
}

export function deleteZimediaAccounts(ids: number[]) {
  return api.delete('/zimedia/accounts', { data: { ids } })
}

export function getZimediaTasks(params?: { page?: number; pageSize?: number }) {
  return api.get('/zimedia/tasks', { params })
}

export function createZimediaTask(data: {
  name: string
  articleIds: number[]
  accountIds: number[]
  publishType?: string
  scheduledAt?: string
}) {
  return api.post('/zimedia/tasks', data)
}

export function getZimediaRecords(params?: {
  page?: number
  pageSize?: number
  status?: string
  platform?: string
}) {
  return api.get('/zimedia/records', { params })
}

export function publishToZimedia(data: {
  articleIds: number[]
  accountIds: number[]
  publishType?: string
  scheduledAt?: string
}) {
  return api.post('/zimedia/publish', data)
}
