<template>
  <div v-if="show" class="paypal-overlay" @click.self="onCancel">
    <div class="paypal-modal" role="dialog" aria-labelledby="paypal-modal-title">
      <header class="paypal-header">
        <span class="paypal-logo">PayPal</span>
        <span class="demo-badge">Learning demo</span>
      </header>

      <div class="paypal-body">
        <p id="paypal-modal-title" class="paypal-title">Complete your payment</p>
        <p class="paypal-amount">${{ amount.toFixed(2) }} USD</p>

        <div class="flow-steps">
          <div class="flow-step" :class="{ active: step === 'creating', done: isPast('creating') }">
            <span class="dot"></span>
            <span>1. Create order</span>
          </div>
          <div class="flow-step" :class="{ active: step === 'approving', done: isPast('approving') }">
            <span class="dot"></span>
            <span>2. Approve payment</span>
          </div>
          <div class="flow-step" :class="{ active: step === 'capturing', done: isPast('capturing') }">
            <span class="dot"></span>
            <span>3. Capture funds</span>
          </div>
        </div>

        <div v-if="step === 'creating'" class="status-box">
          <div class="loader"></div>
          <p>Creating order on server…</p>
        </div>

        <div v-else-if="step === 'approving'" class="status-box">
          <p class="payer-line">Pay as <strong>{{ payerEmail }}</strong></p>
          <p class="hint">In production, PayPal opens a secure login window here.</p>
          <div class="actions">
            <button type="button" class="btn-approve" @click="$emit('approve')">
              Approve &amp; Pay
            </button>
            <button type="button" class="btn-cancel" @click="onCancel">Cancel</button>
          </div>
        </div>

        <div v-else-if="step === 'capturing'" class="status-box">
          <div class="loader"></div>
          <p>Capturing payment…</p>
        </div>

        <div v-else-if="step === 'success'" class="status-box success">
          <p>Payment successful!</p>
        </div>

        <div v-else-if="step === 'error'" class="status-box error">
          <p>{{ errorMessage || 'Payment failed.' }}</p>
          <button type="button" class="btn-cancel" @click="$emit('close')">Close</button>
        </div>

        <div v-else-if="step === 'cancelled'" class="status-box muted">
          <p>Payment cancelled.</p>
          <button type="button" class="btn-cancel" @click="$emit('close')">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: { type: Boolean, default: false },
  step: { type: String, default: 'idle' },
  amount: { type: Number, required: true },
  payerEmail: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
})

const emit = defineEmits(['approve', 'cancel', 'close'])

const stepOrder = ['creating', 'approving', 'capturing', 'success']

function isPast(stepName) {
  const current = stepOrder.indexOf(props.step)
  const target = stepOrder.indexOf(stepName)
  return current > target
}

function onCancel() {
  emit('cancel')
}
</script>

<style scoped>
.paypal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.paypal-modal {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
}

.paypal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f5f7fa;
  border-bottom: 1px solid #e5e9ef;
}

.paypal-logo {
  font-size: 22px;
  font-weight: 700;
  color: #003087;
  letter-spacing: -0.5px;
}

.demo-badge {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
  background: #e5e7eb;
  padding: 4px 8px;
  border-radius: 999px;
}

.paypal-body {
  padding: 24px 20px 20px;
}

.paypal-title {
  margin: 0 0 4px;
  font-size: 15px;
  color: #374151;
}

.paypal-amount {
  margin: 0 0 20px;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.flow-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  padding: 14px;
  background: #f9fafb;
  border-radius: 10px;
}

.flow-step {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #9ca3af;
}

.flow-step.active {
  color: #003087;
  font-weight: 600;
}

.flow-step.done {
  color: #059669;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.status-box {
  text-align: center;
  color: #4b5563;
  font-size: 14px;
}

.status-box.success {
  color: #059669;
  font-weight: 600;
}

.status-box.error {
  color: #dc2626;
}

.status-box.muted {
  color: #6b7280;
}

.payer-line {
  margin: 0 0 8px;
}

.hint {
  margin: 0 0 18px;
  font-size: 12px;
  color: #9ca3af;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-approve {
  padding: 14px;
  border: none;
  border-radius: 24px;
  background: #ffc439;
  color: #111827;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-approve:hover {
  background: #f2b925;
}

.btn-cancel {
  padding: 10px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
}

.btn-cancel:hover {
  color: #374151;
}

.loader {
  width: 36px;
  height: 36px;
  border: 4px solid #e5e7eb;
  border-top-color: #003087;
  border-radius: 50%;
  margin: 0 auto 12px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
