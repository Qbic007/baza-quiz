// Константы системы очков

// Очки за результаты конкурсов
export const CONTEST_SCORES = {
  leftTeam: 1, // Очко за победу левой команды
  rightTeam: 1, // Очко за победу правой команды
  nobody: 0, // Никто не получает очков
  draw: 1, // По очку каждой команде при ничьей
} as const

// Дополнительные очки за специальные достижения
export const BONUS_SCORES = {
  firstWin: 1, // Бонус за первую победу
  streak3: 2, // Бонус за 3 победы подряд
  streak5: 5, // Бонус за 5 побед подряд
  perfectRound: 3, // Бонус за идеальный раунд (все карточки в раунде)
} as const

// Максимальное количество очков для победы в игре
export const MAX_SCORE = 50

// Типы для очков
export type ContestScore = keyof typeof CONTEST_SCORES
export type BonusScore = keyof typeof BONUS_SCORES
