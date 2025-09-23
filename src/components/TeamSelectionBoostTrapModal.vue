<template>
  <Transition name="modal">
    <div v-if="isVisible" class="modal-overlay">
      <div class="modal-content">
        <!-- Заголовок -->
        <div class="modal-header">
          <h2>{{ roundName || (isBoost ? '🚀 Буст!' : '💀 Ловушка!') }}</h2>
        </div>

        <!-- Содержимое -->
        <div class="modal-body">
          <div class="boost-trap-info">
            <p class="boost-trap-question">
              {{
                isBoost
                  ? 'Какой команде дать этот усилитель?'
                  : 'Какой команде подложить эту ловушку?'
              }}
            </p>
          </div>

          <div class="teams-selection">
            <button
              class="team-btn team-left"
              @click="selectTeam('leftTeam')"
              :disabled="!leftTeamName"
            >
              <div class="team-icon">🏆</div>
              <div class="team-name">{{ leftTeamName || 'Левая команда' }}</div>
            </button>

            <div class="vs-divider">
              <span>VS</span>
            </div>

            <button
              class="team-btn team-right"
              @click="selectTeam('rightTeam')"
              :disabled="!rightTeamName"
            >
              <div class="team-icon">🏆</div>
              <div class="team-name">{{ rightTeamName || 'Правая команда' }}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
// Компонент модального окна выбора команды для бустов и ловушек
defineOptions({
  name: 'TeamSelectionBoostTrapModal',
})

// Props
interface Props {
  isVisible: boolean
  isBoost: boolean
  content: string
  roundName?: string
  leftTeamName?: string
  rightTeamName?: string
}

const props = withDefaults(defineProps<Props>(), {
  isBoost: false,
  content: '',
  roundName: '',
  leftTeamName: '',
  rightTeamName: '',
})

// Emits
const emit = defineEmits<{
  teamSelected: [team: 'leftTeam' | 'rightTeam']
  close: []
}>()

// Методы
const selectTeam = (team: 'leftTeam' | 'rightTeam') => {
  emit('teamSelected', team)
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
  max-width: 500px;
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
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
}

.modal-body {
  padding: 24px;
}

.boost-trap-info {
  text-align: center;
  margin-bottom: 32px;
}

.boost-trap-question {
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0;
}

.teams-selection {
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: center;
}

.team-btn {
  flex: 1;
  max-width: 150px;
  padding: 20px 16px;
  border: 2px solid #e9ecef;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-height: 120px;
}

.team-btn:hover:not(:disabled) {
  border-color: #007bff;
  background-color: #f8f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
}

.team-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.team-left:hover:not(:disabled) {
  border-color: #dc3545;
  background-color: #fff5f5;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
}

.team-right:hover:not(:disabled) {
  border-color: #007bff;
  background-color: #f0f8ff;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
}

.team-icon {
  font-size: 2rem;
}

.team-name {
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  text-align: center;
  word-break: break-word;
}

.vs-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: #6c757d;
  background-color: #f8f9fa;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
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

  .teams-selection {
    flex-direction: column;
    gap: 16px;
  }

  .team-btn {
    max-width: 100%;
    width: 100%;
  }

  .vs-divider {
    transform: rotate(90deg);
  }
}
</style>
