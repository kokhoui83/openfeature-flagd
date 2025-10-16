import type { FlagConfig, Flag } from '../types/flag';

class FlagService {
  private flags: FlagConfig = {
    $schema: "https://flagd.dev/schema/v0/flags.json",
    flags: {}
  };

  constructor() {
    this.loadFlagsFromFile();
  }

  private async loadFlagsFromFile(): Promise<void> {
    try {
      const response = await fetch('/api/flags');
      if (response.ok) {
        const data = await response.json();
        this.flags = data;
      } else {
        // If file doesn't exist or can't be read, create with demo data
        this.loadDemoData();
        await this.saveFlagsToFile();
      }
    } catch (error) {
      console.warn('Failed to load flags from file, using demo data:', error);
      this.loadDemoData();
    }
  }

  private async saveFlagsToFile(): Promise<void> {
    try {
      const response = await fetch('/api/flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.flags, null, 2)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save flags: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to save flags to file:', error);
      throw error;
    }
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

  async getAllFlags(): Promise<FlagConfig> {
    await this.loadFlagsFromFile();
    return { ...this.flags };
  }

  getFlag(key: string): Flag | undefined {
    return this.flags.flags[key];
  }

  async createFlag(key: string, flag: Flag): Promise<boolean> {
    if (this.flags.flags[key]) {
      return false; // Flag already exists
    }
    this.flags.flags[key] = { ...flag };
    try {
      await this.saveFlagsToFile();
      return true;
    } catch (error) {
      // Rollback on save error
      delete this.flags.flags[key];
      return false;
    }
  }

  async updateFlag(key: string, flag: Flag): Promise<boolean> {
    if (!this.flags.flags[key]) {
      return false; // Flag doesn't exist
    }
    const oldFlag = { ...this.flags.flags[key] };
    this.flags.flags[key] = { ...flag };
    try {
      await this.saveFlagsToFile();
      return true;
    } catch (error) {
      // Rollback on save error
      this.flags.flags[key] = oldFlag;
      return false;
    }
  }

  async deleteFlag(key: string): Promise<boolean> {
    if (!this.flags.flags[key]) {
      return false; // Flag doesn't exist
    }
    const deletedFlag = { ...this.flags.flags[key] };
    delete this.flags.flags[key];
    try {
      await this.saveFlagsToFile();
      return true;
    } catch (error) {
      // Rollback on save error
      this.flags.flags[key] = deletedFlag;
      return false;
    }
  }

  exportConfig(): string {
    return JSON.stringify(this.flags, null, 2);
  }

  async importConfig(configJson: string): Promise<boolean> {
    try {
      const config = JSON.parse(configJson) as FlagConfig;
      if (config.flags && typeof config.flags === 'object') {
        const oldFlags = { ...this.flags };
        this.flags = config;
        try {
          await this.saveFlagsToFile();
          return true;
        } catch (error) {
          // Rollback on save error
          this.flags = oldFlags;
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to parse config:', error);
      return false;
    }
  }
}

export const flagService = new FlagService();