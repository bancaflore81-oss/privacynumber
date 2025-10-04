const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const User = require('../models/User');
const NumberRequest = require('../models/NumberRequest');
const Country = require('../models/Country');
const Application = require('../models/Application');
const Price = require('../models/Price');

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateToken, requireAdmin);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 */
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalRequests,
      activeRequests,
      totalRevenue,
      recentUsers,
      recentRequests
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      NumberRequest.countDocuments(),
      NumberRequest.countDocuments({ status: { $in: ['ready', 'close'] } }),
      NumberRequest.aggregate([
        { $match: { status: { $in: ['close', 'used'] } } },
        { $group: { _id: null, total: { $sum: '$cost' } } }
      ]),
      User.find().sort({ createdAt: -1 }).limit(5).select('-password -refreshTokens'),
      NumberRequest.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'email')
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          totalRequests,
          activeRequests,
          totalRevenue: revenue
        },
        recentUsers,
        recentRequests
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data'
    });
  }
});

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with pagination
 *     tags: [Admin]
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, active, inactive]
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || 'all';

    let query = {};
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's number requests
    const requests = await NumberRequest.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: {
        user,
        requests
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user details'
    });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}/toggle-status:
 *   post:
 *     summary: Toggle user active status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       404:
 *         description: User not found
 */
router.post('/users/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status'
    });
  }
});

/**
 * @swagger
 * /api/admin/countries:
 *   get:
 *     summary: Get all countries
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Countries retrieved successfully
 */
router.get('/countries', async (req, res) => {
  try {
    const countries = await Country.find().sort({ priority: -1, title: 1 });

    res.json({
      success: true,
      data: {
        countries
      }
    });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get countries'
    });
  }
});

/**
 * @swagger
 * /api/admin/countries:
 *   post:
 *     summary: Create new country
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - title
 *               - code
 *               - phoneCode
 *             properties:
 *               id:
 *                 type: integer
 *               title:
 *                 type: string
 *               code:
 *                 type: string
 *               phoneCode:
 *                 type: string
 *               flag:
 *                 type: string
 *               priority:
 *                 type: integer
 *               currency:
 *                 type: string
 *               timezone:
 *                 type: string
 *               language:
 *                 type: string
 *     responses:
 *       201:
 *         description: Country created successfully
 *       400:
 *         description: Validation error
 */
router.post('/countries', [
  body('id').isInt(),
  body('title').notEmpty().trim(),
  body('code').isLength({ min: 2, max: 2 }).toUpperCase(),
  body('phoneCode').notEmpty()
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

    const country = new Country(req.body);
    await country.save();

    res.status(201).json({
      success: true,
      message: 'Country created successfully',
      data: {
        country
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Country with this ID or code already exists'
      });
    }
    
    console.error('Create country error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create country'
    });
  }
});

/**
 * @swagger
 * /api/admin/applications:
 *   get:
 *     summary: Get all applications
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 */
router.get('/applications', async (req, res) => {
  try {
    const applications = await Application.find().sort({ priority: -1, name: 1 });

    res.json({
      success: true,
      data: {
        applications
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get applications'
    });
  }
});

/**
 * @swagger
 * /api/admin/applications:
 *   post:
 *     summary: Create new application
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *               - code
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               icon:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [social, messaging, marketplace, exchange, gaming, other]
 *               priority:
 *                 type: integer
 *               description:
 *                 type: string
 *               website:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application created successfully
 *       400:
 *         description: Validation error
 */
router.post('/applications', [
  body('id').isInt(),
  body('name').notEmpty().trim(),
  body('code').notEmpty().trim().toLowerCase(),
  body('category').optional().isIn(['social', 'messaging', 'marketplace', 'exchange', 'gaming', 'other'])
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

    const application = new Application(req.body);
    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: {
        application
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Application with this ID or code already exists'
      });
    }
    
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create application'
    });
  }
});

/**
 * @swagger
 * /api/admin/prices:
 *   get:
 *     summary: Get all prices
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Prices retrieved successfully
 */
router.get('/prices', async (req, res) => {
  try {
    const prices = await Price.find()
      .populate('countryId', 'title code')
      .populate('applicationId', 'name code')
      .sort({ countryId: 1, applicationId: 1 });

    res.json({
      success: true,
      data: {
        prices
      }
    });
  } catch (error) {
    console.error('Get prices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get prices'
    });
  }
});

/**
 * @swagger
 * /api/admin/prices:
 *   post:
 *     summary: Create or update price
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - countryId
 *               - applicationId
 *               - cost
 *             properties:
 *               countryId:
 *                 type: integer
 *               applicationId:
 *                 type: integer
 *               cost:
 *                 type: number
 *                 minimum: 0
 *               currency:
 *                 type: string
 *                 default: USD
 *               count:
 *                 type: integer
 *                 minimum: 0
 *               discount:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Price created/updated successfully
 *       400:
 *         description: Validation error
 */
router.post('/prices', [
  body('countryId').isInt(),
  body('applicationId').isInt(),
  body('cost').isFloat({ min: 0 }),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('count').optional().isInt({ min: 0 }),
  body('discount').optional().isFloat({ min: 0, max: 100 })
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

    const { countryId, applicationId, cost, currency = 'USD', count = 0, discount = 0 } = req.body;

    const price = await Price.updatePrice(countryId, applicationId, cost, req.user._id);
    price.currency = currency;
    price.count = count;
    price.discount = discount;
    await price.save();

    res.json({
      success: true,
      message: 'Price updated successfully',
      data: {
        price
      }
    });
  } catch (error) {
    console.error('Update price error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update price'
    });
  }
});

/**
 * @swagger
 * /api/admin/requests:
 *   get:
 *     summary: Get all number requests
 *     tags: [Admin]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, ready, close, reject, used, expired]
 *     responses:
 *       200:
 *         description: Requests retrieved successfully
 */
router.get('/requests', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || 'all';

    let query = {};
    if (status !== 'all') {
      query.status = status;
    }

    const requests = await NumberRequest.find(query)
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await NumberRequest.countDocuments(query);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get requests'
    });
  }
});

module.exports = router;
