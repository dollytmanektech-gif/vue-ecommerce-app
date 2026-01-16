<template>
  <Navbar />
  <section class="order-history">
    <h2>My Orders</h2>

    <div v-if="orders.length === 0" class="empty">No orders found</div>

    <div v-else class="orders">
      <div class="order-card" v-for="order in orders" :key="order.id">
        <div class="order-header">
          <div>
            <h4>Order {{ order.id }}</h4>
            <p>{{ order.date }}</p>
          </div>
          <span class="status">{{ order.status }}</span>
        </div>

        <div class="order-items">
          <div class="item" v-for="item in order.items" :key="item.id">
            <img :src="item.image" />
            <div>
              <p>{{ item.name }}</p>
              <small>Qty: {{ item.quantity }}</small>
            </div>
          </div>
        </div>

        <div class="order-footer">
          <strong>Total: ${{ order.total }}</strong>
        </div>
      </div>
    </div>
  </section>
  <Footer />
</template>
<script setup>
import { ref, onMounted } from "vue";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";

const orders = ref([]);

onMounted(() => {
  const userEmail = localStorage.getItem("userEmail");

  if (!userEmail) {
    orders.value = [];
    return;
  }

  const storageKey = `orders_${userEmail}`;
  orders.value = JSON.parse(localStorage.getItem(storageKey)) || [];
});
</script>
<style scoped>
.order-history {
  max-width: 900px;
  margin: auto;
  padding: 20px;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.status {
  color: #2a9d8f;
  padding: 41px 10px;
  border-radius: 20px;
  font-weight: bold;
}

.item {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 10px 0;
}

.item img {
  width: 50px;
  border-radius: 6px;
}

.order-footer {
  text-align: right;
  font-size: 16px;
  margin-top: 10px;
}
</style>