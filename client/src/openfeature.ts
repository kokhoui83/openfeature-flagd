import { OpenFeature } from '@openfeature/web-sdk';
import { FlagdWebProvider } from '@openfeature/flagd-web-provider';

// Get configuration from environment variables or window.ENV (injected at runtime)
const getConfig = () => {
  // Check if window.ENV exists (Docker runtime injection)
  if (typeof window !== 'undefined' && (window as any).ENV) {
    const env = (window as any).ENV;
    return {
      host: env.FLAGD_HOST || 'localhost',
      port: parseInt(env.FLAGD_PORT) || 8013,
      tls: env.FLAGD_TLS === 'true' || false
    };
  }
  
  // Fallback to import.meta.env (Vite build-time variables)
  return {
    host: import.meta.env.VITE_FLAGD_HOST || 'localhost',
    port: parseInt(import.meta.env.VITE_FLAGD_PORT) || 8013,
    tls: import.meta.env.VITE_FLAGD_TLS === 'true' || false
  };
};

const config = getConfig();
console.log('FlagdWebProvider config:', config);

const provider = new FlagdWebProvider(config);

let initializationPromise: Promise<void> | null = null;

// Register your feature flag provider
const initProvider = async (): Promise<void> => {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log('Initializing OpenFeature provider...');
      await OpenFeature.setProviderAndWait(provider);
      console.log('OpenFeature provider initialized successfully');
    } catch (error) {
      console.error('Failed to initialize provider:', error);
      throw error;
    }
  })();

  return initializationPromise;
};

// Wrapper function that initializes provider and returns client
export const getInitializedClient = async () => {
  await initProvider();
  return OpenFeature.getClient();
};