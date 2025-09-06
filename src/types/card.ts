// Типы вопросов
export type QuestionType = 'image' | 'audio' | 'video' | 'text' | 'boost' | 'trap' | 'codenames'

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

// Данные для аудио
export interface AudioQuestionData extends QuestionData {
  type: 'audio'
  audioUrl: string
}

// Данные для текста
export interface TextQuestionData extends QuestionData {
  type: 'text'
  textContent: string
}

// Данные для буста
export interface BoostQuestionData extends QuestionData {
  type: 'boost'
  content: string
}

// Данные для трэпа (ловушки)
export interface TrapQuestionData extends QuestionData {
  type: 'trap'
  content: string
}

// Данные для Code Names
export interface CodenamesQuestionData extends QuestionData {
  type: 'codenames'
  content: string
  colors: ('red' | 'blue' | 'black')[]
}

// Тип для отдельной карточки
export interface Card {
  id: number
  content: string
  isFlipped: boolean
  questionType: QuestionType
  questionData: QuestionData
}

// Тип для буста или трэпа
export interface BoostOrTrap {
  id: string
  type: 'boost' | 'trap'
  content: string
  cardId: number
}

// Тип для состояния игры
export interface GameState {
  cards: Card[]
  createdAt: number
  lastPlayed: number
  contestResults?: Record<number, 'success' | 'failure'>
  boostsAndTraps: BoostOrTrap[]
}

// Тип для создания новой карточки
export interface CreateCardData {
  id: number
  content: string
}
