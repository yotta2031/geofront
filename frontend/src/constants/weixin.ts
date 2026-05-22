export const WEIXIN_PLATFORMS = [
  '头条号', '搜狐', '小红书', '公众号', '知乎', '抖音', '微博', '百家号',
] as const

export const PLATFORM_TAG_TYPE: Record<string, '' | 'success' | 'warning' | 'danger' | 'info'> = {
  头条号: 'warning',
  搜狐: 'danger',
  小红书: 'danger',
  公众号: 'success',
  知乎: 'info',
  抖音: 'warning',
  微博: 'danger',
  百家号: 'warning',
}
