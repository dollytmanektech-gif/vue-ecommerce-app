import { ref, watch } from 'vue'

const cart = ref(
  JSON.parse(localStorage.getItem('cart')) || []
)

function save() {
  localStorage.setItem('cart', JSON.stringify(cart.value))
}

export function useCart() {
  function addToCart(product) {
    const existingItem = cart.value.find(
      item => item.id === product.id
    )

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || product.thumbnail,
        quantity: 1
      })
    } 
    save()
  }

  function removeFromCart(productId) {
    cart.value = cart.value.filter(item => item.id !== productId)
  }

  function clearCart() {
    cart.value = []
  }
  function increaseQty(item) {
  item.quantity++
  save()
}

function decreaseQty(item) {
  if (item.quantity > 1) {
    item.quantity--
  } else {
    cart.value = cart.value.filter(p => p.id !== item.id)
  }
  save()
}

  // 🔥 Persist cart
  watch(
    cart,
    (val) => {
      localStorage.setItem('cart', JSON.stringify(val))
    },
    { deep: true }
  )
   const isInCart = (id) =>
    cart.value.some(item => item.id === id)


  return {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    increaseQty, decreaseQty,
    isInCart
  }
}
