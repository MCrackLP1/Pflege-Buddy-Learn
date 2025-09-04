import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${remainingSeconds}s`
}

export function calculateXP(difficulty: number, timeMs: number, hintsUsed: number): number {
  const baseXP = difficulty * 10
  const timeBonus = Math.max(0, 30000 - timeMs) / 1000 // Max 30 bonus for quick answers
  const hintPenalty = hintsUsed * 5
  return Math.max(1, Math.floor(baseXP + timeBonus - hintPenalty))
}
