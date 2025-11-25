// ============================================
// TODO LIST FUNCTIONALITY
// ============================================

class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.selectedColor = 'green';
        this.init();
    }

    init() {
        document.getElementById('addTodoBtn').addEventListener('click', () => this.addTodo());
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        document.querySelectorAll('.color-radio').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectedColor = e.target.value;
            });
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        this.render();
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();

        if (!text) return;

        this.todos.unshift({
            id: Date.now(),
            text,
            completed: false,
            color: this.selectedColor,
            date: new Date().toLocaleDateString()
        });

        input.value = '';
        this.save();
        this.render();
        this.updateHeader();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.save();
        this.render();
        this.updateHeader();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.save();
            this.render();
            this.updateHeader();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    getFilteredTodos() {
        switch(this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    updateHeader() {
        const total = this.todos.length;
        document.getElementById('headerTasks').textContent = total;
    }

    render() {
        const list = document.getElementById('todoList');
        const filtered = this.getFilteredTodos();

        list.innerHTML = filtered.map((todo, index) => `
            <li class="list-item ${todo.color}">
                <div style="display: flex; align-items: center; flex: 1;">
                    <div class="checkbox-circle ${todo.completed ? 'checked' : ''}" onclick="todoApp.toggleTodo(${todo.id})">
                        ${todo.completed ? '<span class="checkmark">✓</span>' : ''}
                    </div>
                    <div class="item-text">
                        <div class="item-text-main">${todo.text}</div>
                        <div class="item-text-date">${todo.date}</div>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn-action" onclick="todoApp.toggleTodo(${todo.id})">
                        ${todo.completed ? '↩️ Undo' : '✓ Done'}
                    </button>
                    <button class="btn-action delete" onclick="todoApp.deleteTodo(${todo.id})">🗑️</button>
                </div>
            </li>
        `).join('');

        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

        document.getElementById('todoTotal').textContent = total;
        document.getElementById('todoCompleted').textContent = completed;
        document.getElementById('todoPercent').textContent = percent + '%';
    }

    save() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
}

// ============================================
// EXPENSE TRACKER FUNCTIONALITY
// ============================================

class ExpenseTracker {
    constructor() {
        this.expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        this.filterStartDate = null;
        this.filterEndDate = null;
        this.init();
    }

    init() {
        document.getElementById('addExpenseBtn').addEventListener('click', () => this.addExpense());
        document.getElementById('expenseAmount').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addExpense();
        });

        document.getElementById('applyFilterBtn').addEventListener('click', () => this.applyFilter());
        document.getElementById('resetFilterBtn').addEventListener('click', () => this.resetFilter());

        this.render();
    }

    addExpense() {
        const desc = document.getElementById('expenseDescription').value.trim();
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const category = document.getElementById('expenseCategory').value;
        const dateInput = document.getElementById('expenseDate').value;
        const frequency = document.getElementById('expenseFrequency').value;

        if (!desc || !amount || amount <= 0 || !category || !dateInput) {
            alert('Please fill in all fields with valid amount and date');
            return;
        }

        const selectedDate = new Date(dateInput);
        const formattedDate = selectedDate.toLocaleDateString();

        this.expenses.unshift({
            id: Date.now(),
            description: desc,
            amount,
            category,
            frequency,
            date: formattedDate,
            fullDate: selectedDate,
            completed: false
        });

        document.getElementById('expenseDescription').value = '';
        document.getElementById('expenseAmount').value = '';
        document.getElementById('expenseCategory').value = '';
        document.getElementById('expenseDate').value = '';
        document.getElementById('expenseFrequency').value = 'once';

        this.save();
        this.render();
    }

    deleteExpense(id) {
        this.expenses = this.expenses.filter(e => e.id !== id);
        this.save();
        this.render();
    }

    toggleExpenseComplete(id) {
        const expense = this.expenses.find(e => e.id === id);
        if (expense) {
            expense.completed = !expense.completed;
            this.save();
            this.render();
        }
    }

    applyFilter() {
        const startDateInput = document.getElementById('filterStartDate').value;
        const endDateInput = document.getElementById('filterEndDate').value;

        if (!startDateInput || !endDateInput) {
            alert('Please select both start and end dates');
            return;
        }

        this.filterStartDate = new Date(startDateInput);
        this.filterEndDate = new Date(endDateInput);
        this.render();
    }

    resetFilter() {
        this.filterStartDate = null;
        this.filterEndDate = null;
        document.getElementById('filterStartDate').value = '';
        document.getElementById('filterEndDate').value = '';
        this.render();
    }

    getTotalSpent() {
        return this.expenses.reduce((sum, e) => sum + e.amount, 0);
    }

    getMonthlySpent() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return this.expenses.filter(e => {
            const expenseDate = new Date(e.fullDate);
            return expenseDate.getMonth() === currentMonth &&
                   expenseDate.getFullYear() === currentYear;
        }).reduce((sum, e) => sum + e.amount, 0);
    }

    getTodaySpent() {
        const today = new Date().toLocaleDateString();
        return this.expenses.filter(e => e.date === today)
            .reduce((sum, e) => sum + e.amount, 0);
    }

    getFilteredSpent() {
        if (!this.filterStartDate || !this.filterEndDate) {
            return 0;
        }

        return this.expenses.filter(e => {
            const expenseDate = new Date(e.fullDate);
            return expenseDate >= this.filterStartDate && expenseDate <= this.filterEndDate;
        }).reduce((sum, e) => sum + e.amount, 0);
    }

    getFilteredExpenses() {
        if (!this.filterStartDate || !this.filterEndDate) {
            return this.expenses;
        }

        return this.expenses.filter(e => {
            const expenseDate = new Date(e.fullDate);
            return expenseDate >= this.filterStartDate && expenseDate <= this.filterEndDate;
        });
    }

    getCategoryBreakdown() {
        const breakdown = {};
        const expensesToCount = this.getFilteredExpenses();

        expensesToCount.forEach(e => {
            breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
        });
        return breakdown;
    }

    render() {
        // Update totals
        document.getElementById('totalSpent').textContent = '$' + this.getTotalSpent().toFixed(2);
        document.getElementById('monthlySpent').textContent = '$' + this.getMonthlySpent().toFixed(2);
        document.getElementById('todaySpent').textContent = '$' + this.getTodaySpent().toFixed(2);
        document.getElementById('filteredSpent').textContent = '$' + this.getFilteredSpent().toFixed(2);

        // Update category breakdown
        const breakdown = this.getCategoryBreakdown();
        const categoryDiv = document.getElementById('categoryBreakdown');
        const categories = {
            'food': '🍔 Food & Dining',
            'transport': '🚗 Transportation',
            'entertainment': '🎮 Entertainment',
            'education': '📚 Education',
            'utilities': '⚡ Utilities',
            'shopping': '🛍️ Shopping',
            'health': '🏥 Health',
            'other': '📌 Other'
        };

        categoryDiv.innerHTML = Object.entries(breakdown).map(([cat, amount]) => `
            <div class="category-item">
                <div class="category-name">${categories[cat] || cat}</div>
                <div class="category-amount">$${amount.toFixed(2)}</div>
            </div>
        `).join('');

        // Update expense list
        const list = document.getElementById('expenseList');
        const displayExpenses = this.getFilteredExpenses();

        list.innerHTML = displayExpenses.map(exp => {
            const catLabel = {
                'food': '🍔 Food & Dining',
                'transport': '🚗 Transportation',
                'entertainment': '🎮 Entertainment',
                'education': '📚 Education',
                'utilities': '⚡ Utilities',
                'shopping': '🛍️ Shopping',
                'health': '🏥 Health',
                'other': '📌 Other'
            }[exp.category] || exp.category;

            const frequencyLabel = exp.frequency === 'once' ? '' : ` (${exp.frequency})`;
            const completedClass = exp.completed ? 'completed' : '';

            return `
            <li class="expense-item ${completedClass}">
                <div style="display: flex; align-items: center; flex: 1; gap: 12px;">
                    <div class="checkbox-circle ${exp.completed ? 'checked' : ''}" onclick="expenseTracker.toggleExpenseComplete(${exp.id})">
                        ${exp.completed ? '<span class="checkmark">✓</span>' : ''}
                    </div>
                    <div class="expense-details">
                        <div class="expense-description">${exp.description}</div>
                        <div class="expense-category">${catLabel} • ${exp.date}${frequencyLabel}</div>
                    </div>
                </div>
                <span class="expense-amount">$${exp.amount.toFixed(2)}</span>
                <button class="btn-action delete" onclick="expenseTracker.deleteExpense(${exp.id})">🗑️</button>
            </li>
        `}).join('');
    }

    save() {
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
    }
}

