<template>
  <div class="page-wrapper">
    <Navbar />

    <main class="content">
      <div class="cart-page">
        <h2>Your Cart</h2>

        <div v-if="cart.length === 0" class="empty-cart">
          🛒 Your cart is empty
        </div>

        <div v-else>
          <div class="cart-item" v-for="item in cart" :key="item.id">
            <img :src="item.image" />
            <div class="info">
              <h4>{{ item.name }}</h4>
              <p>${{ item.price }} × {{ item.quantity }}</p>
            </div>

            <div class="qty">
              <button @click="decreaseQty(item)">−</button>
              <span>{{ item.quantity }}</span>
              <button @click="increaseQty(item)">+</button>
            </div>
          </div>

          <div class="cart-summary">
            <h3>Total: ${{ totalPrice }}</h3>
            <button class="checkout-btn" @click="goToCheckout">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>


<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useCart } from "../composables/useCart";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";

const router = useRouter();
const { cart, increaseQty, decreaseQty } = useCart();

const totalPrice = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

function goToCheckout() {
  router.push("/checkout");
}
</script>
<style scoped>
.cart-page {
  max-width: 1100px;
  margin: 40px auto;
  padding: 0 20px;
}

.cart-page h2 {
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
}

/* EMPTY CART */
.empty-cart {
  text-align: center;
  padding: 60px 20px;
  font-size: 20px;
  color: #777;
  background: #f9f9f9;
  border-radius: 12px;
}

/* CART ITEM */
.cart-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 18px;
  margin-bottom: 15px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cart-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

.cart-item img {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 10px;
}

/* PRODUCT INFO */
.cart-item .info {
  flex: 1;
}

.cart-item .info h4 {
  margin-bottom: 6px;
  font-size: 18px;
}

.cart-item .info p {
  font-size: 15px;
  color: #666;
}

/* QUANTITY CONTROLS */
.qty {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qty button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #222;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.qty button:hover {
  background: #444;
}

.qty span {
  font-size: 16px;
  font-weight: 600;
}

/* CART SUMMARY */
.cart-summary {
  margin-top: 30px;
  padding: 25px;
  background: #f8f8f8;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-summary h3 {
  font-size: 22px;
}

/* CHECKOUT BUTTON */
.checkout-btn {
  padding: 12px 26px;
  background: linear-gradient(135deg, #000, #333);
  color: #fff;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}
.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1; /* pushes footer to bottom */
}
</style>