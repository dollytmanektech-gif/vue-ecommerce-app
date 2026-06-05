import { ref, watch, computed } from 'vue'

const cart = ref(
  JSON.parse(localStorage.getItem('cart')) || []
)

const coupon = ref(JSON.parse(localStorage.getItem('coupon')) || null)

function save() {
  localStorage.setItem('cart', JSON.stringify(cart.value))
}

function saveCoupon() {
  localStorage.setItem('coupon', JSON.stringify(coupon.value))
}

const COUPONS = {
  // 10% off, no minimum
  SAVE10: { type: 'percent', value: 10, minSubtotal: 0, label: '10% off' },
  // 15% off over $100
  WELCOME15: { type: 'percent', value: 15, minSubtotal: 100, label: '15% off orders $100+' },
  // $50 off over $300
  FLAT50: { type: 'fixed', value: 50, minSubtotal: 300, label: '$50 off orders $300+' },
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
    save()
  }

  function clearCart() {
    cart.value = []
    clearCoupon()
    save()
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

  const subtotal = computed(() =>
    cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  const couponMeta = computed(() => {
    if (!coupon.value?.code) return null
    return COUPONS[coupon.value.code] || null
  })

  const discountAmount = computed(() => {
    if (!couponMeta.value) return 0
    if (subtotal.value < (couponMeta.value.minSubtotal || 0)) return 0

    let discount = 0
    if (couponMeta.value.type === 'percent') {
      discount = (subtotal.value * couponMeta.value.value) / 100
    } else if (couponMeta.value.type === 'fixed') {
      discount = couponMeta.value.value
    }

    // Never discount more than subtotal
    return Math.max(0, Math.min(subtotal.value, discount))
  })

  const total = computed(() => Math.max(0, subtotal.value - discountAmount.value))

  function applyCoupon(codeRaw) {
    const code = String(codeRaw || '').trim().toUpperCase()
    if (!code) return { ok: false, message: 'Enter a coupon code.' }

    const meta = COUPONS[code]
    if (!meta) return { ok: false, message: 'Invalid coupon code.' }

    if (subtotal.value < (meta.minSubtotal || 0)) {
      return {
        ok: false,
        message: `Coupon requires a minimum subtotal of $${meta.minSubtotal}.`,
      }
    }

    coupon.value = { code }
    saveCoupon()
    return { ok: true, message: `Applied ${code} (${meta.label}).` }
  }

  function clearCoupon() {
    coupon.value = null
    saveCoupon()
  }

  // 🔥 Persist cart
  watch(
    cart,
    (val) => {
      localStorage.setItem('cart', JSON.stringify(val))
      // If cart becomes empty, drop coupon automatically
      if (!val || val.length === 0) {
        coupon.value = null
        saveCoupon()
      }
    },
    { deep: true }
  )
     function isInCart(id, variantId = null, size = null) {
    if (!variantId) {
      return cart.value.some(item => item.id === id)
    }
    return cart.value.some(
      item => item.id === id &&
              item.variant?.variantId === variantId &&
              item.variant?.size === size
    )
  }

  return {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    increaseQty, decreaseQty,
    isInCart,
    coupon,
    subtotal,
    discountAmount,
    total,
    applyCoupon,
    clearCoupon,
  }
}
