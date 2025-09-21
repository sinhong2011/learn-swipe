import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Translation Files and Structure', () => {
  it('should have all required translation files', () => {
    const locales = ['en', 'zh-HK']

    locales.forEach((locale) => {
      const poFile = path.join(
        process.cwd(),
        'src',
        'locales',
        locale,
        'messages.po'
      )
      const mjsFile = path.join(
        process.cwd(),
        'src',
        'locales',
        locale,
        'messages.mjs'
      )

      expect(existsSync(poFile)).toBe(true)
      expect(existsSync(mjsFile)).toBe(true)
    })
  })

  it('should have all required settings translations in po files', () => {
    const requiredTranslations = [
      'Settings',
      'Appearance',
      'Dark Mode',
      'Dark appearance',
      'Light appearance',
      'Language & Region',
      'About',
      'Flashcard Learning App',
      'Version 1.0.0',
    ]

    const locales = ['en', 'zh-HK']

    locales.forEach((locale) => {
      const poFile = path.join(
        process.cwd(),
        'src',
        'locales',
        locale,
        'messages.po'
      )
      const content = readFileSync(poFile, 'utf-8')

      requiredTranslations.forEach((key) => {
        expect(content).toContain(`msgid "${key}"`)
      })
    })
  })

  it('should have non-empty translations for zh-HK locale', () => {
    const zhHKPoFile = path.join(
      process.cwd(),
      'src',
      'locales',
      'zh-HK',
      'messages.po'
    )
    const content = readFileSync(zhHKPoFile, 'utf-8')

    const expectedTranslations = {
      Settings: '設定',
      Appearance: '外觀',
      'Dark Mode': '深色模式',
      'Dark appearance': '深色外觀',
      'Light appearance': '淺色外觀',
      'Language & Region': '語言與地區',
      About: '關於',
      'Flashcard Learning App': '閃卡學習應用程式',
      'Version 1.0.0': '版本 1.0.0',
    }

    Object.entries(expectedTranslations).forEach(([key, translation]) => {
      expect(content).toContain(`msgid "${key}"`)
      expect(content).toContain(`msgstr "${translation}"`)
    })
  })

  it('should have compiled message files with content', () => {
    const locales = ['en', 'zh-HK']

    locales.forEach((locale) => {
      const mjsFile = path.join(
        process.cwd(),
        'src',
        'locales',
        locale,
        'messages.mjs'
      )
      const content = readFileSync(mjsFile, 'utf-8')

      // Should contain compiled messages
      expect(content).toContain('export const messages')
      expect(content).toContain('JSON.parse')
      expect(content.length).toBeGreaterThan(100) // Should have substantial content
    })
  })

  it('should have zh-HK compiled messages with Chinese characters', () => {
    const zhHKMjsFile = path.join(
      process.cwd(),
      'src',
      'locales',
      'zh-HK',
      'messages.mjs'
    )
    const content = readFileSync(zhHKMjsFile, 'utf-8')

    // Should contain some Chinese characters in the compiled messages
    expect(content).toMatch(/[\u4e00-\u9fff]/) // Chinese character range
    expect(content).toContain('設定') // Should contain "Settings" translation
  })
})
