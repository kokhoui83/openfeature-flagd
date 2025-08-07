import express from "express";
import Router from "express-promise-router";
import cowsay from "cowsay";
import { OpenFeature } from "@openfeature/server-sdk";
import { FlagdProvider } from "@openfeature/flagd-provider";

const app = express();
const routes = Router();
app.use((_, res, next) => {
  res.setHeader("content-type", "text/plain");
  next();
}, routes);

const featureFlags = OpenFeature.getClient();

// flagd feature flag provider
const flagdFlagProvider = new FlagdProvider({
  host: "localhost",
  port: 8013,
});

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

app.listen(3333, () => {
  console.log("Server running at http://localhost:3333");
});