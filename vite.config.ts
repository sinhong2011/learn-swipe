import { resolve } from 'node:path'
import { lingui } from '@lingui/vite-plugin'
import babel from '@rolldown/plugin-babel'
import { serwist } from '@serwist/vite'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 5173,
  },
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    react(),
    // @ts-expect-error -- @rolldown/plugin-babel types require all PluginOptions fields
    babel({
      presets: [
        ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
        reactCompilerPreset(),
      ],
      plugins: ['@lingui/babel-plugin-lingui-macro'],
    }),
    tailwindcss(),
    // Only include Serwist in production builds
    ...(mode === 'production'
      ? [
          serwist({
            swSrc: 'src/sw.ts',
            swDest: 'sw.js',
            globDirectory: 'dist',
            injectionPoint: 'self.__SW_MANIFEST',
            rollupFormat: 'iife',
          }),
        ]
      : []),
    lingui(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-dom') || id.includes('react/')) return 'react'
          if (
            id.includes('@tanstack/react-router') ||
            id.includes('@tanstack/router-plugin')
          )
            return 'router'
          if (id.includes('@radix-ui/')) return 'radix'
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('motion')) return 'motion'
          if (id.includes('dexie')) return 'database'
          if (id.includes('zustand')) return 'state'
          if (
            id.includes('clsx') ||
            id.includes('tailwind-merge') ||
            id.includes('class-variance-authority') ||
            id.includes('es-toolkit') ||
            id.includes('uuid')
          )
            return 'utils'
          if (id.includes('@lingui/core') || id.includes('@lingui/react'))
            return 'i18n'
        },
      },
    },
  },
}))
