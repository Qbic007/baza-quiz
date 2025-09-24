<template>
  <Transition name="modal">
    <div v-if="isVisible" class="modal-overlay">
      <div class="modal-content">
        <!-- Заголовок -->
        <div class="modal-header">
          <h2>Выберите названия команд</h2>
        </div>

        <!-- Содержимое -->
        <div class="modal-body">
          <div class="teams-container">
            <div class="teams-grid">
              <!-- Левая команда -->
              <div class="team-section">
                <h3>Команда 1</h3>
                <div class="input-container">
                  <input
                    v-model="leftTeamName"
                    type="text"
                    placeholder="Введите название команды"
                    class="team-input"
                    :disabled="leftTeamConfirmed"
                    @keyup.enter="confirmLeftTeam"
                    @click="leftTeamName = ''"
                  />
                  <div class="button-group">
                    <button
                      v-if="!leftTeamConfirmed"
                      class="confirm-btn"
                      @click="confirmLeftTeam"
                      :disabled="!leftTeamName.trim()"
                    >
                      Подтвердить
                    </button>
                    <button
                      v-if="!leftTeamConfirmed"
                      class="regenerate-single-btn"
                      @click="regenerateLeftTeam"
                      title="Сгенерировать новое название"
                    >
                      🎲
                    </button>
                    <div v-else class="confirmed-name">
                      <span class="team-name">{{ leftTeamName }}</span>
                      <button class="edit-btn" @click="editLeftTeam">✏️</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Правая команда -->
              <div class="team-section">
                <h3>Команда 2</h3>
                <div class="input-container">
                  <input
                    v-model="rightTeamName"
                    type="text"
                    placeholder="Введите название команды"
                    class="team-input"
                    :disabled="rightTeamConfirmed"
                    @keyup.enter="confirmRightTeam"
                    @click="rightTeamName = ''"
                  />
                  <div class="button-group">
                    <button
                      v-if="!rightTeamConfirmed"
                      class="confirm-btn"
                      @click="confirmRightTeam"
                      :disabled="!rightTeamName.trim()"
                    >
                      Подтвердить
                    </button>
                    <button
                      v-if="!rightTeamConfirmed"
                      class="regenerate-single-btn"
                      @click="regenerateRightTeam"
                      title="Сгенерировать новое название"
                    >
                      🎲
                    </button>
                    <div v-else class="confirmed-name">
                      <span class="team-name">{{ rightTeamName }}</span>
                      <button class="edit-btn" @click="editRightTeam">✏️</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопка начала игры -->
        <div class="modal-footer">
          <button class="start-game-btn" @click="startGame" :disabled="!bothTeamsConfirmed">
            Начать игру
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

// Компонент модального окна для выбора названий команд
defineOptions({
  name: 'TeamSelectionModal',
})

// Props
interface Props {
  isVisible: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  teamsSelected: [leftTeam: string, rightTeam: string]
}>()

// Состояние
const leftTeamName = ref('')
const rightTeamName = ref('')
const leftTeamConfirmed = ref(false)
const rightTeamConfirmed = ref(false)
const adjectives = ref<string[]>([])
const nouns = ref<string[]>([])

// Вычисляемые свойства
const bothTeamsConfirmed = computed(() => leftTeamConfirmed.value && rightTeamConfirmed.value)

// Методы
const loadTeamNames = async () => {
  try {
    // Определяем базовый путь в зависимости от окружения
    const basePath = ''
    const response = await fetch(`${basePath}/config/team-names.json`)
    const data = await response.json()
    adjectives.value = data.adjectives || []
    nouns.value = data.nouns || []
    console.log('Загружено прилагательных:', adjectives.value.length)
    console.log('Загружено существительных:', nouns.value.length)
  } catch (error) {
    console.error('Ошибка загрузки названий команд:', error)
    // Fallback названия
    adjectives.value = ['Красные', 'Синие', 'Огненные', 'Ледяные']
    nouns.value = ['Молнии', 'Громы', 'Солнца', 'Луны']
    console.log('Используются fallback названия')
  }
}

const generateTeamName = () => {
  if (adjectives.value.length === 0 || nouns.value.length === 0) {
    console.log('Нет доступных слов для генерации')
    return ''
  }

  const randomAdjective = adjectives.value[Math.floor(Math.random() * adjectives.value.length)]
  const randomNoun = nouns.value[Math.floor(Math.random() * nouns.value.length)]
  const generatedName = `${randomAdjective} ${randomNoun}`

  console.log('Сгенерировано название команды:', generatedName)
  return generatedName
}

