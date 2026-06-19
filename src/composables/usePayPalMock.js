import { ref } from 'vue'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Simulates PayPal's createOrder → onApprove → capture flow for learning Vue.
 * Real PayPal requires server-side order creation; this mock runs entirely in the browser.
 */
export function usePayPalMock() {
  const step = ref('idle') // idle | creating | approving | capturing | success | error | cancelled
  const orderId = ref(null)
  const errorMessage = ref('')

  async function createOrder({ amount, currency = 'USD' }) {
    if (!amount || amount <= 0) {
      step.value = 'error'
      errorMessage.value = 'Order total must be greater than zero.'
      throw new Error(errorMessage.value)
    }

    step.value = 'creating'
    errorMessage.value = ''
    await delay(900)

    orderId.value = `MOCK-ORD-${Date.now()}`
    step.value = 'approving'
    return orderId.value
  }

  async function captureOrder({ payerName = 'Customer', payerEmail = '' }) {
    if (!orderId.value) {
      step.value = 'error'
      errorMessage.value = 'No order to capture.'
      throw new Error(errorMessage.value)
    }

    step.value = 'capturing'
    await delay(1100)

    const details = {
      id: orderId.value,
      status: 'COMPLETED',
      payer: {
        email_address: payerEmail,
        name: { given_name: payerName.split(' ')[0] || 'Customer' },
      },
    }

    step.value = 'success'
    return details
  }

  function cancelPayment() {
    step.value = 'cancelled'
    orderId.value = null
    errorMessage.value = ''
  }

  function reset() {
    step.value = 'idle'
    orderId.value = null
    errorMessage.value = ''
  }

  return {
    step,
    orderId,
    errorMessage,
    createOrder,
    captureOrder,
    cancelPayment,
    reset,
  }
}
