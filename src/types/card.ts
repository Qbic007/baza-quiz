// Тип для отдельной карточки
export interface Card {
  id: number
  content: string
  isFlipped: boolean
}

// Тип для состояния игры
export interface GameState {
  cards: Card[]
  createdAt: number
  lastPlayed: number
  contestResults?: Record<number, 'success' | 'failure'>
}

// Тип для создания новой карточки
export interface CreateCardData {
  id: number
  content: string
}
