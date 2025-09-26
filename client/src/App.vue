<template>
  <div>
    <h1>{{ welcomeMessage }}</h1>
    <button v-if="showBeta">Try Beta Feature</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { getInitializedClient } from './openfeature';
import { ProviderEvents } from '@openfeature/web-sdk';

const welcomeMessage = ref('Welcome!');
const showBeta = ref(false);
let client = null;

// Function to evaluate feature flags
const evaluateFlags = async () => {
  if (!client) return;
  
  try {
    const isNewMessage = await client.getBooleanValue('new-welcome-message', false);
    const isBetaVisible = await client.getBooleanValue('show-beta-button', false);

    console.log('Evaluating flags - New Message:', isNewMessage, 'Beta Visible:', isBetaVisible);

    welcomeMessage.value = isNewMessage ? 'Welcome to the new experience!' : 'Welcome!';
    showBeta.value = isBetaVisible;
  } catch (error) {
    console.error('Failed to evaluate feature flags:', error);
  }
};

// Event handler for provider configuration changes
const handleProviderConfigChange = (eventDetails) => {
  console.log('Provider configuration changed:', eventDetails);
  // Re-evaluate flags when configuration changes
  evaluateFlags();
};

onMounted(async () => {
  try {
    client = await getInitializedClient();

    // Set up event listener for configuration changes
    client.addHandler(ProviderEvents.ConfigurationChanged, handleProviderConfigChange);

    // Initial flag evaluation
    await evaluateFlags();
  } catch (error) {
    console.error('Failed to initialize feature flags:', error);
    // Graceful fallback to defaults
    welcomeMessage.value = 'Welcome!';
    showBeta.value = false;
  }
});

onUnmounted(() => {
  // Clean up event listener
  if (client) {
    client.removeHandler(ProviderEvents.ConfigurationChanged, handleProviderConfigChange);
  }
});
</script>