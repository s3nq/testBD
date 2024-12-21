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

	// Определяем тип ввода: радиокнопки или чекбоксы
	const inputType = q.allowMultiple ? 'checkbox' : 'radio'
	const nameAttr = q.allowMultiple
		? `question-${currentQuestion}`
		: `question-${currentQuestion}`

	container.innerHTML = `
        <div class="question">
            <h3>Вопрос ${currentQuestion + 1}: ${q.question}</h3>
            <form id="answer-form">
                <ul class="options">
                    ${shuffleArray([...q.options])
											.map(
												option =>
													`<li>
                                    <label>
                                        <input type="${inputType}" name="${nameAttr}" value="${escapeHtml(
														option
													)}">
                                        ${escapeHtml(option)}
                                    </label>
                                </li>`
											)
											.join('')}
                </ul>
                <div id="feedback" class="feedback"></div>
                <button type="button" onclick="submitAnswer()">Ответить</button>
            </form>
        </div>
    `

	// Обновляем текущий номер вопроса
	document.getElementById('current-question').textContent = currentQuestion + 1

	// Скрываем кнопку "Следующий вопрос" до выбора ответа
	document.getElementById('next-button').style.display = 'none'
}

// Функция для отправки ответа
// Функция для отправки ответа
function submitAnswer() {
	console.log('submitAnswer вызвана')
	const q = shuffledQuestions[currentQuestion]
	const feedback = document.getElementById('feedback')
	let selectedOptions = []

	if (q.allowMultiple) {
		const checkedBoxes = document.querySelectorAll(
			`input[name="question-${currentQuestion}"]:checked`
		)
		checkedBoxes.forEach(box => selectedOptions.push(box.value))
	} else {
		const selectedRadio = document.querySelector(
			`input[name="question-${currentQuestion}"]:checked`
		)
		if (selectedRadio) {
			selectedOptions.push(selectedRadio.value)
		}
	}

	if (selectedOptions.length === 0) {
		alert('Пожалуйста, выберите ответ.')
		return
	}

	// Проверка правильности ответа
	const correctAnswers = q.correctAnswers
	if (!correctAnswers || correctAnswers.length === 0) {
		feedback.style.color = 'red'
		feedback.textContent = 'Правильный ответ не указан.'
		return
	}
	const isCorrect = arraysEqual(selectedOptions.sort(), correctAnswers.sort())

	if (isCorrect) {
		feedback.style.color = 'green'
		feedback.textContent = 'Верно!'
		score++
	} else {
		feedback.style.color = 'red'
		feedback.textContent = `Неверно! Правильные ответы: ${correctAnswers.join(
			', '
		)}`
	}

	// Отключаем все поля ввода после ответа
	const inputs = document.querySelectorAll(`#answer-form input`)
	inputs.forEach(input => {
		input.disabled = true
		if (correctAnswers.includes(input.value)) {
			input.parentElement.style.color = 'green'
		}
		if (
			selectedOptions.includes(input.value) &&
			!correctAnswers.includes(input.value)
		) {
			input.parentElement.style.color = 'red'
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
	currentQuestion = 0
	score = 0
}

// Функция для перемешивания массива (Фишер-Йейтс)
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[array[i], array[j]] = [array[j], array[i]]
	}
	return array
}

// Функция для сравнения двух массивов
function arraysEqual(a, b) {
	if (a.length !== b.length) return false
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false
	}
	return true
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
