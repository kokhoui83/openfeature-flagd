import express from "express";
import Router from "express-promise-router";
import cowsay from "cowsay";
import { OpenFeature, ProviderEvents } from "@openfeature/server-sdk";
import { FlagdProvider } from "@openfeature/flagd-provider";

const app = express();
const routes = Router();
app.use((_, res, next) => {
  res.setHeader("content-type", "text/plain");
  next();
}, routes);

const featureFlags = OpenFeature.getClient();

const FLAGD_HOST = process.env.FLAGD_HOST || "localhost";
const FLAGD_PORT = parseInt(process.env.FLAGD_PORT) || 8013;
const SERVER_HOST = process.env.SERVER_HOST || "localhost";
const SERVER_PORT = parseInt(process.env.SERVER_PORT) || 3333;

// flagd feature flag provider
const flagdFlagProvider = new FlagdProvider({
  host: FLAGD_HOST,
  port: FLAGD_PORT,
});

// Event handlers for provider events
const handleProviderReady = (eventDetails) => {
  console.log('Provider ready:', eventDetails);
};

const handleProviderError = (eventDetails) => {
  console.error('Provider error:', eventDetails);
};

const handleConfigurationChanged = (eventDetails) => {
  console.log('Configuration changed:', eventDetails);
  // Log which flags might have changed
  if (eventDetails.flagsChanged) {
    console.log('Changed flags:', eventDetails.flagsChanged);
  }
};

const handleProviderStale = (eventDetails) => {
  console.warn('Provider stale (connection issues):', eventDetails);
};

// Set up event listeners before setting provider
OpenFeature.addHandler(ProviderEvents.Ready, handleProviderReady);
OpenFeature.addHandler(ProviderEvents.Error, handleProviderError);
OpenFeature.addHandler(ProviderEvents.ConfigurationChanged, handleConfigurationChanged);
OpenFeature.addHandler(ProviderEvents.Stale, handleProviderStale);

// set provider
OpenFeature.setProvider(flagdFlagProvider);

routes.get("/", async (req, res) => {
  const context = {
    cow: req.get("x-cow")
  };
  const withCows = await featureFlags.getBooleanValue("with-cows", false, context);
  if (withCows) {
    res.send(cowsay.say({ text: "Hello, world!" }));
  } else {
    res.send("Hello, world!");
  }
});

routes.get("/feature", async (req, res) => {
  const isNewMessage = await featureFlags.getBooleanValue("new-welcome-message", false);
  const isBetaVisible = await featureFlags.getBooleanValue("show-beta-button", false);

  res.json({
    isNewMessage,
    isBetaVisible
  });
});

const PORT = parseInt(process.env.PORT) || 3333;

app.listen(SERVER_PORT, SERVER_HOST, () => {
  console.log(`Server running at http://${SERVER_HOST}:${SERVER_PORT}`);
  console.log(`Flagd connection: ${FLAGD_HOST}:${FLAGD_PORT}`);
});