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
onMounted(async () => {
  await gameStore.initializeGame()
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
  console.log(`Карточка ${cardId} перевернута, ждем завершения анимации переворота`)
  currentCardId.value = cardId

  // Задержка для завершения анимации переворота карточки (0.6s + небольшой буфер)
  setTimeout(() => {
    console.log(`Показываем модальное окно для карточки ${cardId}`)
    showRulesModal.value = true
  }, 700) // 700ms = 600ms анимация + 100ms буфер
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

// Обработчики бустов и трэпов
const handleActivateBoost = (cardId: number, content: string) => {
  console.log(`Активирован буст ${cardId}: ${content}`)
  gameStore.addBoostOrTrap('boost', content, cardId)
  showRulesModal.value = false
  currentCardId.value = null
}

const handleActivateTrap = (cardId: number, content: string) => {
  console.log(`Активирован трэп ${cardId}: ${content}`)
  gameStore.addBoostOrTrap('trap', content, cardId)
  showRulesModal.value = false
  currentCardId.value = null
}

// Удаление буста или трэпа
const removeBoostOrTrap = (id: string) => {
  gameStore.removeBoostOrTrap(id)
}

// Создаем массив из 40 элементов для сетки 8x5
const cards = Array.from({ length: 40 }, (_, index) => index + 1)
</script>

<template>
  <div class="app">
    <h1>Baza Quiz</h1>

    <!-- Кнопка перезапуска игры (отладочная) -->
    <button
      v-if="gameStore.isGameStarted"
      @click="async () => await gameStore.resetGame()"
      class="debug-reset-btn"
    >
      🔄
    </button>

    <!-- Блок бустов и трэпов -->
    <div v-if="gameStore.boostsAndTraps.length > 0" class="boosts-traps-container">
      <h3>🎯 Бусты и трэпы</h3>
      <div class="boosts-traps-grid">
        <div
          v-for="item in gameStore.boostsAndTraps"
          :key="item.id"
          class="boost-trap-item"
          :class="item.type"
          @click="removeBoostOrTrap(item.id)"
        >
          <div class="boost-trap-content">
            <span class="boost-trap-type">{{ item.type === 'boost' ? '🚀' : '💀' }}</span>
            <p class="boost-trap-text">{{ item.content }}</p>
          </div>
        </div>
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
      :question-type="gameStore.getCard(currentCardId || 0)?.questionType || 'image'"
      :question-data="gameStore.getCard(currentCardId || 0)?.questionData"
      @close="closeRulesModal"
      @start-contest="handleStartContest"
      @activate-boost="handleActivateBoost"
      @activate-trap="handleActivateTrap"
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
  background-color: #f8f9fa;
  font-family: 'Arial', sans-serif;
  color: #495057;
}

h1 {
  color: #495057;
  margin-bottom: 30px;
  font-size: 2.5rem;
  font-weight: 300;
}

/* Отладочная кнопка перезапуска */
.debug-reset-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #e9ecef;
  color: #495057;
  border: none;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
  z-index: 100;
}

.debug-reset-btn:hover {
  background-color: #dee2e6;
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

/* Блок бустов и трэпов */
.boosts-traps-container {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f1f3f4;
  box-shadow: none;
}

.boosts-traps-container h3 {
  color: #495057;
  margin-bottom: 20px;
  font-size: 1.5rem;
  text-align: center;
  font-weight: 400;
}

.boosts-traps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.boost-trap-item {
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.boost-trap-item.boost {
  background-color: #d4edda;
}

.boost-trap-item.trap {
  background-color: #f8d7da;
}

.boost-trap-item:hover {
  transform: translateY(-2px);
  box-shadow: none;
}

.boost-trap-content {
  text-align: center;
}

.boost-trap-type {
  font-size: 2rem;
  display: block;
  margin-bottom: 10px;
}

.boost-trap-text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #495057;
  font-family: 'Arial', sans-serif;
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

  .boosts-traps-grid {
    grid-template-columns: 1fr;
  }
}

.grid-item {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
