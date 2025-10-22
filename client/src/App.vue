<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <div class="container">
      <div class="theme-status">
        <span class="theme-indicator">
          {{ isDarkMode ? '🌙' : '☀️' }} 
          {{ isDarkMode ? 'Dark Mode' : 'Light Mode' }}
        </span>
        <small>Powered by feature flag</small>
      </div>
      
      <h1>{{ welcomeMessage }}</h1>
      
      <div class="content">
        <button v-if="showBeta" class="beta-button">
          ✨ Try Beta Feature
        </button>
        
        <div class="flag-status">
          <h3>Active Feature Flags:</h3>
          <div class="flag-grid">
            <div class="flag-item">
              <span class="flag-name">Dark Mode</span>
              <span class="flag-value" :class="{ active: isDarkMode }">
                {{ isDarkMode ? 'ON' : 'OFF' }}
              </span>
            </div>
            <div class="flag-item">
              <span class="flag-name">Beta Features</span>
              <span class="flag-value" :class="{ active: showBeta }">
                {{ showBeta ? 'ON' : 'OFF' }}
              </span>
            </div>
            <div class="flag-item">
              <span class="flag-name">Welcome Message</span>
              <span class="flag-value" :class="{ active: welcomeMessage.includes('new') }">
                {{ welcomeMessage.includes('new') ? 'NEW' : 'CLASSIC' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { getInitializedClient } from './openfeature';
import { ProviderEvents } from '@openfeature/web-sdk';

const welcomeMessage = ref('Welcome!');
const showBeta = ref(false);
const isDarkMode = ref(false);
let client = null;

// Function to evaluate feature flags
const evaluateFlags = async () => {
  if (!client) return;
  
  try {
    const isNewMessage = await client.getBooleanValue('new-welcome-message', false);
    const isBetaVisible = await client.getBooleanValue('show-beta-button', false);
    const darkModeEnabled = await client.getBooleanValue('dark-mode', false);

    console.log('Evaluating flags:', {
      newMessage: isNewMessage,
      betaVisible: isBetaVisible,
      darkMode: darkModeEnabled
    });

    welcomeMessage.value = isNewMessage ? 'Welcome to the new experience!' : 'Welcome!';
    showBeta.value = isBetaVisible;
    isDarkMode.value = darkModeEnabled;
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
    isDarkMode.value = false;
  }
});

onUnmounted(() => {
  // Clean up event listener
  if (client) {
    client.removeHandler(ProviderEvents.ConfigurationChanged, handleProviderConfigChange);
  }
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  transition: all 0.3s ease;
  padding: 20px;
}

/* Light mode (default) */
#app {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333333;
}

/* Dark mode */
#app.dark-mode {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: #ecf0f1;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.theme-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.theme-indicator {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.theme-status small {
  opacity: 0.8;
  font-size: 0.85rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 3rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  color: white;
}

.content {
  display: grid;
  gap: 2rem;
  align-items: start;
}

.beta-button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
  justify-self: center;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.beta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
}

.dark-mode .beta-button {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.flag-status {
  padding: 2rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.flag-status h3 {
  margin-bottom: 1.5rem;
  color: white;
  font-size: 1.3rem;
  text-align: center;
}

.flag-grid {
  display: grid;
  gap: 1rem;
}

.flag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.flag-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.flag-name {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.flag-value {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(108, 117, 125, 0.8);
  color: white;
  transition: all 0.3s ease;
}

.flag-value.active {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  h1 {
    font-size: 2.5rem;
  }
  
  .flag-grid {
    gap: 0.75rem;
  }
  
  .flag-item {
    padding: 0.75rem 1rem;
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .flag-name, .flag-value {
    width: 100%;
  }
}

/* Animation for theme transitions */
@media (prefers-reduced-motion: no-preference) {
  #app {
    transition: background 0.5s ease, color 0.3s ease;
  }
  
  .flag-value {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}
</style>