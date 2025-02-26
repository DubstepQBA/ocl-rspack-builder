import type { NextConfig } from 'next'
import type { Configuration as RspackConfig } from '@rspack/core'
import type { Compiler } from 'webpack'
import path from 'path'
import fs from 'fs'

export interface RspackPluginOptions {
  enableReactRefresh?: boolean
  optimizationLevel?: 'development' | 'production'
  experimentalFeatures?: boolean
  rspackConfig?: Partial<RspackConfig>
  swcOptions?: {
    jsc?: {
      parser?: {
        syntax?: 'typescript' | 'ecmascript'
        tsx?: boolean
      }
      transform?: {
        react?: {
          runtime?: 'automatic' | 'classic'
          development?: boolean
          refresh?: boolean
        }
      }
    }
    minify?: boolean
  }
}

export default function withRspack(
  config: NextConfig = {},
  options: RspackPluginOptions = {}
): NextConfig {
  // Enable RSPack and required features
  process.env.NEXT_RSPACK = 'true'
  process.env.BUILTIN_FLIGHT_CLIENT_ENTRY_PLUGIN = 'true'
  process.env.BUILTIN_APP_LOADER = 'true'
  process.env.BUILTIN_SWC_LOADER = 'true'

  // Add customizable options with enhanced defaults
  const defaultOptions: RspackPluginOptions = {
    enableReactRefresh: true,
    optimizationLevel: (process.env.NODE_ENV === 'production' ? 'production' : 'development') as
      | 'development'
      | 'production',
    experimentalFeatures: false,
    rspackConfig: {},
    swcOptions: {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
            development: process.env.NODE_ENV !== 'production',
            refresh: true,
          },
        },
      },
      minify: process.env.NODE_ENV === 'production',
    },
  }

  const finalOptions = { ...defaultOptions, ...options }

  // Default Next.js configurations
  const defaultNextConfig: NextConfig = {
    poweredByHeader: false,
    generateEtags: false,
    serverRuntimeConfig: {
      mySecret: process.env.MY_SECRET,
    },
    publicRuntimeConfig: {
      staticFolder: '/static',
    },
  }

  // Merge configurations with user provided config
  const mergedConfig = {
    ...defaultNextConfig,
    ...config,
  }

  // Get the original webpack config function if it exists
  const originalWebpack = mergedConfig.webpack

  // Merge RSPack specific configurations
  return {
    ...mergedConfig,
    experimental: {
      ...mergedConfig.experimental,
      serverActions: {
        bodySizeLimit: '2mb',
        allowedOrigins: ['*'],
      },
    },
    // Enhanced RSPack configurations using webpack config
    webpack: (config, context) => {
      // Apply original webpack config if it exists
      if (typeof originalWebpack === 'function') {
        config = originalWebpack(config, context)
      }

      // Get absolute path for cache directory
      const cacheDirectory = path.resolve(process.cwd(), '.next/cache/rspack')

      // Create cache directory if it doesn't exist
      try {
        fs.mkdirSync(cacheDirectory, { recursive: true })
      } catch (error) {
        console.warn('Failed to create cache directory:', error)
      }

      // Add RSPack specific configurations
      const webpackConfig = {
        ...config,
        cache: {
          type: 'filesystem',
          buildDependencies: {
            config: [__filename],
          },
          cacheDirectory,
          compression: 'gzip',
          version: '1.0.0',
          store: 'pack',
          memoryCacheUnaffected: true,
        },
        optimization: {
          ...config.optimization,
          minimize: process.env.NODE_ENV === 'production',
          minimizer: [],
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendors: {
                test: /[\\/]node_modules[\\/]/,
                priority: -10,
                reuseExistingChunk: true,
              },
              default: {
                minChunks: 2,
                priority: -20,
                reuseExistingChunk: true,
              },
            },
          },
          ...finalOptions.rspackConfig?.optimization,
        },
        module: {
          ...config.module,
          rules: [
            ...(config.module?.rules || []),
            {
              test: /\.(js|jsx|ts|tsx)$/,
              exclude: /node_modules/,
              use: [
                {
                  loader: 'next/dist/build/webpack/loaders/next-swc-loader',
                  options: {
                    ...finalOptions.swcOptions,
                    isServer: context.isServer,
                    hasReactRefresh: !context.isServer && finalOptions.enableReactRefresh,
                    development: process.env.NODE_ENV !== 'production',
                  },
                },
              ],
            },
            ...(finalOptions.rspackConfig?.module?.rules || []),
          ],
        },
      }

      // Add minifier in production
      if (process.env.NODE_ENV === 'production') {
        // Let Next.js handle minification
        webpackConfig.optimization.minimize = true
      }

      return webpackConfig
    },
  }
}
