import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Card, GameState, BoostOrTrap } from '@/types/card'
import { createInitialGameState, saveGameState, loadGameState } from '@/services/storage'

export const useGameStore = defineStore('game', () => {
  // Состояние
  const cards = ref<Card[]>([])
  const createdAt = ref<number>(0)
  const lastPlayed = ref<number>(0)
  const contestResults = ref<Record<number, 'success' | 'failure'>>({})
  const boostsAndTraps = ref<BoostOrTrap[]>([])

  // Геттеры
  const isGameStarted = computed(() => cards.value.length > 0)
  const flippedCardsCount = computed(() => cards.value.filter((card) => card.isFlipped).length)
  const totalCardsCount = computed(() => cards.value.length)
  const getContestResult = computed(() => (cardId: number) => contestResults.value[cardId] || null)

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
    } else {
      console.log('Создание нового состояния игры')
      // Создаем новое состояние
      const initialState = await createInitialGameState()
      cards.value = initialState.cards
      createdAt.value = initialState.createdAt
      lastPlayed.value = initialState.lastPlayed
      contestResults.value = initialState.contestResults || {}
      boostsAndTraps.value = initialState.boostsAndTraps || []

      // Сохраняем в localStorage
      saveGameState(initialState)
    }
  }

  function flipCard(cardId: number) {
    const card = cards.value.find((c) => c.id === cardId)
    if (card) {
      card.isFlipped = !card.isFlipped
      lastPlayed.value = Date.now()

      // Сохраняем обновленное состояние
      const currentState: GameState = {
        cards: cards.value,
        createdAt: createdAt.value,
        lastPlayed: lastPlayed.value,
        boostsAndTraps: boostsAndTraps.value,
      }
      saveGameState(currentState)

      console.log(`Карточка ${cardId} ${card.isFlipped ? 'перевернута' : 'возвращена'}`)
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

    // Сохраняем новое состояние
    saveGameState(initialState)
  }

  function getCard(cardId: number): Card | undefined {
    return cards.value.find((c) => c.id === cardId)
  }

  function setContestResult(cardId: number, result: 'success' | 'failure') {
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

  return {
    // Состояние
    cards,
    createdAt,
    lastPlayed,
    contestResults,
    boostsAndTraps,

    // Геттеры
    isGameStarted,
    flippedCardsCount,
    totalCardsCount,
    getContestResult,

    // Действия
    initializeGame: initializeGame as () => Promise<void>,
    flipCard,
    resetGame: resetGame as () => Promise<void>,
    getCard,
    setContestResult,
    addBoostOrTrap,
    removeBoostOrTrap,
  }
})
