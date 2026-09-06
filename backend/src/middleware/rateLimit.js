/**
 * Simple in-memory rate limiter middleware.
 * Uses a sliding window counter per IP address.
 *
 * No external dependencies (no Redis/express-rate-limit needed).
 * Suitable for single-process deployment. For clustered deployments,
 * replace with a shared store (Redis).
 */

const DEFAULT_OPTIONS = {
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 100,     // max requests per window per IP
  message: 'Too many requests. Please try again later.',
};

function createRateLimiter(options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const hits = new Map(); // IP -> { count, resetTime }

  // Periodic cleanup to prevent memory leak from stale entries
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of hits) {
      if (now > entry.resetTime) {
        hits.delete(ip);
      }
    }
  }, config.windowMs * 2);

  // Allow cleanup interval to not block process exit
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return function rateLimitMiddleware(req, res, next) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();

    let entry = hits.get(ip);

    if (!entry || now > entry.resetTime) {
      // New window
      entry = { count: 1, resetTime: now + config.windowMs };
      hits.set(ip, entry);
    } else {
      entry.count++;
    }

    // Set standard rate limit headers
    const remaining = Math.max(0, config.maxRequests - entry.count);
    res.set('X-RateLimit-Limit', String(config.maxRequests));
    res.set('X-RateLimit-Remaining', String(remaining));
    res.set('X-RateLimit-Reset', String(Math.ceil(entry.resetTime / 1000)));

    if (entry.count > config.maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: config.message,
        },
      });
    }

    next();
  };
}

module.exports = { createRateLimiter };
