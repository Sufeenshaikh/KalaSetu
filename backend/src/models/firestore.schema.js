/**
 * Firestore data models and collection structure for KalaSetu
 */

const firestoreSchema = {
  collections: {
    users: {
      fields: {
        uid: 'string',
        email: 'string',
        displayName: 'string',
        role: 'string', // 'user', 'artisan', 'admin'
        phoneNumber: 'string?',
        address: {
          street: 'string?',
          city: 'string?',
          state: 'string?',
          country: 'string?',
          pincode: 'string?'
        },
        createdAt: 'timestamp',
        updatedAt: 'timestamp'
      },
      indexes: [
        { fields: ['role', 'createdAt'] }
      ]
    },

    products: {
      fields: {
        artisanId: 'string',
        name: 'string',
        description: 'string',
        price: 'number',
        category: 'string',
        subcategory: 'string?',
        images: 'array<string>', // URLs
        tags: 'array<string>',
        stock: 'number',
        rating: 'number',
        reviewCount: 'number',
        isActive: 'boolean',
        createdAt: 'timestamp',
        updatedAt: 'timestamp'
      },
      indexes: [
        { fields: ['category', 'rating'] },
        { fields: ['artisanId', 'createdAt'] },
        { fields: ['tags', 'rating'] }
      ]
    },

    orders: {
      fields: {
        userId: 'string',
        artisanId: 'string',
        products: `array<{
          productId: string,
          quantity: number,
          price: number
        }>`,
        status: 'string', // 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
        totalAmount: 'number',
        shippingAddress: {
          street: 'string',
          city: 'string',
          state: 'string',
          country: 'string',
          pincode: 'string'
        },
        paymentStatus: 'string',
        createdAt: 'timestamp',
        updatedAt: 'timestamp'
      },
      indexes: [
        { fields: ['userId', 'createdAt'] },
        { fields: ['artisanId', 'status'] }
      ]
    },

    reviews: {
      fields: {
        userId: 'string',
        productId: 'string',
        rating: 'number',
        comment: 'string',
        images: 'array<string>?',
        createdAt: 'timestamp',
        updatedAt: 'timestamp'
      },
      indexes: [
        { fields: ['productId', 'rating'] },
        { fields: ['userId', 'createdAt'] }
      ]
    },

    aiContent: {
      fields: {
        type: 'string', // 'story', 'description', 'tags'
        contentKey: 'string', // Hash of input parameters
        content: 'string',
        createdAt: 'timestamp',
        expiresAt: 'timestamp'
      },
      indexes: [
        { fields: ['type', 'contentKey'] },
        { fields: ['expiresAt'] }
      ]
    },

    artisanStories: {
      fields: {
        artisanId: 'string',
        story: 'string',
        craft: 'string',
        experience: 'number',
        images: 'array<string>',
        featured: 'boolean',
        createdAt: 'timestamp',
        updatedAt: 'timestamp'
      },
      indexes: [
        { fields: ['artisanId'] },
        { fields: ['craft', 'featured'] }
      ]
    }
  }
};

export default firestoreSchema;