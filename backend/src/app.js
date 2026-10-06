const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config/env');
const errorHandler = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');
const ApiError = require('./utils/apiError');

// Route modules
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const masterRoutes = require('./routes/masterRoutes');
const salesRoutes = require('./routes/salesRoutes');
const financeRoutes = require('./routes/financeRoutes');
const productionRoutes = require('./routes/productionRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const procurementRoutes = require('./routes/procurementRoutes');
const qaRoutes = require('./routes/qaRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const governanceRoutes = require('./routes/governanceRoutes');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.env !== 'test') {
  app.use(morgan('combined'));
}

// Global API rate limiting
app.use('/api/', apiLimiter);

// API v1 Routes
const apiRouter = express.Router();

apiRouter.use(healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/master', masterRoutes);
apiRouter.use(salesRoutes);
apiRouter.use(financeRoutes);
apiRouter.use(productionRoutes);
apiRouter.use(inventoryRoutes);
apiRouter.use(procurementRoutes);
apiRouter.use(qaRoutes);
apiRouter.use(logisticsRoutes);
apiRouter.use(serviceRoutes);
apiRouter.use('/maintenance', maintenanceRoutes);
apiRouter.use(governanceRoutes);

app.use('/api/v1', apiRouter);

// 404 Route Handler
app.use('*', (req, res, next) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
});

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
