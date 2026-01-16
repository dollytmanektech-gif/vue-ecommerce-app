import { defineStore } from "pinia";
import { ref } from "vue";

export const useCheckoutStore = defineStore(
  "checkout",
  () => {
    const pendingOrder = ref(false);

    function setPendingOrder() {
      pendingOrder.value = true;
    }

    function confirmOrder() {
      pendingOrder.value = false;
      alert("✅ Your order is confirmed!");
    }

    return { pendingOrder, setPendingOrder, confirmOrder };
  },
  { persist: true }
);
