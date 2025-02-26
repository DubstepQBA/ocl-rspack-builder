# Next.js RSPack Plugin

An enhanced RSPack plugin for Next.js 14+ that provides improved build performance and configuration options.

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
npm install  @ocl/rspack-builder
```

## Usage

In your `next.config.js`:

```javascript
const withRspack = require('@ocl/rspack-builder')

module.exports = withRspack(
  {
    // Your Next.js config here
  },
  {
    // RSPack plugin options (optional)
    enableReactRefresh: true,
    optimizationLevel: 'production',
    experimentalFeatures: false,
  }
)
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

The plugin includes several production optimizations:

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

The plugin includes built-in TypeScript support. No additional configuration needed for basic TypeScript/TSX files.

## Examples

### Basic Usage

```javascript
// next.config.js
const withRspack = require('@ocl/rspack-builder')

module.exports = withRspack({
  // Next.js config
})
```

### Advanced Configuration

```javascript
// next.config.js
const withRspack = require('@next/plugin-rspack')

module.exports = withRspack(
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

Set `DEBUG=next-rspack:*` environment variable for detailed logging:

```bash
DEBUG=next-rspack:* next dev
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT

## Support

- GitHub Issues: [Report a bug](https://github.com/DubstepQBA/ocl-rspack-builder/issues)
- Linkedin :[Profile](https://www.linkedin.com/in/javieralfaroarmas/)

## Credits

This plugin is built on top of [RSPack](https://www.rspack.dev/) and [Next.js](https://nextjs.org/).
