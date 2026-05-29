import api from './request'

export function getKeywords(params?: any) {
  return api.get('/articles/keywords', { params })
}

export function createKeyword(data: any) {
  return api.post('/articles/keywords', data)
}

export function updateKeyword(id: number, data: any) {
  return api.put(`/articles/keywords/${id}`, data)
}

export function deleteKeyword(id: number) {
  return api.delete(`/articles/keywords/${id}`)
}

export function getArticleTypes(params?: any) {
  return api.get('/articles/types', { params })
}

export function createArticleType(data: any) {
  return api.post('/articles/types', data)
}

export function getAiTasks(params?: any) {
  return api.get('/articles/tasks', { params })
}

export function createAiTask(data: any) {
  return api.post('/articles/tasks', data)
}

export function getArticles(params?: any) {
  return api.get('/articles', { params })
}

export function getArticleDetail(id: string) {
  return api.get(`/articles/${id}`)
}
