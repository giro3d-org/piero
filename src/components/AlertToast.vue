<script setup lang="ts">
import * as bootstrap from 'bootstrap';
import { ref } from 'vue';
import Notifications from './controllers/NotificationController';
import Notification from '../types/Notification'

const alertToast = ref(null);
const notification = ref<Notification>(Notification.empty());

function showNotification(notif: Notification) {
  notification.value = notif;

  const toast = bootstrap.Toast.getOrCreateInstance(alertToast.value);
  toast.show();
}

Notifications.registerCallback(showNotification);

function getStyle() {
  if (!notification.value) {
    return 'text-bg-success';
  }

  switch (notification.value.level) {
    case 'info': return 'text-bg-secondary';
    case 'warning': return 'text-bg-warning';
    case 'error': return 'text-bg-danger';
    case 'success': return 'text-bg-success';
    default:
      return 'text-bg-success';
  }
}

function getIcon() {
  if (!notification.value) {
    return 'text-bg-success';
  }

  switch (notification.value.level) {
    case 'info': return 'bi-check-circle-fill';
    case 'warning': return 'bi-exclamation-triangle-fill';
    case 'error': return 'bi-exclamation-circle-fill';
    case 'success': return 'bi-check-lg';
    default:
      return 'text-bg-success';
  }
}

// For testing purposes
// onMounted(() => {
//   showNotification(new Notification('Test', 'this is a test', 'info'));
// })

</script>

<template>
  <div class="toast-container bottom-0 end-0 px-3 py-5">
    <div ref="alertToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div :class="['toast-header', getStyle()]">
        <i :v-if="notification.level === 'info'" :class="['bi', getIcon()]"></i>
        <strong class="me-auto mx-2">{{ notification.title }}</strong>
        <!-- <small>11 mins ago</small> -->
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        {{ notification.text }}
      </div>
    </div>
  </div>
</template>