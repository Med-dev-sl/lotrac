require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000' }));
app.use(morgan('dev'));
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'DOUBLE',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Mk@15590',
  database: process.env.DB_DATABASE || 'lotrac',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const createToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

app.get('/api/ping', (req, res) => {
  res.json({ success: true, message: 'pong' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // TODO: Replace this example with a real user lookup from MySQL.
  const exampleUser = {
    id: 1,
    email: 'admin@example.com',
    passwordHash: await bcrypt.hash('Password123', 10),
  };

  const isValid = await bcrypt.compare(password, exampleUser.passwordHash);
  if (!isValid || email !== exampleUser.email) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = createToken({ id: exampleUser.id, email: exampleUser.email });
  res.json({ token });
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ database: 'ok' });
  } catch (error) {
    res.status(500).json({ database: 'error', message: error.message });
  }
});

const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('message', (payload) => {
    socket.broadcast.emit('message', payload);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Security backend listening on http://localhost:${PORT}`);
});
