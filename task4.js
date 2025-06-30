// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const finalScore = document.getElementById('finalScore');
const gameOverScreen = document.getElementById('gameOver');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Game parameters
const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPEED = 2;
const PIPE_FREQUENCY = 1500; // milliseconds

// Game state
let bird = {
    x: 100,
    y: canvas.height / 2,
    width: 40,
    height: 30,
    velocity: 0
};

let pipes = [];
let score = 0;
let gameRunning = false;
let animationId;
let lastPipeTime = 0;

// Event listeners
canvas.addEventListener('click', handleJump);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') handleJump();
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Game functions
function startGame() {
    // Reset game state
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    gameRunning = true;
    
    // Hide/show appropriate screens
    gameOverScreen.classList.add('hidden');
    startScreen.classList.add('hidden');
    
    // Start game loop
    lastPipeTime = Date.now();
    if (animationId) cancelAnimationFrame(animationId);
    gameLoop();
}

function handleJump() {
    if (!gameRunning) return;
    bird.velocity = JUMP_FORCE;
}

function createPipe() {
    const gapPosition = Math.random() * (canvas.height - PIPE_GAP - 100) + 50;
    
    pipes.push({
        x: canvas.width,
        topHeight: gapPosition,
        bottomY: gapPosition + PIPE_GAP,
        passed: false
    });
}

function update() {
    // Update bird position
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;
    
    // Check for collisions with top/bottom
    if (bird.y < 0 || bird.y + bird.height > canvas.height) {
        endGame();
        return;
    }
    
    // Create new pipes
    const currentTime = Date.now();
    if (currentTime - lastPipeTime > PIPE_FREQUENCY) {
        createPipe();
        lastPipeTime = currentTime;
    }
    
    // Update pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= PIPE_SPEED;
        
        // Check for collisions with pipes
        if (
            bird.x + bird.width > pipes[i].x && 
            bird.x < pipes[i].x + PIPE_WIDTH && 
            (bird.y < pipes[i].topHeight || bird.y + bird.height > pipes[i].bottomY)
        ) {
            endGame();
            return;
        }
        
        // Check if bird passed the pipe
        if (!pipes[i].passed && bird.x > pipes[i].x + PIPE_WIDTH) {
            pipes[i].passed = true;
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
        }
        
        // Remove pipes that are off screen
        if (pipes[i].x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
        }
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw bird
    ctx.fillStyle = '#f8d347';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    
    // Draw pipes
    ctx.fillStyle = '#5cb85c';
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, canvas.height - pipe.bottomY);
    });
}

function endGame() {
    gameRunning = false;
    finalScore.textContent = score;
    gameOverScreen.classList.remove('hidden');
    cancelAnimationFrame(animationId);
}

function gameLoop() {
    if (!gameRunning) return;
    
    update();
    draw();
    
    animationId = requestAnimationFrame(gameLoop);
}

// Initialize game
startScreen.classList.remove('hidden');