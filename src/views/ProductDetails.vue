<template>
  <Navbar />

  <div class="product-wrapper" v-if="product && !isLoading">
    <div class="product-layout">

      <!-- LEFT: Image Gallery -->
      <div class="gallery-section">
        <!-- Thumbnails -->
        <div class="thumbnail-strip">
          <img
            v-for="(img, i) in currentVariantImages"
            :key="i"
            :src="img"
            :class="{ active: activeImageIndex === i }"
            @click="activeImageIndex = i"
          />
        </div>

        <!-- Main Image with Magnifier -->
        <div 
          class="main-image" 
          ref="mainImageRef"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
          @mousemove="handleMouseMove"
        >
          <img
            :src="currentVariantImages[activeImageIndex]"
            :alt="product.title"
            @error="$event.target.src = '/placeholder.jpg'"
            ref="zoomImageRef"
          />
          
          <!-- Magnifier Lens -->
          <div
            v-show="showMagnifier"
            class="magnifier-lens"
            :style="lensStyle"
          ></div>
          
          <!-- Zoom Result Window -->
          <div
            v-show="showMagnifier"
            class="zoom-result"
            :style="zoomResultStyle"
          ></div>

          <button v-if="currentVariantImages.length > 1" class="nav-btn prev" @click="prevImage">‹</button>
          <button v-if="currentVariantImages.length > 1" class="nav-btn next" @click="nextImage">›</button>
        </div>
      </div>

      <!-- RIGHT: Product Info -->
      <div class="info-section">
        <p class="product-category">{{ product.category }}</p>
        <h1 class="product-title">{{ currentVariant.name }}</h1>
        <p class="product-subtitle">{{ product.brand }}</p>

        <!-- Price -->
        <div class="price-row">
          <span class="price">${{ getProductPrice(product) }}</span>
          <span class="tax-note">Inclusive of all taxes</span>
        </div>

        <!-- Size Selection for Selected Variant -->
        <div v-if="currentVariant?.size?.length" class="size-section">
          <div class="size-header">
            <span class="size-label">Select Size</span>
          </div>
          <div class="size-grid">
            <button
              v-for="size in currentVariant.size"
              :key="size"
              class="size-btn"
              :class="{ active: selectedSize === size }"
              @click="selectedSize = size"
            >
              <p v-if="product.category === 'footwear'">UK</p> {{ size }}
            </button>
          </div>
        </div>

        <!-- Variant Images (Color/Style selection) -->
        <div v-if="product.variants?.length" class="variant-images">
          <div
            v-for="variant in product.variants"
            :key="variant.variant_id"
            class="variant-thumb"
            :class="{ active: selectedVariant === variant.variant_id }"
            @click="selectVariant(variant.variant_id)"
          >
            <img :src="variant.image?.[0] || product.thumbnail" :alt="selectedVariant.name" />
          </div>
        </div>

        <!-- Actions -->
        <div class="action-buttons">
          <button class="btn-primary" @click="handleCartAction(product)">
            {{ isCurrentVariantInCart ? 'Go to Cart' : 'Add to Bag' }}
          </button>
          <button
            class="btn-secondary"
            :class="{ active: isInWishlist(product.id) }"
            @click="toggleWishlist(product)"
          >
            Favourite
            <span class="heart" :class="{ active: isInWishlist(product.id) }">♡</span>
          </button>
        </div>

        <!-- Description -->
        <div class="product-description">
          <p>{{ product.description }}</p>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isLoading" class="spinner-wrapper">
    <div class="spinner"></div>
    <p>Loading product...</p>
  </div>

  <Footer />
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import { useCart } from '../composables/useCart'
import productsData from '../data/products_with_variants.json'
import { useWishlistStore } from "../stores/wishlist";

const route = useRoute()
const router = useRouter()
const product = ref(null)
const isLoading = ref(false)
const wishlistStore = useWishlistStore()
const { addToCart, isInCart } = useCart()
const selectedVariant = ref(null)
const activeImageIndex = ref(0)
const selectedSize = ref(null)

// Magnifier refs and state
const mainImageRef = ref(null)
const zoomImageRef = ref(null)
const showMagnifier = ref(false)
const lensPosition = ref({ x: 0, y: 0 })
const zoomLevel = 2.5 // Zoom magnification level

// Lens dimensions (should match CSS)
const lensWidth = 120
const lensHeight = 120

// Computed: lens style
const lensStyle = computed(() => ({
  left: `${lensPosition.value.x}px`,
  top: `${lensPosition.value.y}px`,
  width: `${lensWidth}px`,
  height: `${lensHeight}px`
}))

