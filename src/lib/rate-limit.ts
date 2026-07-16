const MAX_ATTEMPTS = 3;
const LOCK_SECONDS = 60;
const ATTEMPT_TTL_MS = 5 * 60 * 1000;

interface AttemptRecord {
  count: number;
  lockUntil: number;
  lastAttempt: number;
}

const attemptStore = new Map<string, AttemptRecord>();

export const checkLock = (clientKey: string): number => {
  const record = attemptStore.get(clientKey);
  if (!record) return 0;

  const now = Date.now();
  // 鎖定尚未過期，回傳剩餘秒數。
  if (now < record.lockUntil) return Math.ceil((record.lockUntil - now) / 1000);

  // 鎖定期已過，清除紀錄。
  attemptStore.delete(clientKey);
  return 0;
};

export const recordAttempt = (clientKey: string): { locked: boolean; lockSeconds: number } => {
  const now = Date.now();
  let record = attemptStore.get(clientKey);

  // 無紀錄或距離上次嘗試超過 5 分鐘，重新開始計算。
  if (!record || now - record.lastAttempt > ATTEMPT_TTL_MS) {
    record = { count: 0, lockUntil: 0, lastAttempt: now };
  }

  record.count += 1;
  record.lastAttempt = now;

  // 超過最大嘗試次數，鎖定 60 秒。
  if (record.count >= MAX_ATTEMPTS) {
    record.lockUntil = now + LOCK_SECONDS * 1000;
    attemptStore.set(clientKey, record);
    return { locked: true, lockSeconds: LOCK_SECONDS };
  }

  attemptStore.set(clientKey, record);
  return { locked: false, lockSeconds: 0 };
};

export const deleteRecord = (clientKey: string): void => {
  attemptStore.delete(clientKey);
};

export const getClientKey = (request: Request, slug: string): string => {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  return `${ip}:${slug}`;
};
