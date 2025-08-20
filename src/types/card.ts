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
}

// Тип для создания новой карточки
export interface CreateCardData {
  id: number
  content: string
}
