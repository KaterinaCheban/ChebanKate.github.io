let playerName = "";
let score = 0;
let gameStarted = false;
let gamePaused = false;
let level = 1;
let speed = 1;
let rowsCleared = 0;
let leaderboard = [];
let targetScore = 500;

function startGame() {
    playerName = document.getElementById("playerName").value;
    document.getElementById("nameLabel").innerText = `Hello, ${playerName}!`;
    document.getElementById("playerName").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    document.getElementById("score-container").style.display = "block";
    gameStarted = true;
    initializeGame();
}

function initializeGame() {
    const canvas = document.getElementById('game');
    const context = canvas.getContext('2d');
    const grid = 32;
    const tetrominoSequence = [];
    const playfield = [];

    for (let row = -2; row < 20; row++) {
        playfield[row] = [];
        for (let col = 0; col < 10; col++) {
            playfield[row][col] = 0;
        }
    }

    const tetrominos = {
        'I': [
            [0,0,0,0],
            [1,1,1,1],
            [0,0,0,0],
            [0,0,0,0]
        ],
        'J': [
            [1,0,0],
            [1,1,1],
            [0,0,0],
        ],
        'L': [
            [0,0,1],
            [1,1,1],
            [0,0,0],
        ],
        'O': [
            [1,1],
            [1,1],
        ],
        'S': [
            [0,1,1],
            [1,1,0],
            [0,0,0],
        ],
        'Z': [
            [1,1,0],
            [0,1,1],
            [0,0,0],
        ],
        'T': [
            [0,1,0],
            [1,1,1],
            [0,0,0],
        ]
    };

    const colors = {
        'I': 'cyan',
        'O': 'yellow',
        'T': 'purple',
        'S': 'green',
        'Z': 'red',
        'J': 'blue',
        'L': 'orange'
    };

    let count = 0;
    let tetromino = getNextTetromino();
    let rAF = null;
    let gameOver = false;

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateSequence() {
        const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
        while (sequence.length) {
            const rand = getRandomInt(0, sequence.length - 1);
            const name = sequence.splice(rand, 1)[0];
            tetrominoSequence.push(name);
        }
    }

    function getNextTetromino() {
        if (tetrominoSequence.length === 0) {
            generateSequence();
        }

        const name = tetrominoSequence.pop();
        const matrix = tetrominos[name];
        const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
        const row = name === 'I' ? -1 : -2;

        return {
            name: name,
            matrix: matrix,
            row: row,
            col: col
        };
    }

    function rotate(matrix) {
        const N = matrix.length - 1;
        const result = matrix.map((row, i) =>
            row.map((val, j) => matrix[N - j][i])
        );
        return result;
    }

    function isValidMove(matrix, cellRow, cellCol) {
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col] && (
                    cellCol + col < 0 ||
                    cellCol + col >= playfield[0].length ||
                    cellRow + row >= playfield.length ||
                    playfield[cellRow + row][cellCol + col])
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    function placeTetromino() {
        for (let row = 0; row < tetromino.matrix.length; row++) {
            for (let col = 0; col < tetromino.matrix[row].length; col++) {
                if (tetromino.matrix[row][col]) {
                    if (tetromino.row + row < 0) {
                        return showGameOver();
                    }
                    playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
                }
            }
        }

        let rowsToRemove = 0;
        for (let row = playfield.length - 1; row >= 0; ) {
            if (playfield[row].every(cell => !!cell)) {
                rowsToRemove++;
                rowsCleared++;
                for (let r = row; r >= 0; r--) {
                    for (let c = 0; c < playfield[r].length; c++) {
                        playfield[r][c] = playfield[r - 1][c];
                    }
                }
            } else {
                row--;
            }
        }

        if (rowsToRemove > 0) {
            score += rowsToRemove * 100 * level;
        }

        if (rowsCleared >= level * 10) {
            level++;
            speed += 0.5;
            targetScore += 500;
        }

        if (score >= targetScore) {
            // Гравець досяг цільової кількості очок для нового рівня
            // Можна вивести повідомлення або виконати інші дії
        }

        tetromino = getNextTetromino();
    }

    function showLocalLeaderboard() {
      console.log("Local Leaderboard:");
      console.log(leaderboard);
  
      // Отримуємо DOM-елемент, в який будемо вставляти лідерборд
      const leaderboardContainer = document.getElementById('leaderboard-container');
  
      // Очищаємо вміст контейнера перед вставкою нового лідерборду
      leaderboardContainer.innerHTML = '';
  
      // Перевіряємо, чи є записи в лідерборді
      if (leaderboard.length > 0) {
          // Створюємо таблицю
          const table = document.createElement('table');
  
          // Додаємо заголовок таблиці
          const headerRow = table.insertRow();
          const playerNameHeader = headerRow.insertCell(0);
          playerNameHeader.textContent = 'Player Name';
          const scoreHeader = headerRow.insertCell(1);
          scoreHeader.textContent = 'Score';
  
          // Додаємо рядки для кожного запису в лідерборді
          leaderboard.forEach((entry, index) => {
              const row = table.insertRow();
              const playerNameCell = row.insertCell(0);
              const scoreCell = row.insertCell(1);
  
              playerNameCell.textContent = entry.playerName;
              scoreCell.textContent = entry.score;
          });
  
          // Додаємо таблицю до контейнера
          leaderboardContainer.appendChild(table);
      } else {
          // Якщо лідерборд порожній, виводимо повідомлення
          const noDataMessage = document.createElement('p');
          noDataMessage.textContent = 'No leaderboard data available.';
          leaderboardContainer.appendChild(noDataMessage);
      }
  }

    function showGameOver() {
        cancelAnimationFrame(rAF);
        gameOver = true;

        context.fillStyle = 'black';
        context.globalAlpha = 0.75;
        context.fillRect(0, canvas.height / 2 - 30, canvas.width, 150);

        context.globalAlpha = 1;
        context.fillStyle = 'white';
        context.font = '36px monospace';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(`GAME OVER, ${playerName}!`, canvas.width / 2, canvas.height / 2);
        context.fillText(`Your Score: ${score}`, canvas.width / 2, canvas.height / 2+90);

        // Додаємо гравця до локального лідерборду
        leaderboard.push({ playerName: playerName, score: score });

        // Зберігаємо локальний лідерборд в localStorage
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

        // Виводимо локальний лідерборд
        showLocalLeaderboard();
    }

    function loop() {
        rAF = requestAnimationFrame(loop);
        context.clearRect(0, 0, canvas.width, canvas.height);

        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 10; col++) {
                if (playfield[row][col]) {
                    const name = playfield[row][col];
                    context.fillStyle = colors[name];
                    context.fillRect(col * grid, row * grid, grid-1, grid-1);
                }
            }
        }

        if (tetromino) {
            if (++count > 35 / speed) {
                tetromino.row++;
                count = 0;

                if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
                    tetromino.row--;
                    placeTetromino();
                }
            }

            context.fillStyle = colors[tetromino.name];

            for (let row = 0; row < tetromino.matrix.length; row++) {
                for (let col = 0; col < tetromino.matrix[row].length; col++) {
                    if (tetromino.matrix[row][col]) {
                        context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid-1, grid-1);
                    }
                }
            }
        }

        context.fillStyle = 'white';
        context.font = '18px monospace';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText(`Player: ${playerName}`, 10, 10);
        context.fillText(`Score: ${score}`, 10, 30);
        context.fillText(`Level: ${level}`, 10, 50);
        context.fillText(`Rows cleared: ${rowsCleared}`, 10, 70);
    }

    document.addEventListener('keydown', function(e) {
        if (gameOver || !gameStarted) return;

        if (e.which === 37 || e.which === 39) {
            const col = e.which === 37
                ? tetromino.col - 1
                : tetromino.col + 1;

            if (isValidMove(tetromino.matrix, tetromino.row, col)) {
                tetromino.col = col;
            }
        }

        if (e.which === 38) {
            const matrix = rotate(tetromino.matrix);
            if (isValidMove(matrix, tetromino.row, tetromino.col)) {
                tetromino.matrix = matrix;
            }
        }

        if (e.which === 40) {
            const row = tetromino.row + 1;

            if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
                tetromino.row = row - 1;
                placeTetromino();
                return;
            }

            tetromino.row = row;
        }
    });

    rAF = requestAnimationFrame(loop);
}

// Отримуємо локальний лідерборд з localStorage
const savedLeaderboard = localStorage.getItem('leaderboard');

// Перевіряємо, чи є збережений лідерборд та встановлюємо його значення
if (savedLeaderboard) {
    leaderboard = JSON.parse(savedLeaderboard);
}

// Виводимо локальний лідерборд
showLocalLeaderboard();
initializeGame();
