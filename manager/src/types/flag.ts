export interface FlagVariant {
  [key: string]: string | number | boolean;
}

export interface Flag {
  state: 'ENABLED' | 'DISABLED';
  variants: FlagVariant;
  defaultVariant: string;
  description?: string;
}

export interface FlagConfig {
  $schema?: string;
  flags: {
    [key: string]: Flag;
  };
}

export interface FlagFormData {
  key: string;
  description: string;
  state: 'ENABLED' | 'DISABLED';
  defaultVariant: string;
  variants: Array<{
    name: string;
    value: string | number | boolean;
    type: 'string' | 'number' | 'boolean';
  }>;
}