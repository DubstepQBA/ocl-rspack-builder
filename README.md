# Next.js RSPack Builder

A lightweight RSPack builder for Next.js 14+ that provides optimized build performance with minimal configuration.

## Features

- 🚀 Optimized build performance with RSPack
- 🎯 Production-ready optimizations
- 📦 Zero-config TypeScript support
- 🛠 Simple and maintainable configuration
- 🔄 Automatic chunk splitting
- ⚡ Next.js native optimizations

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

### Custom Configuration

```javascript
const { default: withRspack } = require('@dubstepqba/rspack-builder')

/** @type {import('next').NextConfig} */
const nextConfig = withRspack(
  {
    // Your Next.js config
  },
  {
    rspackConfig: {
      // RSPack specific options
      optimization: {
        minimize: true,
        minimizer: ['...'],
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 0,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            defaultVendors: {
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
      },
      performance: {
        maxAssetSize: 250000,
        maxEntrypointSize: 250000,
        hints: 'warning',
      },
      cache: {
        type: 'filesystem',
        buildDependencies: {
          config: ['./next.config.js'],
        },
        name: 'development-cache',
      },
      experiments: {
        asyncWebAssembly: true,
        layers: true,
      },
    },
  }
)

module.exports = nextConfig
```

### Optimized Configuration Example

```javascript
const { default: withRspack } = require('@dubstepqba/rspack-builder')

/** @type {import('next').NextConfig} */
const nextConfig = withRspack(
  {
    // Next.js config
    poweredByHeader: false,
    compress: true,
  },
  {
    rspackConfig: {
      optimization: {
        // Habilitar minificación en producción
        minimize: process.env.NODE_ENV === 'production',
        // Configuración de división de chunks optimizada
        splitChunks: {
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
        // Reducir el tamaño del bundle
        removeAvailableModules: true,
        removeEmptyChunks: true,
        mergeDuplicateChunks: true,
      },
      performance: {
        // Optimizar tamaños de assets
        maxAssetSize: 250000,
        maxEntrypointSize: 250000,
        hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
      },
      cache: {
        // Habilitar caché para builds más rápidos
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        compression: 'gzip',
      },
    },
  }
)

module.exports = nextConfig
```

### Explicación de la Configuración Optimizada

1. **Optimización de Chunks**:

   - `splitChunks.chunks: 'all'`: Divide todos los chunks para mejor caching
   - `minSize/maxSize`: Controla el tamaño de los chunks para mejor rendimiento
   - `cacheGroups`: Agrupa módulos de node_modules en un chunk separado

2. **Optimización de Tamaño**:

   - `minimize`: Minificación automática en producción
   - `removeAvailableModules`: Elimina módulos innecesarios
   - `removeEmptyChunks`: Elimina chunks vacíos
   - `mergeDuplicateChunks`: Combina chunks duplicados

3. **Caché**:

   - `type: 'filesystem'`: Caché persistente para builds más rápidos
   - `compression: 'gzip'`: Compresión de caché para ahorrar espacio

4. **Performance**:
   - Límites de tamaño optimizados para assets
   - Advertencias solo en producción

## Configuration Options

### RSPack Options

| Option         | Type     | Default | Description                 |
| -------------- | -------- | ------- | --------------------------- |
| `rspackConfig` | `object` | `{}`    | Custom RSPack configuration |

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
        test: /\.custom$/, // Regex para archivos
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
      // Polyfills para módulos de Node
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

## Production Optimizations

The builder includes essential production optimizations:

- Automatic code splitting
- Production minification
- Chunk optimization
- Next.js native optimizations

## Development Mode

Development mode includes:

- Fast Refresh support
- Source maps
- Development optimizations

## Environment Variables

The following environment variables are supported:

- `NODE_ENV`: Determines optimization level
- Standard Next.js environment variables

## Troubleshooting

### Common Issues

1. **Build Performance**

   - Ensure you're using the latest version
   - Check your Node.js version (>=16.0.0 required)

2. **Docker Builds**
   - The builder is optimized for Docker environments
   - Uses minimal configuration to prevent memory issues

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

- GitHub Issues: [Report a bug](https://github.com/DubstepQBA/ocl-rspack-builder/issues)
- Author: [Javier Alfaro](https://github.com/DubstepQBA)

## Credits

Built with [RSPack](https://www.rspack.dev/) and [Next.js](https://nextjs.org/)
