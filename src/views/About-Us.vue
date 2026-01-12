<template>
  <div class="about-page">
    <Navbar />
<br/>
    <div class="content">
      <!-- Mission Section -->
      <section class="mission-section">
        <div class="section-content">
          <h2 class="section-title">Our Mission</h2>
          <p class="section-text">
            At Vue E-commerce Platform, we are dedicated to providing you with the best online shopping experience. 
            Our mission is to offer high-quality products at competitive prices while ensuring exceptional customer 
            service and satisfaction.
          </p>
          <p class="section-text">
            We believe that shopping should be convenient, enjoyable, and accessible to everyone. That's why we've 
            built a platform that combines cutting-edge technology with a user-friendly interface, making it easy 
            for you to find exactly what you're looking for.
          </p>
        </div>
      </section>

      <!-- Values Section -->
      <section class="values-section">
        <h2 class="section-title">Our Values</h2>
        <div class="values-grid">
          <div class="value-card">
            <div class="value-icon">🎯</div>
            <h3>Quality First</h3>
            <p>We carefully curate our products to ensure only the highest quality items reach our customers.</p>
          </div>
          <div class="value-card">
            <div class="value-icon">💎</div>
            <h3>Customer Focus</h3>
            <p>Your satisfaction is our top priority. We're committed to providing exceptional service at every step.</p>
          </div>
          <div class="value-card">
            <div class="value-icon">🚀</div>
            <h3>Innovation</h3>
            <p>We continuously improve our platform with the latest technology to enhance your shopping experience.</p>
          </div>
          <div class="value-card">
            <div class="value-icon">🤝</div>
            <h3>Trust & Transparency</h3>
            <p>We believe in honest communication and building long-lasting relationships with our customers.</p>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="categories-section">
        <h2 class="section-title">Shop by Category</h2>
        <p class="section-description">Explore our wide range of products across different categories</p>
        <div class="category-grid">
          <div
            class="category-card"
            v-for="category in categories"
            :key="category.slug"
          >
            <div class="category-image-wrapper">
              <img :src="category.image" :alt="category.name" />
            </div>
            <h4>{{ category.name }}</h4>
          </div>
        </div>
      </section>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'

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
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 20px;
  text-align: center;
  margin-bottom: 60px;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  letter-spacing: -1px;
}

.hero-subtitle {
  font-size: 1.5rem;
  font-weight: 300;
  opacity: 0.95;
}

/* Content Container */
.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

/* Section Styles */
.mission-section,
.values-section,
.categories-section {
  margin-bottom: 80px;
}

.section-content {
  background: white;
  padding: 50px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 24px;
  text-align: center;
  position: relative;
  padding-bottom: 20px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.section-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #4a5568;
  margin-bottom: 20px;
  text-align: justify;
}

.section-description {
  text-align: center;
  font-size: 1.1rem;
  color: #718096;
  margin-bottom: 40px;
}

/* Values Section */
.values-section {
  background: white;
  padding: 60px 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.value-card {
  text-align: center;
  padding: 30px 20px;
  background: #f7fafc;
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.value-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.value-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.value-card h3 {
  font-size: 1.4rem;
  color: #2d3748;
  margin-bottom: 12px;
  font-weight: 600;
}

.value-card p {
  font-size: 1rem;
  color: #718096;
  line-height: 1.6;
  margin: 0;
}

/* Categories Section */
.categories-section {
  background: white;
  padding: 60px 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.category-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.category-image-wrapper {
  width: 100%;
  height: 300px;
  overflow: hidden;
  background: #f7fafc;
}

.category-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.category-card:hover img {
  transform: scale(1.05);
}

.category-card h4 {
  padding: 24px;
  font-size: 1.3rem;
  color: #2d3748;
  text-align: center;
  margin: 0;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .section-content {
    padding: 30px 20px;
  }

  .section-title {
    font-size: 2rem;
  }

  .values-section,
  .categories-section {
    padding: 40px 20px;
  }

  .values-grid,
  .category-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>