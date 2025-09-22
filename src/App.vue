<script setup lang="ts">
import { onMounted, ref } from 'vue'
import QuizCard from './components/Card.vue'
import GameRulesModal from './components/GameRulesModal.vue'
import ContestModal from './components/ContestModal.vue'
import TeamSelectionModal from './components/TeamSelectionModal.vue'
import TeamSelectionBoostTrapModal from './components/TeamSelectionBoostTrapModal.vue'
import { useGameStore } from '@/stores/game'

// Store
const gameStore = useGameStore()

// Состояние модальных окон
const showTeamSelectionModal = ref(false)
const showRulesModal = ref(false)
const showContestModal = ref(false)
const showTeamSelectionBoostTrapModal = ref(false)
const currentCardId = ref<number | null>(null)
const currentBoostTrapData = ref<{ isBoost: boolean; content: string } | null>(null)

// Инициализируем игру при загрузке компонента
onMounted(async () => {
  await gameStore.initializeGame()
  console.log('Команды выбраны:', gameStore.isTeamsSelected)
  console.log('Текущие команды:', gameStore.teams)
  // Показываем модалку выбора команд только если команды не выбраны
  if (!gameStore.isTeamsSelected) {
    console.log('Показываем модалку выбора команд')
    showTeamSelectionModal.value = true
  } else {
    console.log('Команды уже выбраны, модалка не показывается')
  }
})

// Обработчики модального окна выбора команд
const handleTeamsSelected = (leftTeam: string, rightTeam: string) => {
  gameStore.setTeams(leftTeam, rightTeam)
  showTeamSelectionModal.value = false
}

// Обработчики модального окна с правилами
const closeRulesModal = () => {
  showRulesModal.value = false
  currentCardId.value = null
}

// Обработчики модального окна конкурса
const closeContestModal = () => {
  showContestModal.value = false
  currentCardId.value = null
}

// Обработчик переворота карточки
const handleCardFlipped = (cardId: number) => {
  currentCardId.value = cardId

  // Задержка для завершения анимации переворота карточки (0.6s + небольшой буфер)
  setTimeout(() => {
    showRulesModal.value = true
  }, 700) // 700ms = 600ms анимация + 100ms буфер
}

// Обработчик начала конкурса
const handleStartContest = (cardId: number) => {
  showRulesModal.value = false
  currentCardId.value = cardId
  showContestModal.value = true
}

// Обработчик результата конкурса
const handleContestResult = (
  cardId: number,
  result: 'leftTeam' | 'rightTeam' | 'nobody' | 'draw',
) => {
  console.log(`Конкурс ${cardId} - результат: ${result}`)
  gameStore.setContestResult(cardId, result)
  showContestModal.value = false
  currentCardId.value = null
}

// Обработчики бустов и трэпов
const handleShowTeamSelection = (isBoost: boolean, content: string) => {
  currentBoostTrapData.value = { isBoost, content }
  showRulesModal.value = false
  showTeamSelectionBoostTrapModal.value = true
}

const handleTeamSelectedForBoostTrap = (team: 'leftTeam' | 'rightTeam') => {
  if (!currentBoostTrapData.value || !currentCardId.value) return

  const { isBoost, content } = currentBoostTrapData.value
  console.log(
    `${isBoost ? 'Буст' : 'Трэп'} ${currentCardId.value} назначен команде ${team}: ${content}`,
  )

  gameStore.addBoostOrTrap(isBoost ? 'boost' : 'trap', content, currentCardId.value, team)
  showTeamSelectionBoostTrapModal.value = false
  currentCardId.value = null
  currentBoostTrapData.value = null
}

// Удаление буста или трэпа
const removeBoostOrTrap = (id: string) => {
  gameStore.removeBoostOrTrap(id)
}

// Сброс игры с выбором команд
const resetGame = async () => {
  await gameStore.resetGame()
  gameStore.resetTeams()
  showTeamSelectionModal.value = true
}

// Корректировка очков команд
const adjustScore = (team: 'leftTeam' | 'rightTeam', delta: number) => {
  gameStore.adjustScore(team, delta)
}

// Создаем массив из 40 элементов для сетки 8x5
const cards = Array.from({ length: 40 }, (_, index) => index + 1)
</script>

