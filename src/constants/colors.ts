// Константы цветов для команд и результатов конкурсов

// Цвета команд (основные)
export const TEAM_COLORS = {
  leftTeam: '#dc3545',   // Красный
  rightTeam: '#007bff',  // Синий
} as const

// Цвета результатов конкурсов (полупрозрачные)
export const RESULT_COLORS = {
  leftTeam: 'rgba(220, 53, 69, 0.3)',    // Полупрозрачный красный
  rightTeam: 'rgba(0, 123, 255, 0.3)',   // Полупрозрачный синий
  nobody: 'rgba(245, 245, 220, 0.3)',    // Полупрозрачный бежевый
  draw: 'rgba(40, 167, 69, 0.3)',        // Полупрозрачный зелёный
} as const

// Типы для цветов
export type TeamColor = keyof typeof TEAM_COLORS
export type ResultColor = keyof typeof RESULT_COLORS
