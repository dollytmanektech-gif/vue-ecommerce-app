import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import About from '../views/About-Us.vue'
import Checkout from '../views/checkout.vue'
import Product from '../views/products.vue'
import { isAuthenticated } from '../api/auth'

const routes = [
  { path: '/', component: Dashboard, },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  {
    path: '/dashboard',
    component: Dashboard,
  },
  {
    path:'/about',
    component:About,
  },
  {
    path:'/products',
    component:Product
  },
   {
    path: '/checkout',
    component: Checkout,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

export default router
