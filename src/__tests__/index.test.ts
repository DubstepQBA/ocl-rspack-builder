/// <reference types="jest" />
import withRspack from '../index'

describe('withRspack', () => {
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
})
