// Team color utilities
export const TEAM_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Purple
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
  '#BB8FCE', // Lavender
  '#85C1E9', // Light Blue
]

export const getTeamColor = (teamId: string): string => {
  // Simple hash function to get consistent color for team ID
  let hash = 0
  for (let i = 0; i < teamId.length; i++) {
    const char = teamId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return TEAM_COLORS[Math.abs(hash) % TEAM_COLORS.length]
}

export const getTeamColorClass = (teamId: string): string => {
  const colorIndex = Math.abs(teamId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % TEAM_COLORS.length
  return `team-color-${colorIndex + 1}`
}

export const getProgressClass = (percentage: number): string => {
  const rounded = Math.round(percentage / 10) * 10
  return `progress-${Math.min(Math.max(rounded, 0), 100)}`
}
