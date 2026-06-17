<template>
  <div class="products-page">
    <Navbar />
    <div class="content-wrapper">
      <div class="products-layout">
        <!-- FILTER SIDEBAR -->
        <aside class="filters-sidebar">
          <h3>Filters</h3>

          <div class="filter-group">
            <h4>Price</h4>
            <input type="range" min="0" max="5000" v-model="priceRange" />
            <span>Up to ${{ priceRange }}</span>
          </div>

          <div class="filter-group">
            <h4>Rating</h4>
            <select v-model="minRating">
              <option value="0">All</option>
              <option value="3">3★ & above</option>
              <option value="4">4★ & above</option>
              <option value="4.5">4.5★ & above</option>
            </select>
          </div>

          <div class="filter-group">
            <h4>Brands</h4>
            <div class="brands-list">
              <label
                v-for="brand in brands"
                :key="brand"
                class="checkbox-label"
              >
                <input
                  type="checkbox"
                  :value="brand"
                  v-model="selectedBrands"
                  class="checkbox-input"
                />
                <span class="checkbox-text">{{ brand }}</span>
              </label>
            </div>
          </div>
          <div class="filter-group">
            <h4>Discount</h4>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              v-model="discountRange"
            />
            <span class="range-display">
              {{ discountRange ? `${discountRange}% & above` : "All" }}
            </span>
          </div>

          <button  v-if="isFilterApplied" class="clear-btn" @click="clearFilters">Clear Filters</button>
        </aside>

        <!-- RIGHT CONTENT -->
        <section class="products-section">
          <!-- Search -->
          <div class="search-container">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search products..."
              class="search-input"
            />
          </div>

          <!-- Categories -->
          <div class="category-filters">
            <button
              v-for="category in categories"
              :key="category.slug"
              @click="selectedCategory = category.slug"
              :class="[
                'filter-btn',
                { active: selectedCategory === category.slug },
              ]"
            >
              {{ category.name }}
            </button>
          </div>

          <!-- Products Count -->
          <div class="products-info">
            <p class="products-count">
              Showing {{ filteredProducts.length }} of
              {{ products.length }} products
            </p>
          </div>

          <!-- SKELETON LOADER -->
          <div v-if="isLoading" class="skeleton-grid">
            <div v-for="n in 6" :key="n" class="skeleton-card">
              <div class="skeleton-img"></div>
              <div class="skeleton-line short"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line price"></div>
            </div>
          </div>

          <!-- Products Grid -->
          <div v-if="filteredProducts.length > 0" class="products-grid">
           <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-card"
            @click="viewProduct(product)"
            >
               <!-- Image Section with Vertical Variant Strip -->
              <div class="product-image-wrapper">
                <!-- Vertical Variant Dots on Left -->
                <div v-if="product.variants?.length" class="variant-strip" @click.stop>
                  <span
                    v-for="variant in product.variants.slice(0, 4)"
                    :key="variant.variant_id"
                    class="variant-dot-v"
                    :class="{ active: selectedVariants[product.id] === variant.variant_id }"
                    :style="variant.hex ? { backgroundColor: variant.hex } : {}"
                    :title="variant.name"
                    @click.stop="selectVariant(product.id, variant.variant_id)"
                  >
                    <img v-if="!variant.hex && variant.image?.length" :src="variant.image[0]" />
                  </span>
                  <span v-if="product.variants.length > 4" class="variant-more-v">
                    +{{ product.variants.length - 4 }}
                  </span>
                </div>

                <img :src="product.image" :alt="product.name" loading="lazy" />
                
                <div class="product-overlay">
                  <button class="view-btn">View Details</button>
                </div>
              </div>

              <!-- Info Section -->
                <div class="product-info">
                  <p class="product-category">{{ product.category }}</p>
                  <h3 class="product-name">{{ product.name }}</h3>

                  <div class="product-footer">
                    <span class="product-price">${{ getProductPrice(product) }}</span>
                    <div class="product-actions">
                      <button
                        class="action-icon"
                        :class="{ active: isInWishlist(product.id) }"
                        @click.stop="toggleWishlist(product)"
                      >
                        ♥
                      </button>
                      <button
                        class="action-btn"
                        @click.stop="openVariantModal(product)"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                  <!-- Empty -->
                  <!-- No Results Message -->
              </div>
          </div>
          
        </section>
      </div>
    </div>
  </div>
  <div v-if="showModal" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="modal-close" @click="closeModal">×</button>

      <div class="modal-layout">
        <!-- Left: Image -->
        <div class="modal-image">
          <img :src="modalCurrentImage" :alt="selectedProduct?.name" />
          <div v-if="modalVariantImages.length > 1" class="modal-thumbnails">
            <img
              v-for="(img, i) in modalVariantImages"
              :key="i"
              :src="img"
              :class="{ active: modalImageIndex === i }"
              @click="modalImageIndex = i"
            />
          </div>
        </div>

        <!-- Right: Details -->
        <div class="modal-details">
          <p class="modal-category">{{ selectedProduct?.category }}</p>
          <h2 class="modal-title">{{ selectedProduct?.name }}</h2>
          <p class="modal-brand">{{ selectedProduct?.brand }}</p>

          <div class="modal-price">
            <span class="price">${{ getModalPrice() }}</span>
          </div>

          <!-- Color/Variant Selection -->
          <div v-if="selectedProduct?.variants?.length" class="modal-section">
            <label>Select Color</label>
            <div class="variant-grid">
              <button
                v-for="variant in selectedProduct.variants"
                :key="variant.variant_id"
                class="variant-option"
                :class="{ active: modalSelectedVariant === variant.variant_id }"
                @click="selectModalVariant(variant.variant_id)"
              >
                <img v-if="variant.image?.length" :src="variant.image[0]" />
                <span v-if="variant.hex" class="color-dot" :style="{ backgroundColor: variant.hex }"></span>
                <span class="variant-label">{{ variant.name }}</span>
              </button>
            </div>
          </div>

          <!-- Size Selection -->
          <div v-if="currentModalVariant?.size?.length" class="modal-section">
            <label>Select Size</label>
            <div class="size-grid">
              <button
                v-for="size in currentModalVariant.size"
                :key="size"
                class="size-option"
                :class="{ active: modalSelectedSize === size }"
                @click="modalSelectedSize = size"
              >
                UK {{ size }}
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-actions">
            <button
              class="btn-primary"
              :disabled="!canAddToCart"
              @click="addToCartFromModal"
            >
              {{ isModalInCart ? 'Go to Cart' : 'Add to Bag' }}
            </button>
            <button class="btn-secondary" @click="closeModal">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Footer />