// ============================================
// LEARNING JOURNAL & QUIZ FUNCTIONALITY
// ============================================

class LearningApp {
    constructor() {
        this.entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
        this.questions = JSON.parse(localStorage.getItem('quizQuestions')) || [];
        this.currentQuizIndex = 0;
        this.quizScore = 0;
        this.selectedAnswer = null;
        this.init();
    }

    init() {
        document.getElementById('addJournalBtn').addEventListener('click', () => this.addEntry());
        document.getElementById('journalNotes').addEventListener('keypress', (e) => {
            if (e.ctrlKey && e.key === 'Enter') this.addEntry();
        });

        document.getElementById('addQuizBtn').addEventListener('click', () => this.addQuestion());
        document.getElementById('startQuizBtn').addEventListener('click', () => this.startQuiz());

        this.render();
    }

    addEntry() {
        const topic = document.getElementById('journalTopic').value.trim();
        const notes = document.getElementById('journalNotes').value.trim();
        const difficulty = document.getElementById('journalDifficulty').value;

        if (!topic || !notes) {
            alert('Please fill in topic and notes');
            return;
        }

        this.entries.unshift({
            id: Date.now(),
            topic,
            notes,
            difficulty: difficulty || 5,
            date: new Date().toLocaleDateString()
        });

        document.getElementById('journalTopic').value = '';
        document.getElementById('journalNotes').value = '';
        document.getElementById('journalDifficulty').value = '';

        this.save();
        this.render();
        this.updateHeader();
    }

