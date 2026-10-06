const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');
const { validateBody } = require('../middlewares/validate');

const router = express.Router();

router.post(
  '/login',
  authLimiter,
  validateBody({
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string' }
  }),
  authController.login
);

router.post(
  '/register',
  validateBody({
    name: { required: true, type: 'string' },
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string' }
  }),
  authController.register
);

router.post(
  '/refresh',
  validateBody({
    refreshToken: { required: true, type: 'string' }
  }),
  authController.refreshToken
);

router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

router.post(
  '/change-password',
  authenticate,
  validateBody({
    currentPassword: { required: true, type: 'string' },
    newPassword: { required: true, type: 'string' }
  }),
  authController.changePassword
);

module.exports = router;