</template>

<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";
import { useRouter } from "vue-router";
import { useCart } from "../composables/useCart";
import { useWishlistStore } from "../stores/wishlist";
import productsData from "../data/products_with_variants.json"; // adjust path
import { useAuthStore } from "../stores/auth";

// Search and filter state
const searchQuery = ref("");
const selectedCategory = ref("all");
const router = useRouter();
const priceRange = ref(5000);
const minRating = ref(0);
const authStore = useAuthStore();
const brands = computed(() => {
  return [...new Set(products.value.map((p) => p.brand))].filter(Boolean);
});
const selectedBrands = ref([]);
const discountRange = ref(null);
const { addToCart, isInCart } = useCart();

// Categories
const categories = [
  { name: "All", slug: "all" },
  { name: "Furniture", slug: "furniture" },
  { name: "Fragrances", slug: "fragrances" },
  { name: "Beauty", slug: "beauty" },
  { name: "Footwear", slug: "footwear" },
];
const isFilterApplied = computed(() => {
  return (
    priceRange.value < 5000 ||
    Number(minRating.value) > 0 ||
    selectedBrands.value.length > 0 ||
    Number(discountRange.value) > 0 ||
    selectedCategory.value !== "all" ||
    searchQuery.value.trim() !== ""
  );
});

// Products data
const products = ref([]);
const isLoading = ref(false);
const showModal = ref(false);
const selectedProduct = ref(null);
const modalSelectedVariant = ref(null);
const modalSelectedSize = ref(null);
const modalImageIndex = ref(0);

const currentModalVariant = computed(() => {
  return (
    selectedProduct.value?.variants?.find(
      (v) => v.variant_id === modalSelectedVariant.value
    ) || null
  );
});

const modalVariantImages = computed(() => {
  if (!currentModalVariant.value?.image?.length) {
    return [selectedProduct.value?.thumbnail || selectedProduct.value?.image];
  }
  return currentModalVariant.value.image;
});

const modalCurrentImage = computed(() => {
  return (
    modalVariantImages.value[modalImageIndex.value] ||
    modalVariantImages.value[0]
  );
});

const canAddToCart = computed(() => {
  if (!modalSelectedVariant.value) return false;
  if (currentModalVariant.value?.size?.length && !modalSelectedSize.value)
    return false;
  return true;
});

