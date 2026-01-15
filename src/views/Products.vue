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
          <label v-for="brand in brands" :key="brand" class="checkbox-label">
            <input type="checkbox" :value="brand" v-model="selectedBrands" class="checkbox-input" />
            <span class="checkbox-text">{{ brand }}</span>
          </label>
        </div>
      </div>
      <div class="filter-group">
        <h4>Discount</h4>
        <input type="range" min="0" max="50" step="1" v-model="discountRange" />
        <span class="range-display">
          {{ discountRange ? `${discountRange}% & above` : 'All' }}
        </span>
      </div>

      <button class="clear-btn" @click="clearFilters">Clear Filters</button>
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
          <div class="product-image-wrapper">
            <img :src="product.image" :alt="product.name" />
            <div class="product-overlay">
              <button class="view-btn">View Details</button>
            </div>
          </div>

          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-category">{{ product.category }}</p>
            <div class="product-footer">
              <span class="product-price">${{ product.price }}</span>
              <button
                class="add-to-cart-btn"
                @click.stop="handleCartAction(product)"
              >
                {{ isInCart(product.id) ? "Go to Cart" : "Add to Cart" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <!-- No Results Message -->
      <div v-else class="no-results">
        <div class="no-results-content">
          <p class="no-results-icon">🔍</p>
          <h3>No products found</h3>
          <p>Try adjusting your search or filter criteria</p>
          <button @click="clearFilters" class="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      </div>
    </section>
  </div>
  </div>
  </div>

  <Footer />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";
import { useRouter } from "vue-router";
import { useCart } from "../composables/useCart";

// Search and filter state
const searchQuery = ref("");
const selectedCategory = ref("all");
const router = useRouter();
const priceRange = ref(5000);
const minRating = ref(0);
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
];

// Products data
const products = ref([]);
const isLoading = ref(false);
async function fetchProducts() {
  try {
    isLoading.value = true;

    const response = await fetch("https://dummyjson.com/products");
    const data = await response.json();

    products.value = data.products
      .filter((product) => product.category !== "groceries")
      .map((product) => ({
        id: product.id,
        name: product.title,
        category: product.category,
        categorySlug: product.category,
        price: product.price,
        image: product.thumbnail,
        rating: product.rating,
        brand: product.brand,
        discount: product.discountPercentage,
      }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
  } finally {
    isLoading.value = false;
  }
}

// Filtered products computed property
const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const matchesCategory =
      selectedCategory.value === "all" ||
      product.categorySlug === selectedCategory.value;

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
  width: 100%;
  height: 280px;
  overflow: hidden;
  background: #f7fafc;
}

.product-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
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

/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .filter-section {
    padding: 20px;
  }

  .category-filters {
    justify-content: center;
  }

  .product-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .add-to-cart-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
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

/* Responsive Design */
@media (max-width: 1024px) {
  .products-layout {
    grid-template-columns: 260px 1fr;
    gap: 24px;
  }

  .filters-sidebar {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 20px 0 40px;
  }

  .products-layout {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 0 16px;
  }

  .filters-sidebar {
    position: relative;
    top: 0;
    max-height: none;
    margin-bottom: 20px;
  }

  .filters-sidebar h3 {
    font-size: 1.3rem;
  }
}
</style>