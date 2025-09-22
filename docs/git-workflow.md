# Git Workflow Guide

This document outlines the recommended **GitHub Flow** for LearnSwipe development, optimized for our Release-Please automation.

## 🌟 GitHub Flow Overview

```
main (always deployable)
  ↑
feature-branch → Pull Request → Merge → Auto-Release
```

### Key Principles
- `main` branch is always production-ready
- All development happens in feature branches
- Every merge to `main` can trigger a release
- Releases are automated based on conventional commits

## 🚀 Step-by-Step Workflow

### 1. Start New Feature

```bash
# Ensure you're on main and up to date
git checkout main
git pull origin main

# Create feature branch with descriptive name
git checkout -b feat/add-dark-mode
# or
git checkout -b fix/card-navigation-bug
# or  
git checkout -b docs/update-readme
```

### 2. Make Changes with Conventional Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
# Feature (minor version bump)
git commit -m "feat: add dark mode toggle to settings"
git commit -m "feat(study): implement zen mode cycling"

# Bug fix (patch version bump)
git commit -m "fix: resolve card navigation issue on mobile"
git commit -m "fix(i18n): correct Chinese translation for study mode"

# Breaking change (major version bump)
git commit -m "feat!: redesign card interface with new swipe gestures"

# Other types (no version bump)
git commit -m "docs: update deployment guide"
git commit -m "style: improve button hover animations"
git commit -m "refactor: extract card logic into custom hook"
git commit -m "test: add e2e tests for study flow"
git commit -m "chore: update dependencies"
```

### 3. Push and Create Pull Request

```bash
# Push feature branch
git push origin feat/add-dark-mode

# Create PR via GitHub UI or CLI
gh pr create --title "feat: add dark mode toggle" --body "Adds dark mode support with system preference detection"
```

### 4. Pull Request Process

When you create a PR, **automatic processes trigger**:

✅ **CI Pipeline runs** (`.github/workflows/ci.yml`):
- Type checking with TypeScript
- Linting and formatting with Biome
- Translation extraction and compilation
- Unit tests with Vitest
- Build verification
- E2E tests with Playwright

✅ **Preview Deployment** (`.github/workflows/deploy-preview.yml`):
- Deploys to `learn-swipe-preview.pages.dev`
- Comments on PR with preview URL
- Updates automatically on new commits

### 5. Code Review & Merge

1. **Review the PR**:
   - Check CI passes ✅
   - Test preview deployment
   - Review code changes
   - Ensure conventional commit format

2. **Merge to main**:
   - Use "Squash and merge" or "Merge commit"
   - Ensure final commit message follows conventional format

### 6. Automated Release Process

After merging to `main`, **Release-Please automatically**:

1. **Analyzes commits** since last release
2. **Determines version bump** based on conventional commits:
   - `feat:` → minor version (1.0.0 → 1.1.0)
   - `fix:` → patch version (1.0.0 → 1.0.1)
   - `feat!:` or `fix!:` → major version (1.0.0 → 2.0.0)

3. **Creates Release PR** with:
   - Updated `package.json` version
   - Updated `public/manifest.json` version
   - Generated `CHANGELOG.md` entries

4. **When you merge the Release PR**:
   - Creates GitHub release with tag
   - Automatically deploys to production
   - Updates all version references

## 📋 Branch Naming Conventions

Use descriptive branch names with prefixes:

```bash
# Features
feat/user-authentication
feat/offline-sync
feat/card-templates

# Bug fixes
fix/memory-leak-study-mode
fix/translation-missing-keys
fix/pwa-install-prompt

# Documentation
docs/api-documentation
docs/deployment-guide

# Refactoring
refactor/state-management
refactor/component-structure

# Performance
perf/lazy-loading
perf/bundle-optimization

# Tests
test/e2e-study-flow
test/unit-card-logic
```

## 🔄 Hotfix Process

For urgent production fixes:

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b fix/critical-security-patch

# Make minimal fix with conventional commit
git commit -m "fix: resolve XSS vulnerability in card input"

# Push and create PR
git push origin fix/critical-security-patch
gh pr create --title "fix: critical security patch" --body "Urgent fix for XSS vulnerability"

# Fast-track review and merge
# Release-Please will create patch release automatically
```

## 🛠️ Local Development Commands

```bash
# Start development server
bun run dev

# Run tests before pushing
bun run test
bun run test:e2e

# Check code quality
bun run check

# Build and test locally
bun run build

# Deploy to preview (manual)
bun run deploy:preview
```

## 📊 Release Types Examples

### Patch Release (1.0.0 → 1.0.1)
```bash
git commit -m "fix: resolve card flip animation glitch"
git commit -m "fix(i18n): correct plural forms in Chinese"
```

### Minor Release (1.0.0 → 1.1.0)
```bash
git commit -m "feat: add statistics dashboard"
git commit -m "feat(study): implement spaced repetition algorithm"
```

### Major Release (1.0.0 → 2.0.0)
```bash
git commit -m "feat!: redesign entire user interface"
git commit -m "fix!: change API response format for cards"
```

## 🚨 Best Practices

### ✅ Do's
- Keep feature branches small and focused
- Use conventional commit messages consistently
- Test locally before pushing
- Write descriptive PR descriptions
- Review preview deployments before merging
- Merge release PRs promptly for timely deployments

### ❌ Don'ts
- Don't push directly to `main`
- Don't merge without CI passing
- Don't use vague commit messages
- Don't create long-lived feature branches
- Don't skip code review process
- Don't ignore failed tests

## 🔧 Troubleshooting

### CI Failures
```bash
# Fix linting issues
bun run check --write

# Fix type errors
bunx tsc --noEmit

# Update translations
bun run translate

# Run tests locally
bun run test
bun run test:e2e
```

### Release Issues
- Check conventional commit format
- Ensure Release-Please PR is properly formatted
- Verify GitHub secrets are configured
- Check Cloudflare deployment logs

This workflow ensures clean, automated releases while maintaining code quality and enabling rapid development cycles.
