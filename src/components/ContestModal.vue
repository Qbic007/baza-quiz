<template>
  <Transition name="contest-modal">
    <div v-if="isVisible" class="contest-modal">
      <!-- Контент конкурса -->
      <div class="contest-content">
        <!-- Заголовок -->
        <div class="contest-header">
          <h2 v-html="getQuestionTitle()"></h2>
          <!-- Кнопка закрытия для отдельного режима Code Names -->
          <button v-if="isStandaloneCodenames" @click="closeModal" class="close-btn">✕</button>
        </div>

        <!-- Основной контент -->
        <div class="contest-body">
          <!-- Отображение изображения -->
          <div v-if="questionType === 'image'" class="image-container">
            <div class="image-wrapper">
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
            <!-- Описание вопроса справа от картинки -->
            <div v-if="questionData?.description" class="image-description">
              <div v-html="formatTextContent(questionData.description)"></div>
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

          <!-- Экран с ответом -->
          <div v-if="showAnswerScreen" class="answer-screen">
            <!-- Контент ответа (идентичен contest-content) -->
            <div class="contest-content">
              <!-- Заголовок -->
              <div class="contest-header">
                <h2 v-html="getQuestionTitle() + ': ответ'"></h2>
              </div>

              <!-- Основной контент -->
              <div class="contest-body">
                <!-- Отображение изображения ответа -->
                <div v-if="answer?.imageUrl" class="image-container">
                  <div class="image-wrapper">
                    <img
                      :src="answer.imageUrl"
                      :alt="`Ответ на вопрос ${cardId}`"
                      class="contest-image"
                      @error="handleAnswerImageError"
                    />
                    <div v-if="answerImageError" class="image-error">
                      <p>⚠️ Ошибка загрузки изображения</p>
                      <p>Попробуйте обновить страницу</p>
                    </div>
                  </div>
                  <!-- Описание ответа справа от картинки -->
                  <div v-if="answer?.content" class="image-description">
                    <div v-html="formatTextContent(answer.content)"></div>
                  </div>
                </div>

                <!-- Отображение видео ответа -->
                <div v-else-if="answer?.videoUrl" class="video-container">
                  <video
                    ref="answerVideoRef"
                    :src="answer.videoUrl"
                    class="contest-video"
                    @error="handleAnswerVideoError"
                    @loadeddata="handleAnswerVideoLoaded"
                    @play="playAnswerVideo"
                    controls
                  />
                  <div v-if="answerVideoError" class="video-error">
                    <p>⚠️ Ошибка загрузки видео</p>
                    <p>Попробуйте обновить страницу</p>
                  </div>
                  <div v-if="answer?.content" class="video-description">
                    <div v-html="formatTextContent(answer.content)"></div>
                  </div>
                </div>

                <!-- Отображение аудио ответа -->
                <div v-else-if="answer?.audioUrl" class="audio-container">
                  <!-- Скрытый аудио элемент для воспроизведения -->
                  <audio
                    ref="answerAudioRef"
                    :src="answer?.audioUrl"
                    @loadeddata="handleAnswerAudioLoaded"
                    @error="handleAnswerAudioError"
                    style="display: none"
                  >
                    Ваш браузер не поддерживает воспроизведение аудио.
                  </audio>
                  <div v-if="answer?.content" class="audio-description">
                    <div v-html="formatTextContent(answer?.content || '')"></div>
                  </div>
                </div>

                <!-- Отображение текстового ответа -->
                <div v-else-if="answer?.content" class="text-container">
                  <div class="text-question">
                    <div v-html="formatTextContent(answer.content)"></div>
                  </div>
                </div>
              </div>

              <!-- Кнопки действий -->
              <div class="contest-actions">
                <button @click="finishAnswer" class="btn btn-finish-answer">Завершить</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопки действий для вопросов -->
        <div class="contest-actions">
          <!-- Кнопка завершения состязания (только для состязаний) -->
          <button
            v-if="questionType === 'competition'"
            class="btn btn-finish-competition"
            @click="finishCompetition"
          >
            Завершить
          </button>

          <!-- Кнопка завершения игры для Code Names (только для обычного режима) -->
          <button
            v-if="questionType === 'codenames' && !isStandaloneCodenames"
            class="btn btn-finish-game"
            @click="finishCodenamesGame"
          >
            🏁 Завершить игру
          </button>

          <!-- Кнопка запуска таймера (показывается если autoStartTimer = false) -->
          <button
            v-if="questionData?.autoStartTimer === false && timeLeft === timerDuration"
            class="btn btn-start-timer"
            @click="startTimer"
          >
            Запустить таймер
          </button>

          <!-- Кнопка досрочного ответа (показывается когда таймер запущен и больше 1 секунды) -->
          <button
            v-if="timeLeft > 0 && timeLeft < timerDuration && timerInterval"
            class="btn btn-early-answer"
            @click="earlyAnswer"
          >
            Досрочный ответ
          </button>
        </div>

        <!-- Оверлей с кнопкой показать ответ (показывается когда время истекло и есть ответ) -->
        <div v-if="timeLeft <= 0 && answer && showAnswerOverlay" class="answer-overlay">
          <div class="answer-content">
            <h2>Хотите посмотреть ответ?</h2>
            <div class="answer-buttons-container">
              <button @click="showAnswer" class="btn btn-show-answer">Показать ответ</button>
            </div>
          </div>
        </div>

        <!-- Оверлей с результатом (показывается когда время истекло или Code Names завершена) -->
        <div
          v-if="(timeLeft <= 0 || competitionFinished) && !showAnswerOverlay && !showAnswerScreen"
          class="result-overlay"
        >
          <div class="result-content">
            <h2 v-if="questionType === 'codenames'">🏁 Игра завершена!</h2>
            <h2 v-else-if="questionType === 'competition'">Кто победил в состязании?</h2>
            <h2 v-else>Кто победил в конкурсе?</h2>
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
            <span class="timer-value" :class="{ warning: timeLeft <= 10 }">
              {{ timeLeft }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
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

  // Сначала обрабатываем HTML-теги, которые не поддерживаются Markdown
  let html = formattedContent
    .replace(/<del>(.*?)<\/del>/g, '<del>$1</del>')
    .replace(/<strong>(.*?)<\/strong>/g, '<strong>$1</strong>')
    .replace(/<em>(.*?)<\/em>/g, '<em>$1</em>')

  // Затем конвертируем Markdown в HTML
  html = converter.makeHtml(html)

  return html
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
  isStandaloneCodenames?: boolean
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
    autoStartTimer?: boolean
    timerLimit?: number
  }
  answer?: {
    content: string
    audioUrl?: string
    audioStartTime?: number
    videoUrl?: string
    imageUrl?: string
  }
  duration?: number // длительность в секундах
  codenamesWidth?: number
  codenamesHeight?: number
  leftTeamName?: string
  rightTeamName?: string
}

