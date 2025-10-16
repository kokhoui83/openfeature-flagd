import type { FlagConfig, Flag } from '../types/flag';

class FlagService {
  private flags: FlagConfig = {
    $schema: "https://flagd.dev/schema/v0/flags.json",
    flags: {}
  };

  constructor() {
    // Load initial demo data
    this.loadDemoData();
  }

  private loadDemoData() {
    this.flags = {
      $schema: "https://flagd.dev/schema/v0/flags.json",
      flags: {
        "show-welcome-banner": {
          state: "ENABLED",
          variants: {
            on: true,
            off: false
          },
          defaultVariant: "off",
          description: "Controls whether to show the welcome banner"
        },
        "background-color": {
          state: "ENABLED",
          variants: {
            red: "#FF0000",
            blue: "#0000FF",
            green: "#00FF00",
            yellow: "#FFFF00"
          },
          defaultVariant: "red",
          description: "Sets the background color theme"
        },
        "feature-x-enabled": {
          state: "DISABLED",
          variants: {
            enabled: true,
            disabled: false
          },
          defaultVariant: "disabled",
          description: "Enables the new feature X functionality"
        }
      }
    };
  }

  getAllFlags(): FlagConfig {
    return { ...this.flags };
  }

  getFlag(key: string): Flag | undefined {
    return this.flags.flags[key];
  }

  createFlag(key: string, flag: Flag): boolean {
    if (this.flags.flags[key]) {
      return false; // Flag already exists
    }
    this.flags.flags[key] = { ...flag };
    return true;
  }

  updateFlag(key: string, flag: Flag): boolean {
    if (!this.flags.flags[key]) {
      return false; // Flag doesn't exist
    }
    this.flags.flags[key] = { ...flag };
    return true;
  }

  deleteFlag(key: string): boolean {
    if (!this.flags.flags[key]) {
      return false; // Flag doesn't exist
    }
    delete this.flags.flags[key];
    return true;
  }

  exportConfig(): string {
    return JSON.stringify(this.flags, null, 2);
  }

  importConfig(configJson: string): boolean {
    try {
      const config = JSON.parse(configJson) as FlagConfig;
      if (config.flags && typeof config.flags === 'object') {
        this.flags = config;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to parse config:', error);
      return false;
    }
  }
}

export const flagService = new FlagService();