<script setup lang="ts">
import Card from './components/Card.vue'

// Создаем массив из 40 элементов для сетки 8x5
const cards = Array.from({ length: 40 }, (_, index) => index + 1)
</script>

<template>
  <div class="app">
    <h1>Baza Quiz</h1>
    <div class="grid-container">
      <div v-for="card in cards" :key="card" class="grid-item">
        <Card />
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
