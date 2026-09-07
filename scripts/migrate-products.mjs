import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing.");
}

const products = [
  {
    id: 1,
    name: "Essential Heavy Tee",
    category: "T-Shirts",
    gender: "Unisex",
    price: 899,
    originalPrice: 1299,
    badge: "Bestseller",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=90",
    description:
      "A heavyweight everyday tee with a relaxed silhouette and clean finish.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 2,
    name: "Core Oversized Hoodie",
    category: "Hoodies",
    gender: "Unisex",
    price: 1499,
    originalPrice: 1999,
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=90",
    description:
      "A relaxed heavyweight hoodie designed for everyday layering.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 3,
    name: "Relaxed Oxford Shirt",
    category: "Shirts",
    gender: "Men",
    price: 1199,
    originalPrice: 1599,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=90",
    description:
      "A relaxed Oxford shirt balancing classic tailoring with a modern fit.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 4,
    name: "Relaxed Utility Cargo",
    category: "Bottomwear",
    gender: "Unisex",
    price: 1699,
    originalPrice: 2199,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=90",
    description:
      "Relaxed utility trousers with a contemporary streetwear silhouette.",
    sizes: ["28", "30", "32", "34", "36"],
  },
  {
    id: 5,
    name: "Vintage Graphic Tee",
    category: "T-Shirts",
    gender: "Unisex",
    price: 999,
    originalPrice: 1499,
    badge: "Trending",
    image:
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1000&q=90",
    description:
      "A vintage-inspired graphic tee with a relaxed everyday fit.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 6,
    name: "Fabrice Varsity Jacket",
    category: "Outerwear",
    gender: "Unisex",
    price: 2499,
    originalPrice: 3299,
    badge: "Limited",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=90",
    description:
      "A statement varsity jacket combining classic collegiate details with a modern cut.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 7,
    name: "Boxy Everyday Tee",
    category: "T-Shirts",
    gender: "Unisex",
    price: 799,
    originalPrice: 1099,
    image:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1000&q=90",
    description:
      "A clean boxy tee with a structured silhouette for everyday styling.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 9,
    name: "Minimal Zip Hoodie",
    category: "Hoodies",
    gender: "Unisex",
    price: 1599,
    originalPrice: 2199,
    image:
      "https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=1000&q=90",
    description:
      "A minimal full-zip hoodie with a relaxed everyday fit.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 10,
    name: "Heavyweight Pullover",
    category: "Hoodies",
    gender: "Unisex",
    price: 1799,
    originalPrice: 2299,
    badge: "Bestseller",
    image:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=90",
    description:
      "A premium heavyweight pullover built for colder days.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 11,
    name: "Linen Resort Shirt",
    category: "Shirts",
    gender: "Men",
    price: 1299,
    originalPrice: 1799,
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=90",
    description:
      "A lightweight resort shirt designed for relaxed summer dressing.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 12,
    name: "Textured Overshirt",
    category: "Shirts",
    gender: "Unisex",
    price: 1499,
    originalPrice: 1999,
    image:
      "https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=1000&q=90",
    description:
      "A versatile textured overshirt designed for effortless layering.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 13,
    name: "Wide Leg Utility Trousers",
    category: "Bottomwear",
    gender: "Unisex",
    price: 1799,
    originalPrice: 2399,
    badge: "Trending",
    image:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=90",
    description:
      "Wide-leg trousers combining utility details with a contemporary silhouette.",
    sizes: ["28", "30", "32", "34", "36"],
  },
  {
    id: 14,
    name: "Straight Fit Denim",
    category: "Bottomwear",
    gender: "Unisex",
    price: 1899,
    originalPrice: 2499,
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1000&q=90",
    description:
      "Classic straight-fit denim designed for everyday wear.",
    sizes: ["28", "30", "32", "34", "36"],
  },
  {
    id: 15,
    name: "Minimal Bomber",
    category: "Outerwear",
    gender: "Unisex",
    price: 2299,
    originalPrice: 2999,
    badge: "Limited",
    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1000&q=90",
    description:
      "A clean modern bomber jacket with a relaxed streetwear fit.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 16,
    name: "Cropped Studio Jacket",
    category: "Outerwear",
    gender: "Women",
    price: 2199,
    originalPrice: 2899,
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1548883354-94bcfe321cbb?auto=format&fit=crop&w=1000&q=90",
    description:
      "A cropped statement jacket designed for contemporary styling.",
    sizes: ["S", "M", "L"],
  },
  {
    id: 17,
    name: "Relaxed Knit Top",
    category: "Tops",
    gender: "Women",
    price: 1099,
    originalPrice: 1499,
    image:
      "https://images.unsplash.com/photo-1551489186-cf8726f514f8?auto=format&fit=crop&w=1000&q=90",
    description:
      "A soft relaxed knit top with a minimal contemporary silhouette.",
    sizes: ["S", "M", "L"],
  },
  {
    id: 18,
    name: "Everyday Ribbed Dress",
    category: "Dresses",
    gender: "Women",
    price: 1499,
    originalPrice: 1999,
    badge: "Bestseller",
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=90",
    description:
      "A minimal ribbed dress designed for effortless everyday dressing.",
    sizes: ["S", "M", "L"],
  },
];

const client = new MongoClient(uri);

try {
  await client.connect();

  const db = client.db("fabrice");
  const collection = db.collection("products");

  console.log(`Migrating ${products.length} products...`);

  for (const product of products) {
    await collection.replaceOne(
      { id: product.id },
      {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { upsert: true }
    );

    console.log(`✓ ${product.id} - ${product.name}`);
  }

  console.log("");
  console.log(
    `Successfully migrated ${products.length} products.`
  );
} catch (error) {
  console.error("Product migration failed:", error);
  process.exitCode = 1;
} finally {
  await client.close();
}