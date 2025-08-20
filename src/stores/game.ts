import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Card, GameState } from '@/types/card'
import { createInitialGameState, saveGameState, loadGameState } from '@/services/storage'

export const useGameStore = defineStore('game', () => {
  // Состояние
  const cards = ref<Card[]>([])
  const createdAt = ref<number>(0)
  const lastPlayed = ref<number>(0)

  // Геттеры
  const isGameStarted = computed(() => cards.value.length > 0)
  const flippedCardsCount = computed(() => cards.value.filter((card) => card.isFlipped).length)
  const totalCardsCount = computed(() => cards.value.length)

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
    } else {
      console.log('Создание нового состояния игры')
      // Создаем новое состояние
      const initialState = createInitialGameState()
      cards.value = initialState.cards
      createdAt.value = initialState.createdAt
      lastPlayed.value = initialState.lastPlayed

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

    // Сохраняем новое состояние
    saveGameState(initialState)
  }

  function getCard(cardId: number): Card | undefined {
    return cards.value.find((c) => c.id === cardId)
  }

  return {
    // Состояние
    cards,
    createdAt,
    lastPlayed,

    // Геттеры
    isGameStarted,
    flippedCardsCount,
    totalCardsCount,

    // Действия
    initializeGame,
    flipCard,
    resetGame,
    getCard,
  }
})
