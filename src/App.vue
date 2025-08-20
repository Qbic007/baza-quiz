<script setup lang="ts">
import { onMounted } from 'vue'
import QuizCard from './components/Card.vue'
import { useGameStore } from '@/stores/game'

// Store
const gameStore = useGameStore()

// Инициализируем игру при загрузке компонента
onMounted(() => {
  gameStore.initializeGame()
})

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
      <button @click="gameStore.resetGame" class="reset-btn">Сбросить игру</button>
    </div>

    <div class="grid-container">
      <div v-for="card in cards" :key="card" class="grid-item">
        <QuizCard :card-number="card" />
      </div>
    </div>
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
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.game-info p {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  color: #2c3e50;
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