<template>
  <div class="app">
    <h1>Baza Quiz</h1>

    <!-- Отображение команд и очков -->
    <div v-if="gameStore.teams" class="teams-display">
      <div class="team-section-left">
        <!-- Бусты и ловушки левой команды -->
        <div
          v-if="gameStore.leftTeamBoosts.length > 0 || gameStore.leftTeamTraps.length > 0"
          class="team-effects-section team-effects-left"
        >
          <div class="effects-title">Ловушки и бонусы</div>
          <div class="effects-list">
            <div
              v-for="item in [...gameStore.leftTeamBoosts, ...gameStore.leftTeamTraps]"
              :key="item.id"
              class="effect-card"
              :class="item.type"
              @click="removeBoostOrTrap(item.id)"
            >
              {{ gameStore.getCard(item.cardId)?.content || `Карточка ${item.cardId}` }}
            </div>
          </div>
        </div>

        <div class="team team-left">
          <div class="team-name">{{ gameStore.teams.leftTeam }}</div>
          <div class="team-score-container">
            <button class="score-btn score-minus" @click="adjustScore('leftTeam', -1)">-</button>
            <div class="team-score">{{ gameStore.leftTeamScore }}</div>
            <button class="score-btn score-plus" @click="adjustScore('leftTeam', 1)">+</button>
          </div>
        </div>
      </div>

      <div class="vs">
        <div class="vs-text">VS</div>
      </div>

      <div class="team-section-right">
        <div class="team team-right">
          <div class="team-name">{{ gameStore.teams.rightTeam }}</div>
          <div class="team-score-container">
            <button class="score-btn score-minus" @click="adjustScore('rightTeam', -1)">-</button>
            <div class="team-score">{{ gameStore.rightTeamScore }}</div>
            <button class="score-btn score-plus" @click="adjustScore('rightTeam', 1)">+</button>
          </div>
        </div>

        <!-- Бусты и ловушки правой команды -->
        <div
          v-if="gameStore.rightTeamBoosts.length > 0 || gameStore.rightTeamTraps.length > 0"
          class="team-effects-section team-effects-right"
        >
          <div class="effects-title">Ловушки и бонусы</div>
          <div class="effects-list">
            <div
              v-for="item in [...gameStore.rightTeamBoosts, ...gameStore.rightTeamTraps]"
              :key="item.id"
              class="effect-card"
              :class="item.type"
              @click="removeBoostOrTrap(item.id)"
            >
              {{ gameStore.getCard(item.cardId)?.content || `Карточка ${item.cardId}` }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Кнопки отладки -->
    <div v-if="gameStore.isGameStarted" class="debug-buttons">
      <button @click="resetGame" class="debug-reset-btn" title="Перезапустить игру">🔄</button>
    </div>

    <div class="grid-container">
      <div v-for="card in cards" :key="card" class="grid-item">
        <QuizCard :card-number="card" @card-flipped="handleCardFlipped" />
      </div>
    </div>

    <!-- Модальное окно выбора команд -->
    <TeamSelectionModal
      :is-visible="showTeamSelectionModal"
      @teams-selected="handleTeamsSelected"
    />

    <!-- Модальное окно с правилами -->
    <GameRulesModal
      :is-visible="showRulesModal"
      :card-id="currentCardId || 0"
      :question-type="gameStore.getCard(currentCardId || 0)?.questionType || 'image'"
      :question-data="gameStore.getCard(currentCardId || 0)?.questionData"
      :intro-content="currentCardId ? gameStore.getCard(currentCardId)?.intro?.content : undefined"
      :card-content="currentCardId ? gameStore.getCard(currentCardId)?.content : undefined"
      @close="closeRulesModal"
      @start-contest="handleStartContest"
      @show-team-selection="handleShowTeamSelection"
    />

    <!-- Модальное окно конкурса -->
    <ContestModal
      :is-visible="showContestModal"
      :card-id="currentCardId || 0"
      :question-type="gameStore.getCard(currentCardId || 0)?.questionType || 'image'"
      :question-data="gameStore.getCard(currentCardId || 0)?.questionData"
      :answer="gameStore.getCard(currentCardId || 0)?.answer"
      :image-url="
        gameStore.getCard(currentCardId || 0)?.questionData?.type === 'image'
          ? (gameStore.getCard(currentCardId || 0)?.questionData as any)?.imageUrl
          : ''
      "
      :video-url="
        gameStore.getCard(currentCardId || 0)?.questionData?.type === 'video'
          ? (gameStore.getCard(currentCardId || 0)?.questionData as any)?.videoUrl
          : ''
      "
      :codenames-width="
        currentCardId && gameStore.getCard(currentCardId)?.questionData?.type === 'codenames'
          ? (gameStore.getCard(currentCardId)?.questionData as any)?.width
          : undefined
      "
      :codenames-height="
        currentCardId && gameStore.getCard(currentCardId)?.questionData?.type === 'codenames'
          ? (gameStore.getCard(currentCardId)?.questionData as any)?.height
          : undefined
      "
      :left-team-name="gameStore.teams?.leftTeam"
      :right-team-name="gameStore.teams?.rightTeam"
      @close="closeContestModal"
      @contest-result="handleContestResult"
    />

    <!-- Модальное окно выбора команды для бустов и ловушек -->
    <TeamSelectionBoostTrapModal
      :is-visible="showTeamSelectionBoostTrapModal"
      :is-boost="currentBoostTrapData?.isBoost || false"
      :content="currentBoostTrapData?.content || ''"
      :left-team-name="gameStore.teams?.leftTeam"
      :right-team-name="gameStore.teams?.rightTeam"
      @team-selected="handleTeamSelectedForBoostTrap"
    />
  </div>
</template>

<style scoped>
.app {
  padding: 20px;
  text-align: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Arial', sans-serif;
  color: #495057;
}

h1 {
  color: #495057;
  margin-bottom: 30px;
  font-size: 2.5rem;
  font-weight: 300;
}

/* Отображение команд */
.teams-display {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.team-section-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 15px;
  flex: 1;
  max-width: 300px;
  justify-content: flex-end;
}

.team-section-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 15px;
  flex: 1;
  max-width: 300px;
  justify-content: flex-start;
}

