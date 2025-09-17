// Environment configuration for Spec Kit
const isDevelopment = process.env.NODE_ENV === 'development'
const isDemo = process.env.NEXT_PUBLIC_SPEC_KIT_DEMO_MODE === 'true'

export const SPEC_KIT_CONFIG = {
  isDevelopment,
  isDemo: isDevelopment || isDemo, // Always use demo mode in development
  apiKey: process.env.NEXT_PUBLIC_SPEC_KIT_API_KEY || 'demo-key',
  baseUrl: process.env.NEXT_PUBLIC_SPEC_KIT_BASE_URL || 'https://api.speckit.education/v1',
  version: '1.0',
}

export const shouldUseMockData = () => {
  return SPEC_KIT_CONFIG.isDemo || SPEC_KIT_CONFIG.isDevelopment
}