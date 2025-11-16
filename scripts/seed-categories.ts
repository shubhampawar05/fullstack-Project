/**
 * Seed Categories Script
 * Run this to populate initial categories in the database
 * 
 * Usage: npx tsx scripts/seed-categories.ts
 */

// Load environment variables from .env file
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });

import connectDB from "../lib/db";
import Category from "../models/Category";

const categories = [
  // Items Categories
  { name: "Electronics", slug: "electronics", icon: "📱", description: "Phones, laptops, gadgets" },
  { name: "Furniture", slug: "furniture", icon: "🪑", description: "Chairs, tables, sofas" },
  { name: "Clothing & Accessories", slug: "clothing", icon: "👕", description: "Clothes, shoes, bags" },
  { name: "Books & Media", slug: "books", icon: "📚", description: "Books, movies, games" },
  { name: "Vehicles", slug: "vehicles", icon: "🚗", description: "Cars, bikes, scooters" },
  { name: "Home & Garden", slug: "home-garden", icon: "🏠", description: "Home decor, tools, plants" },
  { name: "Sports & Outdoors", slug: "sports-outdoors", icon: "⚽", description: "Sports equipment, camping gear" },
  { name: "Toys & Games", slug: "toys-games", icon: "🎮", description: "Toys, board games, video games" },
  { name: "Appliances", slug: "appliances", icon: "🔌", description: "Kitchen, laundry, home appliances" },
  { name: "Musical Instruments", slug: "musical-instruments", icon: "🎸", description: "Guitars, pianos, drums" },
  { name: "Art & Collectibles", slug: "art-collectibles", icon: "🎨", description: "Artwork, antiques, collectibles" },
  { name: "Baby & Kids", slug: "baby-kids", icon: "👶", description: "Baby gear, kids items" },
  
  // Services Categories
  { name: "Tutoring & Education", slug: "tutoring", icon: "📖", description: "Tutoring, lessons, classes" },
  { name: "Repairs & Maintenance", slug: "repairs", icon: "🔧", description: "Home repairs, car repairs" },
  { name: "Cleaning Services", slug: "cleaning", icon: "🧹", description: "House cleaning, office cleaning" },
  { name: "Personal Care", slug: "personal-care", icon: "💇", description: "Haircuts, massages, beauty" },
  { name: "Pet Care", slug: "pet-care", icon: "🐕", description: "Pet sitting, dog walking, grooming" },
  { name: "Delivery & Moving", slug: "delivery-moving", icon: "📦", description: "Delivery services, moving help" },
  { name: "Photography", slug: "photography", icon: "📷", description: "Event photography, portraits" },
  { name: "Event Planning", slug: "event-planning", icon: "🎉", description: "Party planning, event coordination" },
  { name: "Tech Support", slug: "tech-support", icon: "💻", description: "Computer repair, tech help" },
  { name: "Fitness & Training", slug: "fitness-training", icon: "💪", description: "Personal training, fitness classes" },
  { name: "Cooking & Catering", slug: "cooking-catering", icon: "🍳", description: "Cooking lessons, catering" },
  { name: "Other", slug: "other", icon: "📦", description: "Other items and services" },
];

async function seedCategories() {
  try {
    console.log("🌱 Starting category seeding...");
    
    await connectDB();
    console.log("✅ Connected to database");

    let created = 0;
    let updated = 0;

    for (const cat of categories) {
      const result = await Category.findOneAndUpdate(
        { slug: cat.slug },
        {
          ...cat,
          isActive: true,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      if (result.isNew) {
        created++;
        console.log(`✅ Created: ${cat.name}`);
      } else {
        updated++;
        console.log(`♻️  Updated: ${cat.name}`);
      }
    }

    console.log("\n🎉 Category seeding completed!");
    console.log(`📊 Created: ${created} categories`);
    console.log(`🔄 Updated: ${updated} categories`);
    console.log(`📦 Total: ${categories.length} categories`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  }
}

// Run the seed function
seedCategories();

