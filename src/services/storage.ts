import type { GameState, Card } from '@/types/card'

const STORAGE_KEY = 'baza-quiz-game-state'

// Создание начального состояния игры
export async function createInitialGameState(): Promise<GameState> {
  // Загружаем конфигурацию из JSON файла
  const questionsConfig = await loadQuestionsConfig()

  // Создаем карточки на основе конфигурации
  const cards: Card[] = questionsConfig.map((question) => ({
    id: question.id,
    content: question.content,
    isFlipped: false,
    questionType: question.questionType,
    questionData: question.questionData,
  }))

  return {
    cards,
    createdAt: Date.now(),
    lastPlayed: Date.now(),
    boostsAndTraps: [],
    teams: null,
    scores: { leftTeam: 0, rightTeam: 0 },
  }
}

// Загрузка конфигурации вопросов из JSON файла
async function loadQuestionsConfig(): Promise<
  Array<{
    id: number
    content: string
    questionType: 'image' | 'video' | 'boost' | 'trap' | 'codenames'
    questionData: {
      type: 'image' | 'video' | 'boost' | 'trap' | 'codenames'
      content?: string
      imageUrl?: string
      videoUrl?: string
      width?: number
      height?: number
    }
  }>
> {
  try {
    // Читаем JSON файл из public/config/questions.json
    const response = await fetch('/config/questions.json')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    console.log('=== ЗАГРУЗКА КОНФИГУРАЦИИ ===')
    console.log('Загруженные вопросы:', data.questions)
    const codenamesQuestion = data.questions.find((q: any) => q.questionType === 'codenames')
    if (codenamesQuestion) {
      console.log('Code Names вопрос:', codenamesQuestion)
      console.log(
        'Размеры поля:',
        codenamesQuestion.questionData?.width,
        'x',
        codenamesQuestion.questionData?.height,
      )
    }
    console.log('================================')
    return data.questions || []
  } catch (error) {
    console.error('Ошибка загрузки конфигурации вопросов:', error)
    // Возвращаем пустой массив в случае ошибки
    return []
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
    if (!stored) {
      console.log('Нет сохраненного состояния в localStorage')
      return null
    }

    const state = JSON.parse(stored) as GameState
    console.log('Загружено из localStorage:', {
      teams: state.teams,
      scores: state.scores,
      cardsCount: state.cards?.length,
    })

    // Проверяем валидность данных
    if (!state.cards || !Array.isArray(state.cards) || state.cards.length !== 40) {
      console.log('Невалидные данные карточек, возвращаем null')
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

// Принудительное обновление конфигурации
export async function forceUpdateConfig(): Promise<GameState> {
  console.log('Принудительное обновление конфигурации...')
  clearGameState()
  return await createInitialGameState()
}
