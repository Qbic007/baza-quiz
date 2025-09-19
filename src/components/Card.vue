<template>
  <div
    class="card"
    :class="{ 'is-flipped': card?.isFlipped }"
    :style="cardColorStyle"
    @click="toggleCard"
  >
    <div class="card-inner" :class="{ 'is-flipped': card?.isFlipped }">
      <!-- Рубашка карточки -->
      <div class="card-face card-back">
        <div class="card-content">
          <span class="card-number">{{ props.cardNumber }}</span>
        </div>
      </div>

      <!-- Лицевая сторона карточки -->
      <div class="card-face card-front">
        <div class="card-content">
          <h2 class="card-title">{{ card?.content || 'Загрузка...' }}</h2>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'

// Респонсивный компонент карточки с соотношением сторон 4:3
defineOptions({
  name: 'QuizCard',
})

// Props
interface Props {
  cardNumber: number
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  cardFlipped: [cardId: number]
}>()

// Store
const gameStore = useGameStore()

// Получаем данные карточки из store
const card = computed(() => gameStore.getCard(props.cardNumber))

// Получаем цвет карточки на основе результата конкурса
const cardColor = computed(() => gameStore.getCardColor(props.cardNumber))

// Стиль для карточки с цветом результата
const cardColorStyle = computed(() => {
  if (!cardColor.value) return {}

  return {
    backgroundColor: cardColor.value,
    border: `2px solid ${cardColor.value.replace('0.3', '0.6')}`, // Более яркая граница
    boxShadow: `0 0 0 4px ${cardColor.value.replace('0.3', '0.2')}`, // Дополнительная тень для выделения
  }
})

// Функция переворота карточки
const toggleCard = () => {
  // Карточка может быть перевернута только один раз
  if (card.value?.isFlipped) {
    return
  }

  gameStore.flipCard(props.cardNumber)

  // Эмитим событие переворота
  emit('cardFlipped', props.cardNumber)
}
</script>

<style scoped>
.card {
  width: 100%;
  aspect-ratio: 4/3;
  perspective: 1000px;
  cursor: pointer;
  position: relative;
  transition:
    transform 0.2s ease,
    background-color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.card:hover:not(.is-flipped) {
  transform: translateY(-4px);
}

.card.is-flipped {
  cursor: default;
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
  /* border будет применяться через cardColorStyle */
}

.card-face {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border: none;
  overflow: hidden;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-back {
  background-color: #e9ecef;
  color: #495057;
  transform: rotateY(0deg);
}

.card-front {
  background-color: #f8f9fa;
  color: #495057;
  transform: rotateY(180deg);
}

/* Стили для карточек с результатами конкурса */
.card[style*='background-color'] .card-front {
  background-color: transparent !important; /* Позволяем цвету результата просвечивать */
}

.card[style*='background-color'] .card-back {
  background-color: transparent !important; /* Позволяем цвету результата просвечивать */
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
  font-size: 2.5rem;
  font-weight: 800;
  color: #495057;
}

.card-title {
  margin: 0;
  font-size: 1.4rem;
  color: #212529;
  font-weight: 700;
  text-align: center;
  line-height: 1.3;
  word-wrap: break-word;
  hyphens: auto;
}

/* Убираем hover эффект который может мешать анимации */
</style>
