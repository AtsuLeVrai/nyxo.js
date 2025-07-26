import type { EventEmitter } from "eventemitter3";
import { z } from "zod";
import type {
  CounterMetric,
  DistributionMetrics,
  GaugeMetric,
  HistogramMetric,
  HttpMethod,
  MetricsUpdateEvent,
  RestEvents,
  RestMetrics,
} from "../types/index.js";

/**
 * Configuration options for metrics collection.
 *
 * @example
 * ```typescript
 * const config: MetricsOptions = {
 *   enabled: true,
 *   histogramBuckets: [10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
 *   retentionPeriod: 3600000, // 1 hour
 *   aggregationInterval: 60000 // 1 minute
 * };
 * ```
 *
 * @public
 */
export const MetricsOptions = z.object({
  /**
   * Whether to collect metrics.
   *
   * @default true
   */
  enabled: z.boolean().default(true),

  /**
   * Histogram bucket boundaries for latency measurements (milliseconds).
   *
   * @default [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, Infinity]
   */
  histogramBuckets: z
    .array(z.number().int().positive())
    .default([10, 25, 50, 100, 250, 500, 1000, 2500, 5000, Infinity]),

  /**
   * How long to retain detailed metrics data (milliseconds).
   *
   * @default 3600000 (1 hour)
   */
  retentionPeriod: z.number().int().positive().default(3600000), // 1 hour

  /**
   * Interval for aggregating raw metrics into distributions (milliseconds).
   *
   * @default 60000 (1 minute)
   */
  aggregationInterval: z.number().int().positive().default(60000), // 1 minute

  /**
   * Maximum number of individual items to track in maps.
   * Prevents memory leaks from unlimited growth.
   *
   * @default 10000
   */
  maxTrackedItems: z.number().int().positive().default(10000), // 10,000 items
});

export type MetricsOptions = z.infer<typeof MetricsOptions>;

/**
 * High-performance metrics collection and aggregation engine for REST client monitoring.
 *
 * Provides comprehensive observability into REST client behavior including latency distributions,
 * error rates, rate limiting compliance, and retry patterns. Designed for production environments
 * with configurable retention, aggregation intervals, and memory management.
 *
 * @example
 * ```typescript
 * // Create metrics manager
 * const metrics = new MetricsManager(eventEmitter, {
 *   enabled: true,
 *   histogramBuckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
 *   retentionPeriod: 3600000, // 1 hour
 *   aggregationInterval: 30000 // 30 seconds
 * });
 *
 * // Record request metrics
 * metrics.recordRequest({
 *   method: 'POST',
 *   path: '/channels/123/messages',
 *   statusCode: 200,
 *   duration: 145,
 *   responseSize: 2048
 * });
 *
 * // Get current metrics
 * const snapshot = metrics.getMetrics();
 * console.log(`P95 latency: ${snapshot.requests.latency.p95}ms`);
 * ```
 *
 * @public
 */
export class MetricsManager {
  /**
   * Configuration options controlling metrics behavior.
   *
   * @internal
   */
  readonly #options: Required<MetricsOptions>;

  /**
   * Event emitter for publishing metrics updates.
   *
   * @internal
   */
  readonly #eventEmitter: EventEmitter<RestEvents>;

  /**
   * Raw latency measurements for distribution calculation.
   * Automatically pruned based on retention policy.
   *
   * @internal
   */
  readonly #latencyData: Array<{ timestamp: number; value: number }> = [];

  /**
   * Raw response size measurements for distribution calculation.
   *
   * @internal
   */
  readonly #responseSizeData: Array<{ timestamp: number; value: number }> = [];

  /**
   * Raw bucket utilization measurements for rate limit monitoring.
   *
   * @internal
   */
  readonly #bucketUtilizationData: Array<{ timestamp: number; value: number }> =
    [];

  /**
   * Raw retry count measurements for retry pattern analysis.
   *
   * @internal
   */
  readonly #retryCountData: Array<{ timestamp: number; value: number }> = [];

  /**
   * Raw wait time measurements for rate limit impact analysis.
   *
   * @internal
   */
  readonly #waitTimeData: Array<{ timestamp: number; value: number }> = [];

  /**
   * Raw retry delay measurements for backoff analysis.
   *
   * @internal
   */
  readonly #retryDelayData: Array<{ timestamp: number; value: number }> = [];

