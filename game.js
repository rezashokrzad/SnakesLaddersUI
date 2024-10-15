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
        
        board.appendChild(square);
    }
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

    console.log("Out items: ", outItems);  // Debugging

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

    document.getElementById('board').appendChild(itemDiv);
    this.move(itemDiv, position);  // Move item to its initial position
    this.items.push(itemDiv);  // Add the item to the player's item array
};

// Add the move function or other prototypes here
Player.prototype.move = function(itemDiv, newPosition) {
    const { gridRow, gridCol } = getRealPosition(newPosition);  // Get correct grid position
    const playerSize = 40;     // Player size is 40px
    const gridSize = 50;       // Each grid cell is 50px
    const offset = (gridSize - playerSize) / 2;  // Center the player in the cell
    itemDiv.style.top = `${(gridRow - 1) * squareSize + offset}px`;
    itemDiv.style.left = `${(gridCol - 1) * squareSize + offset}px`;
};

Player.prototype.moveStepByStep = function(itemDiv, currentPosition, targetPosition, callback) {
    const step = () => {
        if (currentPosition === targetPosition) {
            if (callback) {
                setTimeout(callback, 300);  // Call the callback once the step-by-step movement completes
            }
            return;
        }

        currentPosition += (currentPosition < targetPosition) ? 1 : -1;  // Increment or decrement position

        const { gridRow, gridCol } = getRealPosition(currentPosition);

        itemDiv.style.transition = "top 0.3s ease, left 0.3s ease";
        itemDiv.style.top = `${(gridRow - 1) * squareSize}px`;
        itemDiv.style.left = `${(gridCol - 1) * squareSize}px`;
        itemDiv.setAttribute('data-position', currentPosition);  // Update the player's position attribute

        // Delay to simulate step-by-step movement
        setTimeout(() => step(), 500);  // 300ms delay for each step
    };

    step();  // Start the step-by-step movement
};


Player.prototype.moveSmooth = function(itemDiv, targetPosition, callback) {
    const { gridRow, gridCol } = getRealPosition(targetPosition);

    // Apply smooth CSS transitions for the movement
    itemDiv.style.transition = "top 1.0s ease, left 1.0s ease";  // Smooth transition over 0.5 seconds
    itemDiv.style.top = `${(gridRow - 1) * squareSize}px`;
    itemDiv.style.left = `${(gridCol - 1) * squareSize}px`;
    itemDiv.setAttribute('data-position', targetPosition);  // Update the position attribute

    // Call the callback once the smooth movement is complete
    setTimeout(() => {
        if (callback) callback();  // Execute the callback after smooth movement completes
    }, 1000);  // Movement duration (500ms)
};



function createFirework(x, y) {
    console.log("Creating firework at", x, y);
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

// Handle movements of the players' items with animation
function handleMovements(players, movements) {
    let movementIndex = 0;

    function moveNext() {
        if (movementIndex >= movements.length - 1) {
            console.log("All movements processed");
            return;
          }

        const currentMove = movements[movementIndex];
        const nextMove = movements[movementIndex + 1];
        const finalMove = movements[movementIndex + 2];

        console.log(`Processing move: ${currentMove} to ${nextMove}`);

        for (const player of players) {
            for (let i = 0; i < player.items.length; i++) {
                const currentPosition = parseInt(player.items[i].getAttribute('data-position'));

                if (currentPosition === currentMove) {
                    // Step-by-step movement
                    player.moveStepByStep(player.items[i], currentMove, nextMove, () => {
                        // Check if there's a ladder/snake jump
                        if (finalMove && Math.abs(finalMove - nextMove) > 1) {
                            // Smooth movement for ladder/snake
                            player.moveSmooth(player.items[i], finalMove, () => {
                                checkForWin(nextMove);
                                movementIndex += 2;
                                moveNext();
                            });
                        } else {
                            checkForWin(nextMove);
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
function updateFinishedItems(players, outItems) {
    const finishedContainer = document.getElementById('finished-items');
    finishedContainer.innerHTML = '';  // Clear the current finished items

    // Loop over the "out" items and add them to the finished section
    outItems.forEach(outPlayerId => {
        const player = players.find(p => p.id === outPlayerId);
        if (player && player.items.length > 0) {
            const finishedItem = player.items.pop();  // Remove the item from the board
            finishedItem.style.position = 'relative';  // Ensure relative positioning in new container
            finishedContainer.appendChild(finishedItem);  // Add it to the top section
            console.log("Moved item to finished-items:", finishedItem);  // Inspect the element
            checkForWin(100);

        }
        
    });
}

function checkForWin(position) {
    console.log("Checking for win, position:", position);
    if (position === 100) {
        console.log("Win condition met!");
        const { gridRow, gridCol } = getRealPosition(100);
        const x = (gridCol - 1) * squareSize + squareSize / 2;
        const y = (gridRow - 1) * squareSize + squareSize / 2;
        
        // Delay a bit to allow the movement to complete
        setTimeout(() => {
            // Create multiple fireworks
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    console.log("Creating firework");
                    createFirework(x, y);
                }, i * 200);
            }

            showCelebrationMessage();
        }, 4000);  // Adjust the timing for better synchronization
    }
}

function initializeGame() {
    const { initPositions, itemCounts, movements, outItems } = getUrlParams();

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
    handleMovements(players, movements);

    // Handle displaying finished items
    updateFinishedItems(players, outItems);
}


// Initialize the board and start the game
initBoard();
initializeGame();
