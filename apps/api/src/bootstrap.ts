import { loadApiEnv } from './config/env';

loadApiEnv();

await import('./server');
