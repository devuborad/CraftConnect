import { app } from './app.js';
import { ENV } from './config/env.js';
import { checkDatabaseConnection } from './config/db.js';

const PORT = ENV.PORT;

async function startServer() {
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus) {
    console.log('✅ Connected to MySQL Database (craftconnect)');
  } else {
    console.log('ℹ️  Database not initialized or connection pending. Server running with mock/fallback handling mode.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 CraftConnect AI Backend Server is running on port ${PORT}`);
    console.log(`📍 Health check endpoint: http://localhost:${PORT}/api/health`);
  });
}

startServer();
