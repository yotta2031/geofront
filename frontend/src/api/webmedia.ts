import api from './request'

export interface WebMediaFilters {
  keyword?: string
  industry?: string
  portal?: string
  region?: string
  entryLevel?: string
  indexWeb?: string
  indexNews?: string
  linkType?: string
  publishSpeed?: string
  specialIndustry?: string
  weekendPublish?: boolean
  holidayPublish?: boolean
  nightPublish?: boolean
  hasTextLink?: boolean
  whitelistSource?: boolean
  hasVideo?: boolean
  mobileMedia?: boolean
  longValidity?: boolean
  geoRankable?: boolean
  priceSort?: 'asc' | 'desc'
  groupId?: number
  page?: number
  pageSize?: number
}

function buildParams(filters: WebMediaFilters) {
  const p: Record<string, string | number> = {}
  Object.entries(filters).forEach(([k, v]) => {
    if (v === undefined || v === '' || v === '不限') return
    if (typeof v === 'boolean') {
      if (v) p[k] = '1'
    } else {
      p[k] = v as string | number
    }
  })
  return p
}

export function getWebMediaList(filters: WebMediaFilters) {
  return api.get('/webmedia/media', { params: buildParams(filters) })
}

export function getWebMediaDetail(id: number) {
  return api.get(`/webmedia/media/${id}`)
}

export function toggleWebMediaFavorite(mediaId: number, groupId?: number) {
  return api.post('/webmedia/favorites/toggle', { mediaId, groupId })
}

export function getFavoriteGroups() {
  return api.get('/webmedia/favorite-groups')
}

export function createFavoriteGroup(name: string) {
  return api.post('/webmedia/favorite-groups', { name })
}

export function deleteFavoriteGroup(id: number) {
  return api.delete(`/webmedia/favorite-groups/${id}`)
}

export function submitWebMedia(data: {
  mediaId: number
  articleId?: number
  title: string
  content?: string
}) {
  return api.post('/webmedia/submit', data)
}

export function getSubmissions(params?: { page?: number; pageSize?: number; status?: string }) {
  return api.get('/webmedia/submissions', { params })
}

export function getWebMediaTasks(params?: { page?: number; pageSize?: number }) {
  return api.get('/webmedia/tasks', { params })
}

export function createWebMediaTask(data: {
  name: string
  articleIds: number[]
  mediaIds: number[]
  publishType?: string
  scheduledAt?: string
}) {
  return api.post('/webmedia/tasks', data)
}

export function publishToWebmedia(data: {
  articleIds: number[]
  mediaIds: number[]
  publishType?: string
  scheduledAt?: string
}) {
  return api.post('/webmedia/publish', data)
}
