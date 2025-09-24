'use client'

import React from 'react'

interface ColorPickerProps {
  colors: string[]
  selectedColor: string
  onColorSelect: (color: string) => void
  className?: string
}

const colorClassMap: Record<string, string> = {
  '#FF6B6B': 'color-red',
  '#4ECDC4': 'color-teal', 
  '#45B7D1': 'color-blue',
  '#96CEB4': 'color-green',
  '#FFEAA7': 'color-yellow'
}

export function ColorPicker({ 
  colors, 
  selectedColor, 
  onColorSelect, 
  className = '' 
}: ColorPickerProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onColorSelect(color)}
          className={`w-8 h-8 rounded-full border-2 transition-colors ${colorClassMap[color] || ''} ${
            selectedColor === color 
              ? 'border-gray-800 dark:border-gray-200' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-500'
          }`}
          aria-label={`Välj färg ${color}`}
        />
      ))}
    </div>
  )
}
