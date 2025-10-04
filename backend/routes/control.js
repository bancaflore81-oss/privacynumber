const express = require('express');
const { authenticateAPI } = require('../middleware/auth');
const User = require('../models/User');
const NumberRequest = require('../models/NumberRequest');
const Country = require('../models/Country');
const Application = require('../models/Application');
const Price = require('../models/Price');

const router = express.Router();

/**
 * @swagger
 * /api/control/get-balance:
 *   get:
 *     summary: Get user balance
 *     tags: [Control API]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: API token
 *     responses:
 *       200:
 *         description: Balance retrieved successfully
 *       401:
 *         description: Invalid API key
 */
router.get('/get-balance', authenticateAPI, async (req, res) => {
  try {
    res.json({
      balance: req.user.balance.toFixed(2)
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
 * /api/control/limits:
 *   get:
 *     summary: Get available numbers for country and service
 *     tags: [Control API]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: country_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: application_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Limits retrieved successfully
 *       400:
 *         description: Missing required parameters
 */
router.get('/limits', authenticateAPI, async (req, res) => {
  try {
    const { country_id, application_id } = req.query;

    if (!country_id || !application_id) {
      return res.status(400).json({
        success: false,
        message: 'country_id and application_id are required'
      });
    }

    // Get price information to determine available numbers
    const price = await Price.getPrice(parseInt(country_id), parseInt(application_id));
    
    if (!price || !price.isActive) {
      return res.json([{
        application_id: parseInt(application_id),
        country_id: parseInt(country_id),
        numbers: 0
      }]);
    }

    // For demo purposes, return a random number between 1000-50000
    // In production, this would be calculated based on actual available numbers
    const availableNumbers = Math.floor(Math.random() * 49000) + 1000;

    res.json([{
      application_id: parseInt(application_id),
      country_id: parseInt(country_id),
      numbers: availableNumbers
    }]);
  } catch (error) {
    console.error('Get limits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get limits'
    });
  }
});

/**
 * @swagger
 * /api/control/get-number:
 *   get:
 *     summary: Request a phone number
 *     tags: [Control API]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: country_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: application_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Number requested successfully
 *       400:
 *         description: Missing required parameters or insufficient balance
 *       404:
 *         description: Service not available
 */
router.get('/get-number', authenticateAPI, async (req, res) => {
  try {
    const { country_id, application_id } = req.query;

    if (!country_id || !application_id) {
      return res.status(400).json({
        success: false,
        message: 'country_id and application_id are required'
      });
    }

    const countryId = parseInt(country_id);
    const applicationId = parseInt(application_id);

    // Check if country and application exist and are active
    const country = await Country.findOne({ id: countryId, isActive: true });
    const application = await Application.findOne({ id: applicationId, isActive: true });

    if (!country || !application) {
      return res.status(404).json({
        success: false,
        message: 'Service not available'
      });
    }

    // Get price for this combination
    const price = await Price.getPrice(countryId, applicationId);
    
    if (!price || !price.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Service not available'
      });
    }

    const cost = price.getFinalPrice();

    // Check if user has sufficient balance
    if (req.user.balance < cost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Generate phone number (demo format)
    const phoneNumber = generatePhoneNumber(country.phoneCode);

    // Create number request
    const numberRequest = new NumberRequest({
      userId: req.user._id,
      countryId,
      applicationId,
      phoneNumber,
      cost,
      expiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        country: country.title,
        application: application.name,
        service: application.code
      }
    });

    await numberRequest.save();

    // Deduct balance
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { balance: -cost }
    });

    res.json({
      request_id: numberRequest.requestId,
      country_id: countryId,
      application_id: applicationId,
      number: phoneNumber
    });
  } catch (error) {
    console.error('Get number error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get number'
    });
  }
});

/**
 * @swagger
 * /api/control/get-sms:
 *   get:
 *     summary: Get SMS code for a number request
 *     tags: [Control API]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: request_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SMS retrieved successfully
 *       404:
 *         description: Request not found or no SMS received
 *       400:
 *         description: Missing required parameters
 */
