import { put, head } from '@vercel/blob';
import type { OgStorage } from './storage';

export const vercelBlobStorage: OgStorage = {
  async exists(key: string) {
    const blobKey = `og/${key}`;
    try {
      await head(blobKey);
      return true;
    } catch {
      return false;
    }
  },

  async read(key: string) {
    const blobKey = `og/${key}`;
    let meta;

    try {
      meta = await head(blobKey);
    } catch {
      throw new Error(`OG blob not found: ${key}`);
    }

    const res = await fetch(meta.url);
    if (!res.ok) throw new Error(`Failed to fetch OG blob: ${key}`);

    return new Uint8Array(await res.arrayBuffer());
  },

  async write(key: string, data: Uint8Array) {
    const blobKey = `og/${key}`;

    await put(blobKey, Buffer.from(data), {
      access: 'public',
      addRandomSuffix: false,
    });
  },
};
