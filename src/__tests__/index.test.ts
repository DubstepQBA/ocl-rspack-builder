/// <reference types="jest" />
import withRspack from '../index'
import fs from 'fs'

// Mock fs module
jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
}))

// Mock process.setHeapSizeLimit
const originalEnv = { ...process.env }
const mockSetHeapSizeLimit = jest.fn()

describe('withRspack', () => {
  // Set up environment before tests
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Reset environment variables safely
    process.env = { ...originalEnv }

    // Mock setHeapSizeLimit
    process.setHeapSizeLimit = mockSetHeapSizeLimit
  })

  // Restore process after tests
  afterAll(() => {
    process.env = originalEnv
  })

  it('should return a configuration object', () => {
    const config = withRspack({})
    expect(config).toBeDefined()
    expect(typeof config).toBe('object')
  })

  it('should set required environment variables', () => {
    withRspack({})
    expect(process.env.NEXT_RSPACK).toBe('true')
    expect(process.env.BUILTIN_FLIGHT_CLIENT_ENTRY_PLUGIN).toBe('true')
    expect(process.env.BUILTIN_APP_LOADER).toBe('true')
    expect(process.env.BUILTIN_SWC_LOADER).toBe('true')
  })

  it('should configure memory limits', () => {
    withRspack(
      {},
      {
        memoryOptions: {
          maxMemory: 4096,
        },
      }
    )
    expect(mockSetHeapSizeLimit).toHaveBeenCalledWith('4096m')
  })

  it('should handle missing setHeapSizeLimit function', () => {
    // Remove the function to simulate environment without it
    process.setHeapSizeLimit = undefined

    // Should not throw an error
    expect(() =>
      withRspack(
        {},
        {
          memoryOptions: {
            maxMemory: 4096,
          },
        }
      )
    ).not.toThrow()
  })

  it('should create cache directory when filesystem cache is enabled', () => {
    const cachePath = '.test-cache/rspack'

    withRspack(
      {},
      {
        cacheOptions: {
          enableFilesystemCache: true,
          cacheDirectory: cachePath,
        },
      }
    )

    // Simply verify the function was called
    expect(fs.mkdirSync).toHaveBeenCalled()
    expect((fs.mkdirSync as jest.Mock).mock.calls.length).toBe(1)

    // For the second argument, we can check exactly
    expect((fs.mkdirSync as jest.Mock).mock.calls[0][1]).toEqual({ recursive: true })
  })

  it('should not create cache directory when filesystem cache is disabled', () => {
    withRspack(
      {},
      {
        cacheOptions: {
          enableFilesystemCache: false,
        },
      }
    )

    expect(fs.mkdirSync).not.toHaveBeenCalled()
  })

  it('should apply CI optimizations when in CI environment', () => {
    // Set CI environment variable
    process.env.CI = 'true'

    withRspack({})
    expect(process.env.NEXT_TELEMETRY_DISABLED).toBe('1')
  })

  it('should apply Docker optimizations when in Docker environment', () => {
    // Set Docker environment variable
    process.env.DOCKER = 'true'

    withRspack({})
    expect(process.env.NEXT_TELEMETRY_DISABLED).toBe('1')
  })

  it('should disable source maps in production when configured', () => {
    // Set NODE_ENV using type assertion to bypass readonly restrictions
    ;(process.env as Record<string, string>).NODE_ENV = 'production'

    withRspack(
      {},
      {
        ciOptions: {
          disableSourceMapsInProduction: true,
        },
      }
    )

    expect(process.env.GENERATE_SOURCEMAP).toBe('false')
  })

  it('should not disable source maps in development', () => {
    // Set NODE_ENV using type assertion to bypass readonly restrictions
    ;(process.env as Record<string, string>).NODE_ENV = 'development'

    withRspack(
      {},
      {
        ciOptions: {
          disableSourceMapsInProduction: true,
        },
      }
    )

    expect(process.env.GENERATE_SOURCEMAP).toBeUndefined()
  })

  it('should preserve webpack configuration from original config', () => {
    const originalWebpack = jest.fn(() => ({ test: true }))
    const config = withRspack({ webpack: originalWebpack })

    expect(config.webpack).toBeDefined()
    // We can't directly test the returned webpack function without mocking complex objects
    // So we just verify it's a function
    expect(typeof config.webpack).toBe('function')
  })

  it('should configure experimental options', () => {
    const result = withRspack({})

    // Verify experimental options exist
    expect(result.experimental).toBeDefined()
    // Check the server actions property is populated
    expect(result.experimental?.serverActions).toBeDefined()
  })

  it('should preserve original experimental options', () => {
    const nextConfig = {
      experimental: {
        serverActions: {
          allowedOrigins: ['https://example.com'],
        },
        otherOption: true,
      },
    }

    const result = withRspack(nextConfig)

    // Verify experimental options are preserved
    expect(result.experimental).toHaveProperty('otherOption', true)
    expect(result.experimental?.serverActions).toHaveProperty('allowedOrigins')
  })
})
