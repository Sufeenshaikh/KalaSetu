/**
 * Script to populate Firebase with dummy data
 * Run with: node scripts/populate-firebase.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBEh_w4QwH0a8Ht7o_5mc3L3WXp0oDRNhE",
  authDomain: "kalasetu-e55c4.firebaseapp.com",
  projectId: "kalasetu-e55c4",
  storageBucket: "kalasetu-e55c4.firebasestorage.app",
  messagingSenderId: "834060824789",
  appId: "1:834060824789:web:4156176653ec3603d1725c",
  measurementId: "G-ETCXHR73C0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dummy artisans data
const dummyArtisans = [
  {
    id: 'artisan-1',
    name: 'Rina Devi',
    region: 'Rajasthan',
    bio: 'A master of block printing, carrying on a family tradition.',
    story: `From the moment I could walk, the scent of indigo and the rhythmic 'thump-thump' of wooden blocks on fabric was my world. I grew up in a small village in Rajasthan, watching my grandmother, her hands stained with the colors of the earth, bring plain cotton to life. She would tell me that each block held a story—the peacock for beauty, the elephant for strength, the lotus for purity. She didn't just teach me a craft; she passed down a language.

Today, my own hands carry on that tradition. I mix my own dyes from turmeric, madder root, and pomegranate peel, just as she did. The process is slow, meditative. It requires patience and a deep respect for the materials. When I press a freshly carved block onto the fabric, I feel a connection to the generations of women before me who did the same. It's more than just making a pattern; it's about embedding a piece of our history, our soul, into the cloth.

Through my work, I want to share the vibrancy and spirit of Rajasthan with the world. Each scarf, each tapestry, is not just an item to be worn or displayed. It is a piece of my heart, a testament to a legacy that I am proud to carry forward. It is the story of my village, my family, and the enduring beauty of handmade art.`,
    image: 'https://media.istockphoto.com/id/1297412243/photo/a-female-artisan-busy-at-work-inside-saras-mela-fairground-held-at-newtown-kolkata.jpg?s=612x612&w=0&k=20&c=M6jE7E61ZzNSTMPU95EF06g7pXUvW0TBcbwMZGwoalA=',
  },
  {
    id: 'artisan-2',
    name: 'Sanjay Verma',
    region: 'Uttar Pradesh',
    bio: 'Expert potter shaping clay into timeless pieces of art.',
    story: 'Sanjay Verma finds solace at the potter\'s wheel. For him, shaping clay is a form of meditation. His workshop in Uttar Pradesh is filled with earthy aromas and the gentle hum of the wheel, where he creates pottery that blends traditional forms with modern aesthetics.',
    image: 'https://picsum.photos/id/1074/400/400',
  },
];

// Dummy products data
const dummyProducts = [
  {
    id: 'prod-10',
    title: 'Hand-carved Sandalwood Elephant',
    category: 'Woodwork',
    region: 'Karnataka',
    price: 180,
    description: "A symbol of wisdom and strength, this exquisite elephant figurine is hand-carved from fragrant sandalwood. A masterpiece of Karnataka's woodworking heritage, it's a perfect piece for collectors and art lovers.",
    images: ['https://4.imimg.com/data4/WJ/MV/ANDROID-12729036/product-500x500.jpeg'],
    artisanId: 'artisan-2',
    artisanName: 'Sanjay Verma',
    likes: 350,
  },
  {
    id: 'prod-1',
    title: 'Hand-Block Printed Scarf',
    category: 'Textiles',
    region: 'Rajasthan',
    price: 75,
    description: "Discover the timeless elegance of the Hand-Block Printed Scarf. Handcrafted with passion and skill by master artisans, this exquisite piece brings a touch of tradition and cultural heritage to your wardrobe. Perfect for connoisseurs of fine craftsmanship.",
    images: ['https://cdn11.bigcommerce.com/s-fb3s8/images/stencil/1280x1280/products/1557/19159/soft_cotton_green_scarf__17399.1752138490.jpg?c=2'],
    artisanId: 'artisan-1',
    artisanName: 'Rina Devi',
    likes: 320,
  },
  {
    id: 'prod-3',
    title: 'Madhubani Painted Wall Art',
    category: 'Painting',
    region: 'Bihar',
    price: 150,
    description: "Adorn your walls with the vibrant storytelling of our Madubani Painted Wall Art. Each intricate line and bold color is a testament to the rich cultural narratives of Bihar, making it a captivating centerpiece for any room.",
    images: ['https://d2emch4msrhe87.cloudfront.net/image/cache/data/the-bimba/auspicious-tree-of-life-madhubani-art-painting/updated/1-750x650.jpg'],
    artisanId: 'artisan-1',
    artisanName: 'Rina Devi',
    likes: 280,
  },
  {
    id: 'prod-4',
    title: 'Kalamkari Table Runner',
    category: 'Textiles',
    region: 'Andhra Pradesh',
    price: 90,
    description: "Elevate your dining experience with the Kalamkari Table Runner. Hand-painted using ancient techniques and natural dyes, this textile masterpiece showcases intricate mythological motifs, adding a touch of sophistication and history to your table setting.",
    images: ['https://5.imimg.com/data5/SELLER/Default/2024/9/449158090/KC/BA/QW/565387/whatsapp-image-2024-09-05-at-02-08-33-500x500.jpeg'],
    artisanId: 'artisan-2',
    artisanName: 'Sanjay Verma',
    likes: 250,
  },
  {
    id: 'prod-9',
    title: 'Embroidered Cushion Cover',
    category: 'Textiles',
    region: 'Gujarat',
    price: 70,
    description: "Add a splash of color to your living space with this vibrant cushion cover from Gujarat, featuring intricate Kutch embroidery. Each stitch tells a story of tradition and artistry, handcrafted by skilled women artisans.",
    images: ['https://thumbs.dreamstime.com/b/luxurious-embroidered-cushion-covers-bold-jewel-hues-beautifully-stacked-collection-embroidered-cushion-covers-dazzling-359257671.jpg'],
    artisanId: 'artisan-1',
    artisanName: 'Rina Devi',
    likes: 220,
  },
  {
    id: 'prod-6',
    title: 'Channapatna Wooden Toys',
    category: 'Woodwork',
    region: 'Karnataka',
    price: 30,
    description: "Delight in the charm of Channapatna Wooden Toys, the eco-friendly and safe choice for imaginative play. Crafted from soft ivory wood and finished with vibrant, non-toxic vegetable dyes, these toys are a cherished part of Karnataka's craft heritage.",
    images: ['https://www.shutterstock.com/image-photo/hand-made-wooden-colorful-channapatna-600nw-1645250647.jpg'],
    artisanId: 'artisan-2',
    artisanName: 'Sanjay Verma',
    likes: 190,
  },
  {
    id: 'prod-7',
    title: 'Pattachitra Scroll Painting',
    category: 'Painting',
    region: 'Odisha',
    price: 300,
    description: "Own a piece of ancient artistry with the Pattachitra Scroll Painting from Odisha. This intricate narrative art, painted on cloth with natural pigments, tells epic tales through fine, bold brushwork, offering a timeless and culturally rich addition to your collection.",
    images: ['https://www.sowpeace.in/cdn/shop/articles/crafts-of-india-2-exploring-pattachitra-a-shared-treasure-of-west-bengal-and-odisha-178748.jpg?v=1736197998'],
    artisanId: 'artisan-1',
    artisanName: 'Rina Devi',
    likes: 210,
  },
  {
    id: 'prod-8',
    title: 'Blue Pottery Vase',
    category: 'Pottery',
    region: 'Rajasthan',
    price: 100,
    description: "Experience the royal heritage of Jaipur with our stunning Blue Pottery Vase. Made from a unique quartz-based clay and adorned with intricate cobalt blue motifs, this vase is a vibrant and elegant statement piece that embodies centuries of Rajasthani artistry.",
    images: ['https://imgshopimages.lbb.in/catalog/product/b/f/bfvwf660_a.jpg'],
    artisanId: 'artisan-2',
    artisanName: 'Sanjay Verma',
    likes: 176,
  },
  {
    id: 'prod-5',
    title: 'Brass Diya Lamp',
    category: 'Metalwork',
    region: 'Kerala',
    price: 50,
    description: "Illuminate your space with the warm glow of our handcrafted Brass Diya Lamp. A symbol of purity and tradition, this elegant piece is meticulously crafted by artisans from Kerala, making it perfect for festive occasions or as a serene decorative item.",
    images: ['https://t4.ftcdn.net/jpg/09/54/14/77/360_F_954147727_7YwnWRRrZAjjw8n2ym0IkKJar91uOT9g.jpg'],
    artisanId: 'artisan-1',
    artisanName: 'Rina Devi',
    likes: 134,
  },
  {
    id: 'prod-2',
    title: 'Terracotta Clay Pot',
    category: 'Pottery',
    region: 'Uttar Pradesh',
    price: 80,
    description: "Embrace rustic charm with our Terracotta Clay Pot. Skillfully hand-thrown on a potter's wheel, this piece reflects generations of traditional artistry. Its earthy tones and classic form make it a perfect accent for any home or garden.",
    images: ['https://i.etsystatic.com/14269795/r/il/ff4445/2744447778/il_fullxfull.2744447778_eulu.jpg'],
    artisanId: 'artisan-2',
    artisanName: 'Sanjay Verma',
    likes: 199,
  },
  {
    id: 'prod-11',
    title: 'Dhokra Brass Figurine',
    category: 'Metalwork',
    region: 'Chhattisgarh',
    price: 120,
    description: "This unique brass figurine is crafted using the ancient Dhokra art form, a lost-wax casting technique. Representing tribal life and folklore, this piece from Chhattisgarh is a rustic and powerful addition to any decor.",
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQB1qmJP_6B8LKocE6otQHEn45e0qIydQXI3w&s'],
    artisanId: 'artisan-1',
    artisanName: 'Rina Devi',
    likes: 78,
  },
  {
    id: 'prod-12',
    title: 'Pashmina Shawl',
    category: 'Textiles',
    region: 'Kashmir',
    price: 350,
    description: "Wrap yourself in the unparalleled warmth and softness of a genuine Pashmina shawl from Kashmir. Woven from the finest cashmere wool, its delicate texture and timeless elegance make it a luxurious heirloom piece.",
    images: ['https://media.istockphoto.com/id/177783752/photo/colourful-scarves.jpg?s=612x612&w=0&k=20&c=aZZMPlxHqjiAEZvwldVUT00_6z6RwIHeqT_oMud2iaA='],
    artisanId: 'artisan-2',
    artisanName: 'Sanjay Verma',
    likes: 350,
  },
  {
    id: 'prod-13',
    title: 'Terracotta Horse Statue',
    category: 'Pottery',
    region: 'West Bengal',
    price: 1000,
    description: "Inspired by the famous Bankura horse, this terracotta statue is a powerful symbol of West Bengal's folk art. Its distinct, stylized form and earthy texture make it a striking decorative object.",
    images: ['https://i.pinimg.com/736x/be/82/26/be8226851e2d436a81ae3ac6959caae8.jpg'],
    artisanId: 'artisan-1',
    artisanName: 'Rina Devi',
    likes: 105,
  },
  {
    id: 'prod-14',
    title: 'Warli Painting on Canvas',
    category: 'Painting',
    region: 'Maharashtra',
    price: 130,
    description: "This captivating Warli painting depicts scenes of daily life and nature using simple, geometric shapes. A traditional art form of the Warli tribe in Maharashtra, it offers a charming and authentic glimpse into tribal culture.",
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRY8_1NDvcQiqacuWyUhWg5IQRn2eY3RjQRvg&s'],
    artisanId: 'artisan-2',
    artisanName: 'Sanjay Verma',
    likes: 65,
  },
  {
    id: 'prod-15',
    title: 'Leather Mojari Shoes',
    category: 'Leatherwork',
    region: 'Rajasthan',
    price: 90,
    description: "Step out in style with these handcrafted leather Mojari shoes from Rajasthan. Embellished with traditional embroidery, these comfortable and elegant shoes are a classic part of Indian footwear heritage.",
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiQ0OKmnA75UrXNvqpt-maUhs4GJSneF2q2A&s'],
    artisanId: 'artisan-1',
    artisanName: 'Rina Devi',
    likes: 99,
  },
  {
    id: 'prod-16',
    title: 'Bamboo Weave Basket',
    category: 'Basketry',
    region: 'Assam',
    price: 50,
    description: "Functional and beautiful, this basket is handwoven from natural bamboo by artisans in Assam. Its sturdy construction and intricate weave make it perfect for storage or as a decorative piece, bringing a touch of nature indoors.",
    images: ['https://www.greendna.in/cdn/shop/products/IMG_20200925_184833_4608x.jpg?v=1601044957'],
    artisanId: 'artisan-2',
    artisanName: 'Sanjay Verma',
    likes: 45,
  },
];

async function populateFirestore() {
  console.log('🚀 Starting Firebase population...\n');

  try {
    // 1. Populate Artisans
    console.log('📝 Populating artisans...');
    for (const artisan of dummyArtisans) {
      const artisanRef = doc(db, 'artisans', artisan.id);
      await setDoc(artisanRef, {
        name: artisan.name,
        region: artisan.region,
        bio: artisan.bio,
        story: artisan.story,
        image: artisan.image,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`   ✅ Created artisan: ${artisan.name}`);
    }

    // 2. Populate Products
    console.log('\n📦 Populating products...');
    for (const product of dummyProducts) {
      const productRef = doc(db, 'products', product.id);
      await setDoc(productRef, {
        title: product.title,
        category: product.category,
        region: product.region,
        price: product.price,
        description: product.description,
        images: product.images,
        artisanId: product.artisanId,
        artisanName: product.artisanName,
        likes: product.likes || 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`   ✅ Created product: ${product.title}`);
    }

    // 3. Create corresponding user records for artisans
    console.log('\n👤 Creating user records for artisans...');
    for (const artisan of dummyArtisans) {
      const userRef = doc(db, 'users', artisan.id);
      await setDoc(userRef, {
        email: `${artisan.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        displayName: artisan.name,
        role: 'artisan',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }, { merge: true }); // Use merge to avoid overwriting existing users
      console.log(`   ✅ Created user record for: ${artisan.name}`);
    }

    console.log('\n✅ Firebase population complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   - ${dummyArtisans.length} artisans created`);
    console.log(`   - ${dummyProducts.length} products created`);
    console.log(`   - ${dummyArtisans.length} user records created`);
    console.log('\n🎉 You can now view the data in Firebase Console!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error populating Firebase:', error);
    process.exit(1);
  }
}

populateFirestore();