    deleteEntry(id) {
        this.entries = this.entries.filter(e => e.id !== id);
        this.save();
        this.render();
        this.updateHeader();
    }

    addQuestion() {
        const question = document.getElementById('quizQuestion').value.trim();
        const correct = document.getElementById('quizCorrectAnswer').value.trim();
        const wrong1 = document.getElementById('quizWrongAnswer1').value.trim();
        const wrong2 = document.getElementById('quizWrongAnswer2').value.trim();

        if (!question || !correct || !wrong1 || !wrong2) {
            alert('Please fill in all quiz fields');
            return;
        }

        this.questions.push({
            id: Date.now(),
            question,
            answers: [correct, wrong1, wrong2].sort(() => Math.random() - 0.5),
            correct
        });

        document.getElementById('quizQuestion').value = '';
        document.getElementById('quizCorrectAnswer').value = '';
        document.getElementById('quizWrongAnswer1').value = '';
        document.getElementById('quizWrongAnswer2').value = '';

        this.save();
        this.render();
    }

    startQuiz() {
        if (this.questions.length === 0) {
            alert('Add some questions first!');
            return;
        }

        this.currentQuizIndex = 0;
        this.quizScore = 0;
        this.selectedAnswer = null;

        document.getElementById('quizSetup').style.display = 'none';
        document.getElementById('quizGame').style.display = 'block';
        document.getElementById('startQuizBtn').style.display = 'none';

        this.displayQuestion();
    }

    displayQuestion() {
        if (this.currentQuizIndex >= this.questions.length) {
            this.endQuiz();
            return;
        }

        const q = this.questions[this.currentQuizIndex];
        document.getElementById('quizQuestionDisplay').textContent = q.question;
        document.getElementById('currentQuestion').textContent = this.currentQuizIndex + 1;
        document.getElementById('totalQuestions').textContent = this.questions.length;

        const progressPercent = ((this.currentQuizIndex + 1) / this.questions.length) * 100;
        document.getElementById('progressFill').style.width = progressPercent + '%';

        const answersDiv = document.getElementById('quizAnswers');
        answersDiv.innerHTML = q.answers.map((answer, idx) => `
            <button class="quiz-answer-btn" onclick="learningApp.selectAnswer('${answer.replace(/'/g, "\\'")}', '${q.correct.replace(/'/g, "\\'")}', this)">
                ${answer}
            </button>
        `).join('');

        document.getElementById('nextQuestionBtn').style.display = 'none';
    }

