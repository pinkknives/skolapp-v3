// Mock Ably client for testing without real Ably connection
export interface MockChannel {
  publish: (event: string, data: unknown) => Promise<void>
  subscribe: (event: string, callback: (data: { data: unknown }) => void) => void
  presence: {
    enter: (data: unknown) => Promise<void>
    leave: () => Promise<void>
    get: () => Promise<Array<{ clientId: string; data: unknown }>>
    subscribe: (event: string, callback: () => void) => void
  }
}

export interface MockAblyClient {
  channels: {
    get: (name: string) => MockChannel
  }
  connection: {
    on: (event: string, callback: (state: { current: string }) => void) => void
  }
  close: () => void
}

class MockChannelImpl implements MockChannel {
  private subscribers: Map<string, Array<(data: { data: unknown }) => void>> = new Map()
  private presenceData: Array<{ clientId: string; data: unknown }> = []
  
  public presence = {
    subscribe: async (_event: string, _callback: (data: { data: unknown }) => void) => {
      // Mock presence subscription
    },
    unsubscribe: async (_callback: (data: { data: unknown }) => void) => {
      // Mock presence unsubscription
    },
    enter: async (_data: unknown) => {
      // Mock presence enter
    },
    leave: async () => {
      // Mock presence leave
    },
    get: async () => {
      return this.presenceData
    }
  }

  async publish(event: string, data: unknown): Promise<void> {
    console.log(`[Mock Ably] Publishing to ${event}:`, data)
    const callbacks = this.subscribers.get(event) || []
    callbacks.forEach(callback => {
      try {
        callback({ data })
      } catch (error) {
        console.error('Error in mock subscriber callback:', error)
      }
    })
  }


  async enter(data: unknown): Promise<void> {
    console.log('[Mock Ably] Entering presence with data:', data)
    const clientId = `mock-client-${Date.now()}`
    this.presenceData.push({ clientId, data })
    
    // Trigger presence events
    const callbacks = this.subscribers.get('enter') || []
    callbacks.forEach(callback => callback({ data: { clientId, data } }))
  }

  async leave(): Promise<void> {
    console.log('[Mock Ably] Leaving presence')
    this.presenceData = this.presenceData.slice(0, -1)
    
    // Trigger presence events
    const callbacks = this.subscribers.get('leave') || []
    callbacks.forEach(callback => callback({ data: {} }))
  }

  async get(): Promise<Array<{ clientId: string; data: unknown }>> {
    console.log('[Mock Ably] Getting presence data:', this.presenceData)
    return [...this.presenceData]
  }

  subscribe(event: string, callback: (data: { data: unknown }) => void): void {
    console.log(`[Mock Ably] Subscribing to presence event ${event}`)
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, [])
    }
    this.subscribers.get(event)!.push(callback)
  }
}

class MockAblyClientImpl implements MockAblyClient {
  private connectionState = 'connecting'
  private _channels: Map<string, MockChannelImpl> = new Map()

  get channels() {
    return {
      get: (name: string): MockChannel => {
        if (!this._channels.has(name)) {
          this._channels.set(name, new MockChannelImpl())
        }
        return this._channels.get(name)!
      }
    }
  }

  get connection() {
    return {
      on: (event: string, callback: (state: { current: string }) => void) => {
        console.log(`[Mock Ably] Setting up connection listener for ${event}`)
        
        // Simulate connection state changes
        setTimeout(() => {
          this.connectionState = 'connected'
          callback({ current: 'connected' })
        }, 1000)
      }
    }
  }

  close(): void {
    console.log('[Mock Ably] Closing connection')
    this.connectionState = 'closed'
  }
}

let mockClient: MockAblyClient | null = null

export function getMockAbly(): MockAblyClient {
  if (!mockClient) {
    mockClient = new MockAblyClientImpl()
  }
  return mockClient
}

export function disconnectMockAbly(): void {
  if (mockClient) {
    mockClient.close()
    mockClient = null
  }
}
