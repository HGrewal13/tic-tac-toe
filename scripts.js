
const GameBoard = function() {
    const board = new Array(9).fill(null);

    const printBoard = function() {
        console.log(board);
    }

    const checkPosition = function(position) {
        if(board[position] === null) {
            console.log("valid");
            return true;
        } else {
            console.log("invalid");
            return false;
        }
    }

    const insertMark = function(mark, position) {
        board[position] = mark;
    }

    const checkFullBoard = function() {
        return board.every((cell) => cell !== null);
    }

    const resetBoard = function() {
        board.fill(null);
    }
    
    return {printBoard, checkPosition, insertMark, checkFullBoard, resetBoard};
}

const CreatePlayer = function(name, mark) {
    let score = 0;

    const getName = () => name;
    const getMark = () => mark;
    const getScore = () => score;
    const win = function() {score++};
    return {getName, getMark, getScore, win};
}

const Game = function(ui, board, player1, player2) {
    let gameOver = false;
    let currentPlayer = player1;
    // Stores every position each player makes to check for win conditions
    let playerPositions = {
        [player1.getName()] : [],
        [player2.getName()] : []
    }

    // This is the callback function that will be passed to .onSquareClick
    // This is done so game doesnt interact with the DOM directly
    // The arguements will be passed to us by .onSquareClick
    const handleClick = function(square, position) {
        if(gameOver) {return};
        let currentName = currentPlayer.getName();
        let currentMark = currentPlayer.getMark();

        if(board.checkPosition(position)) {
            board.insertMark(currentMark, position);
            playerPositions[currentName].push(position);
            ui.updateBoard(square, currentMark);
            // currentPlayer is defined in Game's scope, so it has to be passed at the time of using checkWinner to ensure 
            // that the correct player is being referenced.
            // if currentPlayer was in handleClick's scope, it wouldnt be an issue
            // Potential issues otherwise: if transitionTurn() is executed before checkWinner(), the wrong player's values would be checked
            if(checkWinner(currentPlayer)) {
                currentPlayer.win();
                // without setTimeout the alert would appear before the mark is places
                setTimeout(function() {
                    ui.alertWinner(currentName);
                }, 100);
                return;
            }
            // board.checkFullBoard();
            if(checkTieGame()) {
                setTimeout(function() {
                    ui.alertTie();
                }, 100)
                return;
            }
            transitionTurn();
            board.printBoard();
            
        } else {
            alert("Invalid move");
        }
    }

    const transitionTurn = function() {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
    }

    const checkWinner = function(player) {
        const winConditions = [
            // horizontal
            [0,1,2], [3,4,5],[6,7,8],
            // vertical
            [0,3,6],[1,4,7],[2,5,8],
            // diagonal
            [0,4,8],[2,4,6]
        ]

        // get the current players playerPosition values
        console.log(playerPositions[player.getName()]);
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

    // Check Tie Game function
    const checkTieGame = function() {
        if(board.checkFullBoard() && gameOver === false) {
            console.log("Tie Game");
            gameOver = true;
            return true;
        } else {
            return false;
        }
    }

    ui.onSquareClick(handleClick);

    const resetPlayerPositions = function() {
        for(let player in playerPositions) {
            playerPositions[player] = [];
            console.log(playerPositions[player]);
        }
    }

    const resetGame = function() {
        gameOver = false;
        resetPlayerPositions();
    }

    return {resetGame};

}

const UI = function(board, player1, player2) {
    // Initial Player Name set up on DOM
    const player1Field = document.querySelector(".player1Name");
    const player2Field = document.querySelector(".player2Name");

    player1Field.textContent = `${player1.getName()} : X`;
    player2Field.textContent = `${player2.getName()} : O`;

    // Main DOM interactions for placing marks on board
    const onSquareClick = function(callback) {
        const main = document.querySelector("main");
        main.addEventListener("click", function(event) {
            const square = event.target;
            // Convert to integer so comparisons can be made when checking for win conditions
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

    const alertWinner = function(winner) {
        alert(`${winner} is the winner!`);
    }

    const alertTie = function() {
        alert("Tie Game!");
    }

    const resetUI = function() {
        const main = document.querySelector("main");
        const squares = main.querySelectorAll(".quadrent");

        squares.forEach(square => square.textContent = "");
    }

    return {updateBoard, onSquareClick, alertWinner, alertTie, resetUI};
}

// Takes in 2 names and then creates all the components of a game and creates an instance of the game
// Once the game is created, it relies on game's logic to run
const init = function(name1, name2) {
    const player1 = CreatePlayer(`${name1}`, "X");
    const player2 = CreatePlayer(`${name2}`,"O");

    // every single instance of a factory function should be called here by passing in the required parameters. Including UI
    const board = GameBoard();
    const ui = UI(board, player1, player2);
    const game = Game(ui, board, player1, player2);
}

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
    const player1Name = form.elements["player1"].value;
    const player2Name = form.elements["player2"].value;


    // init(player1Name, player2Name);
    app.startGame();
    // need resets on all the game components
})


// TO DO:
// game reset logic
    // playerPositions isn't reset when new instance is created
// score tracking
