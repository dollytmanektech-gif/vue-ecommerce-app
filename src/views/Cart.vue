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
          <!-- Cart Items -->
          <div class="cart-item" v-for="item in cart" :key="item.id + '-' + (item.variant?.variantId || 'default')">
            <img :src="item.variant?.image" :alt="item.name" />
            
            <div class="info">
              <h4>{{ item.variant.name }}</h4>
              
              <!-- Variant Details -->
              <div v-if="item.variant" class="variant-info">
                <span v-if="item.variant.hex" class="variant-color" :style="{ backgroundColor: item.variant.hex }"></span>
                <span class="variant-name">{{ item.name }}</span>
                <span v-if="item.variant.size" class="variant-size">Size: UK {{ item.variant.size }}</span>
              </div>
              
              <!-- Price -->
              <p class="price-line">
                <!-- <span class="current-price">${{ item.price.toFixed(2) }}</span> -->
                <span class="current-price">
                  ${{ item.price.toFixed(2) }}
                </span>
                <span class="qty-text">× {{ item.quantity }}</span>
              </p>
            </div>

            <div class="qty">
              <button @click="decreaseQty(item)">−</button>
              <span>{{ item.quantity }}</span>
              <button @click="increaseQty(item)">+</button>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="cart-summary">
            <div class="summary-left">
              <h3>Order Summary</h3>

              <div class="summary-row">
                <span>Subtotal ({{ totalItems }} items)</span>
                <strong>${{ subtotal.toFixed(2) }}</strong>
              </div>

              <div v-if="coupon?.code" class="summary-row coupon-row">
                <span class="muted">
                  Coupon <strong>{{ coupon.code }}</strong>
                  <button class="link-btn" type="button" @click="removeCoupon">
                    Remove
                  </button>
                </span>
                <strong class="discount">- ${{ discountAmount.toFixed(2) }}</strong>
              </div>

              <div v-else class="coupon-box">
                <label class="coupon-label">Have a coupon?</label>
                <div class="coupon-controls">
                  <input
                    v-model="couponInput"
                    class="coupon-input"
                    type="text"
                    placeholder="Enter code e.g. SAVE10"
                    @keydown.enter.prevent="apply"
                  />
                  <button class="apply-btn" type="button" @click="apply">
                    Apply
                  </button>
                </div>
                <p v-if="couponMsg" class="coupon-msg" :class="{ err: !couponOk }">
                  {{ couponMsg }}
                </p>
                <p class="coupon-hint">Try: <code>SAVE10</code>, <code>WELCOME15</code>, <code>FLAT50</code></p>
              </div>

              <div class="summary-row total-row">
                <span>Total</span>
                <strong>${{ total.toFixed(2) }}</strong>
              </div>
            </div>

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
import { ref,computed } from "vue";
import { useRouter } from "vue-router";
import { useCart } from "../composables/useCart";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";

const router = useRouter();

const { cart, increaseQty, decreaseQty, coupon, subtotal, discountAmount, total, applyCoupon, clearCoupon } = useCart()

const couponInput = ref("");
const couponMsg = ref("");
const couponOk = ref(true);
const totalItems = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0))

function goToCheckout() {
  router.push("/checkout");
}

function apply() {
  const res = applyCoupon(couponInput.value);
  couponMsg.value = res.message;
  couponOk.value = res.ok;
  if (res.ok) couponInput.value = "";
}

function removeCoupon() {
  clearCoupon();
  couponMsg.value = "";
  couponOk.value = true;
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.cart-summary h3 {
  font-size: 22px;
  margin: 0 0 12px;
}

.summary-left {
  flex: 1;
  min-width: 280px;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  color: #333;
}

.summary-row.total-row {
  border-bottom: none;
  padding-top: 14px;
  font-size: 18px;
}

.discount {
  color: #0f766e;
}

.muted {
  color: #555;
}

.coupon-box {
  padding: 12px 0 4px;
}

.coupon-label {
  display: block;
  font-size: 13px;
  color: #555;
  margin-bottom: 8px;
}

.coupon-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.coupon-input {
  flex: 1;
  margin: 0;
  padding: 12px 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 14px;
}

.apply-btn {
  padding: 12px 16px;
  border-radius: 10px;
  background: #736fc2;
  color: #fff;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.apply-btn:hover {
  background: #5f5bb3;
}

.coupon-msg {
  margin: 10px 0 0;
  font-size: 13px;
  color: #0f766e;
}

.coupon-msg.err {
  color: #b91c1c;
}

.coupon-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: #777;
}

.coupon-hint code {
  background: #fff;
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.link-btn {
  margin-left: 10px;
  border: none;
  background: transparent;
  color: #736fc2;
  cursor: pointer;
  font-weight: 600;
  padding: 0;
}

.link-btn:hover {
  text-decoration: underline;
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
.variant-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0;
  flex-wrap: wrap;
}

.variant-color {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.15);
  flex-shrink: 0;
}

.variant-name {
  font-size: 13px;
  color: #555;
}

.variant-size {
  font-size: 12px;
  color: #888;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.price-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 0 0;
}

.current-price {
  font-size: 16px;
  font-weight: 700;
  color: #111;
}

.original-price {
  font-size: 13px;
  color: #999;
  text-decoration: line-through;
}

.qty-text {
  font-size: 13px;
  color: #888;
}

@media (max-width: 720px) {
  .cart-summary {
    flex-direction: column;
    align-items: stretch;
  }

  .checkout-btn {
    width: 100%;
  }
}
</style>