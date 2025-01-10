const board = document.getElementById('board');
const questionBox = document.getElementById('question-box');
const questionText = document.getElementById('question');
const answerInput = document.getElementById('answer-input');
const submitButton = document.getElementById('submit-answer');
const turnIndicator = document.getElementById('turn-indicator');

const rows = 6;
const cols = 7;
const boardArray = Array.from({ length: rows }, () => Array(cols).fill(''));

// Track game state
let currentPlayer = null; // 'red' or 'yellow'
let gameActive = true;

// Questions
const questions = [
    { question: "What is 10 - 7?", answer: "3" },
    { question: "Capital of France?", answer: "paris" },
    { question: "What is 7 * 8?", answer: "56" },
    { question: "Who wrote 'Hamlet'?", answer: "shakespeare" },
];

// Function to create the board
function createBoard() {
    board.innerHTML = ''; // Clear the board
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            board.appendChild(cell);
        }
    }
}

// Display question
let currentQuestion = null;
function displayQuestion() {
    const randomIndex = Math.floor(Math.random() * questions.length);
    currentQuestion = questions[randomIndex];
    questionText.textContent = currentQuestion.question;
    answerInput.value = '';
    turnIndicator.textContent = "Answer the question to play!";
}

// Handle answer
function handleAnswer() {
    if (!gameActive) return;

    const playerAnswer = answerInput.value.trim().toLowerCase();
    if (playerAnswer === currentQuestion.answer) {
        currentPlayer = currentPlayer || 'red'; // Set first player as red
        turnIndicator.textContent = `${currentPlayer === 'red' ? 'Player 1' : 'Player 2'}'s Turn!`;
        gameActive = false; // Disable further answers for this turn
    } else {
        alert("Wrong answer! Try again.");
    }
}

// Drop token
function dropToken(col) {
    if (!currentPlayer || !gameActive) return;

    for (let r = rows - 1; r >= 0; r--) {
        if (!boardArray[r][col]) {
            boardArray[r][col] = currentPlayer;
            const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${col}"]`);
            cell.classList.add(currentPlayer);
            if (checkWin(r, col)) {
                alert(`${currentPlayer.toUpperCase()} wins!`);
                resetGame();
                return;
            }
            currentPlayer = null; // Reset currentPlayer to await next question
            gameActive = true;
            displayQuestion();
            return;
        }
    }
    alert("Column is full!");
}

// Check win condition
function checkWin(row, col) {
    const directions = [
        { dr: -1, dc: 0 }, // vertical
        { dr: 0, dc: -1 }, // horizontal left
        { dr: 0, dc: 1 },  // horizontal right
        { dr: -1, dc: -1 }, // diagonal left up
        { dr: -1, dc: 1 },  // diagonal right up
    ];

    for (const { dr, dc } of directions) {
        let count = 1;
        for (let step = 1; step < 4; step++) {
            const nr = row + dr * step;
            const nc = col + dc * step;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || boardArray[nr]?.[nc] !== currentPlayer) break;
            count++;
        }
        for (let step = 1; step < 4; step++) {
            const nr = row - dr * step;
            const nc = col - dc * step;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || boardArray[nr]?.[nc] !== currentPlayer) break;
            count++;
        }
        if (count >= 4) return true;
    }
    return false;
}

// Reset game
function resetGame() {
    boardArray.forEach((row) => row.fill(''));
    currentPlayer = null;
    gameActive = true;
    createBoard();
    displayQuestion();
}

// Initialize
createBoard();
displayQuestion();

// Event listeners
submitButton.addEventListener('click', handleAnswer);
board.addEventListener('click', (e) => {
    if (!e.target.classList.contains('cell')) return;
    const col = parseInt(e.target.dataset.col);
    dropToken(col);
});
