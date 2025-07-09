
// Game Board Module
const GameBoard = function() {
    const board = new Array(9).fill(null);

    const insertMark = function(mark, position) {
        if(board[position] === null) {
            board[position] = mark;
            return true;
        } else {
            return false;
        }
    }

    // checks to see if every quadrent has been filled. Used to determine tie game
    const isFull = function() {
        if(board.every(pos => pos !== null)) {
            return true;
        } else {
            return false;
        }
    }

    const getBoard = () => [...board];

    return {insertMark, isFull, getBoard};
}

// Player Module
const Player = function(mark) {
    let score = 0;

    const getMark = () => mark;
    const getScore = () => score;
    const addWin = function() {score++};

    return {getMark, getScore, addWin};
}

// Game Logic Module
const GameLogic = (function() {
    let currentBoard = GameBoard();
    const player1 = Player("X");
    const player2 = Player("O");
    let currentPlayer = player1;
    let currentPlayerName = "Player1";
    let gameOver = false;


    const winConditions = [
        // horizontal
        [0,1,2], [3,4,5],[6,7,8],
        // vertical
        [0,3,6],[1,4,7],[2,5,8],
        // diagonal
        [0,4,8],[2,4,6]
    ]

    // will run when a quadrent is clicked (Through UI module)
    const performTurn = function(position, updateBoardCallback, messageCallback, highlightCallback) {
        if(!gameOver) {
            currentBoard.insertMark(currentPlayer.getMark(), position);
            printBoard(); // debugging purposes only
            updateBoardCallback(currentBoard.getBoard()); // updateBoardCallback to show the changes after inserting a mark
            if(checkWinner(highlightCallback)) {
                console.log(`${currentPlayerName} is the winner!`);
                messageCallback(`${currentPlayerName} is the winner!`);
                currentPlayer.addWin();
                gameOver = true;
                return;
            }
            if(checkTie()) {
                messageCallback("It's a tie!");
                gameOver = true;
                return;
            }
            transitionTurn();
            messageCallback(`${currentPlayerName}'s turn`);
        }
        
    }

    // TURN FUNCTIONS
    const transitionTurn = function() {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
        currentPlayerName = currentPlayerName === "Player1" ? "Player2" : "Player1";
    }

    const checkWinner = function(highlightCallback) {
        const boardValues = currentBoard.getBoard();
        for(condition of winConditions) {
            // console.log(condition);
            let [a,b,c] = condition;
            if(boardValues[a] !== null && boardValues[a] === boardValues[b] && boardValues[b] === boardValues[c]) {
                highlightCallback(a, b, c)
                return true;
            }
        }
        return false;
    }

    const checkTie = function() {
        if(!gameOver && currentBoard.isFull()) {
            console.log("TIE");
            return true;
        } else {
            return false;
        }
    }


// ------------HELPER FUNCTIONS--------------------
    // Allows UI to access instance of GameBoard
    const passBoard = () => currentBoard.getBoard();
    const passScores = () => [player1.getScore(), player2.getScore()];
    const getGameStatus = () => gameOver;
    
    // debugging purposes only
    const printBoard = function() {
        console.log(currentBoard.getBoard());
    }

// MISC FUNCTIONS
    const resetGameLogic = function() {
        gameOver = false;
        currentPlayer = player1;
        currentPlayerName = "player1";
        currentBoard = GameBoard();
    }
    
    return {performTurn, passBoard, passScores, getGameStatus, resetGameLogic};
}())

// UI Module
const UI = (function() {
    const boardDOM = document.querySelector(".board");
    const resetButton = document.querySelector(".reset");

    // initial board setup for the DOM
    const generateBoard = function() {
        for(let i = 0; i < 9; i++) {
            const quadrent = document.createElement("div");
            quadrent.classList.add("quadrent");
            quadrent.dataset.value = i;
            boardDOM.appendChild(quadrent);
        }
    }

    // Responsible for updating the DOM with GameBoard's instance's current values
    const updateBoard = function(board) {
        const quadrents = document.querySelectorAll(".quadrent");
        // for each element in GameBoard's board
        for(let i = 0; i < 9; i++) {
        // fill quadrent with the value in board's array
            quadrents[i].textContent = board[i];
            quadrents[i].classList.remove("flipped");
        }
    }

    // EVENT LISTENERS
    // data-value and updateBoard() is passed to GameLogic so the turn can be performed
    boardDOM.addEventListener("click", e => {
        const element = e.target;
        const position = element.dataset.value;
        if(element.classList.contains("quadrent")) {
            GameLogic.performTurn(position, updateBoard, showMessage, highlightWinningQuadrents);
        }
        updateScores();
    })

    resetButton.addEventListener("click", e => {
        if(GameLogic.getGameStatus()) {
            GameLogic.resetGameLogic();
            updateBoard(GameLogic.passBoard());
            showMessage("player1's turn");
            updateScores();
        }
    })

    // HELPER FUNCTIONS
    // Check what's considered helper functions
    const showMessage = function(message) {
        const messageDiv = document.querySelector(".message");
        messageDiv.innerHTML = message;
    }

    // MISC FUNCTIONS
    const updateScores = function() {
        const player1Score = document.querySelector(".player1Score");
        const player2Score = document.querySelector(".player2Score");
        const scores = GameLogic.passScores();

        player1Score.innerHTML = `Player1 Score: ${scores[0]}`;
        player2Score.innerHTML = `Player2 Score: ${scores[1]}`;
    }

    const highlightWinningQuadrents = function(a, b, c) {
        const quadrents = document.querySelectorAll(".quadrent");
        // quadrents[a].style.backgroundColor = "red";
        // quadrents[b].style.backgroundColor = "red";
        // quadrents[c].style.backgroundColor = "red";
        quadrents[a].classList.add("flipped");
        quadrents[b].classList.add("flipped");
        quadrents[c].classList.add("flipped");
    }

    generateBoard();
    updateBoard(GameLogic.passBoard());
    showMessage("Player1's turn");
    updateScores();
}())


// TO DO:
// disable clicks after gameover?
