<template>
  <div class="card">
    <div class="card-content">
      <!-- Здесь будет содержимое карточки -->
    </div>
  </div>
</template>

<script setup lang="ts">
// Респонсивный компонент карточки с соотношением сторон 4:3
</script>

<style scoped>
.card {
  width: 100%;
  aspect-ratio: 4/3;
  border: 2px solid #333;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-content {
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
