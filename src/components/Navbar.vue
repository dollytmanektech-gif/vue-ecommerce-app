<template>
  <nav class="navbar">
    <h3>Vue E-commerce Platform</h3>
     <ul class="nav-links">
      <li>
        <router-link to="/dashboard" class="link" active-class="active">Home</router-link>
      </li>
      <li>
        <router-link to="/about" class="link" active-class="active">About</router-link>
      </li>
      <li>
        <router-link to="/products" class="link" active-class="active">Products</router-link>
      </li>
    </ul>
    <button v-if="isAuthenticated" @click="logout">
      Logout
    </button>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isAuthenticated = ref(false)

onMounted(() => {
  isAuthenticated.value = !!localStorage.getItem('isAuthenticated')
})

function logout() {
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>


