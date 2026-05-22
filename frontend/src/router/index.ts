import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '控制台', icon: 'Odometer' }
      },
      {
        path: '/diagnosis',
        name: 'Diagnosis',
        component: () => import('@/views/diagnosis/index.vue'),
        meta: { title: 'AI诊断', icon: 'Search' }
      },
      {
        path: '/diagnosis/reports',
        name: 'DiagnosisReports',
        component: () => import('@/views/diagnosis/reports.vue'),
        meta: { title: '诊断报告', icon: 'Document' }
      },
      {
        path: '/article',
        name: 'Article',
        redirect: '/article/keywords',
        meta: { title: 'AI创作准备', icon: 'EditPen' },
        children: [
          {
            path: '/article/keywords',
            name: 'Keywords',
            component: () => import('@/views/article/keywords.vue'),
            meta: { title: '关键词管理' }
          },
          {
            path: '/article/types',
            name: 'ArticleTypes',
            component: () => import('@/views/article/types.vue'),
            meta: { title: '文章分类' }
          },
          {
            path: '/article/tasks',
            name: 'AiTasks',
            component: () => import('@/views/article/tasks.vue'),
            meta: { title: 'AI写作任务' }
          },
          {
            path: '/article/list',
            name: 'ArticleList',
            component: () => import('@/views/article/list.vue'),
            meta: { title: '文章列表' }
          }
        ]
      },
      {
        path: '/publish',
        name: 'Publish',
        redirect: '/publish/webmedia',
        meta: { title: '文章发布', icon: 'Promotion' },
        children: [
          {
            path: '/publish/webmedia',
            name: 'Webmedia',
            component: () => import('@/views/publish/webmedia/layout.vue'),
            meta: { title: '网站媒体' },
            children: [
              {
                path: '',
                name: 'WebmediaIndex',
                component: () => import('@/views/publish/webmedia/index.vue'),
                meta: { title: '媒体库' }
              },
              {
                path: 'single',
                name: 'WebmediaSingle',
                component: () => import('@/views/publish/webmedia/single.vue'),
                meta: { title: '单条发布' }
              },
              {
                path: 'tasks',
                name: 'WebmediaTasks',
                component: () => import('@/views/publish/webmedia/tasks.vue'),
                meta: { title: 'AI智能发布' }
              },
              {
                path: 'records',
                name: 'WebmediaRecords',
                component: () => import('@/views/publish/webmedia/records.vue'),
                meta: { title: '投稿记录' }
              },
              {
                path: 'favorites',
                name: 'WebmediaFavorites',
                component: () => import('@/views/publish/webmedia/favorites.vue'),
                meta: { title: '收藏分组' }
              }
            ]
          },
          {
            path: '/publish/zimedia',
            name: 'ZimediaPublish',
            component: () => import('@/views/publish/zimedia/layout.vue'),
            meta: { title: '自媒体大V' },
            children: [
              {
                path: '',
                name: 'ZimediaAccounts',
                component: () => import('@/views/publish/zimedia/accounts.vue'),
                meta: { title: '大V账号' }
              },
              {
                path: 'tasks',
                name: 'ZimediaTasks',
                component: () => import('@/views/publish/zimedia/tasks.vue'),
                meta: { title: '发布任务' }
              },
              {
                path: 'records',
                name: 'ZimediaRecords',
                component: () => import('@/views/publish/zimedia/records.vue'),
                meta: { title: '发布记录' }
              }
            ]
          },
          {
            path: '/publish/weixin',
            name: 'WeixinPublish',
            component: () => import('@/views/publish/weixin/layout.vue'),
            meta: { title: '个人自媒体' },
            children: [
              {
                path: '',
                name: 'WeixinAccounts',
                component: () => import('@/views/publish/weixin/accounts.vue'),
                meta: { title: '账号授权' }
              },
              {
                path: 'tasks',
                name: 'WeixinTasks',
                component: () => import('@/views/publish/weixin/tasks.vue'),
                meta: { title: '发布任务' }
              },
              {
                path: 'records',
                name: 'WeixinRecords',
                component: () => import('@/views/publish/weixin/records.vue'),
                meta: { title: '发布记录' }
              }
            ]
          },
          {
            path: '/publish/site',
            name: 'SitePublish',
            component: () => import('@/views/publish/site/layout.vue'),
            meta: { title: 'AI官网SEO' },
            children: [
              {
                path: '',
                name: 'SiteWebsites',
                component: () => import('@/views/publish/site/websites.vue'),
                meta: { title: '站点管理' }
              },
              {
                path: 'tasks',
                name: 'SiteTasks',
                component: () => import('@/views/publish/site/tasks.vue'),
                meta: { title: '发布任务' }
              },
              {
                path: 'records',
                name: 'SiteRecords',
                component: () => import('@/views/publish/site/records.vue'),
                meta: { title: '发布记录' }
              }
            ]
          }
        ]
      },
      {
        path: '/data',
        name: 'DataCenter',
        component: () => import('@/views/data/index.vue'),
        meta: { title: 'AI数据中心', icon: 'TrendCharts' }
      },
      {
        path: '/tools',
        name: 'Tools',
        component: () => import('@/views/tools/index.vue'),
        meta: { title: 'AI工具助手', icon: 'Tools' }
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', icon: 'User' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (!to.meta.public && !userStore.token) {
    next('/login')
  } else if (to.path === '/login' && userStore.token) {
    next('/')
  } else {
    next()
  }
})

export default router
