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
          <li>
            <router-link to="/wishlist" class="wishlist-link">
              Wishlist
              <span v-if="wishlistCount > 0" class="wishlist-badge">
                {{ wishlistCount }}
              </span>
            </router-link>
          </li>
          <li>
            <router-link to="/orders">My Orders</router-link>
          </li>
          <li>
            <button class="logout-btn" @click="logout">Logout</button>
          </li>
        </ul>
      </li>
      <li class="cart-link" v-if="!isAuthenticated">
        <router-link to="/login" class="link cart"> Login </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useCart } from "../composables/useCart";
import { useAuthStore } from "../stores/auth";
import { useWishlistStore } from "../stores/wishlist";

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

const { cart } = useCart();
const wishlistStore = useWishlistStore();

const cartCount = computed(() =>
  cart.value.reduce((total, item) => total + item.quantity, 0)
);

const wishlistCount = computed(() => wishlistStore.items.length);

function logout() {
  authStore.logout();
}
</script>

<style scoped>
.cart-link {
  position: relative;
}

.cart-badge,
.wishlist-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  margin-left: 8px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #fff;
}

.wishlist-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* Ensure the wishlist item looks correct inside the white dropdown menu */
.dropdown-menu .wishlist-link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  width: 100%;
}

.dropdown-menu .wishlist-badge {
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  color: #3730a3;
}
</style>


