<template>
  <Navbar />

<div class="product-wrapper" v-if="product && !isLoading">
  <div class="product-card">

    <!-- Image Section -->
    <div class="image-box">
      <img :src="product.thumbnail" :alt="product.title" />
    </div>

    <!-- Info Section -->
    <div class="info">
      <span class="category-badge">{{ product.category }}</span>

      <h2 class="title">{{ product.title }}</h2>

      <!-- Rating -->
      <div class="rating">
        ⭐ {{ product.rating }} / 5
      </div>

      <p class="description">
        {{ product.description }}
      </p>

      <!-- Price -->
      <div class="price-box">
        <span class="price">${{ product.price }}</span>
        <span class="discount">
          {{ product.discountPercentage }}% OFF
        </span>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button class="cart-btn">Add to Cart</button>
        <button class="buy-btn">Buy Now</button>
      </div>

    </div>
  </div>
</div>
<div v-if="isLoading" class="spinner-wrapper">
  <div class="spinner"></div>
  <p>Loading products...</p>
</div>
  <Footer />
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'

const route = useRoute()
const product = ref(null)
const isLoading = ref(false)

async function fetchProductDetails() {
  try {
    isLoading.value = true
    const response = await fetch(
      `https://dummyjson.com/products/${route.params.id}`
    )
    product.value = await response.json()
  } catch (error) {
    console.error('Failed to fetch product details:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchProductDetails()
})
</script>

<style scoped>
.product-wrapper {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.product-card {
  display: flex;
  gap: 40px;
  max-width: 1000px;
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
}

.image-box {
  width: 400px;
  overflow: hidden;
  border-radius: 16px;
}

.image-box img {
  width: 100%;
  transition: transform 0.4s ease;
}

.image-box:hover img {
  transform: scale(1.08);
}

/* Info */
.info {
  flex: 1;
}

.category-badge {
  display: inline-block;
  background: linear-gradient(135deg, #7367f0, #a66cff);
  color: #fff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  text-transform: capitalize;
}

.title {
  margin: 15px 0;
  font-size: 28px;
  font-weight: 600;
}

.rating {
  font-size: 14px;
  margin-bottom: 15px;
  color: #f39c12;
}

.description {
  color: #555;
  line-height: 1.6;
}

/* Price */
.price-box {
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 15px;
}

.price {
  font-size: 26px;
  font-weight: 700;
  color: #111;
}

.discount {
  background: #eafaf1;
  color: #27ae60;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 14px;
}

/* Buttons */
.actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.cart-btn {
  background: #7367f0;
  color: #fff;
  border: none;
  padding: 14px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
}

.buy-btn {
  background: #111;
  color: #fff;
  border: none;
  padding: 14px 24px;
  border-radius: 10px;
  cursor: pointer;
}

.cart-btn:hover {
  background: #5e50ee;
}

.buy-btn:hover {
  background: #000;
}
.spinner-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 60px 0;
  color: #555;
}

.spinner {
  width: 46px;
  height: 46px;
  border: 5px solid #eee;
  border-top: 5px solid #7367f0;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

</style>
