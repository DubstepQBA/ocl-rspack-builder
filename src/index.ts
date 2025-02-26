import type { NextConfig } from 'next'
import type { Configuration as RspackConfig } from '@rspack/core'

export interface RspackPluginOptions {
  rspackConfig?: Partial<RspackConfig>
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

  return {
    ...config,
    webpack: (webpackConfig, context) => {
      // Apply original webpack config if it exists
      if (typeof config.webpack === 'function') {
        webpackConfig = config.webpack(webpackConfig, context)
      }

      return {
        ...webpackConfig,
        optimization: {
          ...webpackConfig.optimization,
          minimize: process.env.NODE_ENV === 'production',
          splitChunks: {
            chunks: 'all',
          },
          ...options.rspackConfig?.optimization,
        },
      }
    },
  }
}
