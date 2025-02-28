/// <reference types="jest" />
import withRspack from '../index'

describe('RSPack Configuration', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    // Reset environment variables safely
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv
  })

  it('should merge custom and default configurations', () => {
    const config = withRspack(
      {
        reactStrictMode: true,
        poweredByHeader: false,
      },
      {
        memoryOptions: {
          maxMemory: 8192,
        },
      }
    )

    // Check that original config values are preserved
    expect(config.reactStrictMode).toBe(true)
    expect(config.poweredByHeader).toBe(false)
  })

  it('should set swcMinify to true in production', () => {
    // Set NODE_ENV
    ;(process.env as Record<string, string>).NODE_ENV = 'production'

    const config = withRspack({})
    expect(config.swcMinify).toBe(true)
  })

  it('should configure experimental server actions', () => {
    const config = withRspack({})

    // Check that server actions config exists
    expect(config.experimental).toBeDefined()
    expect(config.experimental?.serverActions).toBeDefined()
  })

  it('should preserve experimental options', () => {
    // Define config with experimental options that can be safely cast
    const config = withRspack({
      experimental: {
        serverActions: {
          allowedOrigins: ['https://example.com'],
        },
      },
    })

    // Check that our settings were preserved
    expect(config.experimental?.serverActions).toBeDefined()

    // Safely check properties using hasOwnProperty
    const serverActions = config.experimental?.serverActions || {}
    expect(Object.prototype.hasOwnProperty.call(serverActions, 'allowedOrigins')).toBe(true)
    expect(Object.prototype.hasOwnProperty.call(serverActions, 'bodySizeLimit')).toBe(true)
  })

  it('should apply environment-specific settings', () => {
    // Test with CI environment
    ;(process.env as Record<string, string>).CI = 'true'

    const config = withRspack({})

    // Verify environment variables were set
    expect(process.env.NEXT_TELEMETRY_DISABLED).toBe('1')

    // Verify the config was created successfully
    expect(config).toBeDefined()
    expect(typeof config).toBe('object')
  })

  it('should handle custom rspack configuration', () => {
    const config = withRspack(
      {},
      {
        rspackConfig: {
          // Add custom rspack config
          devtool: 'source-map',
        },
      }
    )

    // Verify the webpack function exists
    expect(typeof config.webpack).toBe('function')
  })
})
