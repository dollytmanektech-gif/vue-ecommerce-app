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

          <button class="place-order-btn" type="submit" :disabled="hasErrors">
            Place Order
          </button>
        </form>
      </div>
    </main>

    <Footer />
  </div>
</template>


<script setup>
import { reactive, computed } from "vue";
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
  validateName();
  validateEmail();
  validateAddress();
  validateCity();
  validateZip();
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
.error {
  color: #e63946;
  font-size: 12px;
  margin-top: 4px;
}

.place-order-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
