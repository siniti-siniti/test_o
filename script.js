const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreDiv = document.getElementById("score");
const messageDiv = document.getElementById("message");
const specialCountDiv = document.getElementById("specialCount");

const size = 8;
const cellSize = canvas.width / size;
let board = [];
let player = 'B';
let specialMode = false;
let specialPlayer = '';
let gameOver = false;
let specialCount = 0;

function initBoard() {
    board = Array.from({ length: size }, () => Array(size).fill('.'));
    board[3][3] = board[4][4] = 'W';
    board[3][4] = board[4][3] = 'B';
    updateScore();
    updateSpecialCount();
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            ctx.fillStyle = "#388e3c";
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

            let flips = getFlips(x, y, player);
            if (flips > 0) {
                if (flips >= 5) ctx.fillStyle = "#90d490";
                else if (flips >= 3) ctx.fillStyle = "#c6e6c6";
                else ctx.fillStyle = "#e8f8e8";
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }

            ctx.strokeStyle = "black";
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);

            if (board[y][x] === 'B' || board[y][x] === 'W') {
                ctx.beginPath();
                ctx.arc(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, cellSize / 2 - 4, 0, Math.PI * 2);
                ctx.fillStyle = board[y][x] === 'B' ? "black" : "white";
                ctx.fill();
                ctx.stroke();
            }
        }
    }
    updateScore();
    updateSpecialCount();
}

function updateScore() {
    let b = 0, w = 0;
    for (let row of board) {
        for (let cell of row) {
            if (cell === 'B') b++;
            if (cell === 'W') w++;
        }
    }
    scoreDiv.innerText = `Black: ${b}  White: ${w}`;
}

function updateSpecialCount() {
    specialCountDiv.innerText = `Special Rules activated: ${specialCount}`;
}

function getFlips(x, y, p) {
    if (board[y][x] !== '.') return 0;
    let dirs = [[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
    let total = 0;
    for (let [dx, dy] of dirs) {
        let nx = x + dx, ny = y + dy;
        let flips = 0;
        while (nx >= 0 && nx < size && ny >= 0 && ny < size && board[ny][nx] === (p === 'B' ? 'W' : 'B')) {
            flips++;
            nx += dx; ny += dy;
        }
        if (flips > 0 && nx >= 0 && nx < size && ny >= 0 && ny < size && board[ny][nx] === p) {
            total += flips;
        }
    }
    return total;
}

function hasValidMove(p) {
    for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++)
            if (getFlips(x, y, p) > 0)
                return true;
    return false;
}

function getValidMoves(p) {
    let moves = [];
    for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++)
            if (getFlips(x, y, p) > 0)
                moves.push([x, y]);
    return moves;
}

function applyMove(x, y, p) {
    let dirs = [[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
    board[y][x] = p;
    for (let [dx, dy] of dirs) {
        let nx = x + dx, ny = y + dy;
        let path = [];
        while (nx >= 0 && nx < size && ny >= 0 && ny < size && board[ny][nx] === (p === 'B' ? 'W' : 'B')) {
            path.push([nx, ny]);
            nx += dx; ny += dy;
        }
        if (path.length > 0 && nx >= 0 && nx < size && ny >= 0 && ny < size && board[ny][nx] === p) {
            for (let [fx, fy] of path) {
                board[fy][fx] = p;
            }
        }
    }
}

function handleClick(e) {
    if (gameOver) return;
    let x = Math.floor(e.offsetX / cellSize);
    let y = Math.floor(e.offsetY / cellSize);

    if (specialMode) {
        if (board[y][x] === specialPlayer) {
            board[y][x] = specialPlayer === 'B' ? 'W' : 'B';
            specialMode = false;
            messageDiv.innerText = "";
            nextTurn();
            drawBoard();
        }
        return;
    }

    let flips = getFlips(x, y, player);
    if (flips === 0) return;

    applyMove(x, y, player);
    drawBoard();

    if (flips >= 2) {
        specialCount++;
        updateSpecialCount();
        specialMode = true;
        specialPlayer = player;
        messageDiv.innerText = "SPECIAL RULE! Click your disc to flip it.";
        return;
    }

    nextTurn();
}

function nextTurn() {
    player = player === 'B' ? 'W' : 'B';
    if (!hasValidMove(player)) {
        player = player === 'B' ? 'W' : 'B';
        if (!hasValidMove(player)) {
            gameOver = true;
            messageDiv.innerText = "Game Over!";
            return;
        }
    }
    drawBoard();
    if (player === 'W') setTimeout(aiMove, 500);
}

function aiMove() {
    let moves = getValidMoves('W');
    if (moves.length === 0) {
        nextTurn();
        return;
    }
    let [x, y] = moves[Math.floor(Math.random() * moves.length)];
    let flips = getFlips(x, y, 'W');
    applyMove(x, y, 'W');
    drawBoard();

    if (flips >= 2) {
        specialCount++;
        updateSpecialCount();
        let ownDiscs = [];
        for (let yy = 0; yy < size; yy++)
            for (let xx = 0; xx < size; xx++)
                if (board[yy][xx] === 'W')
                    ownDiscs.push([xx, yy]);
        if (ownDiscs.length) {
            let [fx, fy] = ownDiscs[Math.floor(Math.random() * ownDiscs.length)];
            board[fy][fx] = 'B';
            drawBoard();
        }
    }
    nextTurn();
}

canvas.addEventListener("click", handleClick);
initBoard();
drawBoard();
