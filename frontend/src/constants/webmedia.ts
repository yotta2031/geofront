export const FILTER_ALL = '不限'

export const INDUSTRIES = [
  FILTER_ALL, 'IT科技', '游戏网站', '财经商业', '汽车网站', '娱乐休闲', '新闻资讯',
  '健康医疗', '房产家居', '亲子母婴', '教育培训', '食品餐饮', '酒店旅游',
  '女性时尚', '生活消费', '公益', '体育运动', '工业贸易', '文化艺术',
  '套餐系列', '最新秒杀', '低价专区', '区块链', '其他',
]

export const PORTALS = [
  FILTER_ALL, '腾讯网', '新浪网', '网易网', '搜狐网', '凤凰网', '人民网', '央视网',
  '中国广播网', '中国新闻网', '新华网', '中国日报网', '光明网', '中国青年网',
  '环球网', '千龙网', '北青网', '中国经济网', '国际在线', '和讯网', '中国网',
  '中华网', '东方网', '大众网', '慧聪网', '垂直媒体', '海外媒体', '其他门户',
  '人民日报客户端', 'zaker号', '官方百家号', '荆楚网（湖北日报）',
]

export const REGIONS = [
  FILTER_ALL, '综合全国', '北京', '上海', '重庆', '天津', '海南', '广东', '广西',
  '湖南', '湖北', '福建', '江西', '浙江', '安徽', '江苏', '河南', '河北', '山东',
  '山西', '贵州', '四川', '青海', '西藏', '辽宁', '吉林', '陕西', '甘肃', '宁夏',
  '黑龙江', '内蒙古', '云南', '新疆', '港澳台',
]

export const ENTRY_LEVELS = [FILTER_ALL, '没有入口', '首页入口', '频道入口', '上级入口']
export const INDEX_WEB = [FILTER_ALL, '不包网页收录', '包网页收录']
export const INDEX_NEWS = [FILTER_ALL, '不包资讯收录', '包资讯收录']
export const LINK_TYPES = [FILTER_ALL, '不可带网址', '可带网址']
export const PUBLISH_SPEEDS = [FILTER_ALL, '1小时', '2小时', '12小时', '当日', '次日', '48小时以上']
export const SPECIAL_INDUSTRIES = [FILTER_ALL, '金融', '微商', '留学', '医疗', '加盟']

export const ADVANCED_OPTIONS = [
  { key: 'weekendPublish', label: '周末可发' },
  { key: 'holidayPublish', label: '节日可发' },
  { key: 'nightPublish', label: '晚上可发' },
  { key: 'hasTextLink', label: '文字链/焦点图' },
  { key: 'whitelistSource', label: '白名单来源' },
  { key: 'hasVideo', label: '可带视频' },
  { key: 'mobileMedia', label: '移动端媒体' },
  { key: 'longValidity', label: '时效3月以上' },
  { key: 'geoRankable', label: '可发GEO排名' },
] as const

export type AdvancedOptionKey = (typeof ADVANCED_OPTIONS)[number]['key']

export const PRICE_SORTS = [FILTER_ALL, '由低到高', '由高到低']

export function priceSortValue(label: string): 'asc' | 'desc' | undefined {
  if (label === '由低到高') return 'asc'
  if (label === '由高到低') return 'desc'
  return undefined
}
