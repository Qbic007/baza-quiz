import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Card, GameState, BoostOrTrap, ContestResult } from '@/types/card'
import { RESULT_COLORS } from '@/constants/colors'
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

  // Геттеры
  const isGameStarted = computed(() => cards.value.length > 0)
  const isTeamsSelected = computed(() => teams.value !== null)
  const flippedCardsCount = computed(() => cards.value.filter((card) => card.isFlipped).length)
  const totalCardsCount = computed(() => cards.value.length)
  const getContestResult = computed(() => (cardId: number) => contestResults.value[cardId] || null)
  
  // Функция для получения цвета карточки на основе результата конкурса
  const getCardColor = (cardId: number): string | null => {
    const result = contestResults.value[cardId]
    if (!result) return null
    
    return RESULT_COLORS[result] || null
  }

  // Действия
  async function initializeGame() {
    console.log('Инициализация игры...')

    // Пытаемся загрузить существующее состояние
    const savedState = loadGameState()

    if (savedState) {
      console.log('Загружено сохраненное состояние игры')
      cards.value = savedState.cards
      createdAt.value = savedState.createdAt
      lastPlayed.value = savedState.lastPlayed
      contestResults.value = savedState.contestResults || {}
      boostsAndTraps.value = savedState.boostsAndTraps || []
      teams.value = savedState.teams || null
    } else {
      console.log('Создание нового состояния игры')
      // Создаем новое состояние
      const initialState = await createInitialGameState()
      cards.value = initialState.cards
      createdAt.value = initialState.createdAt
      lastPlayed.value = initialState.lastPlayed
      contestResults.value = initialState.contestResults || {}
      boostsAndTraps.value = initialState.boostsAndTraps || []
      teams.value = null

      // Сохраняем в localStorage
      saveGameState(initialState)
    }
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
    contestResults.value = initialState.contestResults || {}
    boostsAndTraps.value = initialState.boostsAndTraps || []
    teams.value = null

    // Сохраняем новое состояние
    saveGameState(initialState)
  }

  function getCard(cardId: number): Card | undefined {
    return cards.value.find((c) => c.id === cardId)
  }

  function setContestResult(cardId: number, result: ContestResult) {
    contestResults.value[cardId] = result
    lastPlayed.value = Date.now()

    // Сохраняем обновленное состояние
    const currentState: GameState = {
      cards: cards.value,
      createdAt: createdAt.value,
      lastPlayed: lastPlayed.value,
      contestResults: contestResults.value,
      boostsAndTraps: boostsAndTraps.value,
    }
    saveGameState(currentState)

    console.log(`Результат конкурса ${cardId}: ${result}`)
  }

  function addBoostOrTrap(type: 'boost' | 'trap', content: string, cardId: number) {
    const newBoostOrTrap: BoostOrTrap = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      content,
      cardId,
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
    }
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

    // Геттеры
    isGameStarted,
    isTeamsSelected,
    flippedCardsCount,
    totalCardsCount,
    getContestResult,
    getCardColor,

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
    forceUpdateConfig: forceUpdateGameConfig as () => Promise<void>,
  }
})
