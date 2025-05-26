
const GameBoard = function() {
    let gameBoard = new Array(9).fill(undefined);

    // Returns a copy of the gameBoard so it can't be directly changed
    // console.log for now, but the object will need to be returned to make sure we can update on DOM
    const getBoard = () => console.log([...gameBoard]);

    function checkPosition(position) {
        // 0 to indicate it's free, 1 to indicate taken
        if(gameBoard[position] === undefined) {
            return 0;
        } else {
            return 1;
        }
    }

    // const insertMark = function(player, mark, position) {
    //     gameBoard[position] = mark;
    // }

    // test of actual function
    const insertMark = function(mark, position) {
        // checkPosition is run before inserting in the game function
        gameBoard[position] = mark;
        console.log(getBoard());
    }

    const checkFullBoard = function() {
        return gameBoard.every((space) => space !== undefined);
    }

    return {checkPosition, insertMark, getBoard, checkFullBoard};
}

// Define createPlayer factory function
const createPlayer = function(name, mark) {
    let score = 0;

    const getName = () => name;
    const getMark = () => mark;
    const win = function() {score++};
    const getScore = () => score;

    return {getName, getMark, win, getScore};
}


const game = function(board, p1, p2) {
    let gameOver = false;
    let currentPlayer = p1;

    // tracks the positions the player has inserted a mark in. This will allow to check for win conditions
    let playerPositions = {
        p1: [],
        p2: []
    }

    let turnTransition = function() {
        currentPlayer = currentPlayer === p1 ? p2 : p1;
    }

    let getTurnTransitionMessage = function() {
        return `It's now ${currentPlayer.getName()}'s turn`;
    }

    const getCurrentPlayer = () => currentPlayer;

    const getTurn = () => console.log(`${currentPlayer.getName()}'s turn`);

    const performTurn = function(position) {
        if(gameOver) {
            return;
        }
        // Checks if the position is valid. If it is, insert mark and transition turn, else print board but dont transition turn
        if(board.checkPosition(position) === 0) {
            console.log("accepted");
            board.insertMark(currentPlayer.getMark(), position);
            storePlayerPositions(position);
            if(checkWinner()) {
                return;
            } else {
                return turnTransition();
            }
        } else {
            console.log("position taken");
            board.getBoard();
            return;
        }
    }

    // Function that stores an array of where the marks of each player are
    // This will be passed to checkWinner() in the game() function to determine if someone has won
    function storePlayerPositions(position) {
        const playerName = currentPlayer.getName();
        playerPositions[playerName].push(position);
    }

    function checkWinner() {
        let winnerPresent = false;

        const allWinCons = [
            // horizontal
            [0,1,2], [3,4,5],[6,7,8],
            // vertical
            [0,3,6],[1,4,7],[2,5,8],
            // diagonal
            [0,4,8],[2,4,6]
        ]

        // For each winCon, check if either player has all the positions needed to win
        // forEach doesnt respect return statements, so it's better to use a for of loop
        for(winCon of allWinCons) {
            for(player in playerPositions) {
                // If they do, set gameOver to true
                if(winCon.every(position => playerPositions[player].includes(position))) {
                    alert(`${player} is the winner`);
                    if(player === "p1") {
                        p1.win();
                    } else if(player === "p2") {
                        p2.win();
                    }
                    gameOver = true;
                    return true;
                }
                // check for draw condition
            }
        }

        if(!gameOver) {
            let tieCondition = board.checkFullBoard();
            if(tieCondition) {
                gameOver = true;
                alert("Tie Game");
            }
        }
        return false;
    }

    function isGameOver() {
        if(gameOver) {
            return true;
        } else {
            return false;
        }
    }



    return {getTurn, getCurrentPlayer, getTurnTransitionMessage, performTurn, checkWinner, isGameOver};

}

// DOM Manipulation for Game

const UI = function() {
    const main = document.querySelector("main");
    const currentTurn = document.querySelector(".currentTurn");
    const p1Score = document.querySelector(".player1Score");
    const p2Score = document.querySelector(".player2Score");

    p1Score.textContent = p1.getScore();
    p2Score.textContent = p2.getScore();
    
    currentTurn.textContent = currentGame.getTurnTransitionMessage();
    // Based on which quadrent the user clicks, save that quadrent's value
    main.addEventListener("click", (event) => {
        // Pass that value as the position. parseInt must be used so it can be passed as an index
        const position = parseInt(event.target.dataset.value);
        // Set target div to be an "X" or "O" based on whose turn it is
        event.target.textContent = currentGame.getCurrentPlayer().getMark();
        // use delay so DOM is updated with mark before running game logic. Alert in checkWinner won't allow the DOM to update otherwise
        // Update this without timeout once I no longer use alert
        setTimeout(() => {

            currentGame.performTurn(position);

            // overlay to restrict interaction after game is over
            if (currentGame.isGameOver()) {
                const overlay = document.createElement("div");
                const newGameButton = document.createElement("button");

                overlay.classList.add("overlay");
                overlay.textContent = "Game Over";

                newGameButton.textContent = "New Game";

                main.appendChild(overlay);
                overlay.appendChild(newGameButton);
                main.style.pointerEvents = "none";
            }

            currentTurn.textContent = currentGame.getTurnTransitionMessage();
            
            // Update scores
            p1Score.textContent = p1.getScore();
            p2Score.textContent = p2.getScore();

        }, 0);
    })


}

// const dialog = document.querySelector("dialog");
// dialog.showModal();

// Init Function

const p1 = createPlayer("p1", "X");
const p2 = createPlayer("p2", "O");
const board = GameBoard();
const currentGame = game(board, p1, p2);
const interface = UI();
