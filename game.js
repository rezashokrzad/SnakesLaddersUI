// Board size constants
const boardSize = 10;
const squareSize = 50;  // Each square is 50px by 50px

// Initialize the board and player
function initBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';  // Clear any existing board cells
    
    // Create a 10x10 grid of squares
    for (let i = 100; i > 0; i--) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.id = `square-${i}`;
        
        const { gridRow, gridCol } = getRealPosition(i);
        square.style.gridRow = gridRow;
        square.style.gridColumn = gridCol;

        square.addEventListener('mousedown', handleClickOrTouch);
        square.addEventListener('touchstart', handleClickOrTouch);
        
        function handleClickOrTouch(event) {
            event.preventDefault();
        
            // Check if the square is marked as occupied
            if (square.classList.contains('occupied')) {
                alert(`You clicked on cell number ${i} occupied by player.`);
                console.log(`Square ${i} clicked with player item present.`);
            } else {
                console.log(`Square ${i} clicked but no player item present.`);
            }
        }
        
        
        board.appendChild(square);
    }
    updateBoardSize();

}


function initializeGame() {
    const { initPositions, itemCounts, movements, outItems } = getUrlParams();

    
    // Remove existing player elements
    const existingPlayers = document.querySelectorAll('.player');
    existingPlayers.forEach(player => player.remove());
    
    const players = [];
    let currentInitIndex = 0;  // Tracks the current position being assigned

    // Iterate over the number of items for each player as indicated by the clr parameter
    for (let playerId = 0; playerId < itemCounts.length; playerId++) {
        const itemCount = itemCounts[playerId];  // Number of items for this player
        
        // Create the player with the correct class (e.g., player1, player2, etc.)
        const player = new Player(playerId + 1, `player${playerId + 1}`);

        // Create and assign each item for the player
        for (let j = 0; j < itemCount; j++) {
            if (initPositions[currentInitIndex] !== undefined) {
                player.createItemDiv(initPositions[currentInitIndex]);  // Set the item's initial position
                currentInitIndex++;  // Move to the next position
            }
        }

        players.push(player);  // Add the player to the list of players
    }

    // Apply the movement logic after all players and items are initialized
    handleMovements(players, movements, initPositions);

    // Handle displaying finished items
    updateFinishedItems(players, outItems);
    updatePlayerSizes();
}

// Update this function to handle responsive sizing
function updateBoardSize() {
    const container = document.querySelector('.container');
    const board = document.getElementById('board');
    const finishedItems = document.getElementById('finished-items');

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const finishedItemsHeight = finishedItems.offsetHeight;

    const boardWidth = containerWidth;
    const boardHeight = containerHeight - finishedItemsHeight;

    board.style.width = `${boardWidth}px`;
    board.style.height = `${boardHeight}px`;

    // Update the cell size
    const cellWidth = boardWidth / 10;
    const cellHeight = boardHeight / 10;
    document.documentElement.style.setProperty('--cell-width', `${cellWidth}px`);
    document.documentElement.style.setProperty('--cell-height', `${cellHeight}px`);

    // Update the size of each cell to ensure they are rectangular
    const squares = board.querySelectorAll('.square');
    squares.forEach(square => {
        square.style.width = `${cellWidth}px`;
        square.style.height = `${cellHeight}px`;
    });

    // Update player sizes and positions
    updatePlayerSizes();
}

function updatePlayerSizes() {
    const cellWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-width'));
    const cellHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-height'));
    const playerSize = Math.min(cellWidth, cellHeight) * 0.8; // 80% of the smaller dimension

    const players = document.querySelectorAll('.player');
    players.forEach(player => {
        player.style.width = `${playerSize}px`;
        player.style.height = `${playerSize}px`;
        updatePlayerPosition(player);
    });
}

function updatePlayerPosition(playerElement) {
    const position = parseInt(playerElement.getAttribute('data-position'));
    const { gridRow, gridCol } = getRealPosition(position);

    const cellWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-width'));
    const cellHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-height'));
    const playerSize = Math.min(cellWidth, cellHeight) * 0.8;

    const offsetX = (cellWidth - playerSize) / 2;
    const offsetY = (cellHeight - playerSize) / 2;
    
    playerElement.style.top = `${(gridRow - 1) * cellHeight + offsetY}px`;
    playerElement.style.left = `${(gridCol - 1) * cellWidth + offsetX}px`;
    
}

