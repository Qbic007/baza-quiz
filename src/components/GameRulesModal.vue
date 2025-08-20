<template>
  <Transition name="modal">
    <div v-if="isVisible" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <!-- Заголовок -->
        <div class="modal-header">
          <h2>Конкурс {{ cardId }}</h2>
          <button class="close-btn" @click="closeModal" aria-label="Закрыть">×</button>
        </div>

        <!-- Содержимое -->
        <div class="modal-body">
          <div class="rules-section">
            <h3>🎯 Описание конкурса</h3>
            <p>
              Это описание конкурса для карточки {{ cardId }}. Здесь будет размещена подробная
              информация о том, что нужно сделать, какие правила соблюдать и как получить
              максимальное количество очков.
            </p>
          </div>

          <div class="rules-section">
            <h3>📋 Условия участия</h3>
            <ul>
              <li>Внимательно изучите задание</li>
              <li>Соблюдайте все указанные правила</li>
              <li>Используйте логику и знания</li>
              <li>Не торопитесь с ответом</li>
            </ul>
          </div>

          <div class="rules-section">
            <h3>🏆 Награды</h3>
            <p>
              За успешное выполнение задания вы получите очки и сможете продолжить игру. Чем лучше
              результат, тем больше очков заработаете!
            </p>
          </div>
        </div>

        <!-- Кнопки -->
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Закрыть</button>
          <button class="btn btn-primary" @click="startContest">Начать конкурс</button>
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
}

const props = withDefaults(defineProps<Props>(), {
  cardId: 0,
})

// Emits
const emit = defineEmits<{
  close: []
  startContest: [cardId: number]
}>()

// Методы
const closeModal = () => {
  emit('close')
}

const startContest = () => {
  emit('startContest', props.cardId)
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
  background-color: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #e1e5e9;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
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
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
}

.rules-section p {
  margin: 0 0 12px 0;
  color: #495057;
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
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
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