const props = withDefaults(defineProps<Props>(), {
  duration: CONTEST_DURATION,
  isStandaloneCodenames: false,
})

// Computed для получения правильного лимита времени
const timerDuration = computed(() => {
  // Если есть timerLimit в questionData, используем его
  if (props.questionData?.timerLimit) {
    console.log(
      `Используем timerLimit: ${props.questionData.timerLimit} для вопроса ${props.cardId}`,
    )
    return props.questionData.timerLimit
  }
  // Иначе используем duration из props (по умолчанию CONTEST_DURATION)
  console.log(`Используем duration: ${props.duration} для вопроса ${props.cardId}`)
  return props.duration
})

// Emits
const emit = defineEmits<{
  close: []
  contestResult: [cardId: number, result: 'leftTeam' | 'rightTeam' | 'nobody' | 'draw']
}>()

// Состояние
const timeLeft = ref(timerDuration.value)
const imageError = ref(false)
const videoError = ref(false)
const videoRef = ref<HTMLVideoElement>()
const showAnswerOverlay = ref(false)
const showAnswerScreen = ref(false)
const competitionFinished = ref(false)
const showTimeStartedMessage = ref(false)
const codenamesCards = ref<CodenamesCard[]>([])
const answerAudioRef = ref<HTMLAudioElement>()
const answerAudioError = ref(false)
const answerVideoRef = ref<HTMLVideoElement>()
const answerVideoError = ref(false)
const answerImageError = ref(false)
let timerInterval: ReturnType<typeof setInterval> | null = null

