import { localOgStorage } from './storage.local';
import { vercelBlobStorage } from './storage.vercel';

const isVercelBlobAvailable = typeof process.env.BLOB_READ_WRITE_TOKEN === 'string';

export const ogStorage = isVercelBlobAvailable ? vercelBlobStorage : localOgStorage;
