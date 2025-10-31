import { collections, db } from './firebase.service';
import admin from 'firebase-admin';

export class OrderService {
  static async createOrder(orderData: {
    customerId: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    shippingAddress: {
      address: string;
      city: string;
      state: string;
      pincode: string;
    };
  }) {
    const batch = db.batch();

    try {
      // Calculate total amount
      const totalAmount = orderData.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Create order document
      const orderRef = collections.orders.doc();
      const order = {
        ...orderData,
        status: 'pending',
        totalAmount,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      batch.set(orderRef, order);

      // Update product inventory
      for (const item of orderData.items) {
        const productRef = collections.products.doc(item.productId);
        const productDoc = await productRef.get();
        const productData = productDoc.data();

        if (!productData) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (productData.inStock < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }

        batch.update(productRef, {
          inStock: admin.firestore.FieldValue.increment(-item.quantity),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      await batch.commit();
      return orderRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  static async updateOrderStatus(orderId: string, status: string) {
    try {
      await collections.orders.doc(orderId).update({
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  static async getCustomerOrders(customerId: string) {
    try {
      const snapshot = await collections.orders
        .where('customerId', '==', customerId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting customer orders:', error);
      throw error;
    }
  }

  static async getArtisanOrders(artisanId: string) {
    try {
      const snapshot = await collections.orders
        .where('items.productId', 'in', 
          await this.getArtisanProductIds(artisanId))
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting artisan orders:', error);
      throw error;
    }
  }

  private static async getArtisanProductIds(artisanId: string) {
    const productsSnapshot = await collections.products
      .where('artisanId', '==', artisanId)
      .select() // Only get document IDs
      .get();

    return productsSnapshot.docs.map(doc => doc.id);
  }
}