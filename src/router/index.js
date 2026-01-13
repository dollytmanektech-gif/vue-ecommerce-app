import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import About from '../views/About-Us.vue'
import Product from '../views/Products.vue'
import { isAuthenticated } from '../api/auth'
import ProductDetails from '../views/ProductDetails.vue'

const routes = [
  { path: '/', component: Dashboard, },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  {
    path:'/about',
    component:About,
  },
  {
    path:'/products',
    component:Product
  },
  {
     path: '/products/:id',
     component: ProductDetails
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Back/forward navigation
    if (savedPosition) {
      return savedPosition
    }

    // Always scroll to top on route change
    return { top: 0 }
  }
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
