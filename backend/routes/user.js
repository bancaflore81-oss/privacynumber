const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const NumberRequest = require('../models/NumberRequest');

const router = express.Router();

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
});

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               country:
 *                 type: string
 *               language:
 *                 type: string
 *                 enum: [en, ru, zh]
 *               timezone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 */
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('phone').optional().isMobilePhone(),
  body('country').optional().trim(),
  body('language').optional().isIn(['en', 'ru', 'zh']),
  body('timezone').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { firstName, lastName, phone, country, language, timezone } = req.body;

    const updateData = {};
    if (firstName !== undefined) updateData['profile.firstName'] = firstName;
    if (lastName !== undefined) updateData['profile.lastName'] = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (country !== undefined) updateData['profile.country'] = country;
    if (language !== undefined) updateData['profile.language'] = language;
    if (timezone !== undefined) updateData['profile.timezone'] = timezone;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

/**
 * @swagger
 * /api/user/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error or invalid current password
 */
router.post('/change-password', authenticateToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

/**
 * @swagger
 * /api/user/balance:
 *   get:
 *     summary: Get user balance
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance retrieved successfully
 */
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        balance: req.user.balance
      }
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get balance'
    });
  }
});

/**
 * @swagger
 * /api/user/transactions:
 *   get:
 *     summary: Get user transaction history
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, purchase, payment, refund]
 *           default: all
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 */
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type || 'all';

    const query = { userId: req.user._id };
    if (type !== 'all') {
      query.type = type;
    }

    const transactions = await NumberRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('countryId', 'title code')
      .populate('applicationId', 'name code');

    const total = await NumberRequest.countDocuments(query);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions'
    });
  }
});

/**
 * @swagger
 * /api/user/numbers:
 *   get:
 *     summary: Get user active number requests
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, ready, close, reject, used, expired]
 *           default: all
 *     responses:
 *       200:
 *         description: Numbers retrieved successfully
 */
router.get('/numbers', authenticateToken, async (req, res) => {
  try {
    const status = req.query.status || 'all';
    
    let query = { userId: req.user._id };
    if (status !== 'all') {
      query.status = status;
    }

    const numbers = await NumberRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('countryId', 'title code flag')
      .populate('applicationId', 'name code icon');

    res.json({
      success: true,
      data: {
        numbers
      }
    });
  } catch (error) {
    console.error('Get numbers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get numbers'
    });
  }
});

/**
 * @swagger
 * /api/user/api-key:
 *   get:
 *     summary: Get user API key
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API key retrieved successfully
 */
router.get('/api-key', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        apiKey: req.user.apiKey
      }
    });
  } catch (error) {
    console.error('Get API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get API key'
    });
  }
});

/**
 * @swagger
 * /api/user/api-key:
 *   post:
 *     summary: Regenerate user API key
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API key regenerated successfully
 */
router.post('/api-key', authenticateToken, async (req, res) => {
  try {
    const newApiKey = require('crypto').randomBytes(32).toString('hex');
    
    await User.findByIdAndUpdate(req.user._id, {
      apiKey: newApiKey
    });

    res.json({
      success: true,
      message: 'API key regenerated successfully',
      data: {
        apiKey: newApiKey
      }
    });
  } catch (error) {
    console.error('Regenerate API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate API key'
    });
  }
});

/**
 * @swagger
 * /api/user/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences retrieved successfully
 */
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        preferences: req.user.preferences
      }
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get preferences'
    });
  }
});

/**
 * @swagger
 * /api/user/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifications:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: boolean
 *                   sms:
 *                     type: boolean
 *                   push:
 *                     type: boolean
 *               theme:
 *                 type: string
 *                 enum: [light, dark]
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { notifications, theme } = req.body;

    const updateData = {};
    if (notifications !== undefined) updateData['preferences.notifications'] = notifications;
    if (theme !== undefined) updateData['preferences.theme'] = theme;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

module.exports = router;
