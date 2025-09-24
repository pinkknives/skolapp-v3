import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...classes: Array<ClassValue | string | undefined>) {
  return twMerge(clsx(classes))
}