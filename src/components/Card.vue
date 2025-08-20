<template>
  <div class="card" @click="toggleCard" @mousedown="onMouseDown">
    <div class="card-inner" :class="{ 'is-flipped': isFlipped }">
      <!-- Рубашка карточки -->
      <div class="card-face card-back">
        <div class="card-content">
          <span class="card-number">{{ props.cardNumber }}</span>
        </div>
      </div>

      <!-- Лицевая сторона карточки -->
      <div class="card-face card-front">
        <div class="card-content">
          <h3>Вопрос {{ props.cardNumber }}</h3>
          <p>Состояние: {{ isFlipped ? 'Перевернута' : 'Не перевернута' }}</p>
          <p>Здесь будет содержимое вопроса</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Респонсивный компонент карточки с соотношением сторон 4:3
defineOptions({
  name: 'QuizCard',
})

// Props
interface Props {
  cardNumber: number
}

const props = defineProps<Props>()

// Состояние карточки
const isFlipped = ref(false)

// Функция переворота карточки
const toggleCard = () => {
  console.log(`Карточка ${props.cardNumber} кликнута!`)
  isFlipped.value = !isFlipped.value
}

// Дополнительная отладка
const onMouseDown = () => {
  console.log(`MouseDown на карточке ${props.cardNumber}`)
}
</script>

<style scoped>
.card {
  width: 100%;
  aspect-ratio: 4/3;
  perspective: 1000px;
  cursor: pointer;
  position: relative;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s ease;
  transform-style: preserve-3d;
  transform-origin: center;
}

.card-inner.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border: 2px solid #333;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-back {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: rotateY(0deg);
}

.card-front {
  background-color: #fff;
  color: #333;
  transform: rotateY(180deg);
}

.card-content {
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.card-number {
  font-size: 2rem;
  font-weight: bold;
}

.card-front h3 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.card-front p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

/* Убираем hover эффект который может мешать анимации */
</style>
