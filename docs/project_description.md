# LearnSwipe - Mobile-First Tinder-like Flashcard Review Web App

LearnSwipe is a client-side, mobile-first web application designed to help users review knowledge through an intuitive Tinder-like swiping interface optimized for mobile devices. Users can upload CSV files of any topic (e.g., language learning, history, programming), parse them into flashcards, and use spaced repetition (SRS) to enhance memory retention. The app supports multi-deck management, offline use via Progressive Web App (PWA), gamification (scoring, animations), and stores data in IndexedDB, requiring no backend server. It is tailored for personal use with a focus on seamless mobile user experience (UX).

## Features

- **CSV Upload and Parsing**:

  - Users input a deck/dek/ name (e.g., "English Vocabulary") and upload a CSV file via a mobile-friendly interface.
  - Supports arbitrary/ˈɑːrbɪtreri/ CSV structures: defaults to the first column as the question, second as the answer, with remaining columns stored as JSON (`extra_fields`).
  - Example CSV: `Question,Answer,Category` (e.g., `"What is the capital of France?","Paris","Geography"`).
  - Each deck/dek/ generates a unique `deck_id`, stored in IndexedDB.

- **Deck/dek/ Management**:

  - Displays a touch-friendly list of all decks (name and `deck_id`).
  - Users tap a deck to review or upload a new one using mobile-optimized inputs.

