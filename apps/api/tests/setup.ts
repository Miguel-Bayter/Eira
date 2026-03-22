// apps/api/tests/setup.ts
// Suppress pino output during tests
process.env['LOG_LEVEL'] = 'silent';
process.env['NODE_ENV'] = 'test';
process.env['SUPABASE_URL'] = 'https://test.supabase.co';
process.env['SUPABASE_ANON_KEY'] = 'test-anon-key';
process.env['GEMINI_API_KEY'] = 'test-gemini-key';
process.env['GROQ_API_KEY'] = 'test-groq-key';
process.env['RESEND_API_KEY'] = 'test-resend-key';
process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test';
process.env['JWT_SECRET'] = 'test-jwt-secret';
