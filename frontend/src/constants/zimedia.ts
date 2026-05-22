export const ZIMEDIA_CATEGORIES = [
  '教育', '科技', '美妆', '财经', '生活', '母婴', '汽车', '其他',
] as const

export const COOP_STATUS_MAP: Record<string, { label: string; type: '' | 'success' | 'warning' | 'danger' | 'info' }> = {
  active: { label: '合作中', type: 'success' },
  paused: { label: '暂停', type: 'warning' },
  ended: { label: '已结束', type: 'info' },
}