const isModalInCart = computed(() => {
  if (!selectedProduct.value || !modalSelectedVariant.value) return false;
  return isInCart(
    selectedProduct.value.id,
    modalSelectedVariant.value,
    modalSelectedSize.value
  );
});

function getModalPrice() {
  if (!selectedProduct.value) return "0.00";
  const variant = currentModalVariant.value;
  const price = variant
    ? selectedProduct.value.price + variant.price_adjustment
    : selectedProduct.value.price;
  return price.toFixed(2);
}
function openVariantModal(product) {
  selectedProduct.value = product;
  modalSelectedVariant.value = product.variants?.[0]?.variant_id || null;
  modalSelectedSize.value = product.variants?.[0]?.size?.[0] || null;
  modalImageIndex.value = 0;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedProduct.value = null;
  modalSelectedVariant.value = null;
  modalSelectedSize.value = null;
  modalImageIndex.value = 0;
}

function selectModalVariant(variantId) {
  modalSelectedVariant.value = variantId;
  modalSelectedSize.value = currentModalVariant.value?.size?.[0] || null;
  modalImageIndex.value = 0;
}

function addToCartFromModal() {
  if (!canAddToCart.value) return;

  if (isModalInCart.value) {
    router.push("/cart");
    return;
  }

  const variant = currentModalVariant.value;
  addToCart(selectedProduct.value, {
    variantId: modalSelectedVariant.value,
    size: modalSelectedSize.value,
    variantName: variant?.name,
    variantColor: variant?.color,
    variantHex: variant?.hex,
    variantImage: variant?.image?.[0],
    priceAdjustment: variant?.price_adjustment || 0,
  });

  closeModal();
}

async function fetchProducts() {
  try {
    isLoading.value = true;

    // Simulate a small delay so loading state still feels natural
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Direct access — no fetch, no .json() needed
    products.value = productsData.products
      .filter((product) => product.category !== "groceries")
      .map((product) => ({
        id: product.id,
        name: product.title,
        category: product.category,
        price: product.price,
        image: product.thumbnail,
        rating: product.rating,
        brand: product.brand,
        discount: product.discountPercentage,
        // Include variants
        variants: product.variants || [],
        // Pre-calculate discounted prices for variants
        variantPrices: (product.variants || []).map((v) => ({
          ...v,
          finalPrice: (product.price + v.price_adjustment).toFixed(2),
        })),
      }));
  } catch (error) {
    console.error("Failed to load products:", error);
  } finally {
    isLoading.value = false;
  }
}
// Filtered products computed property
const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const matchesCategory =
      selectedCategory.value === "all" ||
      product.category === selectedCategory.value;

    const matchesSearch =
      !searchQuery.value ||
      product.name?.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesPrice =
      priceRange.value == null || product.price <= priceRange.value;

    const matchesRating =
      minRating.value == null || product.rating >= minRating.value;

    const matchesBrands =
      selectedBrands.value.length === 0 ||
      selectedBrands.value.includes(product.brand);

    const matchesDiscount =
      discountRange.value == null || product.discount >= discountRange.value;

    return (
      matchesCategory &&
      matchesSearch &&
      matchesPrice &&
      matchesRating &&
      matchesBrands &&
      matchesDiscount
    );
  });
});

// Filter products function
function filterProducts() {
  // This function is called on input, but computed property handles the filtering
  // We can add additional logic here if needed
}

// Clear all filters
function clearFilters() {
  searchQuery.value = "";
  selectedCategory.value = "all";
  priceRange.value = 5000;
  minRating.value = 0;
  selectedBrands.value = [];
  discountRange.value = null;
}
// View product details
function viewProduct(product) {
  router.push(`/products/${product.id}`);
}
function handleCartAction(product) {
  if (isInCart(product.id)) {
    router.push("/cart");
  } else {
    addToCart(product);
  }
}

const wishlistStore = useWishlistStore();
function handleWishlist(product) {
  if (!authStore.isAuthenticated) {
    router.push("/login");
    return;
  }

  wishlistStore.addToWishlist(product);
}
const selectedVariants = reactive({});

function toggleWishlist(product) {
  wishlistStore.toggleWishlist(product);
}

function isInWishlist(productId) {
  return wishlistStore.isInWishlist(productId);
}
function selectVariant(productId, variantId) {
  selectedVariants[productId] = variantId;
}

