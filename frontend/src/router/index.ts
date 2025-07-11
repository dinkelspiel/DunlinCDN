import { createRouter, createWebHistory } from 'vue-router'
import AuthUserProvider from './auth/AuthUserProvider.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/-',
      component: AuthUserProvider,
      children: [
        {
          path: '',
          name: 'teams',
          component: () => import('../views/Teams.vue'),
        },
        {
          path: ':team',
          name: 'team',
          component: () => import('../views/Team.vue'),
        },
        {
          path: ':team/:project',
          name: 'project',
          component: () => import('../views/Dashboard.vue'),
        },
      ],
    },
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('../views/auth/Login.vue'),
    },
    {
      path: '/setup',
      name: 'setup',
      component: () => import('../views/Setup.vue'),
    },
  ],
})

export default router