// Convert a board position to the corresponding grid row and column
function getRealPosition(position) {
    const row = Math.ceil(position / boardSize);
    let col = position % boardSize || boardSize;
    if (row % 2 === 0) col = boardSize + 1 - col;  // Zigzag movement for snakes/ladders
    return { gridRow: boardSize + 1 - row, gridCol: col };
}

// Function to retrieve URL parameters and return as an object
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const init = urlParams.get('init');  // Initial positions of the items
    const clr = urlParams.get('clr');    // Number of items for each player
    const mov = urlParams.get('mov');    // Movement commands
    const out = urlParams.get('out');    // Players/items that finished


    // Convert URL parameters into arrays
    const initPositions = init ? init.split(',').map(Number) : [];
    const itemCounts = clr ? clr.split(',').map(Number) : [];
    const movements = mov ? mov.split(',').map(Number) : [];
    const outItems = out ? out.split(',').map(Number) : [];

    return { initPositions, itemCounts, movements, outItems };
}

// Player class to handle player items and movements
class Player {
    constructor(id, colorClass) {
        this.id = id;
        this.items = [];  // Player can have multiple items on the board
        this.colorClass = colorClass;  // CSS class for the player's color
    }

}

// Extending the Player class to include createItemDiv
Player.prototype.createItemDiv = function(position) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('player', this.colorClass);  // Use player color class based on player number
    itemDiv.setAttribute('data-position', position);  // Track the position of each item
    itemDiv.setAttribute('data-id', `${this.id}-${this.items.length}`); // Unique ID based on player and item count

    document.getElementById('board').appendChild(itemDiv);
    this.move(itemDiv, position);  // Move item to its initial position
    this.items.push(itemDiv);  // Add the item to the player's item array
};

// Add the move function or other prototypes here
Player.prototype.move = function(itemDiv, newPosition) {
    const oldPosition = itemDiv.getAttribute('data-position');
    // Remove the player indicator from the old position square
    if (oldPosition) {
        document.getElementById(`square-${oldPosition}`).classList.remove('occupied');
    }
    itemDiv.setAttribute('data-position', newPosition);
    document.getElementById(`square-${newPosition}`).classList.add('occupied');
    itemDiv.style.zIndex = '20';
    updatePlayerPosition(itemDiv);

    
};

Player.prototype.moveStepByStep = function(itemDiv, currentPosition, targetPosition, callback) {
    const step = () => {
        if (currentPosition === targetPosition) {
            if (callback) {
                setTimeout(callback, 300);  // Call the callback once the step-by-step movement completes
                callback();
            }
            return;
        }

        currentPosition += currentPosition < targetPosition ? 1 : -1;
        const { gridRow, gridCol } = getRealPosition(currentPosition);

        // Get the current cell dimensions
        const cellWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-width'));
        const cellHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-height'));
        const playerSize = Math.min(cellWidth, cellHeight) * 0.8; // Keep player size proportionate to cell size

        // Center the player in the new cell
        const offsetX = (cellWidth - playerSize) / 2;
        const offsetY = (cellHeight - playerSize) / 2;

        // Apply the new position and size
        itemDiv.style.transition = "top 0.3s ease, left 0.3s ease";
        itemDiv.style.width = `${playerSize}px`;
        itemDiv.style.height = `${playerSize}px`;
        itemDiv.style.top = `${(gridRow - 1) * cellHeight + offsetY}px`;
        itemDiv.style.left = `${(gridCol - 1) * cellWidth + offsetX}px`;

        itemDiv.setAttribute('data-position', currentPosition);  // Update the player's position attribute

        playStepSound();
        // Delay to simulate step-by-step movement
        setTimeout(() => step(), 500);  // 300ms delay for each step
    };

    step();  // Start the step-by-step movement
};


