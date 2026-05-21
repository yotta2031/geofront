import api from './request'

export function publishToWebmedia(data: any) {
  return api.post('/publish/webmedia', data)
}

export function publishToZimedia(data: any) {
  return api.post('/publish/zimedia', data)
}

export function publishToWeixin(data: any) {
  return api.post('/publish/weixin', data)
}

export function publishToSite(data: any) {
  return api.post('/publish/site', data)
}

export function getPublishRecords(params?: any) {
  return api.get('/publish/records', { params })
}
