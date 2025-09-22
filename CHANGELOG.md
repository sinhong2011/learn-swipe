# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of LearnSwipe - A Tinder-like flashcard learning app
- Spaced repetition algorithm for effective learning
- PWA support with offline functionality
- Multi-language support (English, Traditional Chinese - Hong Kong)
- CSV import/export functionality
- Dark/light theme support
- Mobile-first responsive design
- Comprehensive test suite (unit and E2E tests)

### Features
- **Study Modes**: Traditional and Zen (cycling) study modes
- **Card Management**: Create, edit, and organize flashcards in decks
- **Progress Tracking**: View learning statistics and progress
- **Accessibility**: Full keyboard navigation and screen reader support
- **Performance**: Optimized with code splitting and caching strategies

### Technical
- Built with React, TypeScript, and Vite
- State management with Zustand
- Persistent storage with IndexedDB (Dexie.js)
- UI components with Shadcn UI and Tailwind CSS
- Internationalization with Lingui
- Testing with Vitest and Playwright
- Code quality with Biome and Lefthook
