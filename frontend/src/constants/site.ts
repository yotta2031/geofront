export const SITE_CMS_TYPES = [
  'WordPress', '帝国CMS', '易优CMS', '织梦CMS', '自定义API', '其他',
] as const

export const CONNECT_STATUS_MAP: Record<
  string,
  { label: string; type: '' | 'success' | 'warning' | 'danger' | 'info' }
> = {
  connected: { label: '已连接', type: 'success' },
  pending: { label: '待配置', type: 'warning' },
  error: { label: '连接失败', type: 'danger' },
}

export const CMS_TAG_TYPE: Record<string, '' | 'success' | 'warning' | 'danger' | 'info'> = {
  WordPress: 'success',
  帝国CMS: 'warning',
  易优CMS: 'info',
  织梦CMS: 'info',
  自定义API: 'danger',
  其他: 'info',
}
