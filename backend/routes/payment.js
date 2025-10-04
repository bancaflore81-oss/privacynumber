const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('paypal-rest-sdk');

const router = express.Router();

// Configure PayPal
paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET
});

/**
 * @swagger
 * /api/payment/methods:
 *   get:
 *     summary: Get available payment methods
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 */
router.get('/methods', authenticateToken, async (req, res) => {
  try {
    const methods = [
      {
        id: 'stripe',
        name: 'Credit/Debit Card',
        icon: 'credit-card',
        enabled: true
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: 'paypal',
        enabled: true
      },
      {
        id: 'crypto',
        name: 'Cryptocurrency',
        icon: 'bitcoin',
        enabled: true
      }
    ];

    res.json({
      success: true,
      data: {
        methods
      }
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment methods'
    });
  }
});

/**
 * @swagger
 * /api/payment/stripe/create-payment-intent:
 *   post:
 *     summary: Create Stripe payment intent
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *               currency:
 *                 type: string
 *                 default: usd
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 *       400:
 *         description: Validation error
 */
router.post('/stripe/create-payment-intent', authenticateToken, [
  body('amount').isFloat({ min: 1 }),
  body('currency').optional().isLength({ min: 3, max: 3 })
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

    const { amount, currency = 'usd' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        userId: req.user._id.toString(),
        email: req.user.email
      }
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent'
    });
  }
});

/**
 * @swagger
 * /api/payment/stripe/confirm-payment:
 *   post:
 *     summary: Confirm Stripe payment and add balance
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIntentId
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 *       400:
 *         description: Payment failed or already processed
 */
router.post('/stripe/confirm-payment', authenticateToken, [
  body('paymentIntentId').notEmpty()
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

    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    if (paymentIntent.metadata.userId !== req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Payment does not belong to this user'
      });
    }

    // Check if payment already processed
    const existingTransaction = await User.findOne({
      _id: req.user._id,
      'transactions.paymentIntentId': paymentIntentId
    });

    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed'
      });
    }

    const amount = paymentIntent.amount / 100; // Convert from cents

    // Add balance to user
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { balance: amount },
      $push: {
        transactions: {
          type: 'payment',
          amount,
          currency: paymentIntent.currency,
          paymentMethod: 'stripe',
          paymentIntentId,
          status: 'completed',
          createdAt: new Date()
        }
      }
    });

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        amount,
        newBalance: req.user.balance + amount
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
});

/**
 * @swagger
 * /api/payment/paypal/create-payment:
 *   post:
 *     summary: Create PayPal payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *               currency:
 *                 type: string
 *                 default: USD
 *     responses:
 *       200:
 *         description: PayPal payment created successfully
 *       400:
 *         description: Validation error
 */
router.post('/paypal/create-payment', authenticateToken, [
  body('amount').isFloat({ min: 1 }),
  body('currency').optional().isLength({ min: 3, max: 3 })
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

    const { amount, currency = 'USD' } = req.body;

    const payment = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      redirect_urls: {
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
      },
      transactions: [{
        amount: {
          total: amount.toFixed(2),
          currency: currency.toUpperCase()
        },
        description: `SMS-Man Balance Top-up - $${amount}`,
        custom: req.user._id.toString()
      }]
    };

    paypal.payment.create(payment, (error, payment) => {
      if (error) {
        console.error('PayPal payment creation error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to create PayPal payment'
        });
      }

      const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
      
      res.json({
        success: true,
        data: {
          paymentId: payment.id,
          approvalUrl: approvalUrl.href
        }
      });
    });
  } catch (error) {
    console.error('Create PayPal payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create PayPal payment'
    });
  }
});

/**
 * @swagger
 * /api/payment/paypal/execute-payment:
 *   post:
 *     summary: Execute PayPal payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentId
 *               - payerId
 *             properties:
 *               paymentId:
 *                 type: string
 *               payerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: PayPal payment executed successfully
 *       400:
 *         description: Payment failed or already processed
 */