- **Tinder-like Review Interface**:

  - Uses Swiper React's `EffectCards` module for smooth, touch-optimized card stacking and swiping.
  - Displays the question side; tap to reveal the answer and extra fields (`extra_fields`).
  - Swipe right (know): Doubles the interval (e.g., 1 → 2 → 4 days) and updates `next_review`.
  - Swipe left (don't know): Resets interval to 1 day.
  - Supports `Virtual` module for large decks/deks/ (&gt;1000 cards) to ensure performance on mobile.

- **Spaced Repetition/ˌrepəˈtɪʃn/ (SRS)**:

  - Each card stores `interval` and `next_review`.
  - Only shows cards with `next_review <= current date`.
  - Automatically updates SRS progress, optimized for quick mobile interactions.

- **Learning Progress Analysis**:

  - Displays total cards, mastered cards (`interval > 1`), and progress percentage per deck/dek/ in a mobile-friendly layout.

- **Gamification**:

  - Scoring: +10 points for right swipe, -5 for left swipe, displayed in a prominent, mobile-readable format.
  - Uses Framer Motion for smooth card swipe animations (e.g., scale up/down) tailored for mobile touch.

- **Export and Backup**:

  - Export a deck/dek/ as a CSV file (using PapaParse) with a tap-to-download interface.

- **Offline Support**:

  - Implements PWA with Serwist for offline review and mobile app-like installation.

- **Internationalization (i18n)**:

  - Uses @lingui/react for multi-language support (e.g., English, Chinese) with mobile-friendly translations.

- **Mobile-First UX**:

  - Touch-friendly controls (e.g., large tap targets, swipe gestures/ˈdʒestʃərz/).
  - Responsive layouts using Tailwind CSS and Shadcn UI for optimal display on small screens.
  - Fast load times and smooth animations for mobile performance.
  - Accessibility features (e.g., ARIA labels, high-contrast text) for inclusive mobile use.

## Tech Stack

- **Frontend Framework**: React (TypeScript)
- **Runtime/Package Manager**: Bun@1.2.22
- **Routing**: TanStack Router
- **State Management**: Zustand (in-memory state, e.g., current deck/dek/, cards)
- **Persistent Storage**: IndexedDB (via Dexie.js)
- **CSV Parsing**: PapaParse
- **Swipe Interface**: Swiper React (EffectCards and Virtual modules)
- **Animations**: Framer Motion
- **PWA**: Serwist
- **UI Components**: Shadcn UI (Tailwind CSS + Radix UI)
- **i18n**: @lingui/react
- **Font**: Inter (main), Noto Sans (for multilingual support)

## Data Structure

- **Cards**:

  ```ts
  {
    id: number;
    deck_id: string;
    question: string;
    answer: string;
    extra_fields: Record<string, any>;
    interval: number;
    next_review: string;
  }
  ```

- **Decks/deks/**:

  ```ts
  {
    deck_id: string;
    name: string;
  }
  ```

## Installation and Setup

### Prerequisites

- Bun &gt;= 1.2.22

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/learnswipe.git
   cd learnswipe
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Start the development server:

   ```bash
   bun run dev
   ```

4. Build for production:

   ```bash
   bun run build
   ```

### Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "dexie": "^3.2.4",
    "zustand": "^4.5.2",
    "@tanstack/react-router": "^1.27.5",
    "swiper": "^11.0.7",
    "papaparse": "^5.4.1",
    "framer-motion": "^11.0.8",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "tailwindcss": "^3.4.1",
    "@lingui/core": "^4.5.0",
    "@lingui/react": "^4.5.0",
    "@lingui/cli": "^4.5.0"
  },
  "devDependencies": {
    "@serwist/vite": "^9.0.4",
    "@types/react": "^18.2.67",
    "@types/react-dom": "^18.2.22",
    "typescript": "^5.4.2",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35"
  }
}
```

## Mobile-First UX Design

LearnSwipe prioritizes/praɪˈɔːrətaɪzɪz/ mobile usability with the following features:

- **Touch-Optimized Interface**: Large tap targets (e.g., buttons ≥ 48px), smooth swipe gestures/ˈdʒestʃərz/ via Swiper React, and minimal text input for ease of use on mobile.
- **Responsive Layouts**: Tailwind CSS and Shadcn UI ensure layouts adapt to small screens (e.g., cards stack vertically, full-width buttons).
- **Performance**: Uses Swiper's `Virtual` module for large decks, Framer Motion for lightweight animations, and Serwist for fast offline loading.
- **Accessibility**: ARIA labels for swipe actions, high-contrast text, and keyboard navigation support for inclusive mobile use.
- **Feedback**: Haptic-like animations (via Framer Motion) and sound effects (optional, using `use-sound`) enhance mobile interaction.
- **i18n**: @lingui/react provides localized text (e.g., English, Chinese) with mobile-friendly formatting.

## Usage

1. **Upload a Deck/dek/**:

   - Navigate to `/upload` on mobile, enter a deck/dek/ name (e.g., "English Vocabulary") using a touch-friendly input.
   - Upload a CSV file via a large file input button.
   - The app parses and stores the deck/dek/ in IndexedDB.

2. **Manage Decks/deks/**:

   - Visit `/` (home) to view a touch-friendly deck/dek/ list.
   - Tap a deck/dek/ to review or select "Upload New Deck/dek/".

3. **Review Cards**:

   - At `/review?deckId=xxx`, swipe cards (right for know, left for don't know) with smooth touch gestures/ˈdʒestʃərz/.
   - Tap a card to show the answer and extra fields.
   - SRS progress updates automatically.

4. **View Progress**:

   - Go to `/stats` to see a mobile-optimized view of total cards, mastered cards, and progress percentage per deck/dek/.

5. **Export Deck/dek/**:

   - In `/decks`, tap a deck/dek/ to export as CSV with a single tap.

6. **Offline Use**:

   - Install the PWA (tap "Add to Home Screen" in mobile browser).
   - Review cards offline with full functionality.

## Deployment

1. **Build the App**:

   ```bash
   bun run build
   ```

2. **Deploy to Cloudflare Pages**:

   - Upload the `dist` folder to Cloudflare Pages.
   - No environment variables needed (client-side only).
   - Verify Serwist service worker and PWA manifest functionality.

3. **Testing**:

   - Test PWA installation and swipe experience on mobile (iOS Safari, Android Chrome).
   - Ensure multilingual support (e.g., English, Chinese) with correct font rendering (Noto Sans, Inter).
   - Validate touch interactions (swipes, taps) and accessibility features.

## Future Plans

- **Multimedia Support**: Allow CSV files to include image or audio URLs for display on cards.
- **Enhanced Gamification**: Add daily goals (e.g., review 20 cards) and achievement badges with mobile-friendly notifications.
- **Cloud Sync (Optional)**: Integrate Supabase for cross-device synchronization.
- **Sharing**: Enable deck/dek/ sharing via public links or exported CSVs.

## Notes

- **Multilingual Support**: Ensure CSV files use UTF-8 encoding; UI uses Noto Sans for proper rendering of languages like Chinese.
- **Performance**: Use Swiper's `Virtual` module for large decks (&gt;1000 cards) to maintain mobile performance.
- **Backup**: Regularly export CSVs, as IndexedDB data may be cleared with browser cache.
- **Mobile Testing**: Validate UX on small screens, ensuring smooth swipes, readable text, and fast load times.

## Contributing

This is a personal project. Feedback is welcome! Submit issues or contact \[your-email@example.com\].

## License

MIT License