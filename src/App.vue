<script setup lang="ts">
import Card from './components/Card.vue'
</script>

<template>
  <div class="app">
    <h1>Baza Quiz</h1>
    <div class="card-container">
      <Card />
    </div>
  </div>
</template>

<style scoped>
.app {
  padding: 20px;
  text-align: center;
}

.card-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}
</style>
