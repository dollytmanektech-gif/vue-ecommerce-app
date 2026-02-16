<template>
  <div class="page-wrapper">
    <Navbar />

    <main class="content">
      <div class="wishlist-page">
        <div class="wishlist-header">
          <div class="title-block">
            <h2>Your Wishlist</h2>
            <p class="subtitle">
              {{ wishlistCount }} item<span v-if="wishlistCount !== 1">s</span>
              saved
            </p>
          </div>

          <div class="header-actions">
            <button class="secondary-btn" @click="goToProducts">
              Continue shopping
            </button>
            <button
              class="danger-btn"
              :disabled="wishlistCount === 0"
              @click="clearWishlist"
              title="Remove all items from wishlist"
            >
              Clear wishlist
            </button>
          </div>
        </div>

        <div v-if="wishlistCount === 0" class="empty-state">
          <div class="empty-card">
            <div class="empty-icon">♡</div>
            <h3>No items in your wishlist</h3>
            <p>Tap the heart on a product to save it for later.</p>
            <button class="primary-btn" @click="goToProducts">
              Browse products
            </button>
          </div>
        </div>

        <div v-else class="wishlist-layout">
          <section class="items-grid" aria-label="Wishlist items">
            <article v-for="item in wishlistItems" :key="item.id" class="item">
              <button
                class="image-btn"
                type="button"
                @click="viewProduct(item)"
                :title="`View ${item.name}`"
              >
                <img
                  class="item-img"
                  :src="item.image || item.thumbnail"
                  :alt="item.name"
                  loading="lazy"
                />
              </button>

              <div class="item-body">
                <div class="item-top">
                  <div class="item-meta">
                    <h4 class="item-name" @click="viewProduct(item)">
                      {{ item.name }}
                    </h4>
                    <p class="item-sub">
                      <span v-if="item.brand" class="pill soft">{{
                        item.brand
                      }}</span>
                      <span v-if="item.category" class="pill">{{
                        item.category
                      }}</span>
                      <span v-if="item.rating" class="pill rating">
                        ⭐ {{ Number(item.rating).toFixed(1) }}
                      </span>
                      <span v-if="item.discount" class="pill discount">
                        {{ Math.round(item.discount) }}% off
                      </span>
                    </p>
                  </div>
                  <button
                    class="icon-btn"
                    type="button"
                    @click="remove(item.id)"
                    :title="`Remove ${item.name} from wishlist`"
                  >
                    ✕
                  </button>
                </div>

                <div class="item-bottom">
                  <div class="price">
                    <span class="price-main">${{ item.price }}</span>
                  </div>

                  <div class="actions">
                    <button
                      class="primary-btn"
                      type="button"
                      @click="handleCartAction(item)"
                    >
                      {{ isInCart(item.id) ? "Go to Cart" : "Add to Cart" }}
                    </button>
                    <button
                      class="secondary-btn"
                      type="button"
                      @click="moveToCart(item)"
                      :disabled="isInCart(item.id)"
                      title="Add to cart and remove from wishlist"
                    >
                      Move to cart
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";
import { useWishlistStore } from "../stores/wishlist";
import { useCart } from "../composables/useCart";

const wishlistStore = useWishlistStore();
const router = useRouter();
const { addToCart, isInCart } = useCart();

const wishlistItems = computed(() => wishlistStore.items);
const wishlistCount = computed(() => wishlistItems.value.length);

const totalPrice = computed(() =>
  wishlistItems.value.reduce((sum, item) => sum + item.price, 0)
);

function remove(id) {
  wishlistStore.removeFromWishlist(id);
}

function clearWishlist() {
  wishlistStore.clearWishlist();
}

function goToProducts() {
  router.push("/products");
}

function goToCart() {
  router.push("/cart");
}

function viewProduct(item) {
  if (!item?.id) return;
  router.push(`/products/${item.id}`);
}

function handleCartAction(product) {
  if (isInCart(product.id)) {
    router.push("/cart");
  } else {
    addToCart(product);
  }
}

function moveToCart(product) {
  if (!isInCart(product.id)) {
    addToCart(product);
  }
  wishlistStore.removeFromWishlist(product.id);
}

function addAllToCart() {
  wishlistItems.value.forEach((item) => addToCart(item));
  router.push("/cart");
}
</script>

<style scoped>
.wishlist-page {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.wishlist-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.wishlist-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.subtitle {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.wishlist-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 22px;
  align-items: start;
}

.items-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.item {
  display: grid;
  grid-template-columns: 132px 1fr;
  gap: 14px;
  padding: 14px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(17, 24, 39, 0.06);
}

.image-btn {
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
}

.item-img {
  width: 132px;
  height: 132px;
  object-fit: cover;
  display: block;
  transition: transform 0.35s ease;
}

.image-btn:hover .item-img {
  transform: scale(1.05);
}

.item-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.item-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.item-name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-sub {
  margin: 8px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pill {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #374151;
  text-transform: capitalize;
}

.pill.soft {
  background: #eef2ff;
  color: #3730a3;
}

.pill.rating {
  background: #fffbeb;
  color: #92400e;
}

.pill.discount {
  background: #ecfdf5;
  color: #065f46;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: #fff;
  cursor: pointer;
  color: #6b7280;
}

.icon-btn:hover {
  color: #111827;
  border-color: rgba(17, 24, 39, 0.2);
}

.item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.price-main {
  font-size: 18px;
  font-weight: 800;
  color: #4f46e5;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.primary-btn,
.secondary-btn,
.danger-btn {
  border: none;
  border-radius: 12px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.25);
}

.secondary-btn {
  background: #fff;
  color: #111827;
  border: 1px solid rgba(17, 24, 39, 0.12);
}

.danger-btn {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid rgba(153, 27, 27, 0.18);
}

.primary-btn:hover,
.secondary-btn:hover,
.danger-btn:hover {
  transform: translateY(-1px);
}

.primary-btn:disabled,
.secondary-btn:disabled,
.danger-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.full {
  width: 100%;
}

.summary-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(17, 24, 39, 0.06);
  position: sticky;
  top: 18px;
}

.summary-card h3 {
  margin: 0 0 12px;
  font-size: 16px;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
  color: #374151;
}

.summary-row strong {
  color: #111827;
}

.summary-card button {
  margin-top: 10px;
}

.empty-state {
  padding: 20px 0 10px;
}

.empty-card {
  background: #fff;
  border-radius: 18px;
  padding: 48px 22px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(17, 24, 39, 0.06);
}

.empty-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 14px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  font-size: 30px;
  background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%);
  color: #4f46e5;
}

.empty-card h3 {
  margin: 10px 0 8px;
  font-size: 18px;
}

.empty-card p {
  margin: 0 0 18px;
  color: #6b7280;
}

.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
}

@media (max-width: 980px) {
  .wishlist-layout {
    grid-template-columns: 1fr;
  }

  .summary-card {
    position: static;
  }
}

@media (max-width: 560px) {
  .wishlist-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .item {
    grid-template-columns: 1fr;
  }

  .item-img {
    width: 100%;
    height: 220px;
  }

  .item-bottom {
    align-items: stretch;
  }

  .actions {
    justify-content: stretch;
  }

  .actions .primary-btn,
  .actions .secondary-btn {
    width: 100%;
  }
}
</style>