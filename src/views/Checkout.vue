<template>
  <div class="page-wrapper">
    <Navbar />
    <main class="content">
      <div class="checkout-page">
        <h2>Checkout</h2>
        <p class="subtitle">Please enter your shipping details</p>

        <div class="order-summary" v-if="cart.length > 0">
          <h3>Order Summary</h3>
          <div class="row">
            <span>Subtotal</span>
            <strong>${{ subtotal.toFixed(2) }}</strong>
          </div>
          <div class="row" v-if="coupon?.code">
            <span
              >Coupon <strong>{{ coupon.code }}</strong></span
            >
            <strong class="discount">- ${{ discountAmount.toFixed(2) }}</strong>
          </div>
          <div class="row total">
            <span>Total</span>
            <strong>${{ total.toFixed(2) }}</strong>
          </div>
        </div>

        <form class="checkout-form" @submit.prevent="placeOrder">
          <div class="form-group">
            <label>Full Name</label>
            <input
              v-model="form.name"
              placeholder="John Doe"
              @blur="validateName"
            />
            <p v-if="errors.name" class="error">{{ errors.name }}</p>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="john@email.com"
              @input="validateEmail"
              @blur="validateEmail"
            />
            <p v-if="errors.email" class="error">{{ errors.email }}</p>
          </div>

          <div class="form-group">
            <label>Address</label>
            <input
              v-model="form.address"
              placeholder="Street, Apartment, etc."
              @blur="validateAddress"
            />
            <p v-if="errors.address" class="error">{{ errors.address }}</p>
          </div>

          <div class="form-group">
            <label>City</label>
            <input
              v-model="form.city"
              placeholder="City"
              @blur="validateCity"
            />
            <p v-if="errors.city" class="error">{{ errors.city }}</p>
          </div>

          <div class="form-group">
            <label>Zip Code</label>
            <input
              v-model="form.zip"
              placeholder="123456"
              @input="validateZip"
              @blur="validateZip"
            />
            <p v-if="errors.zip" class="error">{{ errors.zip }}</p>
          </div>

          <div class="payment-section" v-if="cart.length > 0">
            <p class="payment-note">
              Simulated PayPal flow for learning Vue (no real charges).
            </p>
            <button
              type="button"
              class="paypal-btn"
              :disabled="isPaying || total <= 0"
              @click="startPayPalCheckout"
            >
              <span v-if="isPaying" class="btn-loader"></span>
              <span v-else>Pay with PayPal</span>
            </button>
          </div>

          <p v-else class="empty-cart-note">Add items to your cart before paying.</p>
        </form>
      </div>
    </main>

    <PayPalMockModal
      :show="showPayPalModal"
      :step="paymentStep"
      :amount="total"
      :payer-email="form.email"
      :error-message="paymentError"
      @approve="approvePayment"
      @cancel="cancelPayment"
      @close="closePayPalModal"
    />

    <Footer />
  </div>
</template>


<script setup>
import { reactive, computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useCart } from "../composables/useCart";
import { usePayPalMock } from "../composables/usePayPalMock";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";
import PayPalMockModal from "../components/PayPalMockModal.vue";
import { useAuthStore } from "../stores/auth";
import { useOrderStore } from "../stores/order";

const router = useRouter();
const { clearCart, cart, coupon, subtotal, discountAmount, total } = useCart();

const authStore = useAuthStore();
const orderStore = useOrderStore();

const {
  step: paymentStep,
  errorMessage: paymentError,
  createOrder,
  captureOrder,
  cancelPayment: resetCancelledPayment,
  reset: resetPayment,
} = usePayPalMock();

const showPayPalModal = ref(false);

const isPaying = computed(() =>
  ["creating", "capturing"].includes(paymentStep.value)
);

function validateCheckoutForm() {
  validateName();
  validateEmail();
  validateAddress();
  validateCity();
  validateZip();
  return !hasErrors.value;
}

async function startPayPalCheckout() {
  if (!validateCheckoutForm()) return;

  if (!authStore.isAuthenticated) {
    router.push({ path: "/login", query: { redirect: "/checkout" } });
    return;
  }

  if (cart.value.length === 0 || total.value <= 0) return;

  resetPayment();
  showPayPalModal.value = true;

  try {
    await createOrder({ amount: total.value, currency: "USD" });
  } catch {
    // error state handled by composable
  }
}