// Computed: zoom result window style
const zoomResultStyle = computed(() => {
  const currentImage = currentVariantImages.value[activeImageIndex.value]
  if (!mainImageRef.value) return {}

  const container = mainImageRef.value
  const containerWidth = container.offsetWidth
  const containerHeight = container.offsetHeight

  const bgX = (lensPosition.value.x / (containerWidth - lensWidth)) * 100
  const bgY = (lensPosition.value.y / (containerHeight - lensHeight)) * 100

  return {
    backgroundImage: `url('${currentImage}')`,
    backgroundSize: `${zoomLevel * 100}%`,
    backgroundPosition: `${bgX}% ${bgY}%`,
  }
})

// Handle mouse events for magnifier (inline handlers in template now)
function handleMouseEnter() {
  if (!mainImageRef.value) return
  showMagnifier.value = true
}

function handleMouseLeave() {
  showMagnifier.value = false
}

function handleMouseMove(e) {
  if (!mainImageRef.value || !zoomImageRef.value) return
  
  const container = mainImageRef.value
  const rect = container.getBoundingClientRect()
  
  // Calculate mouse position relative to container
  let x = e.clientX - rect.left - lensWidth / 2
  let y = e.clientY - rect.top - lensHeight / 2
  
  // Constrain lens within image bounds
  const maxX = rect.width - lensWidth
  const maxY = rect.height - lensHeight
  
  x = Math.max(0, Math.min(x, maxX))
  y = Math.max(0, Math.min(y, maxY))
  
  lensPosition.value = { x, y }
}

// Watch for product changes to ensure refs are available
watch(() => product.value, async (newVal) => {
  if (newVal) {
    await nextTick()
    // DOM is now updated, refs should be available
    console.log('Product loaded, mainImageRef:', mainImageRef.value)
  }
})

// Gallery images: all product images + variant images
const galleryImages = computed(() => {
  if (!product.value) return ['/placeholder.jpg']
  const images = new Set()
  product.value.images?.forEach(img => images.add(img))
  product.value.thumbnail && images.add(product.value.thumbnail)
  product.value.variants?.forEach(v => v.image && images.add(v.image))
  return Array.from(images)
})

const currentVariantImages = computed(() => {
  if (!product.value) return ['/placeholder.jpg']
  
  const variant = product.value.variants?.find(v => v.variant_id === selectedVariant.value)
  
  if (variant?.image?.length) {
    return variant.image
  }
  
  return product.value.images || [product.value.thumbnail || '/placeholder.jpg']
})

// Computed: currently selected variant object
const currentVariant = computed(() => {
  return product.value?.variants?.find(v => v.variant_id === selectedVariant.value) || null
})

const isCurrentVariantInCart = computed(() => {
  if (!product.value || !selectedVariant.value) return false
  return isInCart(product.value.id, selectedVariant.value, selectedSize.value)
})

watch(currentVariantImages, (newImages) => {
  if (newImages.length > 0) {
    activeImageIndex.value = 0
    selectedSize.value = currentVariant.value?.size?.[0] || null
  }
})

function selectVariant(variantId) {
  selectedVariant.value = variantId
  const variant = product.value.variants?.find(v => v.variant_id === variantId)
  if (variant?.image) {
    const idx = galleryImages.value.indexOf(variant.image)
    if (idx !== -1) activeImageIndex.value = idx
  }
}

function prevImage() {
  activeImageIndex.value = (activeImageIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length
}

function nextImage() {
  activeImageIndex.value = (activeImageIndex.value + 1) % galleryImages.value.length
}

function toggleWishlist(product) {
  wishlistStore.toggleWishlist(product);
}

function isInWishlist(productId) {
  return wishlistStore.isInWishlist(productId);
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
  return variant ? (product.price + variant.price_adjustment).toFixed(2) : product.price.toFixed(2)
}

function handleCartAction(product) {
  const variant = currentVariant.value
  console.log('Selected Variant:', variant)
  
  if (isInCart(product.id, selectedVariant.value, selectedSize.value)) {
    router.push('/cart')
  } else {
    addToCart(product, {
      variantId: selectedVariant.value,
      size: selectedSize.value,
      variantName: variant?.name,
      variantColor: variant?.color,
      variantHex: variant?.hex,
      variantImage: variant?.image?.[0],
      priceAdjustment: variant?.price_adjustment || 0
    })
  }
}

async function fetchProductDetails() {
  try {
    isLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))

    const found = productsData.products.find(p => p.id === Number(route.params.id))
    if (!found) throw new Error('Product not found')

    product.value = {
      ...found,
      title: found.title,
      thumbnail: found.thumbnail,
      images: found.images,
      variants: (found.variants || []).map(v => ({
        ...v,
        image: Array.isArray(v.image) ? v.image : (v.image ? [v.image] : [])
      }))
    }

    if (product.value.variants.length > 0) {
      selectedVariant.value = product.value.variants[0].variant_id
      selectedSize.value = product.value.variants[0].size?.[0] || null
    }
  } catch (error) {
    console.error('Failed to load product details:', error)
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.product-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: start;
}

