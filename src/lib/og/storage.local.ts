import type { OgStorage } from './storage';

const memoryStore = new Map<string, Uint8Array>();

export const localOgStorage: OgStorage = {
  async exists(key: string) {
    return memoryStore.has(key);
  },

  async read(key: string) {
    const data = memoryStore.get(key);
    if (!data) throw new Error(`Missing local OG asset: ${key}`);
    return data;
  },

  async write(key: string, data: Uint8Array) {
    memoryStore.set(key, data);
  },
};