    selectAnswer(selected, correct, button) {
        this.selectedAnswer = selected;

        document.querySelectorAll('.quiz-answer-btn').forEach(btn => {
            btn.disabled = true;
        });

        if (selected === correct) {
            button.classList.add('correct');
            this.quizScore++;
        } else {
            button.classList.add('incorrect');
            const correctBtn = Array.from(document.querySelectorAll('.quiz-answer-btn'))
                .find(btn => btn.textContent.trim() === correct);
            if (correctBtn) correctBtn.classList.add('correct');
        }

        document.getElementById('nextQuestionBtn').style.display = 'block';
    }

    nextQuestion() {
        this.currentQuizIndex++;
        this.displayQuestion();
    }

    endQuiz() {
        const percentage = Math.round((this.quizScore / this.questions.length) * 100);
        const emoji = percentage === 100 ? '🏆' : percentage >= 80 ? '⭐' : percentage >= 60 ? '👍' : '💪';

        document.getElementById('quizGame').innerHTML = `
            <div style="text-align: center; padding: 50px 20px; animation: fadeInUp 0.6s ease-out;">
                <h2 style="font-size: 2.5em; margin-bottom: 20px;">Quiz Complete! ${emoji}</h2>
                <div style="margin: 30px 0;">
                    <div style="font-size: 3em; color: var(--primary-green); font-weight: 700; margin-bottom: 10px;">
                        ${this.quizScore} / ${this.questions.length}
                    </div>
                    <div style="font-size: 2em; background: linear-gradient(135deg, var(--primary-red), var(--primary-green)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700;">
                        ${percentage}%
                    </div>
                </div>
                <p style="color: var(--text-light); margin: 20px 0; font-size: 1.1em;">
                    ${percentage === 100 ? 'Perfect Score! 🎉' : percentage >= 80 ? 'Great Job! Keep it up!' : percentage >= 60 ? 'Good Effort! Study more.' : 'Keep Practicing!'}
                </p>
                <button class="btn-glass-primary" onclick="learningApp.resetQuiz()" style="margin-top: 30px;">
                    🔄 Try Again
                </button>
            </div>
        `;
    }

    resetQuiz() {
        document.getElementById('quizSetup').style.display = 'block';
        document.getElementById('quizGame').innerHTML = `
            <div class="quiz-progress-section">
                <h3 id="quizQuestionDisplay"></h3>
                <div class="progress-bar-large">
                    <div id="progressFill" class="progress-fill-large"></div>
                </div>
                <p class="progress-text">Question <span id="currentQuestion">1</span> of <span id="totalQuestions">1</span></p>
            </div>
            <div id="quizAnswers" class="quiz-answers-grid"></div>
            <button id="nextQuestionBtn" class="btn-glass-primary" style="display:none; width: 100%; margin-top: 20px;">Next Question</button>
        `;
        document.getElementById('quizGame').style.display = 'none';
        document.getElementById('startQuizBtn').style.display = this.questions.length > 0 ? 'block' : 'none';

        document.getElementById('nextQuestionBtn').addEventListener('click', () => {
            this.nextQuestion();
        });
    }

    updateHeader() {
        const entries = this.entries.length;
        document.getElementById('headerLearned').textContent = entries;
    }

