<template>
  <nav class="navbar">
    <h3>Vue E-commerce Platform</h3>
    <ul class="nav-links">
      <li>
        <router-link to="/" class="link" active-class="active"
          >Home</router-link
        >
      </li>
      <li>
        <router-link to="/about" class="link" active-class="active"
          >About</router-link
        >
      </li>
      <li>
        <router-link to="/products" class="link" active-class="active"
          >Products</router-link
        >
      </li>
      <!-- CART -->
      <li class="cart-link">
        <router-link to="/cart" class="link cart">
          Cart
          <span v-if="cartCount > 0" class="cart-badge">
            {{ cartCount }}
          </span>
        </router-link>
      </li>
      <li v-if="isAuthenticated" class="dropdown">
        <span class="dropdown-trigger"> My Profile </span>

        <ul class="dropdown-menu">
            <router-link to="/orders">My Orders</router-link>
          </li>
          <li>
            <button class="logout-btn" @click="logout">Logout</button>
          </li>
        </ul>
      </li>
      <li class="cart-link" v-if="!isAuthenticated">
        <router-link to="/login" class="link cart">
          Login
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useCart } from "../composables/useCart";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const router = useRouter();
const isAuthenticated = computed(() => authStore.isAuthenticated);

const { cart } = useCart();

const cartCount = computed(() =>
  cart.value.reduce((total, item) => total + item.quantity, 0)
);

function logout() {
  authStore.logout()
}
</script>


