import api from './request'

export function getDiagnosisList(params?: any) {
  return api.get('/diagnosis', { params })
}

export function createDiagnosis(data: any) {
  return api.post('/diagnosis', data)
}

export function getDiagnosisDetail(id: string) {
  return api.get(`/diagnosis/${id}`)
}
