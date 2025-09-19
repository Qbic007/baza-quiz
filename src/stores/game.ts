import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Card, GameState, BoostOrTrap, ContestResult, TeamScores } from '@/types/card'
import { RESULT_COLORS } from '@/constants/colors'
import { CONTEST_SCORES } from '@/constants/scoring'
import {
  createInitialGameState,
  saveGameState,
  loadGameState,
  forceUpdateConfig,
} from '@/services/storage'

export const useGameStore = defineStore('game', () => {
  // Состояние
  const cards = ref<Card[]>([])
  const createdAt = ref<number>(0)
  const lastPlayed = ref<number>(0)
  const contestResults = ref<Record<number, ContestResult>>({})
  const boostsAndTraps = ref<BoostOrTrap[]>([])
  const teams = ref<{ leftTeam: string; rightTeam: string } | null>(null)
  const scores = ref<TeamScores>({ leftTeam: 0, rightTeam: 0 })
  
  // Статичные пулы бустов и ловушек
  const boostsPool = [
    "Получите +2 очка за следующий конкурс",
    "Пропустите один конкурс и получите очко",
    "Удвойте очки за победу в следующем конкурсе",
    "Получите подсказку для следующего конкурса",
    "Заберите одно очко у соперника",
    "Получите дополнительный ход",
    "Измените результат одного конкурса",
    "Получите +1 очко за каждый правильный ответ",
    "Пропустите ловушку соперника",
    "Получите бонусное очко за активность",
    "Увеличьте время на конкурс на 30 секунд",
    "Получите право выбрать тип следующего конкурса",
    "Заблокируйте один буст соперника",
    "Получите +3 очка за победу в следующем конкурсе",
    "Верните одно очко, если проиграете",
    "Получите иммунитет к ловушкам на 2 хода",
    "Удвойте очки за ничью",
    "Получите право переиграть один конкурс",
    "Заберите 2 очка у соперника",
    "Получите +1 очко за каждый ход в течение 3 ходов"
  ]
  
  const trapsPool = [
    "Потеряйте 1 очко",
    "Пропустите следующий конкурс",
    "Потеряйте 2 очка за следующий конкурс",
    "Получите штраф -1 очко за каждый ход",
    "Заблокируйте один из ваших бустов",
    "Потеряйте право на подсказку",
    "Получите -1 очко за каждый неправильный ответ",
    "Потеряйте половину очков за следующий конкурс",
    "Получите штраф -2 очка",
    "Заблокируйте все бусты на 2 хода",
    "Потеряйте 1 очко за каждый ход в течение 3 ходов",
    "Получите штраф -3 очка за следующий конкурс",
    "Заблокируйте один из ваших бустов навсегда",
    "Потеряйте право выбирать тип конкурса",
    "Получите штраф -1 очко за каждый правильный ответ",
    "Потеряйте все очки за следующий конкурс",
    "Получите штраф -2 очка за каждый ход",
    "Заблокируйте все бусты навсегда",
    "Потеряйте 5 очков",
    "Получите штраф -1 очко за каждый ход в течение 5 ходов"
  ]

  // Геттеры
  const isGameStarted = computed(() => cards.value.length > 0)
  const isTeamsSelected = computed(() => teams.value !== null)
  const flippedCardsCount = computed(() => cards.value.filter((card) => card.isFlipped).length)
  const totalCardsCount = computed(() => cards.value.length)
  const getContestResult = computed(() => (cardId: number) => contestResults.value[cardId] ?? null)

  // Геттеры для очков
  const leftTeamScore = computed(() => scores.value.leftTeam)
  const rightTeamScore = computed(() => scores.value.rightTeam)
  const totalScore = computed(() => scores.value.leftTeam + scores.value.rightTeam)
  const scoreDifference = computed(() => Math.abs(scores.value.leftTeam - scores.value.rightTeam))
  const leadingTeam = computed(() => {
    if (scores.value.leftTeam > scores.value.rightTeam) return 'leftTeam'
    if (scores.value.rightTeam > scores.value.leftTeam) return 'rightTeam'
    return null
  })

  // Геттеры для бустов и ловушек команд
  const leftTeamBoosts = computed(() =>
    boostsAndTraps.value.filter((item) => item.team === 'leftTeam' && item.type === 'boost'),
  )
  const rightTeamBoosts = computed(() =>
    boostsAndTraps.value.filter((item) => item.team === 'rightTeam' && item.type === 'boost'),
  )
  const leftTeamTraps = computed(() =>
    boostsAndTraps.value.filter((item) => item.team === 'leftTeam' && item.type === 'trap'),
  )
  const rightTeamTraps = computed(() =>
    boostsAndTraps.value.filter((item) => item.team === 'rightTeam' && item.type === 'trap'),
  )

  // Функция для получения цвета карточки на основе результата конкурса
  const getCardColor = (cardId: number): string | null => {
    const result = contestResults.value[cardId]
    if (!result) return null

    return RESULT_COLORS[result] ?? null
  }

  // Действия
  async function initializeGame() {
    console.log('Инициализация игры...')

    // Пытаемся загрузить существующее состояние
    const savedState = loadGameState()

    if (savedState) {
      console.log('Загружено сохраненное состояние игры')
      console.log('Сохраненные команды:', savedState.teams)
      console.log('Сохраненные очки:', savedState.scores)
      cards.value = savedState.cards
      createdAt.value = savedState.createdAt
      lastPlayed.value = savedState.lastPlayed
      contestResults.value = savedState.contestResults ?? {}
      boostsAndTraps.value = savedState.boostsAndTraps ?? []
      teams.value = savedState.teams ?? null
      scores.value = savedState.scores ?? { leftTeam: 0, rightTeam: 0 }
    } else {
      console.log('Создание нового состояния игры')
      // Создаем новое состояние
      const initialState = await createInitialGameState()
      cards.value = initialState.cards
      createdAt.value = initialState.createdAt
      lastPlayed.value = initialState.lastPlayed
      contestResults.value = initialState.contestResults ?? {}
      boostsAndTraps.value = initialState.boostsAndTraps ?? []
      teams.value = null
      scores.value = { leftTeam: 0, rightTeam: 0 }

      // Сохраняем в localStorage
      saveGameState(initialState)
    }

    console.log('Игра инициализирована')
  }

  function flipCard(cardId: number) {
    const card = cards.value.find((c) => c.id === cardId)
    if (card && !card.isFlipped) {
      // Карточка может перевернуться только один раз - из закрытого в открытое состояние
      card.isFlipped = true
      lastPlayed.value = Date.now()

      // Сохраняем обновленное состояние
      const currentState: GameState = {
        cards: cards.value,
        createdAt: createdAt.value,
        lastPlayed: lastPlayed.value,
        boostsAndTraps: boostsAndTraps.value,
      }
      saveGameState(currentState)

      console.log(`Карточка ${cardId} открыта`)
    }
  }

  async function resetGame() {
    console.log('Сброс игры')
    const initialState = await createInitialGameState()
    cards.value = initialState.cards
    createdAt.value = initialState.createdAt
    lastPlayed.value = initialState.lastPlayed
    contestResults.value = initialState.contestResults ?? {}
    boostsAndTraps.value = initialState.boostsAndTraps ?? []
    teams.value = null
    scores.value = { leftTeam: 0, rightTeam: 0 }

    // Сохраняем новое состояние
    saveGameState(initialState)
  }

  function getCard(cardId: number): Card | undefined {
    return cards.value.find((c) => c.id === cardId)
  }

  // Функции для работы с очками
  function addScore(result: ContestResult) {
    const baseScore = CONTEST_SCORES[result]
    console.log(`Начисляем очки за результат "${result}": ${baseScore}`)

    if (result === 'leftTeam') {
      scores.value.leftTeam += baseScore
    } else if (result === 'rightTeam') {
      scores.value.rightTeam += baseScore
    } else if (result === 'draw') {
      scores.value.leftTeam += baseScore
      scores.value.rightTeam += baseScore
    }
    // nobody - никто не получает очков

    console.log(
      `Очки обновлены: ${teams.value?.leftTeam || 'Левая команда'}: ${scores.value.leftTeam}, ${teams.value?.rightTeam || 'Правая команда'}: ${scores.value.rightTeam}`,
    )
  }

  function resetScores() {
    scores.value = { leftTeam: 0, rightTeam: 0 }
    console.log('Очки сброшены')
  }

  function addBonusScore(
    team: 'leftTeam' | 'rightTeam',
    bonusType: keyof typeof import('@/constants/scoring').BONUS_SCORES,
  ) {
    const bonusScore = import('@/constants/scoring').BONUS_SCORES[bonusType]
    scores.value[team] += bonusScore
    console.log(`Бонусные очки ${bonusType} (+${bonusScore}) начислены команде ${team}`)
  }

  function adjustScore(team: 'leftTeam' | 'rightTeam', delta: number) {
    const currentScore = team === 'leftTeam' ? scores.value.leftTeam : scores.value.rightTeam
    const newScore = Math.max(0, currentScore + delta) // Не позволяем очкам быть отрицательными

    scores.value[team] = newScore
    lastPlayed.value = Date.now()

    // Сохраняем обновленное состояние
    const currentState: GameState = {
      cards: cards.value,
      createdAt: createdAt.value,
      lastPlayed: lastPlayed.value,
      contestResults: contestResults.value,
      boostsAndTraps: boostsAndTraps.value,
      teams: teams.value,
      scores: scores.value,
    }
    saveGameState(currentState)

    console.log(`Очки ${team} изменены на ${delta > 0 ? '+' : ''}${delta}: ${newScore}`)
  }

  function setContestResult(cardId: number, result: ContestResult) {
    contestResults.value[cardId] = result
    lastPlayed.value = Date.now()

    // Начисляем очки на основе результата
    addScore(result)

    // Сохраняем обновленное состояние
    const currentState: GameState = {
      cards: cards.value,
      createdAt: createdAt.value,
      lastPlayed: lastPlayed.value,
      contestResults: contestResults.value,
      boostsAndTraps: boostsAndTraps.value,
      teams: teams.value,
      scores: scores.value,
    }
    saveGameState(currentState)

    console.log(`Результат конкурса ${cardId}: ${result}`)
  }

  function addBoostOrTrap(
    type: 'boost' | 'trap',
    content: string,
    cardId: number,
    team?: 'leftTeam' | 'rightTeam',
  ) {
    // Если content пустой, выбираем случайный из пула
    let finalContent = content
    if (!finalContent) {
      const pool = type === 'boost' ? boostsPool : trapsPool
      if (pool.length > 0) {
        finalContent = pool[Math.floor(Math.random() * pool.length)]
      } else {
        finalContent = type === 'boost' ? 'Получите +1 очко' : 'Потеряйте 1 очко'
      }
    }

    const newBoostOrTrap: BoostOrTrap = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      content: finalContent,
      cardId,
      team,
    }

    boostsAndTraps.value.push(newBoostOrTrap)
    lastPlayed.value = Date.now()

    // Сохраняем обновленное состояние
    const currentState: GameState = {
      cards: cards.value,
      createdAt: createdAt.value,
      lastPlayed: lastPlayed.value,
      contestResults: contestResults.value,
      boostsAndTraps: boostsAndTraps.value,
      teams: teams.value,
      scores: scores.value,
    }
    saveGameState(currentState)

    console.log(`Добавлен ${type}: ${content}`)
  }

  function removeBoostOrTrap(id: string) {
    const index = boostsAndTraps.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      boostsAndTraps.value.splice(index, 1)

      // Сохраняем обновленное состояние
      const currentState: GameState = {
        cards: cards.value,
        createdAt: createdAt.value,
        lastPlayed: lastPlayed.value,
        contestResults: contestResults.value,
        boostsAndTraps: boostsAndTraps.value,
        teams: teams.value,
        scores: scores.value,
      }
      saveGameState(currentState)

      console.log(`Удален буст/трэп: ${id}`)
    }
  }

  function setTeams(leftTeam: string, rightTeam: string) {
    teams.value = { leftTeam, rightTeam }
    lastPlayed.value = Date.now()

    // Сохраняем обновленное состояние
    const currentState: GameState = {
      cards: cards.value,
      createdAt: createdAt.value,
      lastPlayed: lastPlayed.value,
      contestResults: contestResults.value,
      boostsAndTraps: boostsAndTraps.value,
      teams: teams.value,
      scores: scores.value,
    }

    console.log('Сохраняем состояние с командами:', currentState.teams)
    saveGameState(currentState)

    console.log(`Команды выбраны: ${leftTeam} vs ${rightTeam}`)
  }

  function resetTeams() {
    teams.value = null
    lastPlayed.value = Date.now()

    // Сохраняем обновленное состояние
    const currentState: GameState = {
      cards: cards.value,
      createdAt: createdAt.value,
      lastPlayed: lastPlayed.value,
      contestResults: contestResults.value,
      boostsAndTraps: boostsAndTraps.value,
      teams: teams.value,
      scores: scores.value,
    }
    saveGameState(currentState)

    console.log('Команды сброшены')
  }

  // Принудительное обновление конфигурации
  async function forceUpdateGameConfig() {
    console.log('Принудительное обновление конфигурации...')
    const newState = await forceUpdateConfig()
    console.log('Новое состояние загружено:', newState)

    // Находим Code Names карточку и выводим её конфигурацию
    const codenamesCard = newState.cards.find((card) => card.questionType === 'codenames')
    if (codenamesCard) {
      console.log('Code Names карточка:', codenamesCard)
      console.log('Размеры поля:', codenamesCard.questionData)
    }

    cards.value = newState.cards
    createdAt.value = newState.createdAt
    lastPlayed.value = newState.lastPlayed
    contestResults.value = newState.contestResults || {}
    boostsAndTraps.value = newState.boostsAndTraps || []
    saveGameState(newState)

    console.log('Конфигурация обновлена успешно!')
  }

  return {
    // Состояние
    cards,
    createdAt,
    lastPlayed,
    contestResults,
    boostsAndTraps,
    teams,
    scores,

    // Геттеры
    isGameStarted,
    isTeamsSelected,
    flippedCardsCount,
    totalCardsCount,
    getContestResult,
    getCardColor,
    leftTeamScore,
    rightTeamScore,
    totalScore,
    scoreDifference,
    leadingTeam,
    leftTeamBoosts,
    rightTeamBoosts,
    leftTeamTraps,
    rightTeamTraps,

    // Действия
    initializeGame: initializeGame as () => Promise<void>,
    flipCard,
    resetGame: resetGame as () => Promise<void>,
    getCard,
    setContestResult,
    addBoostOrTrap,
    removeBoostOrTrap,
    setTeams,
    resetTeams,
    addScore,
    resetScores,
    addBonusScore,
    adjustScore,
    forceUpdateConfig: forceUpdateGameConfig as () => Promise<void>,
  }
})
