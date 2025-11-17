let tests = [];
let currentTest = null;
let currentTestNumber = 0;
let currentQuestionIndex = 0;
let userAnswers = [];
let testResults = [];

document.addEventListener('DOMContentLoaded', () => {
    tests = generateTests();
    
    document.querySelectorAll('.test-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const testNum = parseInt(e.target.dataset.test);
            startTest(testNum);
        });
    });
    
    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion();
        }
    });
    
    document.getElementById('next-btn').addEventListener('click', () => {
        if (currentQuestionIndex < currentTest.length - 1) {
            currentQuestionIndex++;
            showQuestion();
        } else {
            finishTest();
        }
    });
    
    document.getElementById('finish-btn').addEventListener('click', () => {
        finishTest();
    });
    
    document.getElementById('back-to-tests').addEventListener('click', () => {
        showTestSelection();
    });
});

function startTest(testNumber) {
    currentTestNumber = testNumber;
    currentTest = tests[testNumber - 1];
    currentQuestionIndex = 0;
    userAnswers = new Array(currentTest.length).fill(null);
    testResults = [];
    
    document.getElementById('test-selection').classList.add('hidden');
    document.getElementById('test-screen').classList.remove('hidden');
    document.getElementById('results-screen').classList.add('hidden');
    
    document.getElementById('test-title').textContent = `Тест ${testNumber}`;
    
    showQuestion();
}

function showQuestion() {
    const question = currentTest[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex];
    
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    document.getElementById('total-questions').textContent = currentTest.length;
    
    const progress = ((currentQuestionIndex + 1) / currentTest.length) * 100;
    document.getElementById('progress').style.width = progress + '%';
    
    document.getElementById('question-text').textContent = `${currentQuestionIndex + 1}. ${question.question}`;
    
    const answersContainer = document.getElementById('answers-container');
    answersContainer.innerHTML = '';
    
    question.answers.forEach((answer, index) => {
        const answerDiv = document.createElement('div');
        answerDiv.className = 'answer-option';
        
        const letter = String.fromCharCode(65 + index);
        answerDiv.textContent = `${letter}. ${answer}`;
        answerDiv.dataset.index = index;
        
        if (userAnswer !== null) {
            answerDiv.classList.add('disabled');
            
            if (index === userAnswer) {
                answerDiv.classList.add('selected');
            }
            
            if (index === question.correct) {
                answerDiv.classList.add('correct');
            } else if (index === userAnswer && userAnswer !== question.correct) {
                answerDiv.classList.add('incorrect');
            }
        } else {
            answerDiv.addEventListener('click', () => selectAnswer(index));
        }
        
        answersContainer.appendChild(answerDiv);
    });
    
    const resultMessage = document.getElementById('result-message');
    if (userAnswer !== null) {
        const isCorrect = userAnswer === question.correct;
        resultMessage.textContent = isCorrect 
            ? '✓ Правильно!' 
            : `✗ Неправильно. Правильный ответ: ${String.fromCharCode(65 + question.correct)}. ${question.answers[question.correct]}`;
        resultMessage.className = `result-message ${isCorrect ? 'correct' : 'incorrect'}`;
    } else {
        resultMessage.textContent = '';
        resultMessage.className = 'result-message';
    }
    
    document.getElementById('prev-btn').disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === currentTest.length - 1) {
        document.getElementById('next-btn').classList.add('hidden');
        document.getElementById('finish-btn').classList.remove('hidden');
    } else {
        document.getElementById('next-btn').classList.remove('hidden');
        document.getElementById('finish-btn').classList.add('hidden');
    }
}

function selectAnswer(answerIndex) {
    if (userAnswers[currentQuestionIndex] !== null) {
        return;
    }
    
    const question = currentTest[currentQuestionIndex];
    userAnswers[currentQuestionIndex] = answerIndex;
    
    const isCorrect = answerIndex === question.correct;
    testResults[currentQuestionIndex] = {
        question: question.question,
        userAnswer: answerIndex,
        correctAnswer: question.correct,
        isCorrect: isCorrect,
        answers: question.answers
    };
    
    showQuestion();
}

function finishTest() {
    const unansweredCount = userAnswers.filter(a => a === null).length;
    
    if (unansweredCount > 0) {
        if (!confirm(`Вы не ответили на ${unansweredCount} вопросов. Завершить тест?`)) {
            return;
        }
    }
    
    const correctCount = testResults.filter(r => r && r.isCorrect).length;
    const incorrectCount = testResults.length - correctCount;
    const percentage = Math.round((correctCount / currentTest.length) * 100);
    
    document.getElementById('test-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');
    
    document.getElementById('correct-count').textContent = correctCount;
    document.getElementById('incorrect-count').textContent = incorrectCount;
    document.getElementById('percentage').textContent = percentage + '%';
    
    const resultsDetails = document.getElementById('results-details');
    resultsDetails.innerHTML = '';
    
    currentTest.forEach((question, index) => {
        const result = testResults[index];
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${result && result.isCorrect ? 'correct' : 'incorrect'}`;
        
        const status = result && result.isCorrect ? 'Правильно' : 'Неправильно';
        const statusClass = result && result.isCorrect ? 'correct' : 'incorrect';
        
        const userAnswerText = result 
            ? `${String.fromCharCode(65 + result.userAnswer)}. ${result.answers[result.userAnswer]}`
            : 'Не отвечено';
        
        const correctAnswerText = `${String.fromCharCode(65 + question.correct)}. ${question.answers[question.correct]}`;
        
        resultItem.innerHTML = `
            <div class="result-item-header">
                <span class="result-item-number">Вопрос ${index + 1}</span>
                <span class="result-item-status ${statusClass}">${status}</span>
            </div>
            <div class="result-item-question">${question.question}</div>
            <div class="result-item-answer">
                <strong>Ваш ответ:</strong> ${userAnswerText}<br>
                <strong>Правильный ответ:</strong> ${correctAnswerText}
            </div>
        `;
        
        resultsDetails.appendChild(resultItem);
    });
}

function showTestSelection() {
    document.getElementById('test-selection').classList.remove('hidden');
    document.getElementById('test-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.add('hidden');
}

