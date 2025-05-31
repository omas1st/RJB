// server.js

const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

function safeMount(prefix, modulePath) {
  try {
    const router = require(modulePath);
    app.use(prefix, router);
    console.log(`✔️ Mounted ${prefix} → ${modulePath}`);
  } catch (err) {
    console.error(`❌ Failed to mount [${prefix}] from "${modulePath}":`, err.message);
  }
}

// Mount all of your routes (adjust these paths if your folder structure differs)
safeMount('/api/auth',       './routes/authRoutes');
safeMount('/api/admin/auth', './routes/adminAuthRoutes');
safeMount('/api/users',      './routes/userRoutes');
safeMount('/api/tasks',      './routes/taskRoutes');
safeMount('/api/wallet',     './routes/walletRoutes');
safeMount('/api/admin',      './routes/adminRoutes');

// Serve React build in production; fallback on “API is running” in dev
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'frontend', 'build');
  try {
    app.use(express.static(buildPath));
    app.get('*', (_req, res) =>
      res.sendFile(path.join(buildPath, 'index.html'))
    );
    console.log(`✔️  Serving React from "${buildPath}"`);
  } catch (err) {
    console.error(`❌ Failed to serve static build at "${buildPath}":`, err.message);
  }
} else {
  app.get('/', (_req, res) => res.send('API is running'));
}

// Only call app.listen() locally (Vercel will invoke this as a Serverless Function)
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
