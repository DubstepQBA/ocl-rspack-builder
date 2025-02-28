import type { NextConfig } from 'next'
import type { Configuration as RspackConfig } from '@rspack/core'
import path from 'path'
import fs from 'fs'

// Add process.setHeapSizeLimit for Node.js
interface ProcessExtensions {
  setHeapSizeLimit?(limit: string): void
}

// Extend the process interface using type augmentation
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Process extends ProcessExtensions {}
  }
}

export interface RspackPluginOptions {
  rspackConfig?: Partial<RspackConfig>
  /**
   * Memory options to prevent OOM issues in Docker/CI
   */
  memoryOptions?: {
    /**
     * Limit maximum memory in MB to prevent OOM
     * @default 2048
     */
    maxMemory?: number
    /**
     * Limit number of worker threads to reduce memory usage
     * @default 4
     */
    maxWorkers?: number
  }
  /**
   * Cache configuration options
   */
  cacheOptions?: {
    /**
     * Enable or disable filesystem cache
     * @default true
     */
    enableFilesystemCache?: boolean
    /**
     * Directory to store cache
     * @default '.next/cache/rspack'
     */
    cacheDirectory?: string
    /**
     * Compress cache files to save space
     * @default true
     */
    compression?: boolean
  }
  /**
   * Options for CI/Docker environments
   */
  ciOptions?: {
    /**
     * Disable telemetry for faster builds in CI
     * @default true in CI, false in local
     */
    disableTelemetry?: boolean
    /**
     * Disable source maps in production for faster builds and less memory
     * @default true
     */
    disableSourceMapsInProduction?: boolean
  }
}

