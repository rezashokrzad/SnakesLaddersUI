// Board size constants
const boardSize = 10;
const squareSize = 50;  // Assuming each square is 50px by 50px

// Initialize the board and player
function initBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';  // Clear any existing board cells
    
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

// Function to convert board position to real grid position
function getRealPosition(position) {
    const row = Math.ceil(position / boardSize);
    let col = position % boardSize || boardSize;
    if (row % 2 === 0) col = boardSize + 1 - col;  // Zigzag movement for snakes/ladders
    return { gridRow: boardSize + 1 - row, gridCol: col };
}

// Player class
class Player {
    constructor(id) {
        this.id = id;
        this.position = null;  // Start without position
        this.createPlayerDiv();
    }
    
    createPlayerDiv() {
        this.playerDiv = document.createElement('div');
        this.playerDiv.classList.add('player', `player${this.id}`);
        document.getElementById('board').appendChild(this.playerDiv);
        this.playerDiv.style.display = 'none';  // Hidden initially
    }
    
    move(newPosition) {
        if (!newPosition) {
            this.playerDiv.style.display = 'none';  // Hide player if no position
            return;
        }
        
        this.position = newPosition;
        const { gridRow, gridCol } = getRealPosition(newPosition);
        
        this.playerDiv.style.top = `${(gridRow - 1) * squareSize}px`;
        this.playerDiv.style.left = `${(gridCol - 1) * squareSize}px`;
        this.playerDiv.style.display = 'block';  // Show player on valid move
    }
}

// Create the board and player
initBoard();

// Set up player movement with input
const player = new Player(1);  // Assume we only have one player/item for now

document.getElementById('moveBtn').addEventListener('click', () => {
    const input = document.getElementById('movementInput').value.trim();
    
    // Split input into numbers
    const positions = input.split(',').map(Number);

    if (positions.length === 1) {
        // If only one number is provided, just move the player to that cell
        const singlePos = positions[0];
        player.move(singlePos);
        return;  // Exit after the single move
    }


    const currentPos = positions[0];
    const targetPos = positions[1];
    let finalPos = targetPos;

    if (positions.length === 3) {
        finalPos = positions[2];
    }

    // Animate the player movement
    player.move(currentPos);
    
    setTimeout(() => {
        player.move(targetPos);  // First move to the second position
    }, 500);  // Delay for smoother animation

    // Move to the final position if there's a third number
    if (positions.length === 3) {
        setTimeout(() => {
            player.move(finalPos);  // Then move to the final position
        }, 1000);  // Further delay to ensure second move happens after the first
    }
});
