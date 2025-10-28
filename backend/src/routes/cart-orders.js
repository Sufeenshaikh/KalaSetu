/**
 * Cart and order management routes for KalaSetu
 * Handles shopping cart operations and order processing with Stripe
 */

import { Router } from 'express';
import { verifyToken } from '../../server.js';
import * as cartController from '../controllers/cart.controller.js';
import * as orderController from '../controllers/order.controller.js';

const router = Router();

/**
 * Cart Routes
 */

/**
 * GET /api/cart
 * Get current user's cart
 */
router.get('/cart', verifyToken, cartController.getCart);

/**
 * POST /api/cart
 * Add item to cart
 * @body {string} productId - Product to add
 * @body {number} quantity - Quantity to add
 */
router.post('/cart', verifyToken, cartController.addToCart);

/**
 * PUT /api/cart/:itemId
 * Update cart item quantity
 * @body {number} quantity - New quantity
 */
router.put('/cart/:itemId', verifyToken, cartController.updateCartItem);

/**
 * DELETE /api/cart/:itemId
 * Remove item from cart
 */
router.delete('/cart/:itemId', verifyToken, cartController.removeFromCart);

/**
 * DELETE /api/cart
 * Clear entire cart
 */
router.delete('/cart', verifyToken, cartController.clearCart);

/**
 * Order Routes
 */

/**
 * GET /api/orders
 * List user's orders
 * @query {string} status - Filter by status
 */
router.get('/orders', verifyToken, orderController.listOrders);

/**
 * GET /api/orders/:orderId
 * Get single order details
 */
router.get('/orders/:orderId', verifyToken, orderController.getOrder);

/**
 * POST /api/orders
 * Create a new order from cart
 * @body {object} shippingInfo - Shipping details
 */
router.post('/orders', verifyToken, orderController.createOrder);

/**
 * POST /api/orders/checkout
 * Create Stripe checkout session for current cart
 */
router.post('/orders/checkout', verifyToken, orderController.createCheckoutSession);

/**
 * POST /api/orders/webhook
 * Handle Stripe webhook events
 */
router.post('/orders/webhook',
  // Raw body needed for Stripe signature verification
  express.raw({ type: 'application/json' }),
  orderController.handleStripeWebhook
);

/**
 * PUT /api/orders/:orderId
 * Update order status (artisan only)
 * @body {string} status - New status
 */
router.put('/orders/:orderId',
  verifyToken,
  orderController.verifyArtisan,
  orderController.updateOrderStatus
);

/**
 * POST /api/orders/:orderId/cancel
 * Cancel an order (if cancellable)
 */
router.post('/orders/:orderId/cancel',
  verifyToken,
  orderController.cancelOrder
);

export default router;