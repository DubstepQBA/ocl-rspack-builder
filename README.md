# Next.js RSPack Builder

A lightweight and optimized solution to integrate RSPack with Next.js 14+, focused on solving common build issues and improving performance in Docker/CI environments.

## Features

- 🚀 Memory and performance optimization with RSPack
- 🎯 Configuration tailored for Docker and CI environments
- 📦 Zero-config TypeScript support
- 🛠 Resolution of common Next.js issues
- 🔄 Optimized chunk splitting to reduce sizes
- ⚡ Intelligent cache management
- 🔧 Adjustments to prevent OOM (Out of Memory) in Docker
- 🔒 Server Actions optimization for stability

## Installation

```bash
npm install @dubstepqba/rspack-builder
# or
yarn add @dubstepqba/rspack-builder
# or
pnpm add @dubstepqba/rspack-builder
```

## Usage

### Basic Usage

```javascript
const { default: withRspack } = require('@dubstepqba/rspack-builder')

/** @type {import('next').NextConfig} */
const nextConfig = withRspack()

module.exports = nextConfig
```

### Optimized Configuration for Docker/CI

```javascript
const { default: withRspack } = require('@dubstepqba/rspack-builder')

/** @type {import('next').NextConfig} */
const nextConfig = withRspack(
  {
    // Your Next.js config
  },
  {
    // Options for Docker/CI - prevents OOM errors
    memoryOptions: {
      maxMemory: 1536, // Memory limit in MB to prevent OOM
      maxWorkers: 2, // Limit workers to reduce memory usage
    },
    // Cache options - improves build speed
    cacheOptions: {
      enableFilesystemCache: true,
      compression: true,
    },
    // CI optimizations
    ciOptions: {
      disableTelemetry: true,
      disableSourceMapsInProduction: true,
    },
    // RSPack options - webpack optimization
    rspackConfig: {
      optimization: {
        minimize: process.env.NODE_ENV === 'production',
        // More optimization configurations...
      },
    },
  }
)

module.exports = nextConfig
```

### Optimized Configuration Explanation

1. **Memory optimization for Docker/CI**:

   - Limits maximum memory to prevent OOM errors
   - Reduces the number of workers for stability
   - Disables unnecessary memory-consuming features

2. **Intelligent cache management**:

   - Filesystem cache with compression
   - Automatic creation of cache directories
   - Environment-optimized cache names

3. **CI optimizations**:

   - Disables telemetry for faster builds
   - Removes source maps in production to reduce memory
   - Specific configurations for Docker environments

4. **RSPack/Webpack optimization**:
   - Optimized chunk splitting
   - Removal of empty and duplicate chunks
   - Intelligent grouping of node_modules

## Configuration Options

### Memory Options

| Option                     | Type     | Default                | Description               |
| -------------------------- | -------- | ---------------------- | ------------------------- |
| `memoryOptions.maxMemory`  | `number` | `2048`                 | Memory limit in MB        |
| `memoryOptions.maxWorkers` | `number` | `4` (local) / `2` (CI) | Maximum number of workers |

### Cache Options

| Option                               | Type      | Default              | Description             |
| ------------------------------------ | --------- | -------------------- | ----------------------- |
| `cacheOptions.enableFilesystemCache` | `boolean` | `true`               | Enable filesystem cache |
| `cacheOptions.cacheDirectory`        | `string`  | `.next/cache/rspack` | Directory for cache     |
| `cacheOptions.compression`           | `boolean` | `true`               | Compress cache files    |

### CI Options

| Option                                    | Type      | Default        | Description                       |
| ----------------------------------------- | --------- | -------------- | --------------------------------- |
| `ciOptions.disableTelemetry`              | `boolean` | `true` (in CI) | Disable telemetry                 |
| `ciOptions.disableSourceMapsInProduction` | `boolean` | `true`         | Disable source maps in production |

### RSPack Options

| Option         | Type     | Default | Description                         |
| -------------- | -------- | ------- | ----------------------------------- |
| `rspackConfig` | `object` | `{}`    | Custom RSPack/webpack configuration |

## RSPack Configuration Options

### Optimization Options