Player.prototype.moveSmooth = function(itemDiv, targetPosition, callback) {
    const { gridRow, gridCol } = getRealPosition(targetPosition);

    // Get the current cell dimensions to ensure consistency with responsive design
    const cellWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-width'));
    const cellHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-height'));
    const playerSize = Math.min(cellWidth, cellHeight) * 0.8; // Keep player size proportionate to cell size
    
    // Recalculate the offset to center the player
    const offsetX = (cellWidth - playerSize) / 2;
    const offsetY = (cellHeight - playerSize) / 2;

    // Apply smooth CSS transitions for the movement
    itemDiv.style.transition = "top 1.0s ease, left 1.0s ease";
    itemDiv.style.width = `${playerSize}px`;
    itemDiv.style.height = `${playerSize}px`;
    itemDiv.style.top = `${(gridRow - 1) * cellHeight + offsetY}px`;
    itemDiv.style.left = `${(gridCol - 1) * cellWidth + offsetX}px`;
    itemDiv.setAttribute('data-position', targetPosition); // Update the position attribute

    // Play smooth movement sound
    playSmoothSound();

    // Call the callback once the smooth movement is complete
    setTimeout(() => {
        if (callback) callback();  // Execute the callback after smooth movement completes
    }, 1000);  // Movement duration (500ms)
};

// Handle movements of the players' items with animation
function handleMovements(players, movements) {
    let movementIndex = 0;
    const { initPositions } = getUrlParams(); 
    
    function moveNext() {
        if (movementIndex >= movements.length - 1) {
            console.log("All movements processed");
            return;
          }

        const currentMove = movements[movementIndex];
        const nextMove = movements[movementIndex + 1] || currentMove;
        const finalMove = movements[movementIndex + 2] || nextMove;

        console.log(`Processing move: ${currentMove} to ${nextMove}`);

        for (const player of players) {
            for (let i = 0; i < player.items.length; i++) {
                const currentPosition = parseInt(player.items[i].getAttribute('data-position'));

                if (currentPosition === currentMove) {
                    // Step-by-step movement
                    player.moveStepByStep(player.items[i], currentMove, nextMove, () => {
                        // Check if there's a ladder/snake jump
                        checkForCollisions(nextMove, initPositions, player.items[i]);

                        if (finalMove && Math.abs(finalMove - nextMove) > 1) {

                            if (finalMove < nextMove) {
                                playSnakeSound();  // Play snake sound when going down
                            } else if (finalMove > nextMove) {
                                playLadderSound();  // Play ladder sound when going up
                            }

                            // Smooth movement for ladder/snake
                            player.moveSmooth(player.items[i], finalMove, () => {

                                checkForCollisions(finalMove, initPositions, player.items[i]);

                                if (nextMove === 100)  {
                                    console.log("Processing final move to 100! 1");
                                    checkForWin(nextMove);  // Trigger win condition for move 100
                                }
                                movementIndex += 2;
                                moveNext();
                            });
                        } else {

                            checkForCollisions(nextMove, initPositions);

                            if (nextMove === 100)  {
                                console.log("Processing final move to 100! 2");
                                checkForWin(nextMove);
                            }
                            movementIndex++;
                            moveNext();
                        }
                    });
                    return;
                }
            }
        }

        // If no movement was made, move to the next set
        movementIndex++;
        moveNext();
    }

    // Start processing the movements after a short delay
    setTimeout(() => {
        moveNext();
    }, 500);
}

function checkForCollisions(finalMove, initPositions, arrivingItem) {
    initPositions.forEach((initPosition, index) => {
        if (finalMove === initPosition) {
            // Find the item currently at this position excluding the arriving one
            const existingItem = document.querySelector(
                `.player[data-position="${initPosition}"]:not([data-id="${arrivingItem.getAttribute('data-id')}"])`
            );
            // If an existing item is found, remove it since the new item is taking its place
            if (existingItem) {
                existingItem.style.transition = 'opacity 1s';
                existingItem.style.opacity = '0';
                setTimeout(() => existingItem.remove(), 200); // Remove the old item from the board
            }
        }
    });
}



function showRemovalPopup(itemId) {
    // Create the popup div
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.textContent = `Item ${itemId} should be removed`;

    // Style the popup (you can adjust these styles as needed)
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.padding = '20px';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    popup.style.color = 'white';
    popup.style.fontSize = '20px';
    popup.style.borderRadius = '10px';
    popup.style.zIndex = '9999';

    // Add the popup to the document
    document.body.appendChild(popup);

    // Remove the popup after 3 seconds
    setTimeout(() => {
        popup.remove();
    }, 3000);
}


