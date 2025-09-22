// Типы вопросов
export type QuestionType =
  | 'image'
  | 'audio'
  | 'video'
  | 'text'
  | 'boost'
  | 'trap'
  | 'codenames'
  | 'collage'
  | 'competition'

// Базовый интерфейс для данных вопроса
export interface QuestionData {
  type: QuestionType
  autoStartTimer?: boolean // Автоматический запуск таймера (по умолчанию true)
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
  content: string
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
  width: number
  height: number
}

// Данные для коллажа
export interface CollageQuestionData extends QuestionData {
  type: 'collage'
  images: string[]
  title: string
}

// Данные для состязания
export interface CompetitionQuestionData extends QuestionData {
  type: 'competition'
  name: string
  description?: string
}

// Тип для интро карточки
export interface CardIntro {
  content: string
}

// Тип для отдельной карточки
export interface Card {
  id: number
  content: string
  isFlipped: boolean
  questionType: QuestionType
  questionData: QuestionData
  intro?: CardIntro
}

// Тип для буста или трэпа
export interface BoostOrTrap {
  id: string
  type: 'boost' | 'trap'
  content: string
  cardId: number
  team?: 'leftTeam' | 'rightTeam' // Команда, которой принадлежит ловушка/бонус
}

// Тип для результата конкурса
export type ContestResult = 'leftTeam' | 'rightTeam' | 'nobody' | 'draw'

// Тип для очков команд
export interface TeamScores {
  leftTeam: number
  rightTeam: number
}

// Тип для состояния игры
export interface GameState {
  cards: Card[]
  createdAt: number
  lastPlayed: number
  contestResults?: Record<number, ContestResult>
  boostsAndTraps: BoostOrTrap[]
  teams?: { leftTeam: string; rightTeam: string }
  scores?: TeamScores
}

// Тип для создания новой карточки
export interface CreateCardData {
  id: number
  content: string
}