/* ===== GALLERY SECTION ===== */
.gallery-section {
  display: flex;
  gap: 16px;
  position: sticky;
  top: 20px;
}

.thumbnail-strip {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 70px;
  flex-shrink: 0;
}

.thumbnail-strip img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.thumbnail-strip img.active,
.thumbnail-strip img:hover {
  border-color: #111;
}

.main-image {
  flex: 1;
  position: relative;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: visible; /* Changed from hidden to allow zoom result to show outside */
  aspect-ratio: 1;
  cursor: crosshair;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Magnifier Lens */
.magnifier-lens {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.3);
  pointer-events: none;
  z-index: 10;
  backdrop-filter: blur(1px);
  display: block !important; /* Force display when v-show is true */
}

.zoom-result {
  position: absolute;
  top: 0;
  left: calc(100% + 20px);
  width: 400px;   /* explicit fixed width */
  height: 400px;  /* explicit fixed height */
  background-repeat: no-repeat;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  border: 1px solid #e0e0e0;
  z-index: 20;
  background-color: #f5f5f5;
}

/* Adjust zoom result position on smaller screens or when near edge */
@media (max-width: 1200px) {
  .zoom-result {
    left: auto;
    right: calc(100% + 20px);
  }
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #fff;
  color: #111;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 15;
}

.main-image:hover .nav-btn {
  opacity: 1;
}

.nav-btn.prev { left: 12px; }
.nav-btn.next { right: 12px; }

/* ===== INFO SECTION ===== */
.info-section {
  padding-top: 8px;
}

.product-category {
  font-size: 14px;
  color: #666;
  text-transform: capitalize;
  margin-bottom: 4px;
}

.product-title {
  font-size: 28px;
  font-weight: 600;
  color: #111;
  line-height: 1.2;
  margin: 0 0 4px;
}

.product-subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

/* Price */
.price-row {
  margin-bottom: 24px;
}

.price {
  font-size: 20px;
  font-weight: 600;
  color: #111;
  display: block;
}

.tax-note {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
  display: block;
}

/* Variant Images */
.variant-images {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.variant-thumb {
  width: 70px;
  height: 70px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e0e0e0;
  transition: border-color 0.2s;
}

.variant-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.variant-thumb.active,
.variant-thumb:hover {
  border-color: #111;
}

/* Size Section */
.size-section {
  margin-bottom: 24px;
}

.size-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.size-label {
  font-size: 16px;
  font-weight: 600;
  color: #111;
}

.size-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.size-btn {
  height: 48px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
  font-size: 14px;
  color: #111;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.size-btn:hover:not(.disabled) {
  border-color: #111;
}

.size-btn.active {
  border-color: #111;
  box-shadow: 0 0 0 1px #111;
}

.size-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  text-decoration: line-through;
  color: #999;
}

.size-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.2);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.btn-primary {
  width: 100%;
  height: 56px;
  border: none;
  border-radius: 30px;
  background: #111;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #333;
}

.btn-secondary {
  width: 100%;
  height: 56px;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
  background: #fff;
  color: #111;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #111;
}

.btn-secondary.active {
  border-color: #111;
}

.btn-secondary .heart {
  font-size: 18px;
  color: #111;
}

.btn-secondary .heart.active {
  color: #e74c3c;
}

/* Description */
.product-description {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  border-top: 1px solid #e0e0e0;
  padding-top: 24px;
}

/* Responsive */
@media (max-width: 768px) {
  .product-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .gallery-section {
    position: static;
    flex-direction: column-reverse;
  }

  .thumbnail-strip {
    flex-direction: row;
    width: 100%;
    overflow-x: auto;
  }

  .size-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  /* Disable magnifier on mobile */
  .magnifier-lens,
  .zoom-result {
    display: none !important;
  }
  
  .main-image {
    cursor: default;
    overflow: hidden;
  }
}
</style>