import type { NextConfig } from 'next'
import type { Configuration as RspackConfig } from '@rspack/core'

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

  // Merge RSPack specific configurations
  return {
    ...config,
    webpack: undefined, // Disable webpack
    experimental: {
      ...config.experimental,
      serverActions: {
        bodySizeLimit: '2mb',
        allowedOrigins: ['*'],
      },
    },
    // Enhanced RSPack configurations
    rspack: {
      ...finalOptions.rspackConfig,
      optimization: {
        minimize: process.env.NODE_ENV === 'production',
        minimizer:
          process.env.NODE_ENV === 'production'
            ? [
                {
                  pluginName: 'SwcMinifyPlugin',
                },
              ]
            : [],
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
        rules: [
          {
            test: /\.(js|jsx|ts|tsx)$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'builtin:swc-loader',
                options: finalOptions.swcOptions,
              },
            ],
          },
          ...(finalOptions.rspackConfig?.module?.rules || []),
        ],
      },
    },
  }
}