// Методы
const startContest = async () => {
  console.log(`Запуск конкурса ${props.cardId}`)

  // Обновляем timeLeft с правильным значением
  timeLeft.value = timerDuration.value
  console.log(`Установлен timeLeft: ${timeLeft.value} для вопроса ${props.cardId}`)

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
  timeLeft.value = timerDuration.value
  timerInterval = setInterval(() => {
    timeLeft.value--

    if (timeLeft.value <= 0) {
      console.log(`Время конкурса ${props.cardId} истекло`)
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
      // Показываем оверлей с кнопкой показать ответ (если есть ответ)
      if (props.answer) {
        showAnswerOverlay.value = true
      }
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
  competitionFinished.value = true
}

const earlyAnswer = () => {
  console.log(`Досрочный ответ для вопроса ${props.cardId}`)
  // Устанавливаем таймер на 1 секунду
  timeLeft.value = 1
  // Очищаем текущий интервал
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  // Запускаем новый интервал, который сработает через 1 секунду
  timerInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      console.log(`Время конкурса ${props.cardId} истекло (досрочно)`)
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
      // Показываем оверлей с кнопкой показать ответ (если есть ответ)
      if (props.answer) {
        showAnswerOverlay.value = true
      }
    }
  }, 1000)
}

const showAnswer = () => {
  showAnswerOverlay.value = false
  showAnswerScreen.value = true

  // Автоматически запускаем воспроизведение аудио если есть
  if (props.answer?.audioUrl) {
    // Небольшая задержка для корректной инициализации аудио элемента
    setTimeout(() => {
      playAnswerAudio()
    }, 500)
  }

  // Автоматически запускаем воспроизведение видео если есть
  if (props.answer?.videoUrl) {
    // Небольшая задержка для корректной инициализации видео элемента
    setTimeout(() => {
      playAnswerVideo()
    }, 500)
  }
}

const finishAnswer = () => {
  showAnswerScreen.value = false
  showAnswerOverlay.value = false
  // Останавливаем аудио если играет
  if (answerAudioRef.value) {
    answerAudioRef.value.pause()
    answerAudioRef.value.currentTime = 0
  }
  // Останавливаем видео если играет
  if (answerVideoRef.value) {
    answerVideoRef.value.pause()
    answerVideoRef.value.currentTime = 0
  }
  // Показываем обычный оверлей с выбором победителя
  // Устанавливаем timeLeft в 0, чтобы показать result-overlay
  timeLeft.value = 0
}

const handleAnswerAudioLoaded = () => {
  console.log('Аудио ответа загружено')
  answerAudioError.value = false
}

const handleAnswerAudioError = () => {
  console.error('Ошибка загрузки аудио ответа')
  answerAudioError.value = true
}

const handleAnswerVideoLoaded = () => {
  console.log('Видео для ответа загружено')
  answerVideoError.value = false
}

const handleAnswerVideoError = () => {
  console.error('Ошибка загрузки видео для ответа')
  answerVideoError.value = true
}

const playAnswerAudio = () => {
  if (answerAudioRef.value && props.answer?.audioStartTime) {
    answerAudioRef.value.currentTime = props.answer.audioStartTime
    answerAudioRef.value.play().catch((error) => {
      console.error('Ошибка воспроизведения аудио:', error)
      answerAudioError.value = true
    })
  }
}

const playAnswerVideo = () => {
  if (answerVideoRef.value) {
    answerVideoRef.value.play().catch((error) => {
      console.error('Ошибка воспроизведения видео:', error)
      answerVideoError.value = true
    })

    // Разворачиваем видео на весь экран при запуске
    setTimeout(() => {
      if (answerVideoRef.value && answerVideoRef.value.requestFullscreen) {
        answerVideoRef.value.requestFullscreen().catch((error) => {
          console.log('Не удалось развернуть видео на весь экран:', error)
        })
      }
    }, 100)
  }
}

