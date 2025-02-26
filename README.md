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
- 🔒 Secure defaults
- 🌐 Docker-ready configuration

## Installation

```bash
npm install @dubstepqba/rspack-builder
# or
yarn add @dubstepqba/rspack-builder
# or
pnpm add @dubstepqba/rspack-builder
```

## Usage

### Basic Usage (With Default Configuration)

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
    // Override default Next.js configurations
    port: 4000,
    // Add your custom Next.js config
  },
  {
    // RSPack specific options
    enableReactRefresh: true,
    experimentalFeatures: true,
  }
)

module.exports = nextConfig
```

## Default Configurations

### Next.js Default Config

```javascript
{
  poweredByHeader: false,        // Removes X-Powered-By header
  generateEtags: false,         // Disables ETag generation
  serverRuntimeConfig: {
    mySecret: process.env.MY_SECRET,
  },
  publicRuntimeConfig: {
    staticFolder: '/static',
  },
  hostname: '0.0.0.0',          // Listen on all network interfaces
  port: 3000,                   // Default port (can be overridden by PORT env variable)
}
```

### RSPack Options

| Option                 | Type      | Default           | Description                         |
| ---------------------- | --------- | ----------------- | ----------------------------------- |
| `enableReactRefresh`   | `boolean` | `true`            | Enable/disable React Fast Refresh   |
| `optimizationLevel`    | `string`  | Based on NODE_ENV | Build optimization level            |
| `experimentalFeatures` | `boolean` | `false`           | Enable experimental RSPack features |
| `rspackConfig`         | `object`  | `{}`              | Custom RSPack configuration         |
| `swcOptions`           | `object`  | See below         | SWC compiler options                |

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
- Secure defaults (disabled powered-by header, etags)
- Docker-ready network configuration

## Development Mode Features

- Fast Refresh enabled by default
- Enhanced error reporting
- Source maps support
- HMR optimization
- Convenient development defaults

## Docker Support

The default configuration is Docker-ready with:

- Listening on all network interfaces (`0.0.0.0`)
- Configurable port via environment variable
- Secure defaults for production

Example Docker usage:

```bash
docker run -p 3000:3000 -e PORT=3000 your-next-app
```

## TypeScript Support

The builder includes built-in TypeScript support with zero configuration needed for:

- TypeScript/TSX files
- Type checking
- Path aliases
- Declaration files

## Environment Variables

The following environment variables are supported:

- `PORT`: Override default port (3000)
- `NODE_ENV`: Determines optimization level
- `MY_SECRET`: Server-side secret (via serverRuntimeConfig)

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
