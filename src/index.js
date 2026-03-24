'use strict';
// Token bucket rate limiter — configurable capacity and refill rate

class RateLimiter {
  constructor(options) {
    options = options || {};
    this.capacity = options.capacity || 100;
    this.refillRate = options.refillRate || 10;
    this.refillIntervalMs = options.refillIntervalMs || 1000;
    this._buckets = new Map();
  }

  _getBucket(key) {
    if (!this._buckets.has(key)) {
      this._buckets.set(key, { tokens: this.capacity, lastRefill: Date.now() });
    }
    return this._buckets.get(key);
  }

  _refill(bucket) {
    const now = Date.now();
    const elapsed = now - bucket.lastRefill;
    const intervals = Math.floor(elapsed / this.refillIntervalMs);
    if (intervals > 0) {
      bucket.tokens = Math.min(this.capacity, bucket.tokens + intervals * this.refillRate);
      bucket.lastRefill = bucket.lastRefill + intervals * this.refillIntervalMs;
    }
  }

  consume(key, tokens) {
    tokens = tokens || 1;
    const bucket = this._getBucket(key);
    this._refill(bucket);
    if (bucket.tokens < tokens) {
      return { allowed: false, remaining: bucket.tokens, retryAfterMs: this._retryAfter(bucket, tokens) };
    }
    bucket.tokens -= tokens;
    return { allowed: true, remaining: bucket.tokens, retryAfterMs: 0 };
  }

  _retryAfter(bucket, needed) {
    const deficit = needed - bucket.tokens;
    const intervals = Math.ceil(deficit / this.refillRate);
    return intervals * this.refillIntervalMs;
  }

  reset(key) {
    if (key) { this._buckets.delete(key); } else { this._buckets.clear(); }
    return this;
  }

  status(key) {
    const bucket = this._getBucket(key);
    this._refill(bucket);
    return { tokens: bucket.tokens, capacity: this.capacity };
  }
}

module.exports = RateLimiter;
