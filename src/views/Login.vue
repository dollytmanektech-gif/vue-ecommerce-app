<template>
  <div class="auth-container">
    <div class="card">
      <h2>Login</h2>

      <input v-model="email" placeholder="Email" @blur="validateEmail" />
      <p v-if="errors.email" class="error">{{ errors.email }}</p>
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        @blur="validatePassword"
      />
      <p v-if="errors.password" class="error">{{ errors.password }}</p>

      <button @click="login" class="login" :disabled="hasErrors">Login</button>
      <p v-if="error" style="color: red">{{ error }}</p>

      <p class="link-text">
        Don’t have an account?
        <router-link to="/register" class="link-text">
          Register yourself
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { loginUser } from "../api/auth";

const router = useRouter();
const route = useRoute();

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

function login() {
  localStorage.setItem("isAuthenticated", "true");

  if (localStorage.getItem("pendingOrder")) {
    localStorage.removeItem("pendingOrder");
    alert("✅ Your order is confirmed!");
    router.push("/");
  } else {
    router.push("/");
  }
}
</script>
<style scoped>
.login {
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

</style>

