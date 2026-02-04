import { config } from 'dotenv';
import { connectToDatabase } from "@/lib/mongoose";
import DocumentBundle from "@/lib/models/document-bundle.model";

// Load environment variables from .env.local
config({ path: '.env.local' });

async function fixBundleFolders() {
  try {
    await connectToDatabase();
    
    console.log("Starting migration to add isFolder field to existing bundles...");
    
    // Update all bundles that don't have isFolder field
    const result = await DocumentBundle.updateMany(
      { isFolder: { $exists: false } },
      { $set: { isFolder: false } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} bundles with isFolder: false`);
    
    // Also ensure parentFolder is set to null for root items
    const rootResult = await DocumentBundle.updateMany(
      { parentFolder: { $exists: false } },
      { $set: { parentFolder: null } }
    );
    
    console.log(`✅ Updated ${rootResult.modifiedCount} bundles with parentFolder: null`);
    
    // Show all bundles
    const allBundles = await DocumentBundle.find({}, 'title isFolder parentFolder').lean();
    console.log("\nAll bundles after migration:");
    allBundles.forEach(bundle => {
      console.log(`  - ${bundle.title}: isFolder=${bundle.isFolder}, parentFolder=${bundle.parentFolder || 'null'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

fixBundleFolders();