| Option                      | Type              | Description                    |
| --------------------------- | ----------------- | ------------------------------ |
| `optimization.minimize`     | `boolean`         | Enable/disable minification    |
| `optimization.minimizer`    | `string[]`        | List of minimizer plugins      |
| `optimization.splitChunks`  | `object`          | Configure chunk splitting      |
| `optimization.runtimeChunk` | `boolean\|object` | Control runtime chunk creation |

### Performance Options

| Option                          | Type                        | Description                                      |
| ------------------------------- | --------------------------- | ------------------------------------------------ |
| `performance.maxAssetSize`      | `number`                    | Maximum allowed size for assets (in bytes)       |
| `performance.maxEntrypointSize` | `number`                    | Maximum allowed size for entry points (in bytes) |
| `performance.hints`             | `'warning'\|'error'\|false` | Performance hints level                          |

### Cache Options

| Option                    | Type                     | Description                   |
| ------------------------- | ------------------------ | ----------------------------- |
| `cache.type`              | `'memory'\|'filesystem'` | Cache type                    |
| `cache.buildDependencies` | `object`                 | Additional build dependencies |
| `cache.name`              | `string`                 | Cache name for isolation      |
| `cache.version`           | `string`                 | Cache version                 |

### Experiments

| Option                         | Type      | Description                         |
| ------------------------------ | --------- | ----------------------------------- |
| `experiments.asyncWebAssembly` | `boolean` | Enable WebAssembly as async modules |
| `experiments.layers`           | `boolean` | Enable module layer support         |
| `experiments.topLevelAwait`    | `boolean` | Enable top-level await              |

### Module Rules

```javascript
rspackConfig: {
  module: {
    rules: [
      {
        test: /\.custom$/, // File regex
        use: ['custom-loader'],
        exclude: /node_modules/,
      },
    ],
  },
}
```

### Resolve Options

```javascript
rspackConfig: {
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@components': './src/components',
    },
    fallback: {
      // Polyfills for Node modules
      "path": require.resolve("path-browserify"),
    },
  },
}
```

### DevServer Options (Development)

```javascript
rspackConfig: {
  devServer: {
    hot: true,
    port: 3000,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
}
```

## Solutions to Common Next.js Issues

This plugin automatically resolves several common issues that occur during Next.js builds:

1. **"Out of Memory" errors in Docker/CI**

   - Automatically limits memory and workers
   - Optimizes cache to reduce recalculations

2. **Server Actions errors**

   - Configures appropriate limits for payloads
   - Improves server actions stability

3. **"from argument must be of type string" problems**

   - Resolves relative path issues in loaders

4. **Slow builds**

   - Optimized filesystem cache
   - Intelligent chunk configuration
   - Reduction of duplicate work

5. **Minification errors**
   - Robust configuration for production optimizations
   - Automatic fallbacks for minifiers

## Docker Compatibility

The plugin is specially optimized for Docker environments:

```Dockerfile
FROM node:18-alpine AS base
# ... standard Docker configuration
ENV DOCKER=true
# This variable activates special optimizations for Docker

# ... rest of Dockerfile
```

## Production Optimizations

The builder includes essential production optimizations:

- Automatic code splitting
- Production minification
- Chunk optimization
- Filesystem cache with compression
- Memory optimization
- Server Actions stabilization

## Development Mode

Development mode includes:

- Fast Refresh support
- Source maps
- Development optimizations
- Memory usage monitoring

## Environment Variables

The following environment variables are supported:

- `NODE_ENV`: Determines optimization level
- `CI=true`: Activates optimizations for CI environments
- `DOCKER=true`: Activates optimizations for Docker
- `NEXT_TELEMETRY_DISABLED`: Automatically set in CI
- Standard Next.js environment variables

## Troubleshooting

### Common Issues

1. **Build Performance**

   - Ensure you're using the latest version
   - Check your Node.js version (>=16.0.0 required)
   - Adjust memoryOptions based on your environment

2. **Docker Builds**

   - Set `DOCKER=true` environment variable
   - Adjust memory limits based on container constraints
   - Consider reducing maxWorkers for stability

3. **Server Actions Errors**
   - Adjust bodySizeLimit if working with large payloads
   - Check allowedOrigins configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

- GitHub Issues: [Report a bug](https://github.com/DubstepQBA/rspack-builder/issues)
- Author: [Javier Alfaro](https://github.com/DubstepQBA)

## Credits

Built with [RSPack](https://www.rspack.dev/) and [Next.js](https://nextjs.org/)
