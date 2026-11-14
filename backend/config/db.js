const mongoose = require('mongoose');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let localMongodProcess = null;

const startLocalMongod = () => {
  return new Promise((resolve, reject) => {
    const mongodPath =
      process.env.MONGOD_PATH ||
      'C:\\Program Files\\MongoDB\\Server\\8.3\\bin\\mongod.exe';

    if (!fs.existsSync(mongodPath)) {
      return reject(new Error(`mongod executable not found at ${mongodPath}`));
    }

    const dbPath = path.resolve(__dirname, '../../.mongodb-data');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    console.log(`[Database] Starting local MongoDB server with data dir: ${dbPath}`);
    const proc = spawn(
      mongodPath,
      ['--dbpath', dbPath, '--port', '27017', '--bind_ip', '127.0.0.1'],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      }
    );

    localMongodProcess = proc;
    let resolved = false;

    const onData = (chunk) => {
      const text = chunk.toString();
      if (!resolved && (text.includes('Waiting for connections') || text.includes('waiting for connections'))) {
        resolved = true;
        resolve(proc);
      }
    };

    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);

    proc.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    proc.on('exit', (code) => {
      if (!resolved) {
        resolved = true;
        // Port might already be taken by another mongod that just started
        resolve(null);
      }
    });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(proc);
      }
    }, 4500);
  });
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dynamic_it';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (initialError) {
    if (process.env.AUTO_START_LOCAL_MONGOD === 'true') {
      console.log('[Database] Port 27017 not responding yet. Attempting to auto-start local mongod...');
      try {
        await startLocalMongod();
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 6000,
        });
        console.log(`[Database] Connected to auto-started local MongoDB: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
      } catch (fallbackError) {
        console.error('[Database] Failed to connect after starting local mongod:', fallbackError.message);
        throw fallbackError;
      }
    }
    console.error('[Database] MongoDB connection error:', initialError.message);
    throw initialError;
  }
};

const stopLocalMongod = () => {
  if (localMongodProcess && !localMongodProcess.killed) {
    try {
      localMongodProcess.kill('SIGINT');
    } catch (_) {
      // ignore cleanup error
    }
  }
};

process.on('SIGINT', () => {
  stopLocalMongod();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopLocalMongod();
  process.exit(0);
});

module.exports = { connectDB, stopLocalMongod };
