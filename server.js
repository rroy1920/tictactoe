const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(express.static(path.join(__dirname, 'public')));

// ── Room storage ───────────────────────────────────────────────────────────
// rooms[code] = { players: [socketId, socketId], board: [], turn: 0, scores: [0,0], names: [] }
const rooms = {};

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function freshBoard() { return Array(9).fill(null); }

function checkWin(b) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b2,c] of lines) {
    if (b[a] && b[a] === b[b2] && b[a] === b[c]) return { winner: b[a], line: [a,b2,c] };
  }
  if (b.every(Boolean)) return { winner: 'draw', line: [] };
  return null;
}

// ── Socket events ──────────────────────────────────────────────────────────
io.on('connection', (socket) => {

  // CREATE ROOM
  socket.on('create_room', ({ name }) => {
    let code;
    do { code = makeCode(); } while (rooms[code]);
    rooms[code] = {
      players: [socket.id],
      board: freshBoard(),
      turn: 0,
      scores: [0, 0],
      names: [name || 'Player 1', ''],
      status: 'waiting'
    };
    socket.join(code);
    socket.data.room = code;
    socket.data.index = 0;
    socket.emit('room_created', { code, playerIndex: 0, name: rooms[code].names[0] });
  });

  // JOIN ROOM
  socket.on('join_room', ({ code, name }) => {
    const room = rooms[code];
    if (!room) { socket.emit('error', 'Room not found.'); return; }
    if (room.players.length >= 2) { socket.emit('error', 'Room is full.'); return; }
    if (room.status !== 'waiting') { socket.emit('error', 'Game already in progress.'); return; }

    room.players.push(socket.id);
    room.names[1] = name || 'Player 2';
    room.status = 'playing';
    socket.join(code);
    socket.data.room = code;
    socket.data.index = 1;

    socket.emit('room_joined', { code, playerIndex: 1, name: room.names[1] });

    // Tell both players to start
    io.to(code).emit('game_start', {
      names: room.names,
      board: room.board,
      turn: room.turn,
      scores: room.scores
    });
  });

  // MAKE MOVE
  socket.on('make_move', ({ index: cellIndex }) => {
    const code = socket.data.room;
    const pIndex = socket.data.index;
    const room = rooms[code];
    if (!room || room.status !== 'playing') return;
    if (room.turn !== pIndex) return;
    if (room.board[cellIndex] !== null) return;

    room.board[cellIndex] = pIndex === 0 ? 'X' : 'O';
    const result = checkWin(room.board);

    if (result) {
      if (result.winner === 'draw') {
        io.to(code).emit('game_over', { result: 'draw', line: [], board: room.board, scores: room.scores });
      } else {
        room.scores[pIndex]++;
        io.to(code).emit('game_over', {
          result: 'win', winner: pIndex, line: result.line,
          board: room.board, scores: room.scores, names: room.names
        });
      }
      room.status = 'ended';
    } else {
      room.turn = 1 - room.turn;
      io.to(code).emit('board_update', { board: room.board, turn: room.turn });
    }
  });

  // REMATCH
  socket.on('rematch', () => {
    const code = socket.data.room;
    const room = rooms[code];
    if (!room) return;
    room.board = freshBoard();
    room.turn = Math.random() < 0.5 ? 0 : 1; // random start
    room.status = 'playing';
    io.to(code).emit('game_start', {
      names: room.names, board: room.board,
      turn: room.turn, scores: room.scores, rematch: true
    });
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    const code = socket.data.room;
    if (!code || !rooms[code]) return;
    const room = rooms[code];
    io.to(code).emit('opponent_left');
    delete rooms[code];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✦ Tic-Tac-Toe server running on port ${PORT}`));
