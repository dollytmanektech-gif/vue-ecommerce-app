import { defineStore } from "pinia";
import { ref } from "vue";

export const useWishlistStore = defineStore(
  "wishlist",
  () => {
    const items = ref([]);

    function addToWishlist(product) {
      const exists = items.value.find(p => p.id === product.id);
      if (!exists) {
        items.value.push(product);
      }
    }

    function removeFromWishlist(productId) {
      items.value = items.value.filter(p => p.id !== productId);
    }

    function clearWishlist() {
      items.value = [];
    }

    function toggleWishlist(product) {
      const exists = items.value.find(p => p.id === product.id);
      if (exists) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product);
      }
    }

    function isInWishlist(productId) {
      return items.value.some(p => p.id === productId);
    }

    return {
      items,
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
      toggleWishlist,
      isInWishlist,
    };
  },
  {
    persist: true,
  }
);
