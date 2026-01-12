<template>
  <div class="auth-container">
    <div class="card">
      <h2>Register</h2>

      <input v-model="name" placeholder="Name" />
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />

      <button @click="register">Register</button>

      <p class="link-text">
       Already have an account?
        <router-link to="/login" class="link">
          Go to Login
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { registerUser } from '../api/auth'

const router = useRouter()
const route = useRoute()

const name = ref('')
const email = ref('')
const password = ref('')

function register() {
  const success = registerUser({
    name: name.value,
    email: email.value,
    password: password.value
  })

  if (success) {
    // 🔐 Mark user as logged in
    localStorage.setItem('isAuthenticated', 'true')

    // 🔁 Redirect to intended page or dashboard
    const redirectTo = route.query.redirect || '/dashboard'
    router.push(redirectTo)
  }
}
</script>

