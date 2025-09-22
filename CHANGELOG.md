# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0](https://github.com/sinhong2011/learn-swipe/compare/v0.1.0...v0.2.0) (2025-09-22)


### Features

* Add i18n support with language persistence ([2bfdec8](https://github.com/sinhong2011/learn-swipe/commit/2bfdec85e755c6b1be4920b3ea063baae1802ba1))
* Add sidebar navigation and improve app structure ([0b14f83](https://github.com/sinhong2011/learn-swipe/commit/0b14f83d178a3a1dca634e98bd5818eba8105fb6))
* comprehensive updates across the application ([f9ca79f](https://github.com/sinhong2011/learn-swipe/commit/f9ca79fd64d7730c9567bdc84e4e98ef6dda180e))
* implement dynamic i18n loading ([7fdbbaf](https://github.com/sinhong2011/learn-swipe/commit/7fdbbaf5bf60b379e3e283fea959a4ce22dce6f5))
* optimize bundle size with manual chunking ([f7d710f](https://github.com/sinhong2011/learn-swipe/commit/f7d710f5c532c21e93591017596af6e1c3ab873e))
* replace custom UUID with npm uuid package ([ee3bab2](https://github.com/sinhong2011/learn-swipe/commit/ee3bab27155462650d5dbb43ab8c384fee9965db))


### Bug Fixes

* Disable e2e hook until tests are implemented ([061c31c](https://github.com/sinhong2011/learn-swipe/commit/061c31cfe336413a57832f304771bf5055331efa))
* Update lefthook e2e script compatibility ([0461617](https://github.com/sinhong2011/learn-swipe/commit/0461617180bec3f3ff8ba3643a131ae84defe304))

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
