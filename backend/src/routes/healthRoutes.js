const express = require('express');
const mongoose = require('mongoose');
const ApiResponse = require('../utils/apiResponse');

const router = express.Router();

router.get('/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  return ApiResponse.success(res, {
    message: 'Cryo ERP Backend is online',
    data: {
      status: 'healthy',
      database: isDbConnected ? 'connected' : 'disconnected',
      version: '1.0.0',
      uptime: `${process.uptime().toFixed(1)}s`,
      timestamp: new Date().toISOString()
    }
  });
});

router.get('/health/db', (req, res) => {
  const readyStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = readyStates[mongoose.connection.readyState] || 'unknown';
  const isHealthy = mongoose.connection.readyState === 1;

  if (isHealthy) {
    return ApiResponse.success(res, {
      message: 'Database is healthy',
      data: {
        database: 'MongoDB',
        status: state,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      }
    });
  }

  return ApiResponse.error(res, {
    statusCode: 503,
    message: 'Database is not connected',
    code: 'DATABASE_ERROR',
    errors: [{ field: 'database', message: `Current state: ${state}` }]
  });
});

router.get('/system/version', (req, res) => {
  return ApiResponse.success(res, {
    data: {
      name: 'Cryo Scientific Systems ERP API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version
    }
  });
});

module.exports = router;
