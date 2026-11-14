const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB, stopLocalMongod } = require('../config/db');
const ensureInitialData = require('./ensureSeed');

const runSeed = async () => {
  try {
    const forceReset = process.argv.includes('--reset');
    await connectDB();
    await ensureInitialData(forceReset);
    console.log('[Seed] Database seeding completed successfully.');
    stopLocalMongod();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    stopLocalMongod();
    process.exit(1);
  }
};

runSeed();
