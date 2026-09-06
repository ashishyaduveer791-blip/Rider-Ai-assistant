/**
 * Environment Configuration & Validation
 *
 * Validates required environment variables on startup.
 * Warns about insecure defaults (e.g. CORS wildcard).
 * Centralizes env access so the rest of the app doesn't read process.env directly.
 */

function validateEnv() {
  const warnings = [];
  const errors = [];

  // PORT — optional, has sensible default
  const PORT = parseInt(process.env.PORT, 10) || 5000;

  // CLIENT_ORIGIN — required for secure CORS
  const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;
  if (!CLIENT_ORIGIN) {
    warnings.push(
      'CLIENT_ORIGIN is not set. CORS will reject cross-origin requests. ' +
      'Set CLIENT_ORIGIN to your frontend URL (e.g. http://localhost:5173).'
    );
  }

  // GEMINI_API_KEY — optional (AI classification is optional)
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    warnings.push(
      'GEMINI_API_KEY is not set. AI event classification will use fallback responses.'
    );
  }

  // NODE_ENV
  const NODE_ENV = process.env.NODE_ENV || 'development';

  // Log warnings
  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment Warnings:');
    warnings.forEach((w) => console.warn(`   • ${w}`));
    console.warn('');
  }

  // Log errors and exit if critical
  if (errors.length > 0) {
    console.error('\n❌ Environment Errors (server cannot start):');
    errors.forEach((e) => console.error(`   • ${e}`));
    console.error('');
    process.exit(1);
  }

  return {
    PORT,
    CLIENT_ORIGIN,
    GEMINI_API_KEY,
    NODE_ENV,
    isDevelopment: NODE_ENV === 'development',
    isProduction: NODE_ENV === 'production',
  };
}

module.exports = { validateEnv };