function updateFinishedItems(players, outItems) {
    const finishedContainer = document.getElementById('finished-items');
    finishedContainer.innerHTML = '';  // Clear the current finished items

    const { movements } = getUrlParams();  // Get the movements array from the URL parameters
    // Check the last number in the movements array
    const lastMove = movements[movements.length - 1];  // Get the last movement
    if (outItems.length === 0) {
        console.log("No items out yet, but still checking for win condition.");
    }

    console.log("Last move: ", lastMove);  // This should log 100
    // Loop over the "out" items and add them to the finished section
    outItems.forEach(outPlayerId => {
        const player = players.find(p => p.id === outPlayerId);
        if (player && player.items.length > 0) {
            const finishedItem = player.items.pop();  // Remove the item from the board
            finishedItem.style.position = 'relative';  // Ensure relative positioning in new container
            finishedContainer.appendChild(finishedItem);  // Add it to the top section
            console.log("Moved item to finished-items:", finishedItem);  // Inspect the element

            // Only call checkForWin if the last move is 100
        }
    });
    if (lastMove === 100) {
        checkForWin(lastMove);
    }
}

function checkForWin(position) {
    console.log("Checking for win, position:", position);
    if (position === 100) {
        const { gridRow, gridCol } = getRealPosition(100);
        const x = (gridCol - 1) * squareSize + squareSize / 2;
        const y = (gridRow - 1) * squareSize + squareSize / 2;
        

        // Delay a bit to allow the movement to complete
        setTimeout(() => {
            // Create multiple fireworks
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    createFirework(x, y);
                }, i * 200);
            }

            showCelebrationMessage();
            playVictorySound();
        }, 4000);  // Adjust the timing for better synchronization
    }
}

function createFirework(x, y) {
    const colors = ['#ff0', '#f0f', '#0ff', '#f00', '#0f0', '#00f'];
    for (let i = 0; i < 30; i++) {
      const firework = document.createElement('div');
      firework.className = 'firework';
      firework.style.left = `${x+700}px`;
      firework.style.top = `${y+450}px`;
      firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      firework.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(firework);
  
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 50;
      const duration = Math.random() * 0.5 + 0.5;
      firework.animate([
        { transform: `translate(0, 0) scale(0)` },
        { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(1)` }
      ], {
        duration: duration * 3000,
        easing: 'cubic-bezier(0,0,0.2,1)'
      }).onfinish = () => firework.remove();
    }
  }
  
function showCelebrationMessage() {
    console.log("Showing celebration message");
    const overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';

    const message = document.createElement('div');
    message.className = 'celebration-message';
    message.textContent = '... هورا';

    overlay.appendChild(message);
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.remove();
    }, 3000);
  }



// Function to play victory sound (only if the user has interacted)
function playVictorySound() {
    if (!userHasInteracted) {
        console.error('Victory sound cannot be played, user has not interacted with the page.');
        return;
    }
    
    const victorySound = document.getElementById('victory-sound');
    victorySound.play().catch(error => {
        console.error("Failed to play victory sound", error);
    });
}


function playStepSound() {
    const stepSound = document.getElementById('step-sound');
    stepSound.play().catch(error => {
        console.error("Failed to play step sound", error);
    });
}

function playSmoothSound() {
    const smoothSound = document.getElementById('smooth-sound');
    smoothSound.play().catch(error => {
        console.error("Failed to play smooth movement sound", error);
    });
}

function playSnakeSound() {
    const snakeSound = document.getElementById('snake-sound');
    snakeSound.play().catch(error => {
        console.error("Failed to play snake sound", error);
    });
}

function playLadderSound() {
    const ladderSound = document.getElementById('ladder-sound');
    ladderSound.play().catch(error => {
        console.error("Failed to play ladder sound", error);
    });
}


let userHasInteracted = false;

function enableSoundOnInteraction() {
    document.addEventListener('click', () => {
        // userHasInteracted = true;
        const victorySound = document.getElementById('victory-sound');
        victorySound.play().then(() => {
            victorySound.pause();  // Pause immediately after ensuring it's allowed to play
            victorySound.currentTime = 0;  // Reset playback to the beginning
        }).catch(error => {
            console.error("Sound activation failed:", error);
        });
    }, { once: true });  // Only trigger this handler once, on the first click
}

// Add event listener for window resize
window.addEventListener('resize', () => {
    updateBoardSize();
});

// Initialize the board and start the game
initBoard();
initializeGame();
enableSoundOnInteraction();  // Call this on game initialization
updateBoardSize();
