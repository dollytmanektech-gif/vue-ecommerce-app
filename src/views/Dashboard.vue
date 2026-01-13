<template>
  <div>
    <Navbar />

    <div class="content">
      <!-- SLIDER -->
      <div class="slider">
        <div
          class="slides"
          :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        >
          <div
            class="slide-wrapper"
            v-for="(img, index) in images"
            :key="index"
          >
            <img :src="img" class="slide" />
          </div>
        </div>

        <button class="nav prev" @click="prevSlide">‹</button>
        <button class="nav next" @click="nextSlide">›</button>
      </div>
      <br />
      <div class="categories">
        <h3 class="section-title">Shop by Category</h3>

        <div class="category-grid">
          <div
            class="category-card"
            v-for="category in categories"
            :key="category.slug"
            @click="goToCategory(category.slug)"
          >
            <img :src="category.image" :alt="category.name" />

            <!-- Overlay -->
            <div class="category-overlay">
              <h4>{{ category.name }}</h4>
              <button class="shop-btn">Shop Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import homeImg from "../assets/images/slider_3.jpg";
import home2Img from "../assets/images/slider_2.jpg";
import home3Img from "../assets/images/slider.jpg";
import { useRouter } from "vue-router";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";

const images = [homeImg, home2Img, home3Img];
const currentIndex = ref(0);
const router = useRouter();

function nextSlide() {
  currentIndex.value = (currentIndex.value + 1) % images.length;
}

function prevSlide() {
  currentIndex.value = (currentIndex.value - 1 + images.length) % images.length;
}
const categories = [
  {
    name: "Furniture",
    slug: "furniture",
    image: new URL("../assets/images/products/furniture.jpg", import.meta.url)
      .href,
  },
  {
    name: "Fragrances",
    slug: "fragrances",
    image: new URL("../assets/images/products/fragrances.jpg", import.meta.url)
      .href,
  },
  {
    name: "Beauty",
    slug: "beauty",
    image: new URL("../assets/images/products/beauty.jpg", import.meta.url)
      .href,
  },
];

const goToCategory = (slug) => {
  router.push({
    path: "/products",
    query: { category: slug },
  });
};

let interval;
onMounted(() => {
  interval = setInterval(nextSlide, 4000);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<style scoped>
.content {
  padding: 20px;
}

/* SLIDER */
.slider {
  position: relative;
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 12px;
}

/* Flex container */
.slides {
  display: flex;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  /* Force hardware acceleration to fix blur during/after transition */
  will-change: transform;
}

/* Each slide takes full width */
.slide-wrapper {
  min-width: 100%;
  aspect-ratio: 16 / 9; /* Maintains a consistent shape across all screen sizes */
}

/* Image */
.slide {
  width: 100%;
  height: 100%;
  /* Use 'cover' to fill space (crops) or 'contain' to see full image (no crop) */
  object-fit: cover;
  /* Fixes blurring on images */
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Nav buttons */
.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  padding: 10px 14px;
  font-size: 22px;
  cursor: pointer;
  border-radius: 50%;
}

.prev {
  left: 15px;
}

.next {
  right: 15px;
}

/* TEXT */
.text {
  max-width: 800px;
  margin: 15px auto;
  color: #555;
  text-align: center;
}
</style>