.team {
  font-size: 1.5rem;
  font-weight: 600;
  padding: 16px 24px;
  text-align: center;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.team-effects-section {
  padding: 10px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  width: 200px;
  max-width: 200px;
  flex-shrink: 0;
}

.team-effects-left {
  background-color: rgba(111, 66, 193, 0.1);
  border-color: rgba(111, 66, 193, 0.3);
}

.team-effects-right {
  background-color: rgba(253, 126, 20, 0.1);
  border-color: rgba(253, 126, 20, 0.3);
}

.effects-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
  text-align: center;
}

.effects-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.effect-card {
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  line-height: 1.2;
  text-align: center;
  border: 1px solid transparent;
  word-wrap: break-word;
  max-width: 100px;
}

.effect-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.effect-card.boost {
  background-color: rgba(40, 167, 69, 0.2);
  border-color: rgba(40, 167, 69, 0.4);
  color: #155724;
}

.effect-card.boost:hover {
  background-color: rgba(40, 167, 69, 0.3);
}

.effect-card.trap {
  background-color: rgba(220, 53, 69, 0.2);
  border-color: rgba(220, 53, 69, 0.4);
  color: #721c24;
}

.effect-card.trap:hover {
  background-color: rgba(220, 53, 69, 0.3);
}

.team-name {
  font-size: 1.2rem;
  font-weight: 600;
}

.team-score-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.team-score {
  font-size: 2rem;
  font-weight: 800;
  background-color: rgba(255, 255, 255, 0.2);
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
  min-width: 50px;
}

.score-btn {
  width: 30px;
  height: 30px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;
  transform: scale(0.8);
}

.team:hover .score-btn {
  opacity: 1;
  transform: scale(1);
}

.score-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.8);
  transform: scale(1.1);
}

.score-btn:active {
  transform: scale(0.95);
}

.team-left {
  background-color: #6f42c1;
  color: white;
}

.team-right {
  background-color: #fd7e14;
  color: white;
}

.vs {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: #e9ecef;
  min-width: 60px;
}

.vs-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: #495057;
}

/* Отладочные кнопки */
.debug-buttons {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
  z-index: 100;
}

.debug-reset-btn {
  background-color: #e9ecef;
  color: #495057;
  border: none;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.debug-reset-btn:hover {
  background-color: #dee2e6;
  transform: scale(1.1);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Для больших экранов - фиксированная сетка 8x5 */
@media (min-width: 1400px) {
  .grid-container {
    grid-template-columns: repeat(8, 1fr);
    grid-template-rows: repeat(5, auto);
  }
}

/* Для средних экранов - адаптивная сетка */
@media (max-width: 1399px) and (min-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

/* Для мобильных устройств */
@media (max-width: 767px) {
  .grid-container {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    padding: 0 15px;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 20px;
  }

  .teams-display {
    flex-direction: column;
    gap: 20px;
  }

  .team-section-left,
  .team-section-right {
    max-width: 100%;
  }

  .vs {
    transform: rotate(90deg);
  }

  .team {
    min-width: 100%;
  }

  .team-effects-section {
    padding: 8px;
    width: 150px;
    max-width: 150px;
  }

  .effect-card {
    font-size: 0.7rem;
    padding: 4px 8px;
    max-width: 80px;
  }
}

.grid-item {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
