<template>
  <footer class="footer">
    <p>© {{ year }} Vue E-commerce Platform. All rights reserved.</p>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>
