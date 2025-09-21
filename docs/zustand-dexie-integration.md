# Zustand + Dexie.js Integration

This document explains how Zustand state management is integrated with Dexie.js for persistent storage in the LearnSwipe application.

## Overview

The integration provides:
- **Automatic persistence**: Zustand state is automatically saved to IndexedDB via Dexie
- **Type safety**: Full TypeScript support for database operations
- **Migration support**: Seamless transition from old IndexedDB implementation
- **Selective persistence**: Only certain parts of the state are persisted
- **Debounced writes**: Prevents excessive database writes

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │   Zustand Store  │    │   Dexie.js      │
│                 │◄──►│                  │◄──►│                 │
│ - Components    │    │ - State          │    │ - IndexedDB     │
│ - Hooks         │    │ - Actions        │    │ - Persistence   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Files Structure

```
src/
├── lib/
│   ├── dexie-db.ts          # Dexie database configuration
│   ├── dexie-storage.ts     # Custom Zustand storage adapter
│   └── migration.ts         # Migration utility
├── store/
│   └── useAppStore.ts       # Zustand store with Dexie persistence
└── examples/
    └── zustand-dexie-example.tsx  # Usage examples
```

## Key Components

### 1. Dexie Database (`src/lib/dexie-db.ts`)

Defines the database schema and provides helper functions:

```typescript
export class LearnSwipeDB extends Dexie {
  decks!: EntityTable<Deck, 'deck_id'>;
  cards!: EntityTable<Card, 'id'>;
  appState!: EntityTable<AppStoreState, 'id'>;
}

export const dbHelpers = {
  createDeck,
  listDecks,
  deleteDeck,
  addCards,
  getDueCards,
  updateCard,
  getDeckStats,
  saveAppState,
  loadAppState
};
```

### 2. Custom Storage Adapter (`src/lib/dexie-storage.ts`)

Bridges Zustand's persist middleware with Dexie:

```typescript
export const dexieStorage = {
  getItem: async (name: string) => {
    const state = await dbHelpers.loadAppState();
    return state ? JSON.stringify(state) : null;
  },
  setItem: async (name: string, value: string) => {
    const state = JSON.parse(value);
    await dbHelpers.saveAppState(state);
  },
  removeItem: async (name: string) => {
    // Implementation for cleanup if needed
  }
};
```

### 3. Zustand Store (`src/store/useAppStore.ts`)

Configured with Dexie persistence:

```typescript
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // State and actions
      }),
      {
        name: 'app-store',
        storage: debouncedDexieStorage,
        partialize: (state) => ({
          // Only persist certain parts
          decks: state.decks,
          currentDeck: state.currentDeck,
          currentTab: state.currentTab,
          // Don't persist upload/modal state
        }),
      }
    )
  )
);
```

## Usage Examples

### Basic Usage

```typescript
import { useAppStore } from '@/store/useAppStore';
import { dbHelpers } from '@/lib/dexie-db';

function MyComponent() {
  const { decks, setDecks, currentDeck, setCurrentDeck } = useAppStore();

  // Load decks from database
  const loadDecks = async () => {
    const deckList = await dbHelpers.listDecks();
    setDecks(deckList); // Automatically persisted
  };

  // Create new deck
  const createDeck = async (name: string) => {
    const newDeck = await dbHelpers.createDeck(name);
    setCurrentDeck(newDeck); // Automatically persisted
    await loadDecks();
  };

  return (
    <div>
      <h1>Current Deck: {currentDeck?.name || 'None'}</h1>
      <p>Total Decks: {decks.length}</p>
      <button onClick={() => createDeck('New Deck')}>
        Create Deck
      </button>
    </div>
  );
}
```

### Advanced Operations

```typescript
// Add cards to a deck
const addCardsToCurrentDeck = async (cards: Omit<Card, 'id'>[]) => {
  if (!currentDeck) return;
  
  await dbHelpers.addCards(currentDeck.deck_id, cards);
  // State automatically syncs
};

// Get deck statistics
const getStats = async (deckId: string) => {
  const stats = await dbHelpers.getDeckStats(deckId);
  console.log(`Total: ${stats.total}, Due: ${stats.due}, Mastered: ${stats.mastered}`);
};
```

## Configuration Options

### Debounced Storage

The `DebouncedDexieStorage` class prevents excessive writes:

```typescript
export const debouncedDexieStorage = new DebouncedDexieStorage(1000); // 1 second delay
```

### Selective Persistence

Use `partialize` to control what gets persisted:

```typescript
partialize: (state) => ({
  // Persist these
  decks: state.decks,
  currentDeck: state.currentDeck,
  currentTab: state.currentTab,
  
  // Reset these on app restart
  upload: initialUploadState,
  isUploadModalOpen: false,
})
```

## Migration

The migration utility (`src/lib/migration.ts`) handles transition from the old IndexedDB implementation:

```typescript
import { runMigration } from '@/lib/migration';

// Run once on app startup
await runMigration();
```

## Best Practices

1. **Use dbHelpers for database operations**: Don't access Dexie directly in components
2. **Let Zustand handle state**: Use store actions for state changes, not direct database writes
3. **Handle errors gracefully**: Database operations can fail, always wrap in try-catch
4. **Use selective persistence**: Don't persist temporary state like loading indicators
5. **Debounce frequent updates**: Use debounced storage for rapidly changing state

## Troubleshooting

### Common Issues

1. **State not persisting**: Check if the field is included in `partialize`
2. **Migration not running**: Ensure `runMigration()` is called on app startup
3. **Type errors**: Make sure interfaces match between Zustand and Dexie
4. **Performance issues**: Consider using debounced storage for frequently updated state

### Debugging

```typescript
// Enable Dexie debugging
import { db } from '@/lib/dexie-db';
db.open().then(() => {
  console.log('Database opened successfully');
}).catch(error => {
  console.error('Database failed to open:', error);
});

// Check persisted state
const state = await dbHelpers.loadAppState();
console.log('Persisted state:', state);
```

## Performance Considerations

- **Debounced writes**: Prevents excessive IndexedDB operations
- **Selective persistence**: Only persists necessary state
- **Lazy loading**: Load data only when needed
- **Batch operations**: Use Dexie transactions for multiple operations

## Future Enhancements

- **Offline sync**: Add service worker integration for offline support
- **Data compression**: Compress large state objects before persistence
- **Encryption**: Add encryption for sensitive data
- **Backup/restore**: Export/import functionality for user data
