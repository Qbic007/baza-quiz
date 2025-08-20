<template>
  <Transition name="contest-modal">
    <div v-if="isVisible" class="contest-modal">
      <!-- Тёмный оверлей с кнопкой "Начать" -->
      <div v-if="!isStarted" class="contest-overlay">
        <div class="start-button-container">
          <button class="start-btn" @click="startContest">🚀 Начать конкурс</button>
        </div>
      </div>

      <!-- Контент конкурса -->
      <div class="contest-content" v-if="isStarted">
        <!-- Заголовок -->
        <div class="contest-header">
          <h2>Конкурс {{ cardId }}</h2>
          <!-- Убираем кнопку закрытия до истечения таймера -->
        </div>

        <!-- Основной контент -->
        <div class="contest-body">
          <div class="contest-description">
            <h3>🎯 Задание</h3>
            <p>
              Здесь будет размещено задание для конкурса {{ cardId }}. У вас есть
              {{ timeLeft }} секунд на выполнение!
            </p>

            <div class="task-content">
              <h4>📝 Что нужно сделать:</h4>
              <ul>
                <li>Внимательно прочитайте задание</li>
                <li>Выполните все требования</li>
                <li>Уложитесь в отведённое время</li>
                <li>Получите максимальное количество очков</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Оверлей с результатом (показывается когда время истекло) -->
        <div v-if="timeLeft <= 0" class="result-overlay">
          <div class="result-content">
            <h2>⏰ Время истекло!</h2>
            <p>Выберите результат выполнения задания:</p>
            <div class="result-buttons-container">
              <button class="btn btn-success" @click="handleSuccess">🎉 УСПЕХ</button>
              <button class="btn btn-failure" @click="handleFailure">❌ ПРОВАЛ</button>
            </div>
          </div>
        </div>

        <!-- Таймер -->
        <div class="timer-container">
          <div class="timer">
            <span class="timer-label">⏱️ Время:</span>
            <span class="timer-value" :class="{ warning: timeLeft <= 10 }">
              {{ timeLeft }}
            </span>
            <span class="timer-unit">сек</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'

// Компонент полноэкранной модалки для конкурса
defineOptions({
  name: 'ContestModal',
})

// Props
interface Props {
  isVisible: boolean
  cardId: number
  duration?: number // длительность в секундах
}

const props = withDefaults(defineProps<Props>(), {
  duration: 30,
})

// Emits
const emit = defineEmits<{
  close: []
  success: [cardId: number]
  failure: [cardId: number]
}>()

// Состояние
const isStarted = ref(false)
const timeLeft = ref(props.duration)
let timerInterval: number | null = null

// Методы
const startContest = () => {
  console.log(`Запуск конкурса ${props.cardId}`)
  isStarted.value = true
  startTimer()
}

const startTimer = () => {
  timeLeft.value = props.duration
  timerInterval = setInterval(() => {
    timeLeft.value--

    if (timeLeft.value <= 0) {
      console.log(`Время конкурса ${props.cardId} истекло`)
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
      // НЕ закрываем модалку, показываем кнопки результата
    }
  }, 1000)
}

const handleSuccess = () => {
  console.log(`Конкурс ${props.cardId} - УСПЕХ`)
  emit('success', props.cardId)
  closeModal()
}

const handleFailure = () => {
  console.log(`Конкурс ${props.cardId} - ПРОВАЛ`)
  emit('failure', props.cardId)
  closeModal()
}

const closeModal = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  isStarted.value = false
  timeLeft.value = props.duration
  emit('close')
}

// Сброс состояния при изменении видимости
watch(
  () => props.isVisible,
  (newValue) => {
    if (!newValue) {
      isStarted.value = false
      timeLeft.value = props.duration
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
    }
  },
)

// Очистка при размонтировании
onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
.contest-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2000;
}

/* Тёмный оверлей с кнопкой */
.contest-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.start-button-container {
  text-align: center;
}

.start-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 20px 40px;
  font-size: 1.5rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.start-btn:active {
  transform: translateY(0);
}

/* Контент конкурса */
.contest-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f8f9fa;
  overflow-y: auto;
}

.contest-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background-color: white;
  border-bottom: 1px solid #e1e5e9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.contest-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.contest-body {
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
}

.contest-description h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 600;
}

.contest-description p {
  margin: 0 0 24px 0;
  color: #495057;
  line-height: 1.7;
  font-size: 1.1rem;
}

.task-content {
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.task-content h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 600;
}

.task-content ul {
  margin: 0;
  padding-left: 20px;
  color: #495057;
}

.task-content li {
  margin-bottom: 12px;
  line-height: 1.6;
  font-size: 1rem;
}

/* Таймер */
.timer-container {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 10;
}

.timer {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.timer-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.timer-value {
  font-size: 1.5rem;
  font-weight: 700;
  min-width: 30px;
  text-align: center;
}

.timer-value.warning {
  color: #ff6b6b;
  animation: pulse 1s infinite;
}

.timer-unit {
  font-size: 0.8rem;
  opacity: 0.7;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Анимации */
.contest-modal-enter-active,
.contest-modal-leave-active {
  transition: opacity 0.3s ease;
}

.contest-modal-enter-from,
.contest-modal-leave-to {
  opacity: 0;
}

/* Адаптивность */
@media (max-width: 768px) {
  .contest-header {
    padding: 20px 24px;
  }

  .contest-header h2 {
    font-size: 1.6rem;
  }

  .contest-body {
    padding: 24px 20px;
  }

  .start-btn {
    padding: 16px 32px;
    font-size: 1.3rem;
  }

  .timer-container {
    bottom: 20px;
    right: 20px;
  }

  .timer {
    padding: 12px 20px;
  }
}

/* Оверлей с результатом */
.result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.result-content {
  text-align: center;
  color: white;
  max-width: 500px;
  padding: 40px;
}

.result-content h2 {
  margin: 0 0 20px 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
}

.result-content p {
  margin: 0 0 40px 0;
  font-size: 1.3rem;
  line-height: 1.6;
  color: #e1e5e9;
}

.result-buttons-container {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 20px 40px;
  font-size: 1.3rem;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-width: 160px;
}

.btn-success {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  color: white;
}

.btn-success:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.btn-failure {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
}

.btn-failure:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}
</style>
