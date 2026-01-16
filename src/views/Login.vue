<template>
 <!-- <Navbar /> -->
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
      <div class="divider">
        <span>OR</span>
      </div>

      <!-- Google Login -->
      <div id="google-signin-button"></div>
    </div>
  </div>
  <!-- <Footer /> -->
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { loginUser } from "../api/auth";
import { useAuthStore } from "../stores/auth";
import { useCheckoutStore } from "../stores/checkout";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const checkoutStore = useCheckoutStore();
const email = ref("");
const password = ref("");
const errors = reactive({
  email: "",
  password: "",
});
const CLIENT_ID =
  "1077657055518-gk07ahsvifmeb7ruq5kainl6j9mj49gd.apps.googleusercontent.com";
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
  const success_login = authStore.login(email.value, password.value);

  if (checkoutStore.pendingOrder) {
    checkoutStore.confirmOrder();
  }

  if (success_login) {
    router.push("/");
  } else {
    alert("Invalid credentials");
  }
}
onMounted(async () => {
  try {
    await authStore.initGoogleLogin(
      CLIENT_ID,
      document.getElementById("google-signin-button")
    );
    
    // Listen for successful Google sign-in
    window.addEventListener('google-signin-success', () => {
      if (checkoutStore.pendingOrder) {
        checkoutStore.confirmOrder();
      }
      router.push("/");
    });
  } catch (error) {
    console.error("Google Sign-In initialization failed:", error);
    const el = document.getElementById("google-signin-button");
    if (el) {
      el.innerHTML = `
        <button disabled style="opacity:0.6; width: 100%; padding: 10px;">
          Google Sign-In unavailable
        </button>
      `;
    }
  }
});
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
.login:hover {
  background: #4338ca;
}

#google-signin-button {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

#google-signin-button > div {
  width: 100% !important;
}
</style>

