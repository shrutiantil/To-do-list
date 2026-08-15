const STORAGE_KEY = 'todo-list-tasks-v1';

const state = {
  tasks: loadTasks(),
};

function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);

  if (!savedTasks) {
    return [
      { id: createTaskId(), title: 'Review sprint plan', status: 'pending', priority: 'normal' },
      { id: createTaskId(), title: 'Sketch landing page', status: 'progress', priority: 'critical' },
      { id: createTaskId(), title: 'Submit weekly report', status: 'completed', priority: 'minor' },
    ];
  }

  try {
    const parsedTasks = JSON.parse(savedTasks);
    return Array.isArray(parsedTasks) && parsedTasks.length ? parsedTasks : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

function createTaskId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getInitials(text) {
  return text
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('') || 'T';
}

function updateSummary() {
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter((task) => task.status === 'completed').length;
  const pendingTasks = state.tasks.filter((task) => task.status !== 'completed').length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalTaskEl = document.getElementById('totalTask');
  const pendingCountEl = document.getElementById('pendingCount');
  const taskCountEl = document.getElementById('taskcount');
  const completionRateValueEl = document.getElementById('completionRateValue');
  const completionProgressEl = document.getElementById('CompletionProgress');

  if (totalTaskEl) totalTaskEl.textContent = totalTasks;
  if (pendingCountEl) pendingCountEl.textContent = pendingTasks;
  if (taskCountEl) taskCountEl.textContent = totalTasks;
  if (completionRateValueEl) completionRateValueEl.textContent = `${completionRate}%`;
  if (completionProgressEl) completionProgressEl.style.width = `${completionRate}%`;
}

function getStatusClass(status) {
  if (status === 'pending') return 'status-pending';
  if (status === 'progress') return 'status-progress';
  if (status === 'completed') return 'status-completed';
  return 'status-cancelled';
}

function getPriorityClass(priority) {
  if (priority === 'critical') return 'priority-critical';
  if (priority === 'normal') return 'priority-normal';
  return 'priority-minor';
}

function createTaskCard(task) {
  const isCompleted = task.status === 'completed';
  const statusText =
    task.status === 'pending' ? 'Pending' : task.status === 'progress' ? 'In Progress' : 'Completed';

  return `
    <div class="task-items">
      <div class="task-checkbox ${isCompleted ? 'completed' : ''}" onclick="toggleTask('${task.id}')"></div>

      <div class="task-content">
        <div class="task-title ${isCompleted ? 'completed' : ''}">${escapeHtml(task.title)}</div>
      </div>

      <span class="status-badge ${getStatusClass(task.status)}">${statusText}</span>

      <div class="priority-badge ${getPriorityClass(task.priority)}">
        <i class="fas fa-circle"></i>
        <span>${capitalize(task.priority)}</span>
      </div>

      <div class="avatar">${getInitials(task.title)}</div>

      <button class="icon-btn" onclick="editTask('${task.id}')">
        <i class="fas fa-pen"></i>
      </button>

      <button class="icon-btn" onclick="deleteTask('${task.id}')">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
}

function renderTasks() {
  const onHoldContainer = document.getElementById('onholdtasks');
  const completedContainer = document.getElementById('completedtasks');

  if (!onHoldContainer || !completedContainer) return;

  const onHoldTasks = state.tasks.filter((task) => task.status !== 'completed');
  const completedTasks = state.tasks.filter((task) => task.status === 'completed');

  onHoldContainer.innerHTML = onHoldTasks.length
    ? onHoldTasks.map(createTaskCard).join('')
    : '<div class="task-items"><div class="task-content"><div class="task-title">No active tasks yet.</div></div></div>';

  completedContainer.innerHTML = completedTasks.length
    ? completedTasks.map(createTaskCard).join('')
    : '<div class="task-items"><div class="task-content"><div class="task-title">No completed tasks yet.</div></div></div>';

  updateSummary();
}

function openModal() {
  const modal = document.getElementById('taskModal');
  const form = document.getElementById('taskForm');

  if (modal) modal.classList.add('active');
  if (form) form.reset();
  document.getElementById('taskStatus').value = 'pending';
  document.getElementById('taskPriority').value = 'normal';
  document.getElementById('taskTitle').focus();
  window.editingTaskId = null;
}

function closeModal() {
  const modal = document.getElementById('taskModal');
  if (modal) modal.classList.remove('active');

  const form = document.getElementById('taskForm');
  if (form) form.reset();
  window.editingTaskId = null;
}

function addTask(taskData) {
  state.tasks.push({
    id: createTaskId(),
    title: taskData.title,
    status: taskData.status,
    priority: taskData.priority,
  });
  saveTasks();
  renderTasks();
}

function updateTask(taskId, taskData) {
  state.tasks = state.tasks.map((task) =>
    task.id === taskId
      ? { ...task, title: taskData.title, status: taskData.status, priority: taskData.priority }
      : task,
  );
  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  state.tasks = state.tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

function editTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  window.editingTaskId = taskId;
  document.getElementById('taskTitle').value = task.title;
  document.getElementById('taskStatus').value = task.status;
  document.getElementById('taskPriority').value = task.priority;

  const modal = document.getElementById('taskModal');
  if (modal) modal.classList.add('active');
}

function toggleTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  task.status = task.status === 'completed' ? 'pending' : 'completed';
  saveTasks();
  renderTasks();
}

function handleTaskSubmit(event) {
  event.preventDefault();

  const title = document.getElementById('taskTitle').value.trim();
  const status = document.getElementById('taskStatus').value;
  const priority = document.getElementById('taskPriority').value;

  if (!title) {
    document.getElementById('taskTitle').focus();
    return;
  }

  if (window.editingTaskId) {
    updateTask(window.editingTaskId, { title, status, priority });
  } else {
    addTask({ title, status, priority });
  }

  closeModal();
}

function initializeApp() {
  const form = document.getElementById('taskForm');
  if (form) form.addEventListener('submit', handleTaskSubmit);

  renderTasks();
}

window.openModal = openModal;
window.closeModal = closeModal;
window.editTask = editTask;
window.deleteTask = deleteTask;
window.toggleTask = toggleTask;
window.editingTaskId = null;

document.addEventListener('DOMContentLoaded', initializeApp);
