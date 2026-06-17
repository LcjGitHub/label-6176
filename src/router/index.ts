import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('@/views/StatsView.vue'),
    },
    {
      path: '/wishlist',
      name: 'wishlist',
      component: () => import('@/views/WishlistView.vue'),
    },
    {
      path: '/borrow',
      name: 'borrow',
      component: () => import('@/views/BorrowView.vue'),
    },
    {
      path: '/species/:id',
      name: 'species-detail',
      component: () => import('@/views/SpeciesDetailView.vue'),
    },
    {
      path: '/timeline',
      name: 'timeline',
      component: () => import('@/views/TimelineView.vue'),
    },
  ],
})

export default router
