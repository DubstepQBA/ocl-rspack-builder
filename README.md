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
    publicRuntimeConfig: {
      staticFolder: '/custom-static',
    },
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
  }
}
```

### Server Configuration

For server configuration like port and hostname, use the Next.js CLI or environment variables:

```bash
# Using CLI
next dev -p 4000 -H 0.0.0.0

# Or using environment variables
PORT=4000 HOST=0.0.0.0 next dev
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

## Development Mode Features

- Fast Refresh enabled by default
- Enhanced error reporting
- Source maps support
- HMR optimization
- Convenient development defaults

## Server Configuration

To configure the server in development or production:

1. **Using Next.js CLI**:

```bash
next dev -p 3000 -H 0.0.0.0
```

2. **Using Environment Variables**:

```bash
PORT=3000 HOST=0.0.0.0 next dev
```

3. **Using start script in package.json**:

```json
{
  "scripts": {
    "dev": "next dev -p 3000 -H 0.0.0.0",
    "start": "next start -p 3000 -H 0.0.0.0"
  }
}
```

## TypeScript Support

The builder includes built-in TypeScript support with zero configuration needed for:

- TypeScript/TSX files
- Type checking
- Path aliases
- Declaration files

## Environment Variables

The following environment variables are supported:

- `PORT`: Override default port (via Next.js CLI or env)
- `HOST`: Set server hostname (via Next.js CLI or env)
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
