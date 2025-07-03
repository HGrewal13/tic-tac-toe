
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
    score = 0;

    const getMark = () => mark;
    const getScore = () => score;
    const addWin = function() {score++};

    return {getMark, getScore, addWin};
}

// Game Logic Module
const GameLogic = (function() {
    const currentBoard = GameBoard();
    const player1 = Player("X");
    const player2 = Player("O");
    let currentPlayer = player1;
    let currentPlayerName = "player1";
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
    const performTurn = function(position, callback) {
        if(!gameOver) {
            currentBoard.insertMark(currentPlayer.getMark(), position);
            printBoard(); // debugging purposes only
            callback(currentBoard.getBoard()); // callback is updateBoard to show the changes after inserting a mark
            if(checkWinner()) {
                console.log(`${currentPlayerName} is the winner!`);
                gameOver = true;
            }
            if(checkTie()) {
                gameOver = true;
                return;
            }
            transitionTurn();
        }
        
    }

    const transitionTurn = function() {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
        currentPlayerName = currentPlayerName === "player1" ? "player2" : "player1";
    }

    const checkWinner = function() {
        const boardValues = currentBoard.getBoard();
        for(condition of winConditions) {
            // console.log(condition);
            let [a,b,c] = condition;
            // find a better way to do this----------------------------------------------------------
            if(boardValues[a] !== null && boardValues[b] !== null && boardValues[c] !== null && (boardValues[a] === boardValues[b] && boardValues[b] === boardValues[c])) {
                // console.log(`${a} ${b} ${c}`);
                // console.log(boardValues[a]);
                // console.log(boardValues[b]);
                return true;
            }
        }
    }

    const checkTie = function() {
        if(!gameOver && currentBoard.isFull()) {
            console.log("TIE");
            // solves issue. Find out why we need this line
            // return true;
        }
        
    }


// ------------HELPER FUNCTIONS--------------------
    // Allows UI to access instance of GameBoard
    const passBoard = () => currentBoard.getBoard();
    
    // debugging purposes only
    const printBoard = function() {
        console.log(currentBoard.getBoard());
    }
    
    return {performTurn, passBoard};
}())

// UI Module
const UI = (function() {
    const boardDOM = document.querySelector(".board");

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
        }
    }

    // data-value and updateBoard() is passed to GameLogic so the turn can be performed
    boardDOM.addEventListener("click", e => {
        const element = e.target;
        const position = element.dataset.value;
        if(element.classList.contains("quadrent")) {
            GameLogic.performTurn(position, updateBoard);
        }
    })

    generateBoard();
    updateBoard(GameLogic.passBoard());

}())