function getProductPrice(product) {
  const selectedId = selectedVariants[product.id];
  if (!selectedId) return product.price.toFixed(2);

  const variant = product.variants.find((v) => v.variant_id === selectedId);
  if (!variant) return product.price.toFixed(2);

  return (product.price + variant.price_adjustment).toFixed(2);
}
// Add to cart
// function addToCart(product) {
//   console.log("Adding to cart:", product);
//   // You can implement cart functionality here
//   alert(`${product.name} added to cart!`);
// }

onMounted(() => {
  fetchProducts();

  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get("category");
  if (categoryParam) {
    selectedCategory.value = categoryParam;
  }
});
</script>

<style scoped>
.products-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.content-wrapper {
  padding: 40px 0 60px;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 60px;
}

/* Page Header */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 12px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #718096;
}

/* Filter Section */
.filter-section {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
}

/* Search Container */
.search-container {
  position: relative;
  margin-bottom: 24px;
}

.search-input {
  width: 100%;
  padding: 14px 50px 14px 20px;
  font-size: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.search-icon {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  pointer-events: none;
}

/* Category Filters */
.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-btn {
  padding: 10px 24px;
  font-size: 0.95rem;
  font-weight: 500;
  border: 2px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-2px);
}

.filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

/* Products Info */
.products-info {
  margin-bottom: 24px;
}

