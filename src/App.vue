<script setup lang="ts">
import { onMounted, ref } from 'vue'
import QuizCard from './components/Card.vue'
import GameRulesModal from './components/GameRulesModal.vue'
import ContestModal from './components/ContestModal.vue'
import { useGameStore } from '@/stores/game'

// Store
const gameStore = useGameStore()

// Состояние модальных окон
const showRulesModal = ref(false)
const showContestModal = ref(false)
const currentCardId = ref<number | null>(null)

// Инициализируем игру при загрузке компонента
onMounted(() => {
  gameStore.initializeGame()
})

// Обработчики модального окна с правилами
const closeRulesModal = () => {
  showRulesModal.value = false
  currentCardId.value = null
}

// Обработчики модального окна конкурса
const closeContestModal = () => {
  showContestModal.value = false
  currentCardId.value = null
}

// Обработчик переворота карточки
const handleCardFlipped = (cardId: number) => {
  console.log(`Карточка ${cardId} перевернута, показываем модальное окно`)
  currentCardId.value = cardId
  showRulesModal.value = true
}

// Обработчик начала конкурса
const handleStartContest = (cardId: number) => {
  console.log(`Начинаем конкурс ${cardId}`)
  showRulesModal.value = false
  currentCardId.value = cardId
  showContestModal.value = true
}

// Обработчики результата конкурса
const handleContestSuccess = (cardId: number) => {
  console.log(`Конкурс ${cardId} успешно завершён`)
  gameStore.setContestResult(cardId, 'success')
  showContestModal.value = false
  currentCardId.value = null
}

const handleContestFailure = (cardId: number) => {
  console.log(`Конкурс ${cardId} провален`)
  gameStore.setContestResult(cardId, 'failure')
  showContestModal.value = false
  currentCardId.value = null
}

// Создаем массив из 40 элементов для сетки 8x5
const cards = Array.from({ length: 40 }, (_, index) => index + 1)
</script>

<template>
  <div class="app">
    <h1>Baza Quiz</h1>

    <!-- Информация о состоянии игры -->
    <div class="game-info" v-if="gameStore.isGameStarted">
      <p>
        Карточек перевернуто: {{ gameStore.flippedCardsCount }} из {{ gameStore.totalCardsCount }}
      </p>
      <div class="game-controls">
        <button @click="showRulesModal = true" class="btn btn-info">📖 Правила</button>
        <button @click="gameStore.resetGame" class="reset-btn">Сбросить игру</button>
      </div>
    </div>

    <div class="grid-container">
      <div v-for="card in cards" :key="card" class="grid-item">
        <QuizCard
          :card-number="card"
          :contest-result="gameStore.getContestResult(card)"
          @card-flipped="handleCardFlipped"
        />
      </div>
    </div>

    <!-- Модальное окно с правилами -->
    <GameRulesModal
      :is-visible="showRulesModal"
      :card-id="currentCardId || 0"
      @close="closeRulesModal"
      @start-contest="handleStartContest"
    />

    <!-- Модальное окно конкурса -->
    <ContestModal
      :is-visible="showContestModal"
      :card-id="currentCardId || 0"
      @close="closeContestModal"
      @success="handleContestSuccess"
      @failure="handleContestFailure"
    />
  </div>
</template>

<style scoped>
.app {
  padding: 20px;
  text-align: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2.5rem;
}

.game-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.game-info p {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

.game-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover {
  background-color: #138496;
}

.reset-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.reset-btn:hover {
  background-color: #c0392b;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Для больших экранов - фиксированная сетка 8x5 */
@media (min-width: 1400px) {
  .grid-container {
    grid-template-columns: repeat(8, 1fr);
    grid-template-rows: repeat(5, auto);
  }
}

/* Для средних экранов - адаптивная сетка */
@media (max-width: 1399px) and (min-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

/* Для мобильных устройств */
@media (max-width: 767px) {
  .grid-container {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    padding: 0 15px;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 20px;
  }
}

.grid-item {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
