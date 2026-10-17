const express = require('express');
const router = express.Router();
const { getPackagingRecommendation, getPackagingTypes } = require('../controllers/aiController');

// GET /api/ai/packaging-types
router.get('/packaging-types', getPackagingTypes);

// POST /api/ai/recommend
router.post('/recommend', getPackagingRecommendation);

module.exports = router;

