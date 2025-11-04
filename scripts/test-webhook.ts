import { connectToDatabase } from "../lib/mongoose";
import User from "../lib/models/user.model";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testWebhook() {
  try {
    console.log("Testing MongoDB connection and user creation...");
    
    // Test connection
    await connectToDatabase();
    console.log("✅ MongoDB connected successfully");
    
    // Create a test user
    const testUser = {
      clerkId: `test_${Date.now()}`,
      firstName: "Test",
      lastName: "User",
      username: "Test User",
      email: `test${Date.now()}@example.com`,
      picture: "",
    };
    
    console.log("Creating test user:", testUser);
    
    const user = await User.create(testUser);
    console.log("✅ User created successfully:", user);
    
    // Clean up test user
    await User.deleteOne({ _id: user._id });
    console.log("✅ Test user cleaned up");
    
    console.log("\n✅ All tests passed! Webhook should work correctly.");
    
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Test failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

testWebhook();
