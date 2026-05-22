import api from './request'

export function getSiteWebsites(params?: { page?: number; pageSize?: number }) {
  return api.get('/site/websites', { params })
}

export function createSiteWebsite(data: {
  siteName: string
  siteUrl: string
  cmsType?: string
  apiEndpoint?: string
  apiKey?: string
  sitemapUrl?: string
  maxDailyPublish?: number
  remark?: string
}) {
  return api.post('/site/websites', data)
}

export function updateSiteWebsite(id: number, data: Record<string, unknown>) {
  return api.put(`/site/websites/${id}`, data)
}

export function toggleSitePublish(id: number, enabled: boolean) {
  return api.patch(`/site/websites/${id}/publish-enabled`, { enabled })
}

export function testSiteConnection(id: number) {
  return api.post(`/site/websites/${id}/test-connection`)
}

export function deleteSiteWebsites(ids: number[]) {
  return api.delete('/site/websites', { data: { ids } })
}

export function getSiteTasks(params?: { page?: number; pageSize?: number }) {
  return api.get('/site/tasks', { params })
}

export function createSiteTask(data: {
  name: string
  articleIds: number[]
  siteIds: number[]
  publishType?: string
  scheduledAt?: string
}) {
  return api.post('/site/tasks', data)
}

export function getSiteRecords(params?: {
  page?: number
  pageSize?: number
  status?: string
  siteId?: number
}) {
  return api.get('/site/records', { params })
}

export function publishToSite(data: {
  articleIds: number[]
  siteIds: number[]
  publishType?: string
  scheduledAt?: string
}) {
  return api.post('/site/publish', data)
}