export default function withRspack(
  config: NextConfig = {},
  options: RspackPluginOptions = {}
): NextConfig {
  // Enable RSPack
  process.env.NEXT_RSPACK = 'true'
  process.env.BUILTIN_FLIGHT_CLIENT_ENTRY_PLUGIN = 'true'
  process.env.BUILTIN_APP_LOADER = 'true'
  process.env.BUILTIN_SWC_LOADER = 'true'

  // Detect if we're in a CI/Docker environment
  const isCI = process.env.CI === 'true' || process.env.DOCKER === 'true'

  // Set default options
  const defaultOptions: Required<RspackPluginOptions> = {
    rspackConfig: {},
    memoryOptions: {
      maxMemory: 2048,
      maxWorkers: isCI ? 2 : 4,
    },
    cacheOptions: {
      enableFilesystemCache: true,
      cacheDirectory: '.next/cache/rspack',
      compression: true,
    },
    ciOptions: {
      disableTelemetry: isCI,
      disableSourceMapsInProduction: process.env.NODE_ENV === 'production',
    },
  }

  // Merge default options with user options
  const mergedOptions = {
    ...defaultOptions,
    rspackConfig: { ...defaultOptions.rspackConfig, ...options.rspackConfig },
    memoryOptions: { ...defaultOptions.memoryOptions, ...options.memoryOptions },
    cacheOptions: { ...defaultOptions.cacheOptions, ...options.cacheOptions },
    ciOptions: { ...defaultOptions.ciOptions, ...options.ciOptions },
  }

  // Configure memory limits to prevent OOM in Docker/CI
  if (mergedOptions.memoryOptions.maxMemory) {
    const memoryLimit = `${mergedOptions.memoryOptions.maxMemory}m`
    try {
      if (typeof process.setHeapSizeLimit === 'function') {
        process.setHeapSizeLimit(memoryLimit)
      }
    } catch (e) {
      console.warn('Failed to set memory limit:', e)
    }
  }

  // Configure telemetry based on options
  if (mergedOptions.ciOptions.disableTelemetry) {
    process.env.NEXT_TELEMETRY_DISABLED = '1'
  }

  // Disable source maps in production if configured
  if (
    process.env.NODE_ENV === 'production' &&
    mergedOptions.ciOptions.disableSourceMapsInProduction
  ) {
    process.env.GENERATE_SOURCEMAP = 'false'
  }

  // Prepare cache directory if enabled
  if (mergedOptions.cacheOptions.enableFilesystemCache) {
    try {
      const cacheDir = path.resolve(
        process.cwd(),
        mergedOptions.cacheOptions.cacheDirectory || '.next/cache/rspack'
      )
      fs.mkdirSync(cacheDir, { recursive: true })
    } catch (e) {
      console.warn('Failed to create cache directory:', e)
    }
  }

  // Preserve original webpack function
  const originalWebpack = config.webpack

  return {
    ...config,
    webpack: (webpackConfig, context) => {
      // Apply original webpack config if it exists
      if (typeof originalWebpack === 'function') {
        webpackConfig = originalWebpack(webpackConfig, context)
      }

      // Get user optimization config from rspackConfig
      const userOptimization = options.rspackConfig?.optimization || {}

      // Set default optimization values only if not already set
      const optimization = {
        ...webpackConfig.optimization,
        minimize: webpackConfig.optimization?.minimize ?? process.env.NODE_ENV === 'production',
        splitChunks: webpackConfig.optimization?.splitChunks || {
          chunks: 'all',
          minSize: 20000,
          maxSize: 100000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
        // Additional optimizations to reduce bundle size
        removeAvailableModules: process.env.NODE_ENV === 'production',
        removeEmptyChunks: true,
        mergeDuplicateChunks: true,
        // Apply user optimization options with highest priority
        ...userOptimization,
      }

      // Configure cache for faster compilation
      const cacheDirectory = mergedOptions.cacheOptions.cacheDirectory || '.next/cache/rspack'

      const cache = mergedOptions.cacheOptions.enableFilesystemCache
        ? {
            type: 'filesystem' as const,
            cacheDirectory: path.resolve(process.cwd(), cacheDirectory),
            compression: mergedOptions.cacheOptions.compression ? 'gzip' : false,
            buildDependencies: {
              config: [__filename],
            },
            // Faster in CI
            memoryCacheUnaffected: true,
            name: `${process.env.NODE_ENV || 'development'}-cache`,
          }
        : false

      // Configure number of workers to prevent memory issues
      const parallelism = isCI ? mergedOptions.memoryOptions.maxWorkers : undefined

      // Only add configurations if they are enabled or differ from default
      // Define the extended config type without extending RspackOptions directly
      type CacheType =
        | false
        | {
            type: 'filesystem'
            cacheDirectory: string
            compression: string | boolean
            buildDependencies: {
              config: string[]
            }
            memoryCacheUnaffected: boolean
            name: string
          }

      interface ExtendedConfig extends Omit<RspackConfig, 'cache'> {
        cache?: CacheType
        parallelism?: number
      }

      const finalConfig: ExtendedConfig = {
        ...webpackConfig,
        optimization,
      }

      // Add cache only if enabled
      if (cache) {
        finalConfig.cache = cache
      }

      // Limit parallelism in CI to prevent OOM
      if (parallelism !== undefined) {
        finalConfig.parallelism = parallelism
      }

      // Configure performance to control size warnings
      finalConfig.performance = {
        ...webpackConfig.performance,
        hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
        maxAssetSize: 250000,
        maxEntrypointSize: 250000,
      }

      // Add all custom user configurations
      if (options.rspackConfig) {
        Object.entries(options.rspackConfig).forEach(([key, value]) => {
          if (key !== 'optimization') {
            // Don't overwrite optimization (we've already handled it)
            ;(finalConfig as Record<string, unknown>)[key] = value
          }
        })
      }

      return finalConfig
    },
    // Configure SWC for higher speed in CI/Docker
    swcMinify: process.env.NODE_ENV === 'production',
    // Configure memory limits for errors
    experimental: {
      ...(config.experimental || {}),
      serverActions: {
        // Add a larger limit to prevent server actions errors
        bodySizeLimit: '4mb',
        ...(typeof config.experimental?.serverActions === 'object'
          ? config.experimental.serverActions
          : {}),
      },
      // Reduce bundle size in production
      optimizeCss: process.env.NODE_ENV === 'production',
      // Improve code generation stability
      turbotrace: {
        logLevel: 'error',
        ...(typeof config.experimental?.turbotrace === 'object'
          ? config.experimental.turbotrace
          : {}),
      },
    },
  }
}
