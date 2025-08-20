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

    <!-- Кнопка перезапуска игры (отладочная) -->
    <button v-if="gameStore.isGameStarted" @click="gameStore.resetGame" class="debug-reset-btn">
      🔄
    </button>

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
      :question-type="gameStore.getCard(currentCardId || 0)?.questionType || 'image'"
      :image-url="
        gameStore.getCard(currentCardId || 0)?.questionData?.type === 'image'
          ? (gameStore.getCard(currentCardId || 0)?.questionData as any)?.imageUrl
          : ''
      "
      :video-url="
        gameStore.getCard(currentCardId || 0)?.questionData?.type === 'video'
          ? (gameStore.getCard(currentCardId || 0)?.questionData as any)?.videoUrl
          : ''
      "
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

/* Отладочная кнопка перезапуска */
.debug-reset-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
  z-index: 100;
}

.debug-reset-btn:hover {
  background-color: #495057;
  transform: scale(1.1);
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
