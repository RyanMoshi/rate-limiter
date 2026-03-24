'use strict';
const RateLimiter = require('../src/index');

// Create a limiter: 10 tokens, refill 2 per second
const limiter = new RateLimiter({
  capacity: 10,
  refillRate: 2,
  refillIntervalMs: 1000,
});

// Simulate 15 requests from the same client
for (let i = 1; i <= 15; i++) {
  const result = limiter.consume('client-123');
  if (result.allowed) {
    console.log('Request ' + i + ': allowed  (remaining: ' + result.remaining + ')');
  } else {
    console.log('Request ' + i + ': BLOCKED  (retry in ' + result.retryAfterMs + 'ms)');
  }
}

// Check bucket status
console.log('\nBucket status:', limiter.status('client-123'));
