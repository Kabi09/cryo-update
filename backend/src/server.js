const app = require('./app');
const config = require('./config/env');
const { connectDB, mongoose } = require('./config/db');
const logger = require('./config/logger');

let server;

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(config.port, () => {
      logger.info(`Cryo ERP Backend Server running in [${config.env}] mode on port ${config.port}`);
      logger.info(`API Base URL: ${config.appUrl}/api/v1`);
      logger.info(`Health check: ${config.appUrl}/api/v1/health`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

const gracefulShutdown = (signal) => {
  logger.info(`${signal} signal received: closing HTTP server`);
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      await mongoose.connection.close(false);
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}\n${error.stack}`);
  process.exit(1);
});

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
