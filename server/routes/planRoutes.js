const express = require('express');
const router = express.Router();
const {
  getQuotation,
  createPlan,
  getUserPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} = require('../controllers/planController');
const { verifyToken } = require('../middleware/authMiddleware');

// Deterministic pricing calculation (used by wizard/quotation pages)
router.post('/quote', getQuotation);

// CRUD operations protected with Firebase Bearer Token authentication
router.post('/', verifyToken, createPlan);
router.get('/', verifyToken, getUserPlans);
router.get('/:id', verifyToken, getPlanById);
router.put('/:id', verifyToken, updatePlan);
router.delete('/:id', verifyToken, deletePlan);

module.exports = router;
