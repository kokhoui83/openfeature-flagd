import { OpenFeature } from '@openfeature/web-sdk';
import { FlagdWebProvider } from '@openfeature/flagd-web-provider';

const provider = new FlagdWebProvider({
  host: 'localhost',
  port: 8013,
  tls: false
});

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