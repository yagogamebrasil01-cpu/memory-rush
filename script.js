// Memory Rush - Game State
let gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 0,
    moves: 0,
    timer: 0,
    timerInterval: null,
    isPlaying: false,
    difficulty: 'easy',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🦄', '🐝']
};

// DOM Elements
const menu = document.getElementById('menu');
const gameContainer = document.getElementById('gameContainer');
const gameBoard = document.getElementById('gameBoard');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const pairsDisplay = document.getElementById('pairs');
const victoryModal = document.getElementById('victoryModal');

// Difficulty Settings
const difficulties = {
    easy: { rows: 3, cols: 4, pairs: 6 },
    medium: { rows: 4, cols: 4, pairs: 8 },
    hard: { rows: 4, cols: 6, pairs: 12 }
};

// Start Game
function startGame(difficulty) {
    gameState.difficulty = difficulty;
    const config = difficulties[difficulty];
    gameState.totalPairs = config.pairs;
    
    menu.style.display = 'none';
    gameContainer.style.display = 'block';
    
    initGame(config);
    
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Initialize Game
function initGame(config) {
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.timer = 0;
    gameState.flippedCards = [];
    gameState.isPlaying = true;
    
    updateDisplays();
    createCards(config);
    startTimer();
}

// Create Cards
function createCards(config) {
    gameBoard.innerHTML = '';
    gameState.cards = [];
    
    const gameEmojis = gameState.emojis.slice(0, config.pairs);
    const cardPairs = [...gameEmojis, ...gameEmojis];
    
    // Fisher-Yates Shuffle
    for (let i = cardPairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }
    
    gameBoard.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    
    cardPairs.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'card hidden';
        card.dataset.index = index;
        card.dataset.emoji = emoji;
        card.textContent = emoji;
        card.onclick = () => flipCard(card);
        
        gameBoard.appendChild(card);
        gameState.cards.push(card);
    });
}

// Flip Card
function flipCard(card) {
    if (!gameState.isPlaying) return;
    if (card.classList.contains('flipped')) return;
    if (card.classList.contains('matched')) return;
    if (gameState.flippedCards.length >= 2) return;
    
    if (navigator.vibrate) {
        navigator.vibrate(30);
    }
    
    card.classList.remove('hidden');
    card.classList.add('flipped');
    gameState.flippedCards.push(card);
    
    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        updateDisplays();
        checkMatch();
    }
}

// Check Match
function checkMatch() {
    const [card1, card2] = gameState.flippedCards;
    const match = card1.dataset.emoji === card2.dataset.emoji;
    
    if (match) {
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            gameState.matchedPairs++;
            gameState.flippedCards = [];
            updateDisplays();
            
            if (navigator.vibrate) {
                navigator.vibrate([50, 100, 50]);
            }
            
            if (gameState.matchedPairs === gameState.totalPairs) {
                endGame();
            }
        }, 600);
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card1.classList.add('hidden');
            card2.classList.remove('flipped');
            card2.classList.add('hidden');
            gameState.flippedCards = [];
        }, 1000);
    }
}

// Start Timer
function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        updateTimerDisplay();
    }, 1000);
}

// Update Displays
function updateDisplays() {
    movesDisplay.textContent = gameState.moves;
    pairsDisplay.textContent = `${gameState.matchedPairs}/${gameState.totalPairs}`;
}

// Update Timer Display
function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timer / 60).toString().padStart(2, '0');
    const seconds = (gameState.timer % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
}

// End Game
function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.timerInterval);
    
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
    }
    
    document.getElementById('finalTime').textContent = timerDisplay.textContent;
    document.getElementById('finalMoves').textContent = gameState.moves;
    victoryModal.style.display = 'flex';
}

// Restart Game
function restartGame() {
    clearInterval(gameState.timerInterval);
    const config = difficulties[gameState.difficulty];
    initGame(config);
}

// Back to Menu
function backToMenu() {
    clearInterval(gameState.timerInterval);
    gameContainer.style.display = 'none';
    victoryModal.style.display = 'none';
    menu.style.display = 'block';
}

// Prevent double tap zoom on mobile
document.addEventListener('dblclick', function(event) {
    event.preventDefault();
}, { passive: false });