const regenerateTeamNames = () => {
  leftTeamName.value = generateTeamName()
  rightTeamName.value = generateTeamName()

  // Убеждаемся, что названия не совпадают
  while (leftTeamName.value === rightTeamName.value) {
    rightTeamName.value = generateTeamName()
  }

  leftTeamConfirmed.value = false
  rightTeamConfirmed.value = false
  console.log('Названия команд перегенерированы')
}

const regenerateLeftTeam = () => {
  let newName = generateTeamName()
  // Убеждаемся, что название не совпадает с правой командой
  while (newName === rightTeamName.value) {
    newName = generateTeamName()
  }
  leftTeamName.value = newName
  leftTeamConfirmed.value = false
  console.log('Перегенерировано название левой команды:', newName)
}

const regenerateRightTeam = () => {
  let newName = generateTeamName()
  // Убеждаемся, что название не совпадает с левой командой
  while (newName === leftTeamName.value) {
    newName = generateTeamName()
  }
  rightTeamName.value = newName
  rightTeamConfirmed.value = false
  console.log('Перегенерировано название правой команды:', newName)
}

const confirmLeftTeam = () => {
  if (leftTeamName.value.trim()) {
    leftTeamConfirmed.value = true
  }
}

const confirmRightTeam = () => {
  if (rightTeamName.value.trim()) {
    rightTeamConfirmed.value = true
  }
}

const editLeftTeam = () => {
  leftTeamConfirmed.value = false
}

const editRightTeam = () => {
  rightTeamConfirmed.value = false
}

const startGame = () => {
  if (bothTeamsConfirmed.value) {
    emit('teamsSelected', leftTeamName.value.trim(), rightTeamName.value.trim())
  }
}

const resetTeams = () => {
  leftTeamName.value = ''
  rightTeamName.value = ''
  leftTeamConfirmed.value = false
  rightTeamConfirmed.value = false
}

// Инициализация при открытии модалки
watch(
  () => props.isVisible,
  async (newValue) => {
    if (newValue) {
      // Загружаем названия команд если еще не загружены
      if (adjectives.value.length === 0 || nouns.value.length === 0) {
        await loadTeamNames()
      }
      // Небольшая задержка для корректной загрузки
      await new Promise((resolve) => setTimeout(resolve, 100))
      // Генерируем случайные названия команд
      regenerateTeamNames()
    }
  },
)

// Загружаем названия команд при монтировании
onMounted(() => {
  loadTeamNames()
})
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
  max-width: 1800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  color: #495057;
  font-size: 3.6rem;
  font-weight: 500;
}

.modal-body {
  padding: 24px;
}

.teams-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.regenerate-section {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.regenerate-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.regenerate-btn:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.regenerate-btn:active {
  transform: translateY(0);
}

.regenerate-single-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 12px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
}

.regenerate-single-btn:hover {
  background-color: #5a6268;
  transform: scale(1.05);
}

.regenerate-single-btn:active {
  transform: scale(0.95);
}

.teams-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.team-section {
  text-align: center;
}

.team-section h3 {
  margin: 0 0 20px 0;
  color: #495057;
  font-size: 2.6rem;
  font-weight: 500;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.button-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.team-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  font-size: 3.5rem;
  text-align: center;
  transition: border-color 0.2s ease;
}

.team-input:focus {
  outline: none;
  border-color: #007bff;
}

.team-input:disabled {
  background-color: #f8f9fa;
  color: #495057;
}

.confirm-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.confirm-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.confirm-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.confirmed-name {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: #d4edda;
  border: 2px solid #28a745;
  width: 100%;
  justify-content: center;
}

.team-name {
  font-weight: 600;
  color: #155724;
  font-size: 2rem;
}

.edit-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 4px;
  transition: background-color 0.2s ease;
}

.edit-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: center;
  padding: 16px 24px 24px 24px;
  border-top: 1px solid #e1e5e9;
}

.start-game-btn {
  padding: 16px 32px;
  background-color: #28a745;
  color: white;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.start-game-btn:hover:not(:disabled) {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}

.start-game-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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
  .teams-container {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .modal-content {
    max-width: 95%;
    margin: 10px;
  }

  .modal-header h2 {
    font-size: 2.4rem;
  }

  .modal-body {
    padding: 20px;
  }
}
</style>
