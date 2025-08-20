import type { GameState, Card, ImageQuestionData } from '@/types/card'

const STORAGE_KEY = 'baza-quiz-game-state'

// Создание начального состояния игры
export function createInitialGameState(): GameState {
  const cards: Card[] = Array.from({ length: 40 }, (_, index) => ({
    id: index + 1,
    content: `Вопрос ${index + 1}`,
    isFlipped: false,
    questionType: 'image' as const,
    questionData: {
      type: 'image',
      imageUrl: '/images/i.webp',
    } as ImageQuestionData,
  }))

  return {
    cards,
    createdAt: Date.now(),
    lastPlayed: Date.now(),
  }
}

// Сохранение состояния в localStorage
export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Ошибка сохранения состояния игры:', error)
  }
}

// Загрузка состояния из localStorage
export function loadGameState(): GameState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const state = JSON.parse(stored) as GameState

    // Проверяем валидность данных
    if (!state.cards || !Array.isArray(state.cards) || state.cards.length !== 40) {
      return null
    }

    return state
  } catch (error) {
    console.error('Ошибка загрузки состояния игры:', error)
    return null
  }
}

// Очистка состояния игры
export function clearGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Ошибка очистки состояния игры:', error)
  }
}
