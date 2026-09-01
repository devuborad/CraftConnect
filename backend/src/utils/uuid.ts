import { randomUUID } from 'crypto';

export function cryptoRandomUUID(): string {
  return randomUUID();
}
