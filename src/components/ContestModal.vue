<template>
  <Transition name="contest-modal">
    <div v-if="isVisible" class="contest-modal">
      <!-- Контент конкурса -->
      <div class="contest-content">
        <!-- Заголовок -->
        <div class="contest-header">
          <h2>{{ getQuestionTitle() }}</h2>
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

          <!-- Отображение текстового вопроса -->
          <div v-else-if="questionType === 'text'" class="text-container">
            <div class="text-question">
              <div v-html="formatTextContent(questionData?.content || 'Текстовый вопрос')"></div>
            </div>
          </div>

          <!-- Отображение коллажа -->
          <div v-else-if="questionType === 'collage'" class="collage-container">
            <div class="collage-title">
              <h3>{{ questionData?.title || 'Коллаж' }}</h3>
            </div>
            <div class="collage-images">
              <div
                v-for="(image, index) in questionData?.images || []"
                :key="index"
                class="collage-image-item"
              >
                <img
                  :src="image"
                  :alt="`Изображение ${index + 1}`"
                  class="collage-image"
                  @error="handleImageError"
                />
              </div>
            </div>
          </div>

          <!-- Отображение состязания -->
          <div v-else-if="questionType === 'competition'" class="competition-container">
            <div class="competition-content">
              <h2>Состязание: {{ questionData?.name || 'Состязание' }}</h2>
              <p v-if="questionData?.description" class="competition-description">
                {{ questionData.description }}
              </p>
              <button class="btn btn-finish-competition" @click="finishCompetition">
                Завершить
              </button>
            </div>
          </div>

          <!-- Отображение Code Names -->
          <div v-else-if="questionType === 'codenames'" class="codenames-container">
            <div
              class="codenames-grid"
              :style="{
                gridTemplateColumns: `repeat(${codenamesWidth || 3}, 1fr)`,
                gridTemplateRows: `repeat(${codenamesHeight || 3}, 1fr)`,
              }"
            >
              <div
                v-for="(card, index) in codenamesCards"
                :key="index"
                class="codenames-card"
                :class="{
                  'is-flipped': card.isFlipped,
                  blue: card.isFlipped && card.color === 'blue',
                  red: card.isFlipped && card.color === 'red',
                  black: card.isFlipped && card.color === 'black',
                  white: card.isFlipped && card.color === 'white',
                  neutral: card.isFlipped && card.color === 'neutral',
                }"
                @click="flipCodenamesCard(index)"
              >
                <div class="codenames-card-inner">
                  <div class="codenames-card-back">
                    <span class="word">{{ card.word }}</span>
                  </div>
                  <div class="codenames-card-front">
                    <span class="word">{{ card.word }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Оверлей с результатом (показывается когда время истекло или Code Names завершена) -->
        <div v-if="timeLeft <= 0" class="result-overlay">
          <div class="result-content">
            <h2 v-if="questionType !== 'codenames'">⏰ Время истекло!</h2>
            <h2 v-else>🏁 Игра завершена!</h2>
            <p>Кто победил в конкурсе?</p>
            <div class="result-buttons-container">
              <button
                v-if="leftTeamName"
                class="btn btn-left-team"
                @click="handleContestResult('leftTeam')"
              >
                🏆 {{ leftTeamName }}
              </button>
              <button
                v-if="rightTeamName"
                class="btn btn-right-team"
                @click="handleContestResult('rightTeam')"
              >
                🏆 {{ rightTeamName }}
              </button>
              <button class="btn btn-nobody" @click="handleContestResult('nobody')">
                ❌ Никто
              </button>
              <button class="btn btn-draw" @click="handleContestResult('draw')">🤝 Ничья</button>
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
        <div
          v-if="questionType !== 'codenames' && questionType !== 'competition'"
          class="timer-container"
        >
          <div class="timer">
            <span class="timer-label">⏱️ Время:</span>
            <span class="timer-value" :class="{ warning: timeLeft <= 10 }">
              {{ timeLeft }}
            </span>
            <span class="timer-unit">сек</span>
          </div>
          <!-- Кнопка запуска таймера (показывается если autoStartTimer = false) -->
          <div
            v-if="questionData?.autoStartTimer === false && timeLeft === duration"
            class="timer-controls"
          >
            <button @click="startTimer" class="btn btn-start-timer">▶️ Запустить таймер</button>
          </div>
        </div>

        <!-- Кнопка завершения игры для Code Names -->
        <div v-if="questionType === 'codenames'" class="codenames-controls">
          <button class="btn btn-finish-game" @click="finishCodenamesGame">
            🏁 Завершить игру
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'
import { sendCodeNamesLayout } from '@/services/telegram'
import * as showdown from 'showdown'
import { useGameStore } from '@/stores/game'

// Компонент полноэкранной модалки для конкурса
defineOptions({
  name: 'ContestModal',
})

// Константы
const CONTEST_DURATION = 3 // Время конкурса в секундах (для разработки)

// Store
const gameStore = useGameStore()

// Настройка showdown для конвертации Markdown в HTML
const converter = new showdown.Converter({
  tables: true,
  strikethrough: true,
  tasklists: true,
  simpleLineBreaks: true,
  openLinksInNewWindow: true,
})

// Функция для форматирования текстового контента
const formatTextContent = (content: string): string => {
  if (!content) return ''
  // Заменяем \n на переносы строк для корректного отображения
  const formattedContent = content.replace(/\\n/g, '\n')
  return converter.makeHtml(formattedContent)
}

// Интерфейс для карточки Code Names
interface CodenamesCard {
  word: string
  color: 'blue' | 'red' | 'black' | 'white' | 'neutral'
  isFlipped: boolean
}

// Props
interface Props {
  isVisible: boolean
  cardId: number
  questionType:
    | 'image'
    | 'video'
    | 'audio'
    | 'text'
    | 'boost'
    | 'trap'
    | 'codenames'
    | 'collage'
    | 'competition'
  imageUrl?: string
  videoUrl?: string
  questionData?: {
    type: string
    content?: string
    imageUrl?: string
    videoUrl?: string
    audioUrl?: string
    images?: string[]
    title?: string
    name?: string
    description?: string
  }
  duration?: number // длительность в секундах
  codenamesWidth?: number
  codenamesHeight?: number
  leftTeamName?: string
  rightTeamName?: string
}

const props = withDefaults(defineProps<Props>(), {
  duration: CONTEST_DURATION,
})

// Emits
const emit = defineEmits<{
  close: []
  contestResult: [cardId: number, result: 'leftTeam' | 'rightTeam' | 'nobody' | 'draw']
}>()

// Состояние
const timeLeft = ref(props.duration)
const imageError = ref(false)
const videoError = ref(false)
const videoRef = ref<HTMLVideoElement>()
const showTimeStartedMessage = ref(false)
const codenamesCards = ref<CodenamesCard[]>([])
let timerInterval: ReturnType<typeof setInterval> | null = null

// Методы
const startContest = async () => {
  console.log(`Запуск конкурса ${props.cardId}`)

  // Инициализируем Code Names карточки если это Code Names
  if (props.questionType === 'codenames') {
    await initializeCodenamesCards()
  }

  // Для видео таймер запускается после окончания видео
  // Для изображений, текстовых вопросов и коллажей таймер запускается сразу (если autoStartTimer не false)
  // Для Code Names и состязаний таймер не нужен
  if (
    (props.questionType === 'image' ||
      props.questionType === 'text' ||
      props.questionType === 'collage') &&
    props.questionData?.autoStartTimer !== false
  ) {
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

const handleContestResult = (result: 'leftTeam' | 'rightTeam' | 'nobody' | 'draw') => {
  console.log(`Конкурс ${props.cardId} - результат: ${result}`)
  emit('contestResult', props.cardId, result)
  closeModal()
}

const finishCompetition = () => {
  console.log(`Состязание ${props.cardId} завершено`)
  // Для состязаний автоматически считаем ничьей, так как это не конкурс
  emit('contestResult', props.cardId, 'draw')
  closeModal()
}

// Функция для получения заголовка вопроса
const getQuestionTitle = (): string => {
  // Получаем данные карточки из store
  const card = gameStore.getCard(props.cardId)
  return card?.content || `Конкурс ${props.cardId}`
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

// Функция для генерации цветов по новым правилам
const generateColors = (
  totalCards: number,
): { colors: string[]; firstTeam: 'red' | 'blue' | null } => {
  const colors: string[] = []

  if (totalCards <= 9) {
    // До 9 карточек: у обеих команд равное количество + 1 чёрная + белые для дополнения
    const teamCards = Math.floor((totalCards - 1) / 2) // -1 для чёрной карточки
    const redCards = teamCards
    const blueCards = teamCards
    const blackCards = 1
    const whiteCards = totalCards - redCards - blueCards - blackCards

    // Добавляем красные карточки
    for (let i = 0; i < redCards; i++) {
      colors.push('red')
    }

    // Добавляем синие карточки
    for (let i = 0; i < blueCards; i++) {
      colors.push('blue')
    }

    // Добавляем чёрную карточку
    for (let i = 0; i < blackCards; i++) {
      colors.push('black')
    }

    // Добавляем белые карточки (ничьи)
    for (let i = 0; i < whiteCards; i++) {
      colors.push('white')
    }

    // Перемешиваем цвета
    for (let i = colors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[colors[i], colors[j]] = [colors[j], colors[i]]
    }

    return { colors, firstTeam: null }
  } else {
    // Больше 9 карточек: первая команда ~9/25, вторая команда на 1 меньше, 1 чёрная, остальные белые
    const firstTeamCards = Math.floor((totalCards * 9) / 25) // ~9/25
    const secondTeamCards = firstTeamCards - 1 // на одну меньше
    const blackCards = 1
    const whiteCards = totalCards - firstTeamCards - secondTeamCards - blackCards

    // Случайно выбираем, какая команда ходит первой
    const firstTeam = Math.random() < 0.5 ? 'red' : 'blue'

    // Распределяем карточки между командами
    const redCards = firstTeam === 'red' ? firstTeamCards : secondTeamCards
    const blueCards = firstTeam === 'blue' ? firstTeamCards : secondTeamCards

    // Добавляем красные карточки
    for (let i = 0; i < redCards; i++) {
      colors.push('red')
    }

    // Добавляем синие карточки
    for (let i = 0; i < blueCards; i++) {
      colors.push('blue')
    }

    // Добавляем чёрную карточку
    for (let i = 0; i < blackCards; i++) {
      colors.push('black')
    }

    // Добавляем белые карточки (ничьи)
    for (let i = 0; i < whiteCards; i++) {
      colors.push('white')
    }

    // Перемешиваем цвета
    for (let i = colors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[colors[i], colors[j]] = [colors[j], colors[i]]
    }

    return { colors, firstTeam }
  }
}

// Методы для Code Names
const initializeCodenamesCards = async () => {
  try {
    // Получаем размеры поля из конфигурации или используем по умолчанию
    const width = props.codenamesWidth || 3
    const height = props.codenamesHeight || 3
    const totalCards = width * height

    // Загружаем слова из отдельного файла
    const response = await fetch('/config/codenames-words.json')
    const data = await response.json()
    const allWords = data.words

    // Случайно выбираем нужное количество слов без повторов
    const selectedWords = []
    const availableWords = [...allWords]

    for (let i = 0; i < totalCards; i++) {
      const randomIndex = Math.floor(Math.random() * availableWords.length)
      selectedWords.push(availableWords[randomIndex])
      availableWords.splice(randomIndex, 1) // Убираем выбранное слово
    }

    // Генерируем цвета автоматически по правилам
    const { colors, firstTeam } = generateColors(totalCards)

    // Создаем карточки
    codenamesCards.value = selectedWords.map((word, index) => ({
      word,
      color: colors[index] as 'blue' | 'red' | 'black' | 'white' | 'neutral',
      isFlipped: false,
    }))

    // Отправляем раскладку в Telegram
    await sendCodeNamesLayout(selectedWords, colors, props.cardId, width, height, firstTeam)
  } catch (error) {
    console.error('Ошибка загрузки слов для Code Names:', error)
    // Fallback на слова по умолчанию
    const width = props.codenamesWidth || 3
    const height = props.codenamesHeight || 3
    const totalCards = width * height

    const fallbackWords = [
      'КОТ',
      'ДОМ',
      'СОЛНЦЕ',
      'ВОДА',
      'ОГОНЬ',
      'ЗЕМЛЯ',
      'ВОЗДУХ',
      'ДЕРЕВО',
      'ЦВЕТОК',
    ].slice(0, totalCards)

    const { colors, firstTeam } = generateColors(totalCards)

    codenamesCards.value = fallbackWords.map((word, index) => ({
      word,
      color: colors[index] as 'blue' | 'red' | 'black' | 'white' | 'neutral',
      isFlipped: false,
    }))

    // Отправляем раскладку в Telegram (fallback)
    await sendCodeNamesLayout(fallbackWords, colors, props.cardId, width, height, firstTeam)
  }
}

const flipCodenamesCard = (index: number) => {
  if (codenamesCards.value[index].isFlipped) return

  codenamesCards.value[index].isFlipped = true
  console.log(
    `Перевернута карточка ${index + 1}: ${codenamesCards.value[index].word} (${codenamesCards.value[index].color})`,
  )
}

const finishCodenamesGame = () => {
  console.log(`Code Names игра ${props.cardId} завершена`)
  // Для Code Names показываем выбор победителя
  timeLeft.value = 0
}

const closeModal = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  timeLeft.value = props.duration
  showTimeStartedMessage.value = false
  codenamesCards.value = []
  emit('close')
}

// Сброс состояния при изменении видимости
watch(
  () => props.isVisible,
  (newValue) => {
    if (!newValue) {
      timeLeft.value = props.duration
      imageError.value = false
      videoError.value = false
      showTimeStartedMessage.value = false
      codenamesCards.value = []
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
    } else {
      // При открытии модалки запускаем конкурс
      startContest()

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
  justify-content: center;
  align-items: center;
  padding: 24px 32px;
  background-color: #ffffff;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
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
  overflow: visible;
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

.text-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: #f8f9fa;
  margin-top: 0;
}

.text-question {
  text-align: center;
  max-width: 600px;
}

.text-question h3 {
  font-size: 2rem;
  font-weight: 600;
  color: #495057;
  line-height: 1.4;
  margin: 0;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.text-question div {
  font-size: 1.5rem;
  font-weight: 500;
  color: #495057;
  line-height: 1.6;
  margin: 0;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  white-space: pre-line;
}

/* Стили для коллажа */
.collage-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: #f8f9fa;
}

.collage-title {
  margin-bottom: 30px;
  text-align: center;
}

.collage-title h3 {
  font-size: 2rem;
  font-weight: 600;
  color: #495057;
  margin: 0;
  padding: 15px 30px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.collage-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 800px;
  width: 100%;
}

.collage-image-item {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.collage-image-item:hover {
  transform: translateY(-2px);
}

.collage-image {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
}

/* Стили для состязания */
.competition-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: #f8f9fa;
}

.competition-content {
  text-align: center;
  max-width: 600px;
  background-color: #ffffff;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.competition-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #495057;
  margin: 0 0 20px 0;
  line-height: 1.2;
}

.competition-description {
  font-size: 1.2rem;
  color: #6c757d;
  margin: 0 0 30px 0;
  line-height: 1.4;
}

.btn-finish-competition {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-finish-competition:hover {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
}

.btn-finish-competition:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
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
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
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

  .timer-container {
    bottom: 20px;
    right: 20px;
  }

  .timer {
    padding: 12px 20px;
  }
}

/* Кнопка запуска таймера */
.timer-controls {
  display: flex;
  justify-content: center;
}

.btn-start-timer {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-start-timer:hover {
  background: linear-gradient(135deg, #218838, #1ea085);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
}

.btn-start-timer:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
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

.btn-left-team {
  background-color: #f3e5f5;
  color: #6f42c1;
}

.btn-left-team:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.btn-right-team {
  background-color: #fff3e0;
  color: #fd7e14;
}

.btn-right-team:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.btn-nobody {
  background-color: #f8d7da;
  color: #721c24;
}

.btn-nobody:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.btn-draw {
  background-color: #d4edda;
  color: #155724;
}

.btn-draw:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

/* Стили для Code Names */
.codenames-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px;
  box-sizing: border-box;
}

.codenames-grid {
  display: grid;
  gap: 20px;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
}

.codenames-card {
  width: 100%;
  height: 100%;
  perspective: 1000px;
  cursor: pointer;
}

.codenames-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s ease;
  transform-style: preserve-3d;
}

.codenames-card.is-flipped .codenames-card-inner {
  transform: rotateY(180deg);
}

.codenames-card-back,
.codenames-card-front {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border: 2px solid #ddd;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.codenames-card-back {
  background-color: #f8f9fa;
  color: #495057;
  transform: rotateY(0deg);
}

.codenames-card-front {
  background-color: #ffffff;
  color: #495057;
  transform: rotateY(180deg);
}

.word {
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
}

/* Цвета для перевернутых карточек */
.codenames-card.blue .codenames-card-front {
  background-color: #e3f2fd;
  border-color: #007bff;
}

.codenames-card.red .codenames-card-front {
  background-color: #ffebee;
  border-color: #dc3545;
}

.codenames-card.black .codenames-card-front {
  background-color: #f5f5f5;
  border-color: #000000;
}

.codenames-card.neutral .codenames-card-front {
  background-color: #f8f9fa;
  border-color: #6c757d;
}

.codenames-card.white .codenames-card-front {
  background-color: #f5f5dc !important;
  border-color: #d4af37 !important;
}

/* Кнопка завершения игры для Code Names */
.codenames-controls {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 10;
}

.btn-finish-game {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 16px 24px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.btn-finish-game:hover {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.btn-finish-game:active {
  transform: translateY(0);
}

/* Адаптивность для Code Names */
@media (max-width: 768px) {
  .codenames-container {
    padding: 20px;
  }

  .codenames-grid {
    gap: 10px;
  }

  .word {
    font-size: 1rem;
  }

  .codenames-controls {
    bottom: 20px;
    right: 20px;
  }

  .btn-finish-game {
    padding: 12px 20px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .codenames-container {
    padding: 10px;
  }

  .codenames-grid {
    gap: 8px;
  }

  .word {
    font-size: 0.9rem;
  }
}

/* Стили для интро контента */
.intro-content {
  padding: 20px;
  line-height: 1.6;
  color: #495057;
  text-align: left;
}
</style>
