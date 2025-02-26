# Next.js RSPack Builder

An enhanced RSPack builder for Next.js 14+ that provides improved build performance and configuration options.

## Features

- 🚀 Optimized build performance
- ⚡ Fast refresh support
- 🛠 Customizable configuration
- 📦 TypeScript support
- 🔧 Server Components & Actions support
- 🎯 Production optimizations
- 🔄 Hot Module Replacement

## Installation

```bash
npm install @dubstepqba/rspack-builder
# or
yarn add @dubstepqba/rspack-builder
# or
pnpm add @dubstepqba/rspack-builder
```

## Usage

In your `next.config.js`:

```javascript
const { default: withRspack } = require('@dubstepqba/rspack-builder')

/** @type {import('next').NextConfig} */
const nextConfig = withRspack({
  // Tu configuración de Next.js aquí
})

module.exports = nextConfig
```

## Configuration Options

| Option                 | Type      | Default                | Description                         |
| ---------------------- | --------- | ---------------------- | ----------------------------------- |
| `enableReactRefresh`   | `boolean` | `true`                 | Enable/disable React Fast Refresh   |
| `optimizationLevel`    | `string`  | `process.env.NODE_ENV` | Build optimization level            |
| `experimentalFeatures` | `boolean` | `false`                | Enable experimental RSPack features |
| `rspackConfig`         | `object`  | `{}`                   | Custom RSPack configuration         |
| `swcOptions`           | `object`  | See below              | SWC compiler options                |

### Default SWC Options

```javascript
{
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
}
```

## Production Optimizations

The builder includes several production optimizations:

- Code splitting and chunk optimization
- Tree shaking
- Minification using SWC
- Module federation support
- Performance hints and budgets

## Development Mode Features

- Fast Refresh enabled by default
- Enhanced error reporting
- Source maps support
- HMR optimization

## TypeScript Support

The builder includes built-in TypeScript support. No additional configuration needed for basic TypeScript/TSX files.

## Examples

### Basic Usage

```javascript
// next.config.js
const { default: withRspack } = require('@dubstepqba/rspack-builder')

/** @type {import('next').NextConfig} */
const nextConfig = withRspack({
  // Next.js config
})

module.exports = nextConfig
```

### Advanced Configuration

```javascript
// next.config.js
const { default: withRspack } = require('@dubstepqba/rspack-builder')

/** @type {import('next').NextConfig} */
const nextConfig = withRspack(
  {
    // Next.js config
  },
  {
    enableReactRefresh: true,
    experimentalFeatures: true,
    rspackConfig: {
      optimization: {
        splitChunks: {
          chunks: 'all',
        },
      },
      performance: {
        hints: 'warning',
        maxEntrypointSize: 400000,
      },
    },
    swcOptions: {
      jsc: {
        target: 'es2020',
      },
    },
  }
)

module.exports = nextConfig
```

## Troubleshooting

### Common Issues

1. **Build failures**

   - Ensure all peer dependencies are installed
   - Check Node.js version (>=16.0.0 required)
   - Verify TypeScript configuration

2. **Performance Issues**
   - Check optimization settings
   - Review chunk splitting configuration
   - Monitor memory usage

### Debug Mode

Set `DEBUG=rspack-builder:*` environment variable for detailed logging:

```bash
DEBUG=rspack-builder:* next dev
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT

## Support

- GitHub Issues: [Report a bug](https://github.com/DubstepQBA/rspack-builder/issues)
- LinkedIn: [Javier Alfaro](https://www.linkedin.com/in/javieralfaroarmas/)

## Credits

This builder is built on top of [RSPack](https://www.rspack.dev/) and [Next.js](https://nextjs.org/).
