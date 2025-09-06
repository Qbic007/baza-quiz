<template>
  <Transition name="modal">
    <div v-if="isVisible" class="modal-overlay">
      <div class="modal-content">
        <!-- Заголовок -->
        <div class="modal-header">
          <h2>Конкурс {{ cardId }}</h2>
          <!-- Убираем кнопку закрытия -->
        </div>

        <!-- Содержимое -->
        <div class="modal-body">
          <!-- Буст -->
          <div v-if="questionType === 'boost'" class="boost-section">
            <h3>Охуеть! ВОТ ЭТО ДА!</h3>
            <p>{{ questionData?.content || 'Это буст!' }}</p>
          </div>

          <!-- Трэп (ловушка) -->
          <div v-else-if="questionType === 'trap'" class="trap-section">
            <h3>Блять! Ну нахуя?!</h3>
            <p>{{ questionData?.content || 'Это ловушка!' }}</p>
          </div>

          <!-- Code Names -->
          <div v-else-if="questionType === 'codenames'" class="codenames-section">
            <h3>🎯 Code Names</h3>
            <p>{{ questionData?.content || 'Игра в кодовые имена!' }}</p>
            <div class="codenames-rules">
              <h4>Правила игры:</h4>
              <ul>
                <li>На поле 3x3 расположены 9 карточек со словами</li>
                <li>4 карточки принадлежат синей команде</li>
                <li>4 карточки принадлежат красной команде</li>
                <li>1 карточка - черная (проигрышная)</li>
                <li>Кликайте на карточки, чтобы перевернуть их и увидеть цвет</li>
                <li>Цель: найти все карточки своей команды</li>
              </ul>
            </div>
          </div>

          <!-- Обычный конкурс -->
          <div v-else class="rules-section">
            <h3>🎯 Описание конкурса</h3>
            <p>
              Это описание конкурса для карточки {{ cardId }}. Здесь будет размещена подробная
              информация о том, что нужно сделать, какие правила соблюдать и как получить
              максимальное количество очков.
            </p>
          </div>

          <!-- Условия участия только для обычных конкурсов -->
          <div
            v-if="
              questionType !== 'boost' && questionType !== 'trap' && questionType !== 'codenames'
            "
            class="rules-section"
          >
            <h3>📋 Условия участия</h3>
            <ul>
              <li>Внимательно изучите задание</li>
              <li>Соблюдайте все указанные правила</li>
              <li>Используйте логику и знания</li>
              <li>Не торопитесь с ответом</li>
            </ul>
          </div>

          <!-- Награды только для обычных конкурсов -->
          <div
            v-if="
              questionType !== 'boost' && questionType !== 'trap' && questionType !== 'codenames'
            "
            class="rules-section"
          >
            <h3>🏆 Награды</h3>
            <p>
              За успешное выполнение задания вы получите очки и сможете продолжить игру. Чем лучше
              результат, тем больше очков заработаете!
            </p>
          </div>
        </div>

        <!-- Кнопки -->
        <div class="modal-footer">
          <!-- Кнопка для буста -->
          <button v-if="questionType === 'boost'" class="btn btn-boost" @click="activateBoost">
            ЕБАТЬ Я СЧАСТЛИФФФ!
          </button>

          <!-- Кнопка для трэпа -->
          <button v-else-if="questionType === 'trap'" class="btn btn-trap" @click="activateTrap">
            ПУ-ПУ-ПУ!
          </button>

          <!-- Кнопка для обычного конкурса -->
          <button v-else class="btn btn-primary" @click="startContest">Начать конкурс</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
// Компонент модального окна с описанием конкурса
defineOptions({
  name: 'GameRulesModal',
})

// Props
interface Props {
  isVisible: boolean
  cardId?: number
  questionType?: 'image' | 'video' | 'audio' | 'text' | 'boost' | 'trap' | 'codenames'
  questionData?: {
    type: string
    content?: string
    imageUrl?: string
    videoUrl?: string
    audioUrl?: string
    textContent?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  cardId: 0,
})

// Emits
const emit = defineEmits<{
  startContest: [cardId: number]
  activateBoost: [cardId: number, content: string]
  activateTrap: [cardId: number, content: string]
}>()

// Методы
const startContest = () => {
  emit('startContest', props.cardId)
}

const activateBoost = () => {
  emit('activateBoost', props.cardId, props.questionData?.content || '')
}

const activateTrap = () => {
  emit('activateTrap', props.cardId, props.questionData?.content || '')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background-color: #ffffff;
  border: none;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  color: #495057;
  font-size: 1.8rem;
  font-weight: 500;
}

.modal-body {
  padding: 24px;
}

.rules-section {
  margin-bottom: 24px;
}

.rules-section:last-child {
  margin-bottom: 0;
}

.rules-section h3 {
  margin: 0 0 12px 0;
  color: #495057;
  font-size: 1.3rem;
  font-weight: 500;
}

.rules-section p {
  margin: 0 0 12px 0;
  color: #6c757d;
  line-height: 1.6;
}

.rules-section ul {
  margin: 0;
  padding-left: 20px;
  color: #495057;
}

.rules-section li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px 24px;
  border-top: 1px solid #e1e5e9;
}

.btn {
  padding: 12px 24px;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #6c757d;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

/* Стили для бустов */
.boost-section h3 {
  color: #28a745;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
}

.boost-section p {
  color: #28a745;
  font-size: 1.2rem;
  text-align: center;
  font-weight: 500;
}

.btn-boost {
  background-color: #28a745;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 16px 32px;
}

.btn-boost:hover {
  background-color: #218838;
  transform: translateY(-2px);
}

/* Стили для трэпов */
.trap-section h3 {
  color: #dc3545;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
}

.trap-section p {
  color: #dc3545;
  font-size: 1.2rem;
  text-align: center;
  font-weight: 500;
}

/* Стили для Code Names */
.codenames-section h3 {
  color: #007bff;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
}

.codenames-section p {
  color: #007bff;
  font-size: 1.2rem;
  text-align: center;
  font-weight: 500;
  margin-bottom: 20px;
}

.codenames-rules {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  margin-top: 20px;
}

.codenames-rules h4 {
  color: #495057;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 15px;
}

.codenames-rules ul {
  color: #495057;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  padding-left: 20px;
}

.codenames-rules li {
  margin-bottom: 8px;
}

.btn-trap {
  background-color: #dc3545;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 16px 32px;
}

.btn-trap:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}

/* Анимации */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Адаптивность */
@media (max-width: 768px) {
  .modal-content {
    max-width: 95%;
    margin: 10px;
  }

  .modal-header h2 {
    font-size: 1.5rem;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    flex-direction: column;
    gap: 8px;
  }

  .btn {
    width: 100%;
  }
}
</style>
