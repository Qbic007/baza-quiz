import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Card, GameState } from '@/types/card'
import { createInitialGameState, saveGameState, loadGameState } from '@/services/storage'

export const useGameStore = defineStore('game', () => {
  // Состояние
  const cards = ref<Card[]>([])
  const createdAt = ref<number>(0)
  const lastPlayed = ref<number>(0)
  const contestResults = ref<Record<number, 'success' | 'failure'>>({})

  // Геттеры
  const isGameStarted = computed(() => cards.value.length > 0)
  const flippedCardsCount = computed(() => cards.value.filter((card) => card.isFlipped).length)
  const totalCardsCount = computed(() => cards.value.length)
  const getContestResult = computed(() => (cardId: number) => contestResults.value[cardId] || null)

  // Действия
  function initializeGame() {
    console.log('Инициализация игры...')

    // Пытаемся загрузить существующее состояние
    const savedState = loadGameState()

    if (savedState) {
      console.log('Загружено сохраненное состояние игры')
      cards.value = savedState.cards
      createdAt.value = savedState.createdAt
      lastPlayed.value = savedState.lastPlayed
      contestResults.value = savedState.contestResults || {}
    } else {
      console.log('Создание нового состояния игры')
      // Создаем новое состояние
      const initialState = createInitialGameState()
      cards.value = initialState.cards
      createdAt.value = initialState.createdAt
      lastPlayed.value = initialState.lastPlayed
      contestResults.value = initialState.contestResults || {}

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
      }
      saveGameState(currentState)

      console.log(`Карточка ${cardId} ${card.isFlipped ? 'перевернута' : 'возвращена'}`)
    }
  }

  function resetGame() {
    console.log('Сброс игры')
    const initialState = createInitialGameState()
    cards.value = initialState.cards
    createdAt.value = initialState.createdAt
    lastPlayed.value = initialState.lastPlayed
    contestResults.value = initialState.contestResults || {}

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
    }
    saveGameState(currentState)

    console.log(`Результат конкурса ${cardId}: ${result}`)
  }

  return {
    // Состояние
    cards,
    createdAt,
    lastPlayed,
    contestResults,

    // Геттеры
    isGameStarted,
    flippedCardsCount,
    totalCardsCount,
    getContestResult,

    // Действия
    initializeGame,
    flipCard,
    resetGame,
    getCard,
    setContestResult,
  }
})
