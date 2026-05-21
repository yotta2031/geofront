import api from './request'

export function getKeywordIndex(keyword: string) {
  return api.get('/tools/zhishu', { params: { keyword } })
}

export function getExpandWords(keyword: string) {
  return api.get('/tools/tuoci', { params: { keyword } })
}

export function manualExpandWords(data: any) {
  return api.post('/tools/tuoci/manual', data)
}
