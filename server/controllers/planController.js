const mongoose = require('mongoose');
const PackagingPlan = require('../models/PackagingPlan');
const calculatePrice = require('../utils/calculatePrice');

// In-memory fallback store for offline development if MongoDB is disconnected
// Keyed strictly by userId to guarantee user data isolation even in offline mode
const inMemoryStore = [];

/**
 * Check if MongoDB connection is active
 */
const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * Calculate deterministic quotation
 * POST /api/plans/quote
 */
const getQuotation = async (req, res) => {
  try {
    const { packagingType, dimensions, quantity, materialGrade, requirements } = req.body;
    const calculation = calculatePrice({
      packagingType,
      dimensions,
      quantity,
      materialGrade,
      requirements,
    });

    res.status(200).json({
      success: true,
      data: calculation,
    });
  } catch (error) {
    console.error('Error calculating quote:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create a new packaging plan
 * POST /api/plans
 * Protected: Requires verified Firebase ID Token
 */
const createPlan = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userEmail = req.user.email || '';

    const {
      productName = 'Product Item',
      category = 'General',
      dimensions = { length: 20, width: 15, height: 8 },
      quantity = 500,
      packagingType = 'Corrugated Box',
      materialGrade = '5-Ply Corrugated Cardboard',
      requirements = {},
      aiRecommendation,
      pricing,
    } = req.body;

    // Deterministically calculate or verify the price quote
    const computedQuote = calculatePrice({
      packagingType,
      dimensions,
      quantity,
      materialGrade,
      requirements,
    });

    const finalPricing = {
      unitPrice: pricing?.unitPrice || computedQuote.unitPrice,
      totalPrice: pricing?.totalPrice || computedQuote.totalPrice,
      breakdown: computedQuote.breakdown,
    };

    const newPlanData = {
      userId,
      userEmail,
      productDetails: {
        name: productName,
        category,
        dimensions: {
          length: Number(dimensions.length),
          width: Number(dimensions.width),
          height: Number(dimensions.height),
        },
        quantity: Number(quantity),
      },
      productName,
      category,
      dimensions: {
        length: Number(dimensions.length),
        width: Number(dimensions.width),
        height: Number(dimensions.height),
      },
      quantity: Number(quantity),
      selectedPackaging: {
        packagingType,
        materialGrade,
      },
      packagingType,
      materialGrade,
      packagingRequirements: {
        protectionLevel: requirements.protectionLevel || 'Medium',
        costPreference: requirements.costPreference || 'Balanced',
        ecoFriendly: Boolean(requirements.ecoFriendly),
        customPrint: Boolean(requirements.customPrint),
      },
      requirements: {
        protectionLevel: requirements.protectionLevel || 'Medium',
        costPreference: requirements.costPreference || 'Balanced',
        ecoFriendly: Boolean(requirements.ecoFriendly),
        customPrint: Boolean(requirements.customPrint),
      },
      aiRecommendation: aiRecommendation || {
        recommendedType: packagingType,
        materialGrade,
        reasoning: ['Suitable for your dimensions', 'Good product protection', 'Cost effective'],
        suitabilityScore: 95,
      },
      estimatedQuotation: finalPricing,
      pricing: finalPricing,
      status: 'Processing',
    };

    // Save to MongoDB if connected
    if (isMongoConnected()) {
      const savedPlan = await PackagingPlan.create(newPlanData);
      return res.status(201).json({
        success: true,
        message: 'Packaging plan saved successfully',
        data: savedPlan,
      });
    }

    // In-memory fallback
    const fallbackPlan = {
      _id: 'plan_' + Date.now(),
      ...newPlanData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryStore.unshift(fallbackPlan);

    return res.status(201).json({
      success: true,
      message: 'Packaging plan saved successfully (in-memory)',
      data: fallbackPlan,
    });
  } catch (error) {
    console.error('Error creating packaging plan:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all packaging plans for the authenticated user
 * GET /api/plans
 * Protected: Requires verified Firebase ID Token
 * Enforces strict user isolation: Users only see plans matching req.user.uid
 */
const getUserPlans = async (req, res) => {
  try {
    const userId = req.user.uid;

    if (isMongoConnected()) {
      const plans = await PackagingPlan.find({ userId }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: plans.length,
        data: plans,
      });
    }

    // In-memory fallback: strictly filter by userId
    const userPlans = inMemoryStore.filter((p) => p.userId === userId);
    return res.status(200).json({
      success: true,
      count: userPlans.length,
      data: userPlans,
    });
  } catch (error) {
    console.error('Error fetching user plans:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single plan by ID
 * GET /api/plans/:id
 * Protected: Only the plan owner (matching req.user.uid) can access it
 */
const getPlanById = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const plan = await PackagingPlan.findOne({ _id: id, userId });
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Packaging plan not found or unauthorized access',
        });
      }
      return res.status(200).json({ success: true, data: plan });
    }

    // In-memory fallback
    const plan = inMemoryStore.find((p) => p._id === id && p.userId === userId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Packaging plan not found or unauthorized access',
      });
    }
    return res.status(200).json({ success: true, data: plan });
  } catch (error) {
    console.error('Error fetching plan by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update an existing packaging plan
 * PUT /api/plans/:id
 * Protected: Only the plan owner (matching req.user.uid) can update it
 */
const updatePlan = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const updates = req.body;

    // Prevent modifying ownership
    delete updates.userId;
    delete updates._id;

    // If dimensions, packagingType, or quantity changed, recalculate pricing
    if (updates.dimensions || updates.packagingType || updates.quantity || updates.materialGrade) {
      const quote = calculatePrice({
        packagingType: updates.packagingType || 'Corrugated Box',
        dimensions: updates.dimensions,
        quantity: updates.quantity,
        materialGrade: updates.materialGrade,
        requirements: updates.requirements,
      });
      updates.pricing = {
        unitPrice: quote.unitPrice,
        totalPrice: quote.totalPrice,
        breakdown: quote.breakdown,
      };
      updates.estimatedQuotation = updates.pricing;
    }

    if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const plan = await PackagingPlan.findOneAndUpdate(
        { _id: id, userId },
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Packaging plan not found or unauthorized access',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Packaging plan updated successfully',
        data: plan,
      });
    }

    // In-memory fallback
    const index = inMemoryStore.findIndex((p) => p._id === id && p.userId === userId);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Packaging plan not found or unauthorized access',
      });
    }

    inMemoryStore[index] = {
      ...inMemoryStore[index],
      ...updates,
      updatedAt: new Date(),
    };

    return res.status(200).json({
      success: true,
      message: 'Packaging plan updated successfully (in-memory)',
      data: inMemoryStore[index],
    });
  } catch (error) {
    console.error('Error updating packaging plan:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a packaging plan
 * DELETE /api/plans/:id
 * Protected: Only the plan owner (matching req.user.uid) can delete it
 */
const deletePlan = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const deletedPlan = await PackagingPlan.findOneAndDelete({ _id: id, userId });
      if (!deletedPlan) {
        return res.status(404).json({
          success: false,
          message: 'Packaging plan not found or unauthorized access',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Packaging plan deleted successfully',
      });
    }

    // In-memory fallback
    const index = inMemoryStore.findIndex((p) => p._id === id && p.userId === userId);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Packaging plan not found or unauthorized access',
      });
    }

    inMemoryStore.splice(index, 1);
    return res.status(200).json({
      success: true,
      message: 'Packaging plan deleted successfully (in-memory)',
    });
  } catch (error) {
    console.error('Error deleting packaging plan:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getQuotation,
  createPlan,
  getUserPlans,
  getPlanById,
  updatePlan,
  deletePlan,
};
