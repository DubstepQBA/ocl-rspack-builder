module.exports = function withRspack(config, options = {}) {
  // Enable RSPack and required features
  process.env.NEXT_RSPACK = 'true'
  process.env.BUILTIN_FLIGHT_CLIENT_ENTRY_PLUGIN = 'true'
  process.env.BUILTIN_APP_LOADER = 'true'
  process.env.BUILTIN_SWC_LOADER = 'true'

  // Add customizable options with enhanced defaults
  const defaultOptions = {
    enableReactRefresh: true,
    optimizationLevel: process.env.NODE_ENV || 'development',
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
    performance: {
      hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
    },
  }

  const finalOptions = { ...defaultOptions, ...options }

  // Validate options
  if (typeof finalOptions.enableReactRefresh !== 'boolean') {
    throw new Error('enableReactRefresh must be a boolean')
  }

  // Merge RSPack specific configurations
  return {
    ...config,
    webpack: undefined, // Disable webpack
    experimental: {
      ...config.experimental,
      rspackExperimentalOptions: finalOptions.experimentalFeatures,
      serverActions: true,
      serverComponents: true,
    },
    // Enhanced RSPack configurations
    rspack: {
      ...finalOptions.rspackConfig,
      optimization: {
        minimize: process.env.NODE_ENV === 'production',
        minimizer: process.env.NODE_ENV === 'production' ? [
          {
            pluginName: 'SwcMinifyPlugin',
          },
        ] : [],
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
      performance: finalOptions.performance,
    },
  }
}
