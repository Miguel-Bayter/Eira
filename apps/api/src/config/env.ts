import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const apiRoot = resolve(currentDir, '..', '..');
const envPath = resolve(apiRoot, '.env');

let envLoaded = false;

export function loadApiEnv(): void {
  if (envLoaded) {
    return;
  }

  dotenv.config({ path: envPath });
  envLoaded = true;
}

export function requireEnv(key: string): string {
  const value = process.env[key]?.trim();

  if (value) {
    return value;
  }

  throw new Error(
    `Missing required environment variable: ${key}. ` +
      `Set ${key} in apps/api/.env or in the process environment before starting the API.`,
  );
}
