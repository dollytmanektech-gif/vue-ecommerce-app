<template>
  <nav class="navbar">
    <h3>Vue E-commerce Platform</h3>
     <ul class="nav-links">
      <li>
        <router-link to="/" class="link" active-class="active">Home</router-link>
      </li>
      <li>
        <router-link to="/about" class="link" active-class="active">About</router-link>
      </li>
      <li>
        <router-link to="/products" class="link" active-class="active">Products</router-link>
      </li>
      <!-- CART -->
      <li class="cart-link">
        <router-link to="/cart" class="link cart">
          🛒 Cart
          <span v-if="cartCount > 0" class="cart-badge">
            {{ cartCount }}
          </span>
        </router-link>
      </li>
    </ul>
    <button v-if="isAuthenticated" @click="logout">
      Logout
    </button>
  </nav>
</template>

<script setup>
import { ref, onMounted,computed  } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '../composables/useCart'

const router = useRouter()
const isAuthenticated = ref(false)

const { cart } = useCart()

const cartCount = computed(() =>
  cart.value.reduce((total, item) => total + item.quantity, 0)
)

onMounted(() => {
  isAuthenticated.value = !!localStorage.getItem('isAuthenticated')
})

function logout() {
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>


