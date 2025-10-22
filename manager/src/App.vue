<script setup lang="ts">
import FeatureFlagManager from './components/FeatureFlagManager.vue'
</script>

<template>
  <div id="app">
    <FeatureFlagManager />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8f9fa;
  color: #333;
}

#app {
  min-height: 100vh;
}

code {
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
}

/* Utility classes */
.text-center {
  text-align: center;
}

.mb-0 {
  margin-bottom: 0;
}

.mt-0 {
  margin-top: 0;
}

/* Focus styles */
*:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Loading animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading {
  animation: spin 1s linear infinite;
}
</style>
