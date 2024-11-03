const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const playerImage = new Image();
playerImage.src = 'player.png'; // Replace with your player image path

const itemImage = new Image();
itemImage.src = 'item.png'; // Replace with your item image path

const obstacleImage = new Image();
obstacleImage.src = 'obstacle.png'; // Replace with your obstacle image path

const backgroundImage = new Image();
backgroundImage.src = 'background.jpg'; // Replace with your background image path

// Load background music
const backgroundMusic = new Audio('background-music.mp3'); // Replace with your audio file path
backgroundMusic.loop = true; // Loop the music

let player = { x: 50, y: 300, size: 20, speed: 5 };
let items = [];
let score = 0;
let hijacked = false;
let hijackCooldown = false; // New variable to track cooldown

// Function to generate a new item at a random position
function generateItem() {
    const x = Math.floor(Math.random() * (canvas.width - 20)); // Random x position
    const y = Math.floor(Math.random() * (canvas.height - 20)); // Random y position
    items.push({ x: x, y: y, collected: false });
}

// Initial item generation
for (let i = 0; i < 3; i++) { // Generate 3 initial items
    generateItem();
}

let obstacles = [
    { x: 300, y: 250, width: 30, height: 30, dx: 2 }, // Existing moving obstacle
    { x: 500, y: 250, width: 30, height: 30, dx: -2 }, // Existing moving obstacle
    { x: 100, y: 400, width: 30, height: 30, dx: 3 }, // Existing moving obstacle
    { x: 600, y: 100, width: 30, height: 30, dx: -3 }, // New moving obstacle
    { x: 200, y: 350, width: 30, height: 30, dx: 4 }, // New moving obstacle
    { x: 400, y: 450, width: 30, height: 30, dx: -4 }, // New moving obstacle
    { x: 700, y: 50, width: 30, height: 30, dx: -5 }, // Additional moving obstacle
    { x: 50, y: 300, width: 30, height: 30, dx: -2 }   // Additional moving obstacle
];

// Draw the background image
function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

// Draw the player using an image
function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.size, player.size);
}

// Draw the items using an image
function drawItems() {
    items.forEach(item => {
        if (!item.collected) {
            ctx.drawImage(itemImage, item.x, item.y, 20, 20);
        }
    });
}

// Draw obstacles using an image
function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// Check for collisions with items
function checkItemCollisions() {
    items.forEach(item => {
        if (!item.collected && 
            player.x < item.x + 20 && 
            player.x + player.size > item.x && 
            player.y < item.y + 20 && 
            player.y + player.size > item.y) {
            item.collected = true;
            score++;
            generateItem(); // Generate a new item when one is collected
        }
    });
}

// Check for collisions with obstacles and handle responses
function checkObstacleCollisions() {
    obstacles.forEach(obstacle => {
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.size > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.size > obstacle.y) {
            if (!hijacked && !hijackCooldown) { // Only trigger if not already hijacked
                hijacked = true; // Activate hijack mode
                hijackCooldown = true; // Start cooldown

                // Reduce score on collision
                score -= 1;

                setTimeout(() => { 
                    hijacked = false; // Reset hijack state after some time
                    hijackCooldown = false; // Reset cooldown state
                }, 2000); 
                
                // Visual feedback (flashing effect)
                setTimeout(() => {
                    ctx.fillStyle = '#FF0000'; // Flash red color for feedback
                    ctx.fillRect(player.x, player.y, player.size, player.size);
                    setTimeout(() => {
                        ctx.clearRect(player.x, player.y, player.size, player.size); // Clear flash
                        drawPlayer(); // Redraw original player after flash
                    }, 200);
                }, 0);
            }
        }
    });
}

// Update the game state
function update() {
    drawBackground(); // Draw background first

    drawPlayer();
    drawItems();
    drawObstacles();
    
    checkItemCollisions();
    checkObstacleCollisions();

    // Display Score
    ctx.fillStyle = '#000000'; // Black for score text
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);

    // Move obstacles
    obstacles.forEach(obstacle => {
        obstacle.x += obstacle.dx;

        // Reverse direction if hitting canvas edges
        if (obstacle.x <= 0 || obstacle.x >= canvas.width - obstacle.width) {
            obstacle.dx *= -1;
        }
    });
}

// Move the player based on keyboard input
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            if (player.y > 0) player.y -= player.speed; 
            break;
        case 'ArrowDown':
            if (player.y < canvas.height - player.size) player.y += player.speed; 
            break;
        case 'ArrowLeft':
            if (player.x > 0) player.x -= player.speed; 
            break;
        case 'ArrowRight':
            if (player.x < canvas.width - player.size) player.x += player.speed; 
            break;
    }
});

// Start the game loop when images are loaded and play background music
let imagesLoaded = false;

function checkImagesLoaded() {
    if (playerImage.complete && itemImage.complete && obstacleImage.complete && backgroundImage.complete) {
        imagesLoaded = true;
        backgroundMusic.play(); // Start playing background music when images are loaded.
        setInterval(update, 1000 / 30); 
    } else {
        requestAnimationFrame(checkImagesLoaded);
    }
}

checkImagesLoaded();