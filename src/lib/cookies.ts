/**
 * Cookie utility functions for safe cookie management
 * Uses react-cookie library for robust cookie handling
 */

import { Cookies } from 'react-cookie'

export interface CookieOptions {
  path?: string
  domain?: string
  maxAge?: number
  expires?: Date
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  httpOnly?: boolean
}

// Create a cookies instance
const cookies = new Cookies()

/**
 * Set a cookie with proper options
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  const {
    path = '/',
    domain,
    maxAge,
    expires,
    secure,
    sameSite = 'lax',
    httpOnly = false,
  } = options

  // Use react-cookie for safe cookie management
  cookies.set(name, value, {
    path,
    domain,
    maxAge,
    expires,
    secure,
    sameSite,
    httpOnly,
  })
}

/**
 * Get a cookie value by name
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export function getCookie(name: string): string | undefined {
  return cookies.get(name)
}

/**
 * Get all cookies as an object
 * @returns Object with all cookie key-value pairs
 */
export function getAllCookies(): { [name: string]: string } {
  return cookies.getAll()
}

/**
 * Delete a cookie by setting its expiration to the past
 * @param name - Cookie name
 * @param options - Cookie options (path and domain should match the original cookie)
 */
export function deleteCookie(
  name: string,
  options: Pick<CookieOptions, 'path' | 'domain'> = {}
): void {
  const { path = '/', domain } = options

  // Use react-cookie for safe cookie removal
  cookies.remove(name, { path, domain })
}
