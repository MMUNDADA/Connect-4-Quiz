const BASE_URL = "https://connect-4-quiz-backend.onrender.com"; 
const BASE_URL = "https://your-backend-service.onrender.com"; // Replace with your backend URL
const board = document.getElementById('board');
const questionBox = document.getElementById('question-box');
const questionText = document.getElementById('question');
const answerInput = document.getElementById('answer-input');
const submitButton = document.getElementById('submit-answer');
const turnIndicator = document.getElementById('turn-indicator');
const playerNamesSection = document.getElementById('player-names');
const startGameButton = document.getElementById('start-game');
const gameSection = document.getElementById('game');
const player1NameInput = document.getElementById('player1-name');
const player2NameInput = document.getElementById('player2-name');

const rows = 6;
const cols = 7;
const boardArray = Array.from({ length: rows }, () => Array(cols).fill(''));

// Track game state
let currentPlayer = null; // 'red' or 'yellow'
let gameActive = true;
let player1Name = "Player 1";
let player2Name = "Player 2";

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

// Fetch a question from the backend
async function fetchQuestion() {
    try {
        const response = await fetch(`${BASE_URL}/get-question`);
        const data = await response.json();
        if (data.question) {
            questionText.textContent = data.question;
            turnIndicator.textContent = "Answer the question to play!";
            answerInput.value = '';
            gameActive = true;
        } else {
            alert("No more questions available!");
            resetGame();
        }
    } catch (error) {
        console.error("Error fetching question:", error);
        alert("Could not fetch question. Please try again later.");
    }
}

// Submit answer to the backend
async function submitAnswer() {
    if (!gameActive) return;

    const playerAnswer = answerInput.value.trim().toLowerCase();
    try {
        const response = await fetch(`${BASE_URL}/submit-answer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answer: playerAnswer }),
        });
        const data = await response.json();

        if (data.correct) {
            currentPlayer = currentPlayer || 'red'; // Set first player as red
            const playerName = currentPlayer === 'red' ? player1Name : player2Name;
            turnIndicator.textContent = `${playerName}'s Turn!`;
            gameActive = false; // Allow token drop
        } else {
            alert("Wrong answer! Try again.");
        }
    } catch (error) {
        console.error("Error submitting answer:", error);
        alert("Could not validate your answer. Please try again later.");
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
                const winnerName = currentPlayer === 'red' ? player1Name : player2Name;
                alert(`${winnerName.toUpperCase()} wins!`);
                resetGame();
                return;
            }
            currentPlayer = null; // Reset currentPlayer to await next question
            gameActive = true;
            fetchQuestion(); // Fetch the next question
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
    fetchQuestion();
}

// Start the game
function startGame() {
    player1Name = player1NameInput.value.trim() || "Player 1";
    player2Name = player2NameInput.value.trim() || "Player 2";

    playerNamesSection.style.display = "none";
    gameSection.style.display = "block";
    createBoard();
    fetchQuestion();
}

// Event listeners
startGameButton.addEventListener('click', startGame);
submitButton.addEventListener('click', submitAnswer);
board.addEventListener('click', (e) => {
    if (!e.target.classList.contains('cell')) return;
    const col = parseInt(e.target.dataset.col);
    dropToken(col);
});
