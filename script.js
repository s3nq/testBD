let currentQuestion = 0
let tests = []
let selectedTest = null
let score = 0
let shuffledQuestions = []

// Загрузка тестов из JSON файла
fetch('tests.json')
	.then(response => response.json())
	.then(data => {
		tests = data.tests
		populateTestSelection()
	})
	.catch(error => console.error('Ошибка загрузки тестов:', error))

// Функция для заполнения выпадающего списка тестов
function populateTestSelection() {
	const testSelect = document.getElementById('test-select')
	tests.forEach(test => {
		const option = document.createElement('option')
		option.value = test.testId
		option.textContent = test.testName
		testSelect.appendChild(option)
	})
}

// Функция для начала теста
function startTest() {
	const testId = parseInt(document.getElementById('test-select').value)
	if (isNaN(testId)) {
		alert('Пожалуйста, выберите тест.')
		return
	}

	selectedTest = tests.find(test => test.testId === testId)
	if (!selectedTest) {
		alert('Выбранный тест не найден.')
		return
	}

	document.getElementById('test-selection').style.display = 'none'
	document.getElementById('test-container').style.display = 'block'
	document.getElementById('next-button').style.display = 'none'
	currentQuestion = 0
	score = 0

	// Перемешиваем вопросы
	shuffledQuestions = shuffleArray([...selectedTest.questions])

	// Обновляем общее количество вопросов
	document.getElementById('total-questions').textContent =
		shuffledQuestions.length

	displayQuestion()
}

// Функция для отображения текущего вопроса
function displayQuestion() {
	if (currentQuestion >= shuffledQuestions.length) {
		displayResult()
		return
	}

	const q = shuffledQuestions[currentQuestion]
	const container = document.getElementById('question-container')
	container.innerHTML = `
        <div class="question">
            <h3>Вопрос ${currentQuestion + 1}: ${q.question}</h3>
            <ul class="options">
                ${shuffleArray([...q.options])
									.map(
										option =>
											`<li><button onclick="checkAnswer('${escapeHtml(
												option
											)}')">${escapeHtml(option)}</button></li>`
									)
									.join('')}
            </ul>
            <div id="feedback" class="feedback"></div>
        </div>
    `

	// Обновляем текущий номер вопроса
	document.getElementById('current-question').textContent = currentQuestion + 1

	// Скрываем кнопку "Следующий вопрос" до выбора ответа
	document.getElementById('next-button').style.display = 'none'
}

// Функция для проверки ответа
function checkAnswer(selected) {
	const q = shuffledQuestions[currentQuestion]
	const feedback = document.getElementById('feedback')
	const correct = q.correctAnswer

	if (selected === correct) {
		feedback.style.color = 'green'
		feedback.textContent = 'Верно!'
		score++
	} else {
		feedback.style.color = 'red'
		feedback.textContent = `Неверно! Правильный ответ: ${correct}`
	}

	const buttons = document.querySelectorAll('.options button')
	buttons.forEach(button => {
		button.disabled = true
		if (button.textContent === correct) {
			button.classList.add('correct')
		}
		if (button.textContent === selected && selected !== correct) {
			button.classList.add('incorrect')
		}
	})

	// Показываем кнопку "Следующий вопрос"
	document.getElementById('next-button').style.display = 'block'
}

// Функция для загрузки следующего вопроса
function loadNextQuestion() {
	currentQuestion++
	displayQuestion()
}

// Функция для отображения результата
function displayResult() {
	const container = document.getElementById('test-container')
	container.innerHTML = `
        <h2>Тест завершен!</h2>
        <p>Ваш результат: ${score} из ${shuffledQuestions.length}</p>
        <button onclick="restartTest()">Пройти снова</button>
    `
}

// Функция для перезапуска теста
function restartTest() {
	document.getElementById('test-container').style.display = 'none'
	document.getElementById('test-selection').style.display = 'block'
	document.getElementById('question-container').innerHTML = ''
	document.getElementById('next-button').style.display = 'none'
	// Сброс прогресса
	document.getElementById('current-question').textContent = '0'
	document.getElementById('total-questions').textContent = '0'
}

// Функция для перемешивания массива (Фишер-Йейтс)
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[array[i], array[j]] = [array[j], array[i]]
	}
	return array
}

// Функция для экранирования HTML-сущностей
function escapeHtml(text) {
	const map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;',
	}
	return text.replace(/[&<>"']/g, function (m) {
		return map[m]
	})
}