async function approvePayment() {
  try {
    const details = await captureOrder({
      payerName: form.name,
      payerEmail: form.email,
    });

    orderStore.addOrder({
      id: "ORD-" + Date.now(),
      paymentId: details.id,
      items: [...cart.value],
      subtotal: subtotal.value,
      coupon: coupon.value?.code || null,
      discount: discountAmount.value,
      total: total.value,
      status: "completed",
      date: new Date().toISOString(),
      paymentMethod: "paypal (demo)",
      customer: {
        name: form.name,
        email: form.email,
        address: form.address,
        city: form.city,
        zip: form.zip,
      },
    });

    clearCart();
    showPayPalModal.value = false;
    resetPayment();

    const firstName = details.payer?.name?.given_name || "Customer";
    alert(`Payment completed! Thank you, ${firstName}.`);
    router.push("/orders");
  } catch {
    // error state handled by composable
  }
}

function cancelPayment() {
  resetCancelledPayment();
}

function closePayPalModal() {
  showPayPalModal.value = false;
  resetPayment();
}
const form = reactive({
  name: "",
  email: "",
  address: "",
  city: "",
  zip: "",
});

const errors = reactive({
  name: "",
  email: "",
  address: "",
  city: "",
  zip: "",
});

/* ---------- Validators ---------- */

const validateName = () => {
  errors.name = form.name.trim() ? "" : "Full name is required";
};

const validateEmail = () => {
  if (!form.email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address";
  } else {
    errors.email = "";
  }
};

const validateAddress = () => {
  errors.address = form.address.trim() ? "" : "Address is required";
};

const validateCity = () => {
  errors.city = form.city.trim() ? "" : "City is required";
};

const validateZip = () => {
  if (!form.zip) {
    errors.zip = "Zip code is required";
  } else if (!/^\d{5,6}$/.test(form.zip)) {
    errors.zip = "Enter a valid zip code";
  } else {
    errors.zip = "";
  }
};

/* ---------- Form State ---------- */

const hasErrors = computed(() => {
  return Object.values(errors).some((error) => error);
});

function placeOrder() {
  startPayPalCheckout();
}
</script>
<style scoped>
.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1; /* pushes footer to bottom */
}
.checkout-page {
  max-width: 480px;
  margin: 40px auto;
  background: #fff;
  padding: 56px;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.checkout-page h2 {
  text-align: center;
  margin-bottom: 6px;
}

.subtitle {
  text-align: center;
  color: #777;
  font-size: 14px;
  margin-bottom: 25px;
}

/* ORDER SUMMARY */
.order-summary {
  background: #f8f8f8;
  border-radius: 14px;
  padding: 18px;
  margin: 18px 0 22px;
}

.order-summary h3 {
  margin: 0 0 12px;
  font-size: 16px;
}

.order-summary .row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  color: #333;
}

.order-summary .row.total {
  border-bottom: none;
  padding-top: 14px;
  font-size: 18px;
}

.order-summary .discount {
  color: #0f766e;
}

/* FORM */
.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 13px;
  margin-bottom: 6px;
  color: #555;
}

.form-group input {
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
  transition: border 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #736fc2;
  box-shadow: 0 0 0 2px rgba(115, 111, 194, 0.15);
}

/* TWO COLUMN ROW */
.form-row {
  display: flex;
  gap: 12px;
}

/* BUTTON */
.place-order-btn {
  margin-top: 10px;
  padding: 14px;
  background: #736fc2;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
}

.place-order-btn:hover {
  background: #5f5bb3;
  transform: translateY(-1px);
}
.error {
  color: #e63946;
  font-size: 12px;
  margin-top: 4px;
}

.place-order-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.payment-section {
  margin-top: 8px;
}

.payment-note {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 12px;
  text-align: center;
}

.empty-cart-note {
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  margin: 8px 0 0;
}

.paypal-btn {
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 24px;
  background: #ffc439;
  color: #111827;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  transition: background 0.2s, opacity 0.2s;
}

.paypal-btn:hover:not(:disabled) {
  background: #f2b925;
}

.paypal-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-loader {
  width: 22px;
  height: 22px;
  border: 3px solid rgba(0, 0, 0, 0.15);
  border-top-color: #111827;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.payment-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.payment-box {
  background: white;
  width: 350px;
  border-radius: 14px;
  padding: 25px;
  text-align: center;
}

.payment-box h2 {
  margin-bottom: 15px;
}

.payment-box h3 {
  color: #736fc2;
  margin-bottom: 20px;
}

.payment-box button {
  margin: 8px;
  padding: 10px 20px;
  border: none;
  background: #736fc2;
  color: white;
  border-radius: 8px;
  cursor: pointer;
}

.loader {
  width: 45px;
  height: 45px;
  border: 5px solid #ddd;
  border-top-color: #736fc2;
  border-radius: 50%;
  margin: 20px auto;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
