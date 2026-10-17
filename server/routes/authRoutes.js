const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * Public route to verify the auth service is running
 * GET /api/auth/health
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth service is operational',
  });
});

/**
 * Protected route to verify the authenticated Firebase user
 * GET /api/auth/me
 * Headers: Authorization: Bearer <firebase_id_token>
 */
router.get('/me', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication successful',
    user: {
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
    },
  });
});

module.exports = router;
