<template>
  <div class="auth-container">
    <div class="card">
      <h2>Login</h2>

      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="password" />

      <button @click="login">Login</button>
      <p v-if="error" style="color:red">{{ error }}</p>

      <p class="link-text">
        Don’t have an account?
        <router-link to="/register" class="link">
          Register yourself
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { loginUser } from '../api/auth'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')

function login() {
  const success = loginUser(email.value, password.value)

  if (success) {
    localStorage.setItem('isAuthenticated', 'true')

    // 🔥 Redirect back to intended page
    const redirectTo = route.query.redirect || '/dashboard'
    router.push(redirectTo)
  } else {
    error.value = 'Invalid credentials'
  }
}
</script>

