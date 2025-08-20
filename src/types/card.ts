// Типы вопросов
export type QuestionType = 'image' | 'audio' | 'video' | 'text'

// Базовый интерфейс для данных вопроса
export interface QuestionData {
  type: QuestionType
}

// Данные для изображения
export interface ImageQuestionData extends QuestionData {
  type: 'image'
  imageUrl: string
}

// Данные для видео
export interface VideoQuestionData extends QuestionData {
  type: 'video'
  videoUrl: string
}

// Тип для отдельной карточки
export interface Card {
  id: number
  content: string
  isFlipped: boolean
  questionType: QuestionType
  questionData: QuestionData
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