// Функция для получения заголовка вопроса
const getQuestionTitle = (): string => {
  if (props.isStandaloneCodenames) {
    return 'Code Names 5x5'
  }
  // Получаем данные карточки из store
  const card = gameStore.getCard(props.cardId)
  const content = card?.content || `Конкурс ${props.cardId}`

  // Обрабатываем HTML-теги в заголовке
  return content
    .replace(/<del>(.*?)<\/del>/g, '<del>$1</del>')
    .replace(/<strong>(.*?)<\/strong>/g, '<strong>$1</strong>')
    .replace(/<em>(.*?)<\/em>/g, '<em>$1</em>')
}

const handleImageError = () => {
  console.log(`Ошибка загрузки изображения для конкурса ${props.cardId}`)
  imageError.value = true
}

const handleAnswerImageError = () => {
  console.log(`Ошибка загрузки изображения ответа для конкурса ${props.cardId}`)
  answerImageError.value = true
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

    // Разворачиваем видео на весь экран при запуске
    setTimeout(() => {
      if (videoRef.value && videoRef.value.requestFullscreen) {
        videoRef.value.requestFullscreen().catch((error) => {
          console.log('Не удалось развернуть видео на весь экран:', error)
        })
      }
    }, 100)
  }
}

const handleVideoEnded = () => {
  console.log(`Видео для конкурса ${props.cardId} закончилось, показываем сообщение`)

  // Сворачиваем видео с полного экрана при окончании
  if (document.fullscreenElement) {
    document.exitFullscreen().catch((error) => {
      console.log('Не удалось свернуть видео с полного экрана:', error)
    })
  }

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
    // Для отдельного режима используем 5x5, иначе из конфигурации
    const width = props.isStandaloneCodenames ? 5 : props.codenamesWidth || 3
    const height = props.isStandaloneCodenames ? 5 : props.codenamesHeight || 3
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
  timeLeft.value = timerDuration.value
  showTimeStartedMessage.value = false
  showAnswerOverlay.value = false
  showAnswerScreen.value = false
  competitionFinished.value = false
  answerAudioError.value = false
  answerVideoError.value = false
  codenamesCards.value = []
  emit('close')
}

// Сброс состояния при изменении видимости
watch(
  () => props.isVisible,
  (newValue) => {
    if (!newValue) {
      timeLeft.value = timerDuration.value
      imageError.value = false
      videoError.value = false
      showTimeStartedMessage.value = false
      showAnswerOverlay.value = false
      showAnswerScreen.value = false
      competitionFinished.value = false
      answerAudioError.value = false
      answerVideoError.value = false
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

            // Разворачиваем видео на весь экран при запуске
            setTimeout(() => {
              if (videoRef.value && videoRef.value.requestFullscreen) {
                videoRef.value.requestFullscreen().catch((error) => {
                  console.log('Не удалось развернуть видео на весь экран:', error)
                })
              }
            }, 200)
          }
        }, 100)
      }
    }
  },
)

// Watch для обновления timeLeft при изменении timerDuration
watch(timerDuration, (newDuration) => {
  // Обновляем timeLeft только если таймер еще не запущен
  if (timeLeft.value === timerDuration.value) {
    timeLeft.value = newDuration
  }
})

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
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  font-size: 4.8rem;
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
  flex: 1;
  padding: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
}

