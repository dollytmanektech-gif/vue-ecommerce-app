import { defineStore } from "pinia";

export const useOrderStore = defineStore("order", {
  state: () => ({
    orders: [],
  }),

  actions: {
    addOrder(order) {
      this.orders.unshift(order);
    },
  },

  persist: true,
});
