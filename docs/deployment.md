# Deployment Guide

This document explains how to set up and deploy LearnSwipe using GitHub Actions with Wrangler and release-please.

## Prerequisites

1. **Cloudflare Account**: You need a Cloudflare account with Pages enabled
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Cloudflare API Token**: Required for automated deployments

## Setup Instructions

### 1. Cloudflare Setup

1. **Create a Cloudflare Pages Project**:
   - Go to Cloudflare Dashboard → Pages
   - Create a new project named `learn-swipe`
   - Connect it to your GitHub repository (optional, we'll use Wrangler for deployment)

2. **Get Your Account ID**:
   - Go to Cloudflare Dashboard → Right sidebar
   - Copy your Account ID

3. **Create API Token**:
   - Go to Cloudflare Dashboard → My Profile → API Tokens
   - Click "Create Token"
   - Use "Custom token" template
   - Permissions:
     - Account: `Cloudflare Pages:Edit`
     - Zone: `Zone:Read` (if using custom domain)
   - Account Resources: Include your account
   - Click "Continue to summary" → "Create Token"
   - Copy the token (you won't see it again!)

### 2. GitHub Secrets Setup

Add the following secrets to your GitHub repository:

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add these Repository secrets:

```
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
```

### 3. Workflow Overview

The deployment setup includes three main workflows:

#### CI Workflow (`.github/workflows/ci.yml`)
- Runs on every push and pull request
- Performs linting, type checking, testing
- Builds the application
- Runs E2E tests with Playwright

#### Release Please (`.github/workflows/release-please.yml`)
- Runs on pushes to main branch
- Creates release PRs based on conventional commits
- Automatically deploys to production when releases are created
- Updates version numbers and changelog

#### Preview Deployment (`.github/workflows/deploy-preview.yml`)
- Runs on pull requests to main
- Deploys preview versions for testing
- Comments on PRs with preview URLs

## Release Process

### Conventional Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for automated releases:

- `feat:` - New features (minor version bump)
- `fix:` - Bug fixes (patch version bump)
- `feat!:` or `fix!:` - Breaking changes (major version bump)
- `docs:`, `style:`, `refactor:`, `test:`, `chore:` - No version bump

### Creating a Release

1. **Make changes** using conventional commit messages:
   ```bash
   git commit -m "feat: add new study mode"
   git commit -m "fix: resolve card navigation issue"
   ```

2. **Push to main**:
   ```bash
   git push origin main
   ```

3. **Release Please will**:
   - Analyze commits since last release
   - Create a release PR with updated changelog and version
   - When you merge the release PR, it will:
     - Create a GitHub release
     - Deploy to Cloudflare Pages
     - Update version in package.json and manifest.json

## Manual Deployment

If you need to deploy manually:

```bash
# Install Wrangler globally
bun add -g wrangler

# Login to Cloudflare
wrangler login

# Build the application
bun run build

# Deploy to production
wrangler pages deploy dist --project-name=learn-swipe --compatibility-date=2024-12-21

# Deploy to preview
wrangler pages deploy dist --project-name=learn-swipe-preview --compatibility-date=2024-12-21
```

## Troubleshooting

### Common Issues

1. **API Token Issues**:
   - Ensure token has correct permissions
   - Check token hasn't expired
   - Verify account ID is correct

2. **Build Failures**:
   - Check if all dependencies are properly installed
   - Ensure translations are compiled (`bun run translate`)
   - Verify TypeScript compilation passes

3. **Deployment Failures**:
   - Check Cloudflare Pages project name matches wrangler.toml
   - Verify compatibility date is recent
   - Check build output directory is correct (`dist`)

### Logs and Debugging

- **GitHub Actions**: Check the Actions tab in your repository
- **Cloudflare Pages**: Check the deployment logs in Cloudflare Dashboard
- **Wrangler**: Use `wrangler pages deployment list` to see deployment history

## Custom Domain (Optional)

To use a custom domain:

1. Add domain in Cloudflare Pages settings
2. Update DNS records as instructed
3. Update wrangler.toml if needed
4. Add Zone permissions to your API token

## Environment Variables

Currently, this application doesn't require environment variables as it's a client-side only app. If you need to add environment variables in the future:

1. Add them to GitHub Secrets
2. Pass them in the workflow files using `env:` sections
3. Update wrangler.toml with `[env.production.vars]` section