.contest-actions {
  flex-shrink: 0;
  padding: 20px 0;
  background: white;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.image-container {
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 20px;
  overflow: hidden;
  box-sizing: border-box;
}

.image-wrapper {
  flex: 1;
  max-width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  box-sizing: border-box;
  min-height: 0;
}

.contest-image {
  width: 100%;
  height: auto;
  max-height: 80vh;
  object-fit: contain;
  object-position: center;
}

.image-description {
  flex: 1;
  box-sizing: border-box;
  padding: 20px;
  text-align: left;
  font-size: 3.5rem;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-description > div {
  max-width: 1200px;
  margin: 0 auto;
}

/* Стили для описаний видео и аудио в ответах */
.video-description,
.audio-description {
  flex: 1;
  box-sizing: border-box;
  padding: 20px;
  text-align: left;
  font-size: 3.5rem;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-description > div,
.audio-description > div {
  max-width: 1200px;
  margin: 0 auto;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .image-container {
    flex-direction: column;
    gap: 10px;
  }

  .image-wrapper {
    max-width: 100%;
  }

  .image-description,
  .video-description,
  .audio-description {
    max-width: 100%;
    text-align: center;
  }
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
  font-size: 2.9rem;
  line-height: 1;
  padding: 40px;
  margin-top: 0;
  background: white;
}

.text-question {
  text-align: center;
  max-width: 1200px;
}

.text-question h3 {
  font-size: 2rem;
  font-weight: 600;
  color: #495057;
  line-height: 1.4;
  margin: 0;
  padding: 20px;
  background-color: #ffffff;
}

.text-question div {
  font-size: 3.5rem;
  font-weight: 500;
  color: #495057;
  line-height: 1.2;
  margin: 0;
  padding: 20px;
  background-color: #ffffff;
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
  background: white;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.collage-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 1600px;
  width: 100%;
}

.collage-image-item {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
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
}

/* Стили для состязания */
.competition-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
}

.competition-content {
  text-align: center;
  max-width: 1200px;
  background-color: #ffffff;
  padding: 40px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.competition-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #495057;
  margin: 0 0 20px 0;
  line-height: 1.2;
}

.btn-finish-competition {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1.2rem;
  font-weight: 600;
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
  top: 0;
  right: 32px;
  height: 156px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.timer {
  background-color: #ffffff;
  color: #495057;
  padding: 32px 48px;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.timer-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.timer-value {
  font-size: 4rem;
  font-weight: 700;
  min-width: 80px;
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
    top: 0;
    right: 20px;
    height: 156px;
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
  background-color: #28a745;
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-start-timer:hover {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
}

.btn-start-timer:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.btn-early-answer {
  background-color: #ffc107;
  color: #212529;
  border: none;
  padding: 15px 40px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
}

.btn-early-answer:hover {
  background-color: #e0a800;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 193, 7, 0.4);
}

.btn-early-answer:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
}

/* Оверлей с кнопкой показать ответ */
.answer-overlay {
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

.answer-content {
  background: white;
  padding: 40px;
  text-align: center;
  max-width: 1000px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.answer-content h2 {
  color: #dc3545;
  margin-bottom: 16px;
  font-size: 2rem;
}

.answer-content p {
  color: #495057;
  margin-bottom: 32px;
  font-size: 1.2rem;
}

.answer-buttons-container {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-show-answer {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-show-answer:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
}

/* Экран с ответом */
.answer-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  overflow: hidden;
}

.answer-screen-content {
  background: white;
  padding: 40px;
  text-align: center;
  max-width: 1600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* Стили для contest-content внутри answer-screen */
.answer-screen .contest-content {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.answer-screen .contest-body {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
}

.answer-screen .contest-actions {
  flex-shrink: 0;
  padding: 20px 0;
  background: white;
}

.answer-screen-content h2 {
  color: #28a745;
  margin-bottom: 24px;
  font-size: 2.2rem;
}

.answer-text {
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
  font-size: 1.1rem;
  line-height: 1.2;
  color: #495057;
}

.answer-video-container {
  margin-bottom: 32px;
}

.answer-video {
  width: 100%;
  max-width: 1200px;
  height: auto;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.answer-image-container {
  margin-bottom: 32px;
}

.answer-image {
  width: 100%;
  max-width: 1200px;
  height: auto;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.answer-buttons {
  display: flex;
  justify-content: center;
}

.btn-finish-answer {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-finish-answer:hover {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
}

.btn-finish-answer:active {
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
  max-width: 1000px;
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
  flex-direction: column;
  gap: 15px;
  align-items: center;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.btn {
  padding: 20px 40px;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
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