router.get('/get-sms', authenticateAPI, async (req, res) => {
  try {
    const { request_id } = req.query;

    if (!request_id) {
      return res.status(400).json({
        success: false,
        message: 'request_id is required'
      });
    }

    const numberRequest = await NumberRequest.findOne({
      requestId: request_id,
      userId: req.user._id
    });

    if (!numberRequest) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (numberRequest.status === 'expired') {
      return res.status(404).json({
        success: false,
        message: 'Request expired'
      });
    }

    // For demo purposes, generate a random SMS code
    // In production, this would be the actual SMS received
    if (!numberRequest.smsCode) {
      const smsCode = Math.floor(1000 + Math.random() * 9000).toString();
      numberRequest.smsCode = smsCode;
      numberRequest.status = 'close';
      await numberRequest.save();
    }

    res.json({
      request_id: numberRequest.requestId,
      country_id: numberRequest.countryId,
      application_id: numberRequest.applicationId,
      number: numberRequest.phoneNumber,
      sms_code: numberRequest.smsCode
    });
  } catch (error) {
    console.error('Get SMS error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get SMS'
    });
  }
});

/**
 * @swagger
 * /api/control/set-status:
 *   post:
 *     summary: Change status of a number request
 *     tags: [Control API]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: request_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ready, close, reject, used]
 *     responses:
 *       200:
 *         description: Status changed successfully
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: Request not found
 */
router.post('/set-status', authenticateAPI, async (req, res) => {
  try {
    const { request_id, status } = req.query;

    if (!request_id || !status) {
      return res.status(400).json({
        success: false,
        message: 'request_id and status are required'
      });
    }

    const validStatuses = ['ready', 'close', 'reject', 'used'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const numberRequest = await NumberRequest.findOne({
      requestId: request_id,
      userId: req.user._id
    });

    if (!numberRequest) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    numberRequest.status = status;
    if (status === 'used') {
      numberRequest.completedAt = new Date();
    }
    await numberRequest.save();

    res.json({
      request_id: numberRequest.requestId,
      success: true
    });
  } catch (error) {
    console.error('Set status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set status'
    });
  }
});

/**
 * @swagger
 * /api/control/get-prices:
 *   get:
 *     summary: Get prices for a country
 *     tags: [Control API]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: country_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Prices retrieved successfully
 *       400:
 *         description: Missing required parameters
 */
router.get('/get-prices', authenticateAPI, async (req, res) => {
  try {
    const { country_id } = req.query;

    if (!country_id) {
      return res.status(400).json({
        success: false,
        message: 'country_id is required'
      });
    }

    const countryId = parseInt(country_id);
    const prices = await Price.getByCountry(countryId);

    // Format response to match SMS-Man API format
    const formattedPrices = {};
    prices.forEach(price => {
      if (!formattedPrices[price.countryId]) {
        formattedPrices[price.countryId] = {};
      }
      formattedPrices[price.countryId][price.applicationId] = {
        cost: price.cost.toString(),
        count: price.count
      };
    });

    res.json(formattedPrices);
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
 * /api/control/countries:
 *   get:
 *     summary: Get available countries
 *     tags: [Control API]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Countries retrieved successfully
 */
router.get('/countries', authenticateAPI, async (req, res) => {
  try {
    const countries = await Country.getActive();
    
    const formattedCountries = countries.map(country => ({
      id: country.id,
      title: country.title
    }));

    res.json(formattedCountries);
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
 * /api/control/applications:
 *   get:
 *     summary: Get available applications/services
 *     tags: [Control API]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 */
router.get('/applications', authenticateAPI, async (req, res) => {
  try {
    const applications = await Application.getActive();
    
    const formattedApplications = applications.map(app => ({
      id: app.id,
      name: app.name,
      code: app.code
    }));

    res.json(formattedApplications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get applications'
    });
  }
});

// Helper function to generate phone number
function generatePhoneNumber(phoneCode) {
  // Generate a random number with the country code
  const randomNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
  return `+${phoneCode}${randomNumber}`;
}

module.exports = router;
