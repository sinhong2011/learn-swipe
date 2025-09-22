import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createDeck } from './db'

// Mock IndexedDB for testing
const mockDB = {
  transaction: vi.fn(),
  objectStoreNames: { contains: vi.fn(() => false) },
  createObjectStore: vi.fn(() => ({
    createIndex: vi.fn(),
  })),
}

const mockTransaction = {
  objectStore: vi.fn(),
  oncomplete: null as ((this: IDBTransaction, ev: Event) => void) | null,
  onerror: null as ((this: IDBTransaction, ev: Event) => void) | null,
}

const mockObjectStore = {
  put: vi.fn(),
}

const mockOpenRequest = {
  result: mockDB,
  onupgradeneeded: null as
    | ((this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => void)
    | null,
  onsuccess: null as ((this: IDBOpenDBRequest, ev: Event) => void) | null,
  onerror: null as ((this: IDBOpenDBRequest, ev: Event) => void) | null,
}

// Mock indexedDB
global.indexedDB = {
  open: vi.fn(() => mockOpenRequest),
} as unknown as IDBFactory

describe('createDeck', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTransaction.objectStore.mockReturnValue(mockObjectStore)
    mockDB.transaction.mockReturnValue(mockTransaction)
  })

  it('should create a deck with a valid UUID', async () => {
    // Set up the mock to simulate successful database operations
    setTimeout(() => {
      if (mockOpenRequest.onsuccess) {
        mockOpenRequest.onsuccess.call(
          mockOpenRequest as unknown as IDBOpenDBRequest,
          new Event('success')
        )
      }
    }, 0)

    setTimeout(() => {
      if (mockTransaction.oncomplete) {
        mockTransaction.oncomplete.call(
          mockTransaction as unknown as IDBTransaction,
          new Event('complete')
        )
      }
    }, 10)

    const deckPromise = createDeck('Test Deck')

    // Trigger the success callbacks
    if (mockOpenRequest.onsuccess) {
      mockOpenRequest.onsuccess.call(
        mockOpenRequest as unknown as IDBOpenDBRequest,
        new Event('success')
      )
    }
    if (mockTransaction.oncomplete) {
      mockTransaction.oncomplete.call(
        mockTransaction as unknown as IDBTransaction,
        new Event('complete')
      )
    }

    const deck = await deckPromise

    expect(deck.name).toBe('Test Deck')
    expect(deck.deck_id).toBeDefined()
    expect(typeof deck.deck_id).toBe('string')

    // Check that it's a valid UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    expect(deck.deck_id).toMatch(uuidRegex)

    // Verify database operations were called
    expect(mockDB.transaction).toHaveBeenCalledWith(['decks'], 'readwrite')
    expect(mockTransaction.objectStore).toHaveBeenCalledWith('decks')
    expect(mockObjectStore.put).toHaveBeenCalledWith(deck)
  })
})
