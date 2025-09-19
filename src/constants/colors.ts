// Константы цветов для команд и результатов конкурсов

// Цвета команд (основные)
export const TEAM_COLORS = {
  leftTeam: '#6f42c1', // Фиолетовый
  rightTeam: '#fd7e14', // Оранжевый
} as const

// Цвета результатов конкурсов
export const RESULT_COLORS = {
  leftTeam: 'rgba(111, 66, 193, 0.3)', // Полупрозрачный фиолетовый
  rightTeam: 'rgba(253, 126, 20, 0.3)', // Полупрозрачный оранжевый
  nobody: 'rgba(128, 128, 128, 0.3)', // Полупрозрачный серый
  draw: 'linear-gradient(135deg, rgba(111, 66, 193, 0.3) 0%, rgba(253, 126, 20, 0.3) 100%)', // Градиент от фиолетового к оранжевому
} as const

// Цвета для бустов и ловушек
export const BOOST_TRAP_COLORS = {
  boost: 'rgba(40, 167, 69, 0.3)', // Полупрозрачный зелёный
  trap: 'rgba(220, 53, 69, 0.3)', // Полупрозрачный красный
} as const

// Типы для цветов
export type TeamColor = keyof typeof TEAM_COLORS
export type ResultColor = keyof typeof RESULT_COLORS
export type BoostTrapColor = keyof typeof BOOST_TRAP_COLORS
