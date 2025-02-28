/// <reference types="jest" />
import withRspack from '../index'
import fs from 'fs'

// Mock fs module
jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
}))

// Mock process.setHeapSizeLimit
const mockSetHeapSizeLimit = jest.fn()

describe('Environment-specific optimizations', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv }

    // Clear mocks
    jest.clearAllMocks()

    // Set up mock for setHeapSizeLimit
    process.setHeapSizeLimit = mockSetHeapSizeLimit
  })

  afterAll(() => {
    // Restore environment
    process.env = originalEnv
  })

  it('should apply Docker-specific optimizations', () => {
    // Set Docker environment
    ;(process.env as Record<string, string>).DOCKER = 'true'

    const config = withRspack({})

    // Verify telemetry is disabled in Docker
    expect(process.env.NEXT_TELEMETRY_DISABLED).toBe('1')

    // Docker should have webpack function
    expect(typeof config.webpack).toBe('function')
  })

  it('should apply CI-specific optimizations', () => {
    // Set CI environment
    ;(process.env as Record<string, string>).CI = 'true'

    const config = withRspack({})

    // Verify telemetry is disabled in CI
    expect(process.env.NEXT_TELEMETRY_DISABLED).toBe('1')

    // Verify config was created properly
    expect(config).toBeDefined()
    expect(typeof config).toBe('object')
  })

  it('should configure memory limits in CI environment', () => {
    // Set CI environment
    ;(process.env as Record<string, string>).CI = 'true'

    // Configure with smaller memory limit for CI
    withRspack(
      {},
      {
        memoryOptions: {
          maxMemory: 1024,
          maxWorkers: 2,
        },
      }
    )

    // Verify memory limit was set
    expect(mockSetHeapSizeLimit).toHaveBeenCalledWith('1024m')
  })

  it('should configure default memory limits when not specified', () => {
    withRspack({})

    // Default memory limit should be applied
    expect(mockSetHeapSizeLimit).toHaveBeenCalledWith('2048m')
  })

  it('should disable source maps in production mode in CI', () => {
    // Set environment variables
    ;(process.env as Record<string, string>).CI = 'true'
    ;(process.env as Record<string, string>).NODE_ENV = 'production'

    withRspack(
      {},
      {
        ciOptions: {
          disableSourceMapsInProduction: true,
        },
      }
    )

    // Verify source maps are disabled
    expect(process.env.GENERATE_SOURCEMAP).toBe('false')
  })

  it('should create cache directory with filesystem cache enabled', () => {
    const cachePath = '.docker-cache'

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
})