.products-count {
  color: #718096;
  font-size: 0.95rem;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

/* Product Card */
.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.product-image-wrapper {
  position: relative;
  aspect-ratio: 1;
  background: #f8f8f8;
  overflow: hidden;
  display: flex;
}

.product-image-wrapper > img {
  flex: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card:hover .product-image-wrapper img {
  transform: scale(1.05);
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.view-btn {
  padding: 12px 24px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.view-btn:hover {
  transform: scale(1.05);
}

.product-info {
  padding: 20px;
}

.product-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.product-category {
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 16px;
  text-transform: capitalize;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 1.4rem;
  font-weight: 700;
  color: #667eea;
}

.add-to-cart-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.add-to-cart-btn:hover {
  transform: scale(1.05);
  opacity: 0.9;
}

.wishlist-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: #fff;
  cursor: pointer;
  display: inline-grid;
  place-items: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.wishlist-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-color: rgba(17, 24, 39, 0.2);
}

.heart {
  font-size: 18px;
  line-height: 1;
  color: #9ca3af;
  transform: translateY(1px);
  transition: color 0.15s ease, transform 0.15s ease;
}

.heart.active {
  color: #ef4444;
  transform: translateY(1px) scale(1.05);
}

/* No Results */
.no-results {
  background: white;
  padding: 80px 20px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.no-results-content {
  max-width: 400px;
  margin: 0 auto;
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.no-results h3 {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 12px;
}

.no-results p {
  color: #718096;
  margin-bottom: 24px;
}

.clear-filters-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.clear-filters-btn:hover {
  transform: scale(1.05);
}
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  cursor: pointer;
}

.product-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Image */
.product-image-wrapper {
  position: relative;
  aspect-ratio: 1;
  background: #f5f5f5;
  overflow: hidden;
}

.product-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card:hover .product-image-wrapper img {
  transform: scale(1.03);
}

.product-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.view-btn {
  background: #fff;
  color: #333;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

/* Info */
.product-info {
  padding: 14px;
}

.product-category {
  font-size: 11px;
  color: #888;
  text-transform: capitalize;
  margin: 0 0 4px;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #222;
  line-height: 1.35;
  margin: 0 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 38px;
}

/* Variants - Compact Dots */
.product-variants {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

/* Vertical Variant Strip - Left Side */
.variant-strip {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 4px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.variant-dot-v {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  background: #f5f5f5;
  flex-shrink: 0;
  transition: transform 0.2s, border-color 0.2s;
}

.variant-dot-v:hover {
  transform: scale(1.15);
}

.variant-dot-v.active {
  border-color: #111;
  box-shadow: 0 0 0 2px #fff, 0 0 0 3px #111;
}

.variant-dot-v img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.variant-more-v {
  font-size: 9px;
  color: #666;
  text-align: center;
  font-weight: 600;
}

.dot-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: block;
}

.dot-text {
  font-size: 10px;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
}

/* Footer */
.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.product-price {
  font-size: 16px;
  font-weight: 700;
  color: #222;
}

.product-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #bbb;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.15s ease;
}

.action-icon:hover {
  border-color: #e74c3c;
  color: #e74c3c;
}

.action-icon.active {
  background: #ffeaea;
  border-color: #e74c3c;
  color: #e74c3c;
}

.action-btn {
  height: 32px;
  padding: 0 14px;
  border-radius: 8px;
  border: none;
  background: #0078d4;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.action-btn:hover {
  background: #444;
}
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: fit-content;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f5f5f5;
  font-size: 20px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
}

/* Modal Image */
.modal-image {
  background: #f8f8f8;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-image img {
  width: 100%;
  height: 400px;
  object-fit: contain;
}

.modal-thumbnails {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.modal-thumbnails img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
}

.modal-thumbnails img.active {
  border-color: #111;
}

/* Modal Details */
.modal-details {
  padding: 40px;
  overflow-y: auto;
}

.modal-category {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #111;
  margin-bottom: 4px;
}

.modal-brand {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.modal-price {
  margin-bottom: 24px;
}

.modal-price .price {
  font-size: 22px;
  font-weight: 700;
  color: #111;
}

/* Sections */
.modal-section {
  margin-bottom: 24px;
}

.modal-section label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

/* Variant Grid */
.variant-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.variant-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.variant-option:hover {
  border-color: #111;
}

.variant-option.active {
  border-color: #111;
  box-shadow: 0 0 0 1px #111;
}

.variant-option img {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 4px;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.15);
}

.variant-label {
  font-size: 13px;
  font-weight: 500;
  color:#111;
}

/* Size Grid */
.size-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.size-option {
  height: 44px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.size-option:hover {
  border-color: #111;
}

.size-option.active {
  border-color: #111;
  box-shadow: inset 0 0 0 1px #111;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 32px;
}

.btn-primary {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 8px;
  background: #111;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #333;
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-secondary {
  width: 100%;
  height: 44px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  color: #333;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  border-color: #111;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  padding: 20px;
}

.skeleton-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
}

.skeleton-img {
  height: 180px;
  border-radius: 12px;
  background: linear-gradient(100deg, #e0e0e0 30%, #f5f5f5 50%, #e0e0e0 70%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.skeleton-line {
  height: 14px;
  margin-top: 12px;
  border-radius: 6px;
  background: linear-gradient(100deg, #e0e0e0 30%, #f5f5f5 50%, #e0e0e0 70%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-line.price {
  width: 40%;
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}
.products-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 32px;
  align-items: start;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Sidebar */
.filters-sidebar {
  background: #ffffff;
  padding: 28px;
  border-radius: 16px;
  position: sticky;
  top: 100px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: fit-content;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.filters-sidebar h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}

/* Filter groups */
.filter-group {
  margin-bottom: 28px;
}

.filter-group:last-of-type {
  margin-bottom: 24px;
}

.filter-group h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #4a5568;
  margin: 0 0 14px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group h4::before {
  content: "▸";
  color: #667eea;
  font-size: 0.9rem;
}

/* Price Range Slider */
.filter-group input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 5px;
  background: #e2e8f0;
  outline: none;
  margin: 12px 0;
}

.filter-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.filter-group input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.6);
}

.filter-group input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.filter-group input[type="range"]::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.6);
}

.filter-group input[type="range"]::-moz-range-track {
  height: 6px;
  border-radius: 5px;
  background: #e2e8f0;
}

.filter-group span {
  display: block;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
  color: #667eea;
  margin-top: 10px;
  padding: 8px 12px;
  background: #f0f4ff;
  border-radius: 8px;
}

.range-display {
  display: block;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
  color: #667eea;
  margin-top: 10px;
  padding: 8px 12px;
  background: #f0f4ff;
  border-radius: 8px;
}

/* Rating Select */
.filter-group select {
  width: 100%;
  padding: 12px 16px;
  font-size: 0.95rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 12px;
  padding-right: 40px;
}

.filter-group select:hover {
  border-color: #667eea;
}

.filter-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-group select option {
  padding: 10px;
}

/* Brand list */
.brands-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  color: #4a5568;
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.checkbox-label:hover {
  background-color: #f7fafc;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
  border-radius: 4px;
  border: 2px solid #cbd5e0;
  transition: all 0.2s ease;
}

.checkbox-input:checked {
  background-color: #667eea;
  border-color: #667eea;
}

.checkbox-text {
  flex: 1;
  user-select: none;
}

/* Clear button */
.clear-btn {
  width: 100%;
  padding: 14px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.clear-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.clear-btn:active {
  transform: translateY(0);
}

/* Scrollbar styling for filter sidebar */
.filters-sidebar::-webkit-scrollbar {
  width: 6px;
}

.filters-sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.filters-sidebar::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

.filters-sidebar::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>