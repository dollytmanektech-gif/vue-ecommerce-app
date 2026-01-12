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
          <img
            v-for="(img, index) in images"
            :key="index"
            :src="img"
            class="slide"
          />
        </div>

        <button class="nav prev" @click="prevSlide">‹</button>
        <button class="nav next" @click="nextSlide">›</button>
      </div>

      <div class="categories">
        <h3>Shop by Category</h3>

        <div class="category-grid">
          <div
            class="category-card"
            v-for="category in categories"
            :key="category.slug"
            @click="goToCategory(category.slug)"
          >
            <img :src="category.image" :alt="category.name" />
            <h4>{{ category.name }}</h4>
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
import { useRouter } from "vue-router"
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'

const images = [homeImg, home2Img, home3Img];
const currentIndex = ref(0);
const router = useRouter()

function nextSlide() {
  currentIndex.value = (currentIndex.value + 1) % images.length;
}

function prevSlide() {
  currentIndex.value = (currentIndex.value - 1 + images.length) % images.length;
}
const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    image: new URL("../assets/images/products/headphone_1.jpg", import.meta.url).href,
  },
  {
    name: "Bags",
    slug: "bags",
    image: new URL("../assets/images/products/purse_1.jpg", import.meta.url).href,
  },
  {
    name: "Fashion",
    slug: "fashion",
    image: new URL("../assets/images/products/women's_fashion.jpg", import.meta.url).href,
  },
]

const goToCategory = (slug) => {
  router.push(`/category/${slug}`)
}

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
  max-width: 1500px;
  overflow: hidden;
  border-radius: 12px;
}

.slides {
  display: flex;
  transition: transform 0.6s ease-in-out;
}

.slide {
  width: 100%;
  flex-shrink: 0;
  height: 800px;
  object-fit: cover;
}

/* NAV BUTTONS */
.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
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