  /**
   * Counter metrics tracking cumulative events.
   *
   * @internal
   */
  readonly #counters = {
    requests: this.#createCounter(),
    errors: this.#createCounter(),
    timeouts: this.#createCounter(),
    rateLimits: this.#createCounter(),
    rateLimitViolations: this.#createCounter(),
    rateLimitPrevented: this.#createCounter(),
    retryAttempts: this.#createCounter(),
    retrySuccesses: this.#createCounter(),
    retryFailures: this.#createCounter(),
  };

  /**
   * Gauge metrics tracking instantaneous values.
   *
   * @internal
   */
  readonly #gauges = {
    activeRequests: this.#createGauge(),
    activeBuckets: this.#createGauge(),
  };

  /**
   * HTTP status code occurrence tracking.
   *
   * @internal
   */
  readonly #statusCodes = new Map<number, CounterMetric>();

  /**
   * Rate limit bucket individual statistics.
   *
   * @internal
   */
  readonly #bucketStats = new Map<
    string,
    {
      hits: CounterMetric;
      utilization: GaugeMetric;
      lastReset: number;
    }
  >();

  /**
   * Retry reason occurrence tracking.
   *
   * @internal
   */
  readonly #retryReasons = new Map<string, CounterMetric>();

  /**
   * Middleware execution metrics.
   *
   * @internal
   */
  readonly #middlewareStats = new Map<
    string,
    {
      executions: CounterMetric;
      duration: Array<{ timestamp: number; value: number }>;
      errors: CounterMetric;
    }
  >();

  /**
   * Latency histogram for efficient percentile calculation.
   *
   * @internal
   */
  readonly #latencyHistogram: HistogramMetric;

  /**
   * Cleanup interval for data retention management.
   *
   * @internal
   */
  #cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Aggregation interval for metrics computation.
   *
   * @internal
   */
  #aggregationInterval: NodeJS.Timeout | null = null;

  /**
   * Timestamp when metrics collection started.
   *
   * @internal
   */
  readonly #startTime = Date.now();

  /**
   * Creates a new metrics manager with the specified configuration.
   *
   * @param eventEmitter - Event emitter for publishing metrics updates
   * @param options - Configuration options for metrics behavior
   *
   * @example
   * ```typescript
   * const metrics = new MetricsManager(restClient, {
   *   enabled: true,
   *   histogramBuckets: [50, 100, 200, 500, 1000, 2000, 5000],
   *   retentionPeriod: 1800000, // 30 minutes
   *   aggregationInterval: 15000 // 15 seconds
   * });
   * ```
   *
   * @public
   */
  constructor(eventEmitter: EventEmitter<RestEvents>, options: MetricsOptions) {
    this.#eventEmitter = eventEmitter;
    this.#options = options;

    // Initialize histogram with configured buckets
    this.#latencyHistogram = {
      buckets: new Map(),
      sum: 0,
      count: 0,
    };

    for (const bucket of this.#options.histogramBuckets) {
      this.#latencyHistogram.buckets.set(bucket, 0);
    }

    if (this.#options.enabled) {
      this.#startCleanupInterval();
      this.#startAggregationInterval();
    }
  }

  /**
   * Records metrics for a completed HTTP request.
   *
   * @param data - Request metrics data
   *
   * @example
   * ```typescript
   * metrics.recordRequest({
   *   method: 'GET',
   *   path: '/users/@me',
   *   statusCode: 200,
   *   duration: 89,
   *   responseSize: 1024
   * });
   * ```
   *
   * @public
   */
  recordRequest(data: {
    method: HttpMethod;
    path: string;
    statusCode: number;
    duration: number;
    responseSize?: number;
  }): void {
    if (!this.#options.enabled) return;

    const now = Date.now();

    // Increment request counter
    this.#incrementCounter(this.#counters.requests, now);

    // Record latency
    this.#latencyData.push({ timestamp: now, value: data.duration });
    this.#updateHistogram(this.#latencyHistogram, data.duration);

    // Record response size if provided
    if (data.responseSize !== undefined) {
      this.#responseSizeData.push({ timestamp: now, value: data.responseSize });
    }

    // Track status codes
    if (!this.#statusCodes.has(data.statusCode)) {
      this.#statusCodes.set(data.statusCode, this.#createCounter());
    }
    this.#incrementCounter(this.#statusCodes.get(data.statusCode)!, now);

    // Track errors (4xx and 5xx responses)
    if (data.statusCode >= 400) {
      this.#incrementCounter(this.#counters.errors, now);
    }

    // Decrement active requests
    this.#updateGauge(
      this.#gauges.activeRequests,
      this.#gauges.activeRequests.value - 1,
      now,
    );
  }

  /**
   * Records a request timeout event.
   *
   * @param data - Timeout event data
   *
   * @public
   */
  recordTimeout(data: {
    method: HttpMethod;
    path: string;
    duration: number;
  }): void {
    if (!this.#options.enabled) return;

    const now = Date.now();
    this.#incrementCounter(this.#counters.timeouts, now);
    this.#latencyData.push({ timestamp: now, value: data.duration });
  }

  /**
   * Records the start of a new HTTP request.
   *
   * @param data - Request start data
   *
   * @public
   */
  recordRequestStart(): void {
    if (!this.#options.enabled) return;

    const now = Date.now();
    this.#updateGauge(
      this.#gauges.activeRequests,
      this.#gauges.activeRequests.value + 1,
      now,
    );
  }

  /**
   * Records a rate limit hit event.
   *
   * @param data - Rate limit event data
   *
   * @public
   */
  recordRateLimit(data: {
    bucketId?: string;
    waitTime: number;
    violated: boolean;
    utilization?: number;
  }): void {
    if (!this.#options.enabled) return;

    const now = Date.now();

    if (data.violated) {
      this.#incrementCounter(this.#counters.rateLimitViolations, now);
    } else {
      this.#incrementCounter(this.#counters.rateLimitPrevented, now);
    }

    this.#incrementCounter(this.#counters.rateLimits, now);
    this.#waitTimeData.push({ timestamp: now, value: data.waitTime });

    if (data.utilization !== undefined) {
      this.#bucketUtilizationData.push({
        timestamp: now,
        value: data.utilization,
      });
    }

    // Track bucket-specific stats
    if (data.bucketId) {
      if (!this.#bucketStats.has(data.bucketId)) {
        this.#bucketStats.set(data.bucketId, {
          hits: this.#createCounter(),
          utilization: this.#createGauge(),
          lastReset: now,
        });
      }

      const bucketStat = this.#bucketStats.get(data.bucketId)!;
      this.#incrementCounter(bucketStat.hits, now);

      if (data.utilization !== undefined) {
        this.#updateGauge(bucketStat.utilization, data.utilization, now);
      }
    }
  }

  /**
   * Records a retry attempt.
   *
   * @param data - Retry event data
   *
   * @public
   */
  recordRetry(data: {
    reason: string;
    attempt: number;
    maxAttempts: number;
    delay: number;
    success: boolean;
  }): void {
    if (!this.#options.enabled) return;

    const now = Date.now();

    this.#incrementCounter(this.#counters.retryAttempts, now);
    this.#retryCountData.push({ timestamp: now, value: data.attempt });
    this.#retryDelayData.push({ timestamp: now, value: data.delay });

    if (data.success) {
      this.#incrementCounter(this.#counters.retrySuccesses, now);
    } else if (data.attempt >= data.maxAttempts) {
      this.#incrementCounter(this.#counters.retryFailures, now);
    }

    // Track retry reasons
    if (!this.#retryReasons.has(data.reason)) {
      this.#retryReasons.set(data.reason, this.#createCounter());
    }
    this.#incrementCounter(this.#retryReasons.get(data.reason)!, now);
  }

  /**
   * Records middleware execution metrics.
   *
   * @param data - Middleware execution data
   *
   * @public
   */
  recordMiddleware(data: {
    name: string;
    duration: number;
    success: boolean;
  }): void {
    if (!this.#options.enabled) return;

    const now = Date.now();

    if (!this.#middlewareStats.has(data.name)) {
      this.#middlewareStats.set(data.name, {
        executions: this.#createCounter(),
        duration: [],
        errors: this.#createCounter(),
      });
    }

    const middlewareStat = this.#middlewareStats.get(data.name)!;
    this.#incrementCounter(middlewareStat.executions, now);
    middlewareStat.duration.push({ timestamp: now, value: data.duration });

    if (!data.success) {
      this.#incrementCounter(middlewareStat.errors, now);
    }
  }

  /**
   * Updates the active bucket count.
   *
   * @param count - Current number of active buckets
   *
   * @public
   */
  updateActiveBuckets(count: number): void {
    if (!this.#options.enabled) return;

    this.#updateGauge(this.#gauges.activeBuckets, count, Date.now());
  }

  /**
   * Retrieves current metrics snapshot.
   *
   * @returns Complete metrics data
   *
   * @example
   * ```typescript
   * const metrics = manager.getMetrics();
   * console.log(`Error rate: ${metrics.requests.errorCount.value / metrics.requests.requestCount.value * 100}%`);
   * console.log(`P95 latency: ${metrics.requests.latency.p95}ms`);
   * ```
   *
   * @public
   */
  getMetrics(): RestMetrics {
    const now = Date.now();

    return {
      requests: {
        latency: this.#calculateDistribution(this.#latencyData),
        responseSize: this.#calculateDistribution(this.#responseSizeData),
        requestCount: { ...this.#counters.requests },
        errorCount: { ...this.#counters.errors },
        timeoutCount: { ...this.#counters.timeouts },
        rateLimitCount: { ...this.#counters.rateLimits },
        statusCodes: new Map(
          Array.from(this.#statusCodes.entries()).map(([code, counter]) => [
            code,
            { ...counter },
          ]),
        ),
        activeRequests: { ...this.#gauges.activeRequests },
        latencyHistogram: this.#cloneHistogram(this.#latencyHistogram),
      },
      rateLimits: {
        violations: { ...this.#counters.rateLimitViolations },
        preventedViolations: { ...this.#counters.rateLimitPrevented },
        activeBuckets: { ...this.#gauges.activeBuckets },
        bucketUtilization: this.#calculateDistribution(
          this.#bucketUtilizationData,
        ),
        waitTime: this.#calculateDistribution(this.#waitTimeData),
        bucketStats: new Map(
          Array.from(this.#bucketStats.entries()).map(([id, stats]) => [
            id,
            {
              hits: { ...stats.hits },
              utilization: { ...stats.utilization },
              lastReset: stats.lastReset,
            },
          ]),
        ),
      },
      retries: {
        attempts: { ...this.#counters.retryAttempts },
        successes: { ...this.#counters.retrySuccesses },
        failures: { ...this.#counters.retryFailures },
        retryDistribution: this.#calculateDistribution(this.#retryCountData),
        delayTime: this.#calculateDistribution(this.#retryDelayData),
        reasonStats: new Map(
          Array.from(this.#retryReasons.entries()).map(([reason, counter]) => [
            reason,
            { ...counter },
          ]),
        ),
      },
      middleware: new Map(
        Array.from(this.#middlewareStats.entries()).map(([name, stats]) => [
          name,
          {
            executions: { ...stats.executions },
            duration: this.#calculateDistribution(stats.duration),
            errors: { ...stats.errors },
          },
        ]),
      ),
      collectionStartTime: this.#startTime,
      lastUpdate: now,
    };
  }

  /**
   * Resets all collected metrics.
   *
   * @example
   * ```typescript
   * // Reset metrics daily for fresh monitoring periods
   * setInterval(() => metrics.reset(), 24 * 60 * 60 * 1000);
   * ```
   *
   * @public
   */
  reset(): void {
    // Clear all data arrays
    this.#latencyData.length = 0;
    this.#responseSizeData.length = 0;
    this.#bucketUtilizationData.length = 0;
    this.#retryCountData.length = 0;
    this.#waitTimeData.length = 0;
    this.#retryDelayData.length = 0;

    // Reset counters
    for (const counter of Object.values(this.#counters)) {
      counter.value = 0;
      counter.lastIncrement = 0;
    }

    // Reset gauges
    for (const gauge of Object.values(this.#gauges)) {
      gauge.value = 0;
      gauge.lastUpdate = 0;
    }

    // Clear maps
    this.#statusCodes.clear();
    this.#bucketStats.clear();
    this.#retryReasons.clear();
    this.#middlewareStats.clear();

    // Reset histogram
    this.#latencyHistogram.sum = 0;
    this.#latencyHistogram.count = 0;
    for (const [bucket] of this.#latencyHistogram.buckets) {
      this.#latencyHistogram.buckets.set(bucket, 0);
    }
  }

  /**
   * Destroys the metrics manager and cleans up resources.
   *
   * @public
   */
  destroy(): void {
    if (this.#cleanupInterval) {
      clearInterval(this.#cleanupInterval);
      this.#cleanupInterval = null;
    }

    if (this.#aggregationInterval) {
      clearInterval(this.#aggregationInterval);
      this.#aggregationInterval = null;
    }

    this.reset();
  }

  /**
   * Creates a new counter metric.
   *
   * @internal
   */
  #createCounter(): CounterMetric {
    return { value: 0, lastIncrement: 0 };
  }

  /**
   * Creates a new gauge metric.
   *
   * @internal
   */
  #createGauge(): GaugeMetric {
    return { value: 0, lastUpdate: 0 };
  }

  /**
   * Increments a counter metric.
   *
   * @internal
   */
  #incrementCounter(counter: CounterMetric, timestamp: number): void {
    counter.value++;
    counter.lastIncrement = timestamp;
  }

  /**
   * Updates a gauge metric.
   *
   * @internal
   */
  #updateGauge(gauge: GaugeMetric, value: number, timestamp: number): void {
    gauge.value = Math.max(0, value); // Prevent negative values
    gauge.lastUpdate = timestamp;
  }

  /**
   * Updates a histogram with a new value.
   *
   * @internal
   */
  #updateHistogram(histogram: HistogramMetric, value: number): void {
    histogram.sum += value;
    histogram.count++;

    for (const [bucket, count] of histogram.buckets) {
      if (value <= bucket) {
        histogram.buckets.set(bucket, count + 1);
      }
    }
  }

  /**
   * Creates a deep copy of a histogram.
   *
   * @internal
   */
  #cloneHistogram(histogram: HistogramMetric): HistogramMetric {
    return {
      buckets: new Map(histogram.buckets),
      sum: histogram.sum,
      count: histogram.count,
    };
  }

  /**
   * Calculates distribution metrics from raw data.
   *
   * @internal
   */
  #calculateDistribution(
    data: Array<{ timestamp: number; value: number }>,
  ): DistributionMetrics {
    if (data.length === 0) {
      return {
        count: 0,
        min: 0,
        max: 0,
        mean: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        variance: 0,
        stddev: 0,
      };
    }

    const values = data.map((d) => d.value).sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / count;

    const variance =
      values.reduce((acc, val) => acc + (val - mean) ** 2, 0) / count;
    const stddev = Math.sqrt(variance);

    return {
      count,
      min: values[0] as number,
      max: values[count - 1] as number,
      mean,
      p50: this.#percentile(values, 50),
      p95: this.#percentile(values, 95),
      p99: this.#percentile(values, 99),
      variance,
      stddev,
    };
  }

  /**
   * Calculates a percentile from sorted values.
   *
   * @internal
   */
  #percentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;

    const index = (percentile / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) {
      return sortedValues[lower] as number;
    }

    const weight = index - lower;
    return (
      (sortedValues[lower] as number) * (1 - weight) +
      (sortedValues[upper] as number) * weight
    );
  }

  /**
   * Starts the cleanup interval for data retention.
   *
   * @internal
   */
  #startCleanupInterval(): void {
    this.#cleanupInterval = setInterval(() => {
      const cutoff = Date.now() - this.#options.retentionPeriod;

      this.#pruneData(this.#latencyData, cutoff);
      this.#pruneData(this.#responseSizeData, cutoff);
      this.#pruneData(this.#bucketUtilizationData, cutoff);
      this.#pruneData(this.#retryCountData, cutoff);
      this.#pruneData(this.#waitTimeData, cutoff);
      this.#pruneData(this.#retryDelayData, cutoff);

      for (const stats of this.#middlewareStats.values()) {
        this.#pruneData(stats.duration, cutoff);
      }

      // Limit map sizes to prevent memory leaks
      this.#limitMapSize(this.#statusCodes, this.#options.maxTrackedItems);
      this.#limitMapSize(this.#bucketStats, this.#options.maxTrackedItems);
      this.#limitMapSize(this.#retryReasons, this.#options.maxTrackedItems);
      this.#limitMapSize(this.#middlewareStats, this.#options.maxTrackedItems);
    }, this.#options.aggregationInterval);
  }

  /**
   * Starts the aggregation interval for metrics updates.
   *
   * @internal
   */
  #startAggregationInterval(): void {
    this.#aggregationInterval = setInterval(() => {
      const start = Date.now();
      const metrics = this.getMetrics();
      const computationTime = Date.now() - start;

      const event: MetricsUpdateEvent = {
        timestamp: new Date().toISOString(),
        metrics,
        computationTime,
      };

      this.#eventEmitter.emit("metricsUpdate", event);
    }, this.#options.aggregationInterval);
  }

  /**
   * Removes old data points based on retention policy.
   *
   * @internal
   */
  #pruneData(
    data: Array<{ timestamp: number; value: number }>,
    cutoff: number,
  ): void {
    const startIndex = data.findIndex((item) => item.timestamp > cutoff);
    if (startIndex > 0) {
      data.splice(0, startIndex);
    }
  }

  /**
   * Limits map size by removing oldest entries.
   *
   * @internal
   */
  #limitMapSize<K, V>(map: Map<K, V>, maxSize: number): void {
    if (map.size <= maxSize) return;

    const entries = Array.from(map.entries());
    const toRemove = entries.slice(0, map.size - maxSize);

    for (const [key] of toRemove) {
      map.delete(key);
    }
  }
}
