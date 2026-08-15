// Task management object
const TaskManager = {
    tasks: [],
    
    // Initialize the app
    init() {
        this.loadTasks();
        this.attachEventListeners();
        this.render();
    },
    
    // Load tasks from localStorage
    loadTasks() {
        const saved = localStorage.getItem('tasks');
        this.tasks = saved ? JSON.parse(saved) : [];
    },
    
    // Save tasks to localStorage
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    },
    
    // Add new task
    addTask(title, status = 'pending', priority = 'normal') {
        const task = {
            id: Date.now(),
            title,
            status,
            priority,
            completed: false,
            avatar: this.getAvatar()
        };
        this.tasks.unshift(task);
        this.saveTasks();
        this.render();
    },
    
    // Delete task
    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.render();
    },
    
    // Toggle task completion
    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            task.status = task.completed ? 'completed' : 'pending';
            this.saveTasks();
            this.render();
        }
    },
    
    // Get random avatar initials
    getAvatar() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return letters.charAt(Math.floor(Math.random() * letters.length));
    },
    
    // Render all tasks
    render() {
        this.renderTasks();
        this.updateStats();
    },
    
    // Render task items
    renderTasks() {
        const container = document.querySelector('.tasks-container') || document.createElement('div');
        container.className = 'tasks-container';
        container.innerHTML = '';
        
        this.tasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = 'task-items';
            taskEl.innerHTML = `
                <input type="checkbox" class="task-checkbox ${task.completed ? 'completed' : ''}" 
                    data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <div class="task-title ${task.completed ? 'compeletd' : ''}">${task.title}</div>
                </div>
                <span class="status-badge status-${task.status}">${task.status}</span>
                <span class="priority-badge priority-${task.priority}">
                    <i class="fas fa-circle"></i> ${task.priority}
                </span>
                <div class="avatar">${task.avatar}</div>
                <button class="delete-btn" data-id="${task.id}" style="background: #fee2e2; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; color: #dc2626;">Delete</button>
            `;
            container.appendChild(taskEl);
        });
        
        const parent = document.querySelector('.section') || document.body;
        const existing = document.querySelector('.tasks-container');
        if (existing) {
            existing.replaceWith(container);
        } else {
            parent.appendChild(container);
        }
    },
    
    // Update statistics
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const progress = total > 0 ? (completed / total) * 100 : 0;
        
        const totalEl = document.querySelector('.stat-value');
        const progressEl = document.querySelector('.progress-fill');
        
        if (totalEl) totalEl.textContent = total;
        if (progressEl) progressEl.style.width = progress + '%';
    },
    
    // Search tasks
    search(query) {
        const filtered = this.tasks.filter(task => 
            task.title.toLowerCase().includes(query.toLowerCase())
        );
        this.displayFiltered(filtered);
    },
    
    // Display filtered tasks
    displayFiltered(filtered) {
        const container = document.querySelector('.tasks-container');
        if (!container) return;
        
        container.innerHTML = '';
        filtered.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = 'task-items';
            taskEl.innerHTML = `
                <input type="checkbox" class="task-checkbox ${task.completed ? 'completed' : ''}" 
                    data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <div class="task-title ${task.completed ? 'compeletd' : ''}">${task.title}</div>
                </div>
                <span class="status-badge status-${task.status}">${task.status}</span>
                <div class="avatar">${task.avatar}</div>
            `;
            container.appendChild(taskEl);
        });
    },
    
    // Attach event listeners
    attachEventListeners() {
        // Add task button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-btn')) {
                this.openModal();
            }
            
            // Toggle task
            if (e.target.classList.contains('task-checkbox')) {
                this.toggleTask(parseInt(e.target.dataset.id));
            }
            
            // Delete task
            if (e.target.classList.contains('delete-btn')) {
                this.deleteTask(parseInt(e.target.dataset.id));
            }
        });
        
        // Search functionality
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (e.target.value.trim()) {
                    this.search(e.target.value);
                } else {
                    this.render();
                }
            });
        }
        
        // Modal close button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
            if (e.target.classList.contains('btn-secondary')) {
                this.closeModal();
            }
        });
    },
    
    // Open modal
    openModal() {
        const modal = document.querySelector('.modal');
        if (modal) modal.classList.add('active');
    },
    
    // Close modal
    closeModal() {
        const modal = document.querySelector('.modal');
        if (modal) modal.classList.remove('active');
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    TaskManager.init();
    
    // Handle form submission
    const form = document.querySelector('.modal-content form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.querySelector('#taskTitle')?.value || '';
            const status = document.querySelector('#taskStatus')?.value || 'pending';
            const priority = document.querySelector('#taskPriority')?.value || 'normal';
            
            if (title.trim()) {
                TaskManager.addTask(title, status, priority);
                form.reset();
                TaskManager.closeModal();
            }
        });
    }
});