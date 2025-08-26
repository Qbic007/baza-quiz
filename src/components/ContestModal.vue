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
          <!-- Отображение изображения -->
          <div v-if="questionType === 'image'" class="image-container">
            <img
              :src="imageUrl"
              :alt="`Задание для конкурса ${cardId}`"
              class="contest-image"
              @error="handleImageError"
              @load="handleImageLoad"
            />
            <div v-if="imageError" class="image-error">
              <p>⚠️ Ошибка загрузки изображения</p>
              <p>Попробуйте обновить страницу</p>
            </div>
          </div>

          <!-- Отображение видео -->
          <div v-else-if="questionType === 'video'" class="video-container">
            <video
              ref="videoRef"
              :src="videoUrl"
              class="contest-video"
              @error="handleVideoError"
              @ended="handleVideoEnded"
              @loadeddata="handleVideoLoaded"
            />
            <div v-if="videoError" class="video-error">
              <p>⚠️ Ошибка загрузки видео</p>
              <p>Попробуйте обновить страницу</p>
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

        <!-- Сообщение "ВРЕМЯ ПОШЛО!" -->
        <div v-if="showTimeStartedMessage" class="time-started-message">
          <div class="time-started-content">
            <h1>ВРЕМЯ ПОШЛО!</h1>
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

// Константы
const CONTEST_DURATION = 3 // Время конкурса в секундах (для разработки)

// Props
interface Props {
  isVisible: boolean
  cardId: number
  questionType: 'image' | 'video' | 'audio' | 'text' | 'boost' | 'trap'
  imageUrl?: string
  videoUrl?: string
  duration?: number // длительность в секундах
}

const props = withDefaults(defineProps<Props>(), {
  duration: CONTEST_DURATION,
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
const imageError = ref(false)
const videoError = ref(false)
const videoRef = ref<HTMLVideoElement>()
const showTimeStartedMessage = ref(false)
let timerInterval: number | null = null

// Методы
const startContest = () => {
  console.log(`Запуск конкурса ${props.cardId}`)
  isStarted.value = true

  // Для видео таймер запускается после окончания видео
  // Для изображений таймер запускается сразу
  if (props.questionType === 'image') {
    startTimer()
  }
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

const handleImageError = () => {
  console.log(`Ошибка загрузки изображения для конкурса ${props.cardId}`)
  imageError.value = true
}

const handleImageLoad = () => {
  console.log(`Изображение для конкурса ${props.cardId} успешно загружено`)
  imageError.value = false
}

const handleVideoError = () => {
  console.log(`Ошибка загрузки видео для конкурса ${props.cardId}`)
  videoError.value = true
}

const handleVideoLoaded = () => {
  console.log(`Видео для конкурса ${props.cardId} успешно загружено`)
  videoError.value = false

  // Устанавливаем максимальную громкость
  if (videoRef.value) {
    videoRef.value.volume = 1.0
  }

  // Автоматически запускаем видео после загрузки
  if (videoRef.value) {
    videoRef.value.play().catch((error) => {
      console.log('Автовоспроизведение заблокировано браузером:', error)
    })
  }
}

const handleVideoEnded = () => {
  console.log(`Видео для конкурса ${props.cardId} закончилось, показываем сообщение`)
  // Показываем сообщение "ВРЕМЯ ПОШЛО!"
  showTimeStartedMessage.value = true

  // Через 2 секунды скрываем сообщение и запускаем таймер
  setTimeout(() => {
    showTimeStartedMessage.value = false
    startTimer()
  }, 2000)
}

const closeModal = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  isStarted.value = false
  timeLeft.value = props.duration
  showTimeStartedMessage.value = false
  emit('close')
}

// Сброс состояния при изменении видимости
watch(
  () => props.isVisible,
  (newValue) => {
    if (!newValue) {
      isStarted.value = false
      timeLeft.value = props.duration
      imageError.value = false
      videoError.value = false
      showTimeStartedMessage.value = false
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
    } else {
      // Если модалка открылась и это видео, запускаем его автоматически
      if (props.questionType === 'video' && videoRef.value) {
        // Небольшая задержка для корректной инициализации
        setTimeout(() => {
          if (videoRef.value) {
            // Устанавливаем максимальную громкость
            videoRef.value.volume = 1.0
            videoRef.value.play().catch((error) => {
              console.log('Автовоспроизведение заблокировано браузером:', error)
            })
          }
        }, 100)
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
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.start-button-container {
  text-align: center;
}

.start-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 20px 40px;
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
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
  background-color: #ffffff;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.contest-header h2 {
  margin: 0;
  color: #495057;
  font-size: 2rem;
  font-weight: 500;
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
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #e9ecef;
  color: #495057;
}

.contest-body {
  padding: 0;
  height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: hidden;
}

.contest-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.image-error {
  text-align: center;
  color: #e74c3c;
  padding: 20px;
}

.image-error p {
  margin: 8px 0;
  font-size: 1.1rem;
}

/* Сообщение "ВРЕМЯ ПОШЛО!" */
.time-started-message {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2500;
}

.time-started-content h1 {
  color: #495057;
  font-size: 4rem;
  font-weight: 700;
  text-align: center;
  margin: 0;
  animation: timeStartedPulse 1s infinite;
  font-family: 'Arial', sans-serif;
}

@keyframes timeStartedPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* Стили для видео */
.video-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: hidden;
}

.contest-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.video-error {
  text-align: center;
  color: #e74c3c;
  padding: 20px;
}

.video-error p {
  margin: 8px 0;
  font-size: 1.1rem;
}

/* Таймер */
.timer-container {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 10;
}

.timer {
  background-color: #ffffff;
  color: #495057;
  padding: 16px 24px;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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
    padding: 0;
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
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 160px;
}

.btn-success {
  background-color: #d4edda;
  color: #155724;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.btn-failure {
  background-color: #f8d7da;
  color: #721c24;
}

.btn-failure:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}
</style>
