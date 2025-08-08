<template>
  <div>
    <h1>{{ welcomeMessage }}</h1>
    <button v-if="showBeta">Try Beta Feature</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getInitializedClient } from './openfeature';

const welcomeMessage = ref('Welcome!');
const showBeta = ref(false);

onMounted(async () => {
  try {
    const client = await getInitializedClient();

    const isNewMessage = await client.getBooleanValue('new-welcome-message', false);
    const isBetaVisible = await client.getBooleanValue('show-beta-button', false);

    console.log('New Welcome Message:', isNewMessage);
    console.log('Show Beta Button:', isBetaVisible);

    welcomeMessage.value = isNewMessage ? 'Welcome to the new experience!' : 'Welcome!';
    showBeta.value = isBetaVisible;
  } catch (error) {
    console.error('Failed to load feature flags:', error);
    // Graceful fallback to defaults
    welcomeMessage.value = 'Welcome!';
    showBeta.value = false;
  }
});
</script>