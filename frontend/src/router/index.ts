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
            component: () => import('@/views/publish/webmedia.vue'),
            meta: { title: '网站媒体' }
          },
          {
            path: '/publish/zimedia',
            name: 'Zimedia',
            component: () => import('@/views/publish/zimedia.vue'),
            meta: { title: '自媒体大V' }
          },
          {
            path: '/publish/weixin',
            name: 'WeixinPublish',
            component: () => import('@/views/publish/weixin.vue'),
            meta: { title: '个人自媒体' }
          },
          {
            path: '/publish/site',
            name: 'SitePublish',
            component: () => import('@/views/publish/site.vue'),
            meta: { title: 'AI官网SEO' }
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