    render() {
        // Render journal entries
        const journalList = document.getElementById('journalList');
        journalList.innerHTML = this.entries.map(entry => {
            const difficultyBar = '█'.repeat(entry.difficulty) + '░'.repeat(10 - entry.difficulty);
            const diffLevel = entry.difficulty <= 3 ? 'Easy' : entry.difficulty <= 7 ? 'Medium' : 'Hard';
            return `
            <li class="journal-item">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <div class="journal-topic">${entry.topic}</div>
                        <div class="journal-notes">${entry.notes}</div>
                        <div class="journal-difficulty">🎯 Difficulty: ${diffLevel} (${entry.difficulty}/10)</div>
                        <div class="journal-date">${entry.date}</div>
                    </div>
                    <button class="btn-action delete" onclick="learningApp.deleteEntry(${entry.id})" style="margin-left: 10px;">🗑️</button>
                </div>
            </li>
        `}).join('');

        // Update quiz button visibility
        document.getElementById('startQuizBtn').style.display = this.questions.length > 0 ? 'block' : 'none';
    }

    save() {
        localStorage.setItem('journalEntries', JSON.stringify(this.entries));
        localStorage.setItem('quizQuestions', JSON.stringify(this.questions));
    }
}

// ============================================
// HABITS FUNCTIONALITY
// ============================================

class HabitsApp {
    constructor() {
        this.habits = JSON.parse(localStorage.getItem('habits')) || [];
        this.init();
    }

    init() {
        document.getElementById('addHabitBtn').addEventListener('click', () => this.addHabit());
        this.render();
    }

    addHabit() {
        const name = document.getElementById('habitName').value.trim();
        const frequency = document.getElementById('habitFrequency').value;

        if (!name || !frequency) {
            alert('Please fill in all fields');
            return;
        }

        this.habits.unshift({
            id: Date.now(),
            name,
            frequency,
            streak: 0,
            lastChecked: null,
            createdDate: new Date().toLocaleDateString()
        });

        document.getElementById('habitName').value = '';
        document.getElementById('habitFrequency').value = '';

        this.save();
        this.render();
    }

    deleteHabit(id) {
        this.habits = this.habits.filter(h => h.id !== id);
        this.save();
        this.render();
    }

    checkHabit(id) {
        const habit = this.habits.find(h => h.id === id);
        if (habit) {
            const today = new Date().toLocaleDateString();
            if (habit.lastChecked !== today) {
                habit.streak++;
                habit.lastChecked = today;
                this.save();
                this.render();
            }
        }
    }

    render() {
        const habitsList = document.getElementById('habitsList');
        const habitHistoryList = document.getElementById('habitHistoryList');

        habitsList.innerHTML = this.habits.map(habit => `
            <div class="habit-card">
                <div class="habit-name">${habit.name}</div>
                <div class="habit-frequency">${habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}</div>
                <div style="margin: 15px 0; color: var(--primary-green); font-weight: 700; font-size: 1.2em;">
                    🔥 ${habit.streak} day${habit.streak !== 1 ? 's' : ''}
                </div>
                <button class="habit-check-btn" onclick="habitsApp.checkHabit(${habit.id})">✓</button>
            </div>
        `).join('');

        habitHistoryList.innerHTML = this.habits.map(habit => `
            <li class="list-item">
                <div class="item-text">
                    <div class="item-text-main">${habit.name}</div>
                    <div class="item-text-date">
                        ${habit.frequency} • Streak: ${habit.streak} days • Created: ${habit.createdDate}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn-action delete" onclick="habitsApp.deleteHabit(${habit.id})">🗑️</button>
                </div>
            </li>
        `).join('');
    }

    save() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }
}

// ============================================
// TAB NAVIGATION
// ============================================

function initTabs() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.currentTarget.dataset.tab;

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            document.querySelectorAll('.nav-btn').forEach(navBtn => {
                navBtn.classList.remove('active');
            });

            document.getElementById(tabName).classList.add('active');
            e.currentTarget.classList.add('active');
        });
    });
}

// ============================================
// INITIALIZE APP
// ============================================

let todoApp;
let expenseTracker;
let learningApp;
let habitsApp;

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    todoApp = new TodoApp();
    expenseTracker = new ExpenseTracker();
    learningApp = new LearningApp();
    habitsApp = new HabitsApp();

    document.addEventListener('click', (e) => {
        if (e.target.id === 'nextQuestionBtn') {
            learningApp.nextQuestion();
        }
    });
});