router.post('/paypal/execute-payment', authenticateToken, [
  body('paymentId').notEmpty(),
  body('payerId').notEmpty()
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

    const { paymentId, payerId } = req.body;

    const executePayment = {
      payer_id: payerId
    };

    paypal.payment.execute(paymentId, executePayment, async (error, payment) => {
      if (error) {
        console.error('PayPal payment execution error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to execute PayPal payment'
        });
      }

      if (payment.state !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Payment not approved'
        });
      }

      const amount = parseFloat(payment.transactions[0].amount.total);
      const currency = payment.transactions[0].amount.currency;

      // Check if payment already processed
      const existingTransaction = await User.findOne({
        _id: req.user._id,
        'transactions.paymentId': paymentId
      });

      if (existingTransaction) {
        return res.status(400).json({
          success: false,
          message: 'Payment already processed'
        });
      }

      // Add balance to user
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { balance: amount },
        $push: {
          transactions: {
            type: 'payment',
            amount,
            currency,
            paymentMethod: 'paypal',
            paymentId,
            status: 'completed',
            createdAt: new Date()
          }
        }
      });

      res.json({
        success: true,
        message: 'Payment executed successfully',
        data: {
          amount,
          newBalance: req.user.balance + amount
        }
      });
    });
  } catch (error) {
    console.error('Execute PayPal payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute PayPal payment'
    });
  }
});

/**
 * @swagger
 * /api/payment/crypto/generate-address:
 *   post:
 *     summary: Generate crypto payment address
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *               currency:
 *                 type: string
 *                 enum: [BTC, ETH, LTC, USDT]
 *     responses:
 *       200:
 *         description: Crypto address generated successfully
 *       400:
 *         description: Validation error
 */
router.post('/crypto/generate-address', authenticateToken, [
  body('amount').isFloat({ min: 1 }),
  body('currency').isIn(['BTC', 'ETH', 'LTC', 'USDT'])
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

    const { amount, currency } = req.body;

    // Generate a unique payment ID
    const paymentId = require('crypto').randomBytes(16).toString('hex');
    
    // For demo purposes, generate a mock address
    // In production, integrate with a crypto payment processor like Coinbase Commerce
    const addresses = {
      BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      ETH: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      LTC: 'LTC1qTymQmqcdhUyU9Km2D1bVXqV6Vo7Vr',
      USDT: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    };

    const address = addresses[currency];

    // Store pending payment
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        transactions: {
          type: 'payment',
          amount,
          currency,
          paymentMethod: 'crypto',
          paymentId,
          address,
          status: 'pending',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        }
      }
    });

    res.json({
      success: true,
      data: {
        paymentId,
        address,
        amount,
        currency,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      }
    });
  } catch (error) {
    console.error('Generate crypto address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate crypto address'
    });
  }
});

/**
 * @swagger
 * /api/payment/crypto/check-payment:
 *   post:
 *     summary: Check crypto payment status
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentId
 *             properties:
 *               paymentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
 */
router.post('/crypto/check-payment', authenticateToken, [
  body('paymentId').notEmpty()
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

    const { paymentId } = req.body;

    const user = await User.findById(req.user._id);
    const transaction = user.transactions.find(t => t.paymentId === paymentId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // For demo purposes, simulate payment confirmation after 2 minutes
    // In production, check actual blockchain for payment
    const isConfirmed = Date.now() - transaction.createdAt.getTime() > 2 * 60 * 1000;

    if (isConfirmed && transaction.status === 'pending') {
      // Update transaction status and add balance
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { balance: transaction.amount },
        $set: {
          'transactions.$.status': 'completed'
        }
      });

      res.json({
        success: true,
        data: {
          status: 'completed',
          amount: transaction.amount,
          newBalance: req.user.balance + transaction.amount
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          status: transaction.status,
          amount: transaction.amount
        }
      });
    }
  } catch (error) {
    console.error('Check crypto payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status'
    });
  }
});

module.exports = router;
