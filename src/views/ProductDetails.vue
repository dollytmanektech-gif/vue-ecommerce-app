<template>
  <Navbar />

<div class="product-wrapper" v-if="product && !isLoading">
  <div class="product-card">

    <!-- Image Section -->
   <div class="image-box">
  <img 
    :src="currentImage" 
    :alt="product.title"
    @error="$event.target.src = '/placeholder.jpg'"
  />
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
      <div v-if="product.variants?.length" class="variants-section">
        <span class="variant-label">Select {{ getVariantType(product.variants) }}:</span>
        <div class="variant-options">
          <button
            v-for="variant in product.variants"
            :key="variant.variant_id"
            class="variant-btn"
            :class="{ active: selectedVariant === variant.variant_id }"
            @click="selectedVariant = variant.variant_id"
          >
            <span
              v-if="variant.hex"
              class="variant-swatch"
              :style="{ backgroundColor: variant.hex }"
            ></span>
            <span class="variant-name">{{ variant.name }}</span>
          </button>
        </div>
      </div>

      <!-- Price -->
      <div class="price-box">
        <span class="price">${{ getProductPrice(product) }}</span>
        <span v-if="getDiscount(product)" class="discount">
          {{ getDiscount(product) }}% OFF
        </span>
      </div>


      <!-- Actions -->
      <div class="actions">
        <button class="cart-btn"  @click.stop="handleCartAction(product)">
    {{ isInCart(product.id) ? 'Go to Cart' : 'Add to Cart' }}</button>
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
import { ref, onMounted,computed  } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import { useCart } from '../composables/useCart'
import productsData from '../data/products_with_variants.json'

const route = useRoute()
const router = useRouter();
const product = ref(null)
const isLoading = ref(false)
const { addToCart,isInCart  } = useCart()
const selectedVariant = ref(null)
const currentImage = computed(() => {
  if (!product.value) return '/placeholder.jpg'
  
  // If a variant is selected and has its own image
  if (selectedVariant.value && product.value.variants) {
    const variant = product.value.variants.find(
      v => v.variant_id === selectedVariant.value
    )
    if (variant?.image) return variant.image
  }
  
  // Fallback to product thumbnail or first image
  return product.value.thumbnail || product.value.images?.[0] || '/placeholder.jpg'
})

async function fetchProductDetails() {
  try {
    isLoading.value = true
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const found = productsData.products.find(
      p => p.id === Number(route.params.id)
    )

    if (!found) {
      throw new Error('Product not found')
    }
      // Map variant images from product images array
    const variantImages = found.images || [found.thumbnail]
    
    product.value = {
      ...found,
      variants: (found.variants || []).map((v, index) => ({
        ...v,
        // Assign an image to each variant (cycle through available images)
        image: variantImages[index % variantImages.length] || found.thumbnail
      }))
    }
      // Auto-select first variant
    if (product.value.variants.length > 0) {
      selectedVariant.value = product.value.variants[0].variant_id
    }

    // Map to the same shape your template expects
    product.value = {
      id: found.id,
      name: found.title,
      description: found.description,
      category: found.category,
      price: found.price,
      image: found.thumbnail,
      images: found.images,
      rating: found.rating,
      brand: found.brand,
      discount: found.discountPercentage,
      stock: found.stock,
      sku: found.sku,
      variants: found.variants || [],
    }
  } catch (error) {
    console.error('Failed to load product details:', error)
    // Optional: redirect to 404 or show error state
  } finally {
    isLoading.value = false
  }
}

function getVariantType(variants) {
  if (variants[0]?.hex) return 'Color'
  if (variants[0]?.size) return 'Size'
  if (variants[0]?.flavor) return 'Flavor'
  if (variants[0]?.material) return 'Material'
  return 'Option'
}
function getDiscount(product) {
  return product.discountPercentage || product.discount || 0
}

function getProductPrice(product) {
  if (!selectedVariant.value) return product.price.toFixed(2)
  const variant = product.variants?.find(v => v.variant_id === selectedVariant.value)
  return variant 
    ? (product.price + variant.price_adjustment).toFixed(2) 
    : product.price.toFixed(2)
}
function handleCartAction(product) {
  if (isInCart(product.id)) {
    router.push('/cart')
  } else {
    addToCart(product)
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
