<template>
  <div class="products-page">
    <Navbar />

    <div class="content">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Our Products</h1>
        <p class="page-subtitle">Discover our wide range of quality products</p>
      </div>

      <!-- Search and Filter Section -->
      <div class="filter-section">
        <!-- Search Bar -->
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search products..."
            class="search-input"
            @input="filterProducts"
          />
          <span class="search-icon">🔍</span>
        </div>

        <!-- Category Filters -->
        <div class="category-filters">
          <button
            v-for="category in categories"
            :key="category.slug"
            @click="
              selectedCategory = category.slug;
              filterProducts();
            "
            :class="[
              'filter-btn',
              { active: selectedCategory === category.slug },
            ]"
          >
            {{ category.name }}
          </button>
        </div>
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
              <button class="add-to-cart-btn" @click.stop="handleCartAction(product)">
    {{ isInCart(product.id) ? 'Go to Cart' : 'Add to Cart' }}</button>
            </div>
          </div>
        </div>
      </div>

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
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";
import { useRouter } from "vue-router";
import { useCart } from '../composables/useCart'

// Search and filter state
const searchQuery = ref("");
const selectedCategory = ref("all");
const router = useRouter();
const { addToCart,isInCart } = useCart()

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
      }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
  } finally {
    isLoading.value = false;
  }
}

// Filtered products computed property
const filteredProducts = computed(() => {
  let filtered = products.value;

  // Filter by category
  if (selectedCategory.value !== "all") {
    filtered = filtered.filter(
      (product) => product.categorySlug === selectedCategory.value
    );
  }

  // Filter by search query
  if (searchQuery.value.trim() !== "") {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
  }

  return filtered;
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
}

// View product details
function viewProduct(product) {
  router.push(`/products/${product.id}`);
}
function handleCartAction(product) {
  if (isInCart(product.id)) {
    router.push('/cart')
  } else {
    addToCart(product)
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
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

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
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
</style>