import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Determines the time of day based on the current hour.
 * @param date - The date to check
 * @returns 'morning' | 'afternoon' | 'evening' | 'night'
 */
export function getTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) {
    return 'morning'
  }
  if (hour >= 12 && hour < 17) {
    return 'afternoon'
  }
  if (hour >= 17 && hour < 22) {
    return 'evening'
  }
  return 'night'
}

/**
 * Detects the device type based on screen width.
 * @returns 'mobile' | 'tablet' | 'desktop'
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') {
    return 'desktop'
  }
  const width = window.innerWidth
  if (width < 768) {
    return 'mobile'
  }
  if (width < 1024) {
    return 'tablet'
  }
  return 'desktop'
}
