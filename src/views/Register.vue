<template>
<Navbar />
  <div class="auth-container">
    <div class="card">
      <h2>Register</h2>

      <input v-model="name" placeholder="Name" />

      <input v-model="email" placeholder="Email" @blur="validateEmail" />
      <p v-if="errors.email" class="error">{{ errors.email }}</p>

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        @blur="validatePassword"
      />
      <p v-if="errors.password" class="error">{{ errors.password }}</p>

      <button @click="register" class="register" :disabled="hasErrors">
        Register
      </button>

      <p class="link-text">
        Already have an account?
        <router-link to="/login" class="link-text"> Go to Login </router-link>
      </p>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const name = ref("");
const email = ref("");
const password = ref("");

const errors = reactive({
  email: "",
  password: "",
});

const validateEmail = () => {
  if (!email.value) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = "Please enter a valid email address";
  } else {
    errors.email = "";
  }
};

const validatePassword = () => {
  if (!password.value) {
    errors.password = "Password is required";
  } else if (password.value.length < 6) {
    errors.password = "Password must be at least 6 characters";
  } else {
    errors.password = "";
  }
};

const hasErrors = computed(() => {
  return Boolean(errors.email || errors.password);
});

function register() {
  validateEmail();
  validatePassword();

  if (hasErrors.value) return;

  const success = authStore.register({
    name: name.value,
    email: email.value,
    password: password.value,
  });

  if (success) {
    const redirectTo = route.query.redirect || "/";
    router.push(redirectTo);
  }
}
</script>

<style scoped>
.register {
  width: 108%;
}
.error {
  color: #e63946;
  font-size: 12px;
  margin: 4px 0 10px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.register:hover {
  background: #4338ca;
}
</style>

