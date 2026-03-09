export interface OgStorage {
  exists(key: string): Promise<boolean>;
  read(key: string): Promise<Uint8Array>;
  write(key: string, data: Uint8Array): Promise<void>;
}
