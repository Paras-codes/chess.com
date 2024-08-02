const socket = io(); // create a socket connection to the server
const chess = new Chess(); // for implementing everything related to chess through chess.js
const boardElement = document.querySelector('.chessboard'); // select the chessboard element

let draggedPiece = null; // to store the dragged piece
let sourceSquare = null; // to store the source square
let playerRole = null; // to store the player role

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = '';

    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement('div');

            squareElement.classList.add('square',
                (rowIndex + squareIndex) % 2 === 0 ? 'light' : 'dark');
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece',
                    square.color === "w" ? 'white' : 'black')

                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener('dragstart', (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: squareIndex };
                        e.dataTransfer.setData('text/plain', ''); // to allow drag and drop without any seen on cross platform;
                    }
                });
                pieceElement.addEventListener('dragend', () => {
                    draggedPiece = null;
                    sourceSquare = null;
                });
                squareElement.appendChild(pieceElement); // add the piece to the square
            }
            squareElement.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            squareElement.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };
                    handleMove(sourceSquare, targetSquare);
                }
            })
            boardElement.appendChild(squareElement); // add the square to the board
        })

    });
    if (playerRole == 'b') {
        boardElement.classList.add('flipped');

    }
    else {
        boardElement.classList.remove('flipped');
    }
}
const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q'
    }

    socket.emit('move', move);
};

const getPieceUnicode = (piece) => {
    const unicode = {
        p: '♙',
        r: '♖',
        n: '♘',
        b: '♗',
        q: '♕',
        k: '♔',
        P: '♟',
        R: '♜',
        N: '♞',
        B: '♝',
        Q: '♛',
        K: '♚',
    }
    return unicode[piece.type] || "";
};
renderBoard();

socket.on('playerRole', (role) => {
    playerRole = role;
    renderBoard();
});

socket.on('spectatorRole', () => {
    playerRole = null;
    renderBoard();
});

socket.on('boardState', (fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on('move', (move) => {
    chess.move(move);
    renderBoard();
})