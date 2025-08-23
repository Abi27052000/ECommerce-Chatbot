import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { z } from "zod";
import "dotenv/config";

// Create MongoDB client instance using connection string from environment variables
const client = new MongoClient(process.env.MONGODB_ATLAS_URI as string);

// Define schema for furniture item structure using Zod validation
const itemSchema = z.object({
  item_id: z.string(),
  item_name: z.string(),
  item_description: z.string(),
  brand: z.string(),
  manufacturer_address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string(),
  }),
  prices: z.object({
    full_price: z.number(),
    sale_price: z.number(),
  }),
  categories: z.array(z.string()),
  user_reviews: z.array(
    z.object({
      review_date: z.string(),
      rating: z.number(),
      comment: z.string(),
    })
  ),
  notes: z.string(),
});

// Create TypeScript type from Zod schema for type safety
type Item = z.infer<typeof itemSchema>;

// Static list of furniture items
const items: Item[] = [
  {
    item_id: "1",
    item_name: "Modern Sofa",
    item_description: "A comfortable 3-seater sofa with fabric upholstery.",
    brand: "HomeComfort",
    manufacturer_address: {
      street: "123 Maple St",
      city: "New York",
      state: "NY",
      postal_code: "10001",
      country: "USA",
    },
    prices: {
      full_price: 1200,
      sale_price: 950,
    },
    categories: ["Living Room", "Sofa"],
    user_reviews: [
      {
        review_date: "2025-01-05",
        rating: 5,
        comment: "Very comfy and stylish!",
      },
    ],
    notes: "Limited stock available.",
  },
  {
    item_id: "2",
    item_name: "Dining Table Set",
    item_description: "6-seater dining table with oak wood finish.",
    brand: "WoodWorks",
    manufacturer_address: {
      street: "456 Oak Ave",
      city: "Chicago",
      state: "IL",
      postal_code: "60601",
      country: "USA",
    },
    prices: {
      full_price: 2200,
      sale_price: 1800,
    },
    categories: ["Dining Room", "Table"],
    user_reviews: [
      {
        review_date: "2025-02-10",
        rating: 4,
        comment: "Strong build but a bit heavy.",
      },
    ],
    notes: "Includes 6 matching chairs.",
  },
  {
    item_id: "3",
    item_name: "Office Chair",
    item_description: "Ergonomic office chair with lumbar support.",
    brand: "ErgoSeats",
    manufacturer_address: {
      street: "789 Pine Rd",
      city: "San Francisco",
      state: "CA",
      postal_code: "94101",
      country: "USA",
    },
    prices: {
      full_price: 350,
      sale_price: 299,
    },
    categories: ["Office", "Chair"],
    user_reviews: [
      {
        review_date: "2025-03-01",
        rating: 5,
        comment: "Perfect for long working hours.",
      },
    ],
    notes: "Available in black and gray.",
  },
  {
    item_id: "4",
    item_name: "Queen Bed Frame",
    item_description: "Wooden bed frame with storage drawers.",
    brand: "SleepWell",
    manufacturer_address: {
      street: "321 Cedar St",
      city: "Dallas",
      state: "TX",
      postal_code: "75001",
      country: "USA",
    },
    prices: {
      full_price: 950,
      sale_price: 850,
    },
    categories: ["Bedroom", "Bed"],
    user_reviews: [
      {
        review_date: "2025-01-20",
        rating: 4,
        comment: "Good build but storage is small.",
      },
    ],
    notes: "Assembly required.",
  },
  {
    item_id: "5",
    item_name: "Bookshelf",
    item_description: "5-tier bookshelf made of walnut wood.",
    brand: "ReadSpace",
    manufacturer_address: {
      street: "654 Birch Ln",
      city: "Seattle",
      state: "WA",
      postal_code: "98101",
      country: "USA",
    },
    prices: {
      full_price: 400,
      sale_price: 350,
    },
    categories: ["Living Room", "Storage"],
    user_reviews: [
      {
        review_date: "2025-04-15",
        rating: 5,
        comment: "Looks elegant and sturdy.",
      },
    ],
    notes: "Available in dark and light finishes.",
  },
  {
    item_id: "6",
    item_name: "Coffee Table",
    item_description: "Glass-top coffee table with steel legs.",
    brand: "UrbanLiving",
    manufacturer_address: {
      street: "852 Spruce Blvd",
      city: "Miami",
      state: "FL",
      postal_code: "33101",
      country: "USA",
    },
    prices: {
      full_price: 600,
      sale_price: 520,
    },
    categories: ["Living Room", "Table"],
    user_reviews: [
      {
        review_date: "2025-05-02",
        rating: 4,
        comment: "Stylish but glass needs regular cleaning.",
      },
    ],
    notes: "Best paired with modern sofas.",
  },
  {
    item_id: "7",
    item_name: "Wardrobe",
    item_description: "3-door wardrobe with mirror panels.",
    brand: "ClosetKing",
    manufacturer_address: {
      street: "147 Elm Dr",
      city: "Boston",
      state: "MA",
      postal_code: "02108",
      country: "USA",
    },
    prices: {
      full_price: 1800,
      sale_price: 1600,
    },
    categories: ["Bedroom", "Storage"],
    user_reviews: [
      {
        review_date: "2025-06-01",
        rating: 5,
        comment: "Spacious and stylish design.",
      },
    ],
    notes: "Mirror is fragile, handle with care.",
  },
  {
    item_id: "8",
    item_name: "Recliner Chair",
    item_description: "Leather recliner chair with footrest.",
    brand: "RelaxPro",
    manufacturer_address: {
      street: "963 Willow Way",
      city: "Los Angeles",
      state: "CA",
      postal_code: "90001",
      country: "USA",
    },
    prices: {
      full_price: 800,
      sale_price: 700,
    },
    categories: ["Living Room", "Chair"],
    user_reviews: [
      {
        review_date: "2025-06-18",
        rating: 5,
        comment: "Super comfy for movie nights!",
      },
    ],
    notes: "Available in brown and black.",
  },
  {
    item_id: "9",
    item_name: "Study Desk",
    item_description: "Compact study desk with two drawers.",
    brand: "WorkEase",
    manufacturer_address: {
      street: "753 Aspen Ct",
      city: "Denver",
      state: "CO",
      postal_code: "80201",
      country: "USA",
    },
    prices: {
      full_price: 500,
      sale_price: 450,
    },
    categories: ["Office", "Desk"],
    user_reviews: [
      {
        review_date: "2025-07-01",
        rating: 4,
        comment: "Perfect size for small rooms.",
      },
    ],
    notes: "Chair not included.",
  },
  {
    item_id: "10",
    item_name: "TV Stand",
    item_description: "Wooden TV stand with cable management.",
    brand: "MediaMax",
    manufacturer_address: {
      street: "258 Poplar St",
      city: "Atlanta",
      state: "GA",
      postal_code: "30301",
      country: "USA",
    },
    prices: {
      full_price: 700,
      sale_price: 620,
    },
    categories: ["Living Room", "Storage"],
    user_reviews: [
      {
        review_date: "2025-08-10",
        rating: 5,
        comment: "Fits perfectly under my 55-inch TV.",
      },
    ],
    notes: "Supports TVs up to 65 inches.",
  },
];

// Function to create database and collection before seeding
async function setupDatabaseAndCollection(): Promise<void> {
  console.log("Setting up database and collection...");
  const db = client.db("inventory_database");
  const collections = await db.listCollections({ name: "items" }).toArray();

  if (collections.length === 0) {
    await db.createCollection("items");
    console.log("Created 'items' collection in 'inventory_database' database");
  } else {
    console.log(
      "'items' collection already exists in 'inventory_database' database"
    );
  }
}

// Function to create vector search index
async function createVectorSearchIndex(): Promise<void> {
  try {
    const db = client.db("inventory_database");
    const collection = db.collection("items");
    await collection.dropIndexes();
    const vectorSearchIdx = {
      name: "vector_index",
      type: "vectorSearch",
      definition: {
        fields: [
          {
            type: "vector",
            path: "embedding",
            numDimensions: 768,
            similarity: "cosine",
          },
        ],
      },
    };
    console.log("Creating vector search index...");
    await collection.createSearchIndex(vectorSearchIdx);
    console.log("Successfully created vector search index");
  } catch (e) {
    console.error("Failed to create vector search index:", e);
  }
}

// Function to create a searchable text summary from furniture item data
async function createItemSummary(item: Item): Promise<string> {
  return new Promise((resolve) => {
    const manufacturerDetails = `Made in ${item.manufacturer_address.country}`;
    const categories = item.categories.join(", ");
    const userReviews = item.user_reviews
      .map(
        (review) =>
          `Rated ${review.rating} on ${review.review_date}: ${review.comment}`
      )
      .join(" ");
    const basicInfo = `${item.item_name} ${item.item_description} from the brand ${item.brand}`;
    const price = `At full price it costs: ${item.prices.full_price} USD, On sale it costs: ${item.prices.sale_price} USD`;
    const notes = item.notes;
    const summary = `${basicInfo}. Manufacturer: ${manufacturerDetails}. Categories: ${categories}. Reviews: ${userReviews}. Price: ${price}. Notes: ${notes}`;
    resolve(summary);
  });
}

// Main function to populate database with static furniture data
async function seedDatabase(): Promise<void> {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");

    await setupDatabaseAndCollection();
    await createVectorSearchIndex();

    const db = client.db("inventory_database");
    const collection = db.collection("items");

    await collection.deleteMany({});
    console.log("Cleared existing data from items collection");

    const recordsWithSummaries = await Promise.all(
      items.map(async (record) => ({
        pageContent: await createItemSummary(record),
        metadata: { ...record },
      }))
    );

    for (const record of recordsWithSummaries) {
      await MongoDBAtlasVectorSearch.fromDocuments(
        [record],
        new GoogleGenerativeAIEmbeddings({
          apiKey: process.env.GOOGLE_API_KEY,
          modelName: "text-embedding-004",
        }),
        {
          collection,
          indexName: "vector_index",
          textKey: "embedding_text",
          embeddingKey: "embedding",
        }
      );
      console.log(
        "Successfully processed & saved record:",
        record.metadata.item_id
      );
    }

    console.log("Database seeding completed");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

// Execute the database seeding function and handle any errors
seedDatabase().catch(console.error);
