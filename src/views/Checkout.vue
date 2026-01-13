<template>
  <div class="page-wrapper">
    <Navbar />

    <main class="content">
      <div class="checkout-page">
        <h2>Checkout</h2>
        <p class="subtitle">Please enter your shipping details</p>

        <form class="checkout-form" @submit.prevent="placeOrder">
          <div class="form-group">
            <label>Full Name</label>
            <input v-model="form.name" placeholder="John Doe" required />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" placeholder="john@email.com" required />
          </div>

          <div class="form-group">
            <label>Address</label>
            <input v-model="form.address" placeholder="Street, Apartment, etc." required />
          </div>

            <div class="form-group">
              <label>City</label>
              <input v-model="form.city" placeholder="City" required />
            </div>
            <div class="form-group">
              <label>Zip Code</label>
              <input v-model="form.zip" placeholder="123456" required />
            </div>

          <button class="place-order-btn" type="submit">
            Place Order
          </button>
        </form>
      </div>
    </main>

    <Footer />
  </div>
</template>


<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useCart } from "../composables/useCart";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";

const router = useRouter();
const { clearCart } = useCart();

const form = reactive({
  name: "",
  email: "",
  address: "",
  city: "",
  zip: "",
});

function placeOrder() {
  const isAuthenticated = localStorage.getItem("isAuthenticated");

  if (!isAuthenticated) {
    localStorage.setItem("pendingOrder", "true");
    router.push("/login");
    return;
  }

  clearCart();
  localStorage.removeItem("pendingOrder");
  alert("✅ Your order is confirmed!");
  router.push("/");
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

</style>
