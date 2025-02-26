import { Configuration as RspackConfig } from '@rspack/core'
import { NextConfig } from 'next'

export interface RspackPluginOptions {
  /**
   * Enable/disable React Fast Refresh
   * @default true
   */
  enableReactRefresh?: boolean

  /**
   * Build optimization level
   * @default process.env.NODE_ENV
   */
  optimizationLevel?: 'development' | 'production'

  /**
   * Enable experimental RSPack features
   * @default false
   */
  experimentalFeatures?: boolean

  /**
   * Custom RSPack configuration
   * @default {}
   */
  rspackConfig?: Partial<RspackConfig>

  /**
   * SWC compiler options
   */
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

  /**
   * Performance hints configuration
   */
  performance?: {
    hints?: boolean | 'warning' | 'error'
    maxEntrypointSize?: number
    maxAssetSize?: number
  }
}

declare function withRspack(config?: NextConfig, options?: RspackPluginOptions): NextConfig

export default withRspack
