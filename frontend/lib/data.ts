import { Product, Order, User, Review } from './types'

export const products: Product[] = [
  {
    id: '1',
    name: 'Elegant Floral Maxi Dress',
    price: 89.99,
    originalPrice: 129.99,
    image: 'https://i.pinimg.com/1200x/53/87/a3/5387a37f0b4d296c0f73780ee3a8cafa.jpg',
    category: 'Dresses',
    rating: 4.8,
    reviews: 124,
    description: 'A stunning floral maxi dress perfect for summer occasions. Features a flowing silhouette with delicate floral prints.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Blush Pink', 'Sky Blue', 'Sage Green'],
    inStock: true,
    featured: true,
    trending: true
  },
  {
    id: '2',
    name: 'Classic Silk Blouse',
    price: 65.00,
    image: 'https://i.pinimg.com/736x/f1/f6/66/f1f66621796165745705b3216e80df48.jpg',
    category: 'Tops',
    rating: 4.6,
    reviews: 89,
    description: 'A timeless silk blouse that transitions seamlessly from office to evening. Soft, breathable, and elegantly tailored.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Ivory', 'Black', 'Dusty Rose'],
    inStock: true,
    featured: true
  },
  {
    id: '3',
    name: 'High-Waisted Palazzo Pants',
    price: 75.00,
    originalPrice: 95.00,
    image: 'https://i.pinimg.com/736x/52/27/20/52272072d38f330090505fc1e975df8e.jpg',
    category: 'Bottoms',
    rating: 4.7,
    reviews: 156,
    description: 'Effortlessly chic palazzo pants with a flattering high waist. Perfect for both casual and dressed-up looks.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Cream', 'Navy', 'Terracotta'],
    inStock: true,
    trending: true
  },
  {
    id: '4',
    name: 'Pearl Drop Earrings',
    price: 45.00,
    image: 'https://i.pinimg.com/736x/e1/59/23/e15923f90021340dcba00f32ae98ef37.jpg',
    category: 'Accessories',
    rating: 4.9,
    reviews: 203,
    description: 'Elegant freshwater pearl drop earrings with 14k gold-plated hooks. A classic accessory for any outfit.',
    sizes: ['One Size'],
    colors: ['Pearl White', 'Champagne'],
    inStock: true,
    featured: true
  },
  {
    id: '5',
    name: 'Cashmere Wrap Cardigan',
    price: 150.00,
    originalPrice: 199.00,
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop',
    category: 'Tops',
    rating: 4.8,
    reviews: 78,
    description: 'Luxuriously soft cashmere wrap cardigan. Perfect for layering in transitional weather.',
    sizes: ['S', 'M', 'L'],
    colors: ['Camel', 'Heather Grey', 'Blush'],
    inStock: true,
    trending: true
  },
  {
    id: '6',
    name: 'Shoes',
    price: 185.00,
    image: 'https://i.pinimg.com/736x/27/69/34/2769346f88f52c75bfe17064b76d0b2f.jpg',
    category: 'Accessories',
    rating: 4.7,
    reviews: 145,
    description: 'A sophisticated structured leather tote with multiple compartments. The perfect everyday bag.',
    sizes: ['One Size'],
    colors: ['Cognac', 'Black', 'Taupe'],
    inStock: true,
    featured: true
  },
  {
    id: '7',
    name: 'Necklace',
    price: 68.00,
    image: 'https://i.pinimg.com/736x/f7/ba/d8/f7bad8b4a1416fba548bbee476578a0f.jpg',
    category: 'Bottoms',
    rating: 4.5,
    reviews: 92,
    description: 'A breezy linen midi skirt with a beautiful drape. Ideal for warm weather styling.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Natural', 'Olive', 'Dusty Blue'],
    inStock: true
  },
  {
    id: '8',
    name: 'Satin Wrap Dress',
    price: 120.00,
    originalPrice: 160.00,
    image: 'https://i.pinimg.com/736x/27/69/34/2769346f88f52c75bfe17064b76d0b2f.jpg',
    category: 'Dresses',
    rating: 4.9,
    reviews: 187,
    description: 'A luxurious satin wrap dress that flatters every figure. Perfect for special occasions.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Emerald', 'Burgundy', 'Midnight Blue'],
    inStock: true,
    featured: true,
    trending: true
  }
]

export const categories = [
  { name: 'Accessories', image: 'https://i.pinimg.com/736x/f7/ba/d8/f7bad8b4a1416fba548bbee476578a0f.jpg', count: 45 },
  { name: 'Tops', image: 'https://i.pinimg.com/736x/da/ed/b3/daedb379b72f78384c6e8eef6e81e3bc.jpg', count: 62 },
  { name: 'Footwear', image: 'https://i.pinimg.com/736x/b2/cf/99/b2cf9922157cca1fa9e635ee44d3c25c.jpg', count: 38 }
]

export const sampleOrders: Order[] = [
  {
    id: 'ORD-001234',
    date: '2024-01-15',
    status: 'delivered',
    items: [
      {
        product: products[0],
        quantity: 1,
        size: 'M',
        color: 'Blush Pink'
      }
    ],
    total: 89.99,
    shippingAddress: {
      fullName: 'Jane Doe',
      address: '123 Fashion Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567'
    }
  },
  {
    id: 'ORD-001235',
    date: '2024-01-20',
    status: 'shipped',
    items: [
      {
        product: products[1],
        quantity: 2,
        size: 'S',
        color: 'Ivory'
      },
      {
        product: products[3],
        quantity: 1,
        size: 'One Size',
        color: 'Pearl White'
      }
    ],
    total: 175.00,
    shippingAddress: {
      fullName: 'Jane Doe',
      address: '123 Fashion Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567'
    }
  },
  {
    id: 'ORD-001236',
    date: '2024-01-25',
    status: 'processing',
    items: [
      {
        product: products[5],
        quantity: 1,
        size: 'One Size',
        color: 'Cognac'
      }
    ],
    total: 185.00,
    shippingAddress: {
      fullName: 'Jane Doe',
      address: '123 Fashion Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567'
    }
  }
]

export const sampleUser: User = {
  id: 'user-001',
  name: 'Jane Doe',
  email: 'jane.doe@email.com',
  phone: '+1 (555) 123-4567',
  addresses: [
    {
      fullName: 'Jane Doe',
      address: '123 Fashion Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567'
    }
  ]
}

export const sampleReviews: Review[] = [
  {
    id: 'rev-001',
    userId: 'user-002',
    userName: 'Sarah M.',
    rating: 5,
    comment: 'Absolutely love this dress! The fabric is so soft and the fit is perfect. Received so many compliments.',
    date: '2024-01-10'
  },
  {
    id: 'rev-002',
    userId: 'user-003',
    userName: 'Emily R.',
    rating: 4,
    comment: 'Beautiful quality and true to size. The color is slightly different from the photos but still gorgeous.',
    date: '2024-01-08'
  },
  {
    id: 'rev-003',
    userId: 'user-004',
    userName: 'Michelle K.',
    rating: 5,
    comment: 'Fast shipping and excellent packaging. The dress exceeded my expectations!',
    date: '2024-01-05'
  }
]
