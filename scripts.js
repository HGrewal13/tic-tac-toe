
// Gameboard Module
const GameBoard = function() {
    const board = new Array(9).fill(null);

    // used for debugging. Not necessary for actual game
    const printBoard = function() {
        console.log(board);
    }

    // checks if square is empty. if so, insert player mark
    const insertMark = (mark, position) => {
        if (board[position] === null) {
            board[position] = mark;
            return true;
        }
        return false;
    }

    // Used to check for tie game condition
    const checkFullBoard = function() {
        return board.every((cell) => cell !== null);
    }

    // resets board when "Start New Game" is pressed
    const resetBoard = function() {
        board.fill(null);
    }
    
    return {printBoard, insertMark, checkFullBoard, resetBoard};
}

// Player Module
const CreatePlayer = function(name, mark) {
    let score = 0;

    const getName = () => name;
    const getMark = () => mark;
    const getScore = () => score;
    const win = function() {score++};
    return {getName, getMark, getScore, win};
}

// Game Module
const Game = function(ui, board, player1, player2) {
    let gameOver = false; //flag to indicate game is concluded
    let currentPlayer = player1;
    // Stores every position each player makes to check for win conditions
    let playerPositions = {
        [player1.getName()] : [],
        [player2.getName()] : []
    }

    const winConditions = [
        // horizontal
        [0,1,2], [3,4,5],[6,7,8],
        // vertical
        [0,3,6],[1,4,7],[2,5,8],
        // diagonal
        [0,4,8],[2,4,6]
    ]

    ui.focusCurrentPlayer(currentPlayer); // highlights the current player

    // This is the callback function that will be passed to .onSquareClick
    // This is done so game doesnt interact with the DOM directly
    // The arguements will be passed to us by .onSquareClick
    const handleClick = function(square, position) {
        if(gameOver) return; // ends round
        let currentName = currentPlayer.getName();
        let currentMark = currentPlayer.getMark();

        if (!board.insertMark(currentMark, position)) return; // no move will be registered if there is already a mark

        playerPositions[currentName].push(position); //push the position value into the player's position array that keeps track of their placements
        ui.updateBoard(square, currentMark); // updates board with the mark being placed

        if(checkWinner(currentPlayer)) {
            currentPlayer.win();
            gameOver = true;
            ui.updateScore(currentPlayer);
            ui.showMessage(`${currentName} is the winner!`);
            return;
        }

        if (board.checkFullBoard()) {
            gameOver = true;
            ui.showMessage("Tie game!");
            return;
        }

        transitionTurn();
        board.printBoard();
    }

    const transitionTurn = function() {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
        ui.focusCurrentPlayer(currentPlayer);
    }

    const checkWinner = function(player) {
        // get the current players playerPosition values
        console.log(playerPositions[player.getName()]); // used to make debugging easier
        const positionArray = playerPositions[player.getName()];
        // iterate through each array to see if the player's playerPositions contains all of the values 
        for(condition of winConditions) {
            // .every returns a boolean value
            if(condition.every(pos => positionArray.includes(pos))) {
                console.log("match");
                gameOver = true;
                return true;
            }
        }
    }

    // Passes our callback function to onSquareClick in ui
    ui.onSquareClick(handleClick);

    // clears the player position values at the start of the next round
    const resetPlayerPositions = function() {
        for(let player in playerPositions) {
            playerPositions[player] = [];
            console.log(playerPositions[player]);
        }
    }

    // resets flag and calls the function to clear player position values
    const resetGame = function() {
        gameOver = false;
        resetPlayerPositions();
    }

    return {resetGame};

}

const UI = function(board, player1, player2) {
    // Player divs that will be highlighted when it's their turn
    const player1Div = document.querySelector(".player1");
    const player2Div = document.querySelector(".player2");

    // will display names after names are inputted in form
    const player1Field = document.querySelector(".player1Name");
    const player2Field = document.querySelector(".player2Name");

    // will hold player scores and be updated after each round
    const player1Score = document.querySelector(".player1Score");
    const player2Score = document.querySelector(".player2Score");

    player1Field.textContent = `${player1.getName()}: X`;
    player2Field.textContent = `${player2.getName()}: O`;

    player1Score.textContent = `Score : ${player1.getScore()}`;
    player2Score.textContent = `Score : ${player2.getScore()}`;

    // Round count
    const roundField = document.querySelector(".round");
    let roundCount = 0;

    // Main DOM interactions for placing marks on board
    const onSquareClick = function(callback) {
        const main = document.querySelector("main"); // main holds the actual game board
        main.addEventListener("click", function(event) {
            const square = event.target; // square is each quadrent in the tic tac toe board
            // Convert to integer so comparisons can be made when checking for win conditions
            // Each square has a data value assigned to it to represent the values 0-9. These values are used
            // to match with the win condition arrays
            let position = parseInt(event.target.dataset.value);
            // makes sure the position is a valid square value
            if(position !== undefined) {
                callback(square, position);
            }
        })
    }
    
    const updateBoard = function(square, mark) {
        square.textContent = mark;
    }

    const updateScore = function(player) {
        if(player === player1) {
            player1Score.textContent = `Score : ${player1.getScore()}`;
        } else {
            player2Score.textContent = `Score : ${player2.getScore()}`;
        }
    }

    const updateRound = function() {
        roundCount += 1;
        roundField.textContent = `Round ${roundCount}`;
    }

    const focusCurrentPlayer = function(player) {
        if(player === player1) {
            player1Div.style.border = "2px solid red";
            player2Div.style.border = "none";
        } else {
            player1Div.style.border = "none";
            player2Div.style.border = "2px solid red";
        }
    }

    // without setTimeout the alert would appear before the mark is placed
    const showMessage = function(msg) {
        setTimeout(function() {
            alert(msg);
        }, 100);
    }

    // resets UI after "Start New Game" is clicked
    const resetUI = function() {
        const main = document.querySelector("main");
        const squares = main.querySelectorAll(".quadrent");
        squares.forEach(square => square.textContent = "");
    }

    return {updateBoard, onSquareClick, updateScore, updateRound, focusCurrentPlayer, showMessage, resetUI};
}

// Takes in 2 names and then creates all the components of a game and creates an instance of Game
// Once the game is created, it relies on Game's logic to run
const App = function() {
    let player1, player2;
    const setPlayers = function(name1, name2) {
        player1 = CreatePlayer(`${name1}`, "X");
        player2 = CreatePlayer(`${name2}`,"O");
    }

    const startGame = function() {
        const board = GameBoard();
        const ui = UI(board, player1, player2);
        const game = Game(ui, board, player1, player2);
        ui.resetUI();
        // ui.updateRound();
    }
    
    return {setPlayers, startGame};
}

// Global Variables and Initiating the Game
const dialog = document.querySelector("dialog");
const form = document.querySelector("form");
const submit = document.querySelector(".submitButton");
const newGame = document.querySelector("#newGame");
const app = App();


dialog.showModal();
submit.addEventListener("click", function(event) {
    event.preventDefault();
    const player1Name = form.elements["player1"].value;
    const player2Name = form.elements["player2"].value;

    // init(player1Name, player2Name);
    app.setPlayers(player1Name, player2Name);
    app.startGame();
    dialog.close();
})

newGame.addEventListener("click", function() {
    app.startGame();
})


// TO DO:
// add rounds
// shenanigans with pressing start new game before there is a round winner


