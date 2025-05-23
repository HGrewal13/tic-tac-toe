
const GameBoard = function() {
    let gameBoard = new Array(9);

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
        // add a check to make sure the index is empty before inserting

        gameBoard[position] = mark;
        console.log(getBoard());
    }

    return {checkPosition, insertMark, getBoard};
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

    let playerPositions = {
        p1: [],
        p2: []
    }

    let turnTransition = function() {
        currentPlayer = currentPlayer === p1 ? p2 : p1;
        console.log(`It's now ${currentPlayer.getName()}'s turn`);
    }

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
            // checkWinner();
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
                    gameOver = true;
                    return true;
                }
                // check for draw condition
            }
        }
        return false;
    }

    return {getTurn, performTurn, checkWinner};

}


// Init Function
const p1 = createPlayer("p1", "X");
const p2 = createPlayer("p2", "O");
const board = GameBoard();
const game1 = game(board, p1, p2);
