/**
 * Cleanup Orphaned UploadThing Files
 * 
 * This script identifies and deletes video files in UploadThing
 * that no longer have corresponding database records.
 * 
 * NOTE: This requires UploadThing Pro plan for listFiles() API
 * 
 * Usage: npm run cleanup:uploadthing
 */

import { config } from "dotenv";
import { UTApi } from "uploadthing/server";
import Video from "../lib/models/video.model";
import { connectToDatabase } from "../lib/mongoose";
import path from "path";

// Load environment variables
config({ path: path.resolve(process.cwd(), ".env.local") });

// Verify token is loaded
if (!process.env.UPLOADTHING_TOKEN) {
  console.error("❌ ERROR: UPLOADTHING_TOKEN not found in environment");
  console.error("   Check your .env.local file\n");
  process.exit(1);
}

console.log("✅ Environment loaded successfully");
console.log(`   UPLOADTHING_TOKEN: ${process.env.UPLOADTHING_TOKEN?.substring(0, 20)}...`);
console.log(`   UPLOADTHING_APP_ID: ${process.env.UPLOADTHING_APP_ID}\n`);

// Initialize UTApi with token parameter
const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });

async function cleanupOrphanedFiles() {
  console.log("🔍 Starting UploadThing orphaned files cleanup...\n");

  try {
    // Connect to database
    console.log("📦 Connecting to database...");
    await connectToDatabase();
    console.log("✅ Database connected\n");

    // Get all video URLs from database
    console.log("📊 Fetching all video records from database...");
    const videos = await Video.find({}, "videoUrl title");
    const activeUrls = new Set(
      videos
        .map((v) => v.videoUrl)
        .filter((url) => url && url.includes("utfs.io"))
    );
    console.log(`✅ Found ${activeUrls.size} active video URLs in database\n`);

    // Get all files from UploadThing
    console.log("☁️  Fetching files from UploadThing...");
    console.log("⚠️  Note: This requires UploadThing Pro plan\n");

    let uploadedFiles;
    try {
      uploadedFiles = await utapi.listFiles();
    } catch (error: any) {
      if (error.message?.includes("Pro") || error.message?.includes("plan")) {
        console.error("❌ ERROR: listFiles() requires UploadThing Pro plan");
        console.error("   Upgrade at: https://uploadthing.com/pricing");
        console.error("\n   Alternative: Manually review files in dashboard");
        console.error("   Dashboard: https://uploadthing.com/dashboard\n");
        process.exit(1);
      }
      throw error;
    }

    console.log(`✅ Found ${uploadedFiles.files.length} files in UploadThing\n`);

    // Find orphaned files (files in UploadThing but not in database)
    console.log("🔍 Identifying orphaned files...");
    
    // Construct URLs from file keys
    const uploadedFileUrls = new Set(
      uploadedFiles.files.map(file => `https://utfs.io/f/${file.key}`)
    );
    
    const orphanedFiles = uploadedFiles.files.filter((file) => {
      const fileUrl = `https://utfs.io/f/${file.key}`;
      return !activeUrls.has(fileUrl);
    });

    if (orphanedFiles.length === 0) {
      console.log("✅ No orphaned files found! Storage is clean.\n");
      return;
    }

    console.log(`\n⚠️  Found ${orphanedFiles.length} orphaned files:\n`);

    // Display orphaned files
    let totalSize = 0;
    orphanedFiles.forEach((file, index) => {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      const fileUrl = `https://utfs.io/f/${file.key}`;
      totalSize += file.size;
      console.log(`${index + 1}. ${file.name || file.key}`);
      console.log(`   Size: ${sizeMB} MB`);
      console.log(`   Key: ${file.key}`);
      console.log(`   URL: ${fileUrl}`);
      console.log(`   Uploaded: ${new Date(file.uploadedAt).toLocaleDateString()}\n`);
    });

    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
    const totalSizeGB = (totalSize / 1024 / 1024 / 1024).toFixed(2);
    console.log(`📊 Total orphaned storage: ${totalSizeMB} MB (${totalSizeGB} GB)\n`);

    // Ask for confirmation
    console.log("⚠️  WARNING: This will permanently delete these files!");
    console.log("   Make sure you have reviewed the list above.\n");

    // In production, you'd want to add a confirmation prompt here
    // For now, we'll just do a dry run
    console.log("🔧 DRY RUN MODE - No files will be deleted");
    console.log("   To actually delete, uncomment the deletion code in the script\n");

    // UNCOMMENT BELOW TO ACTUALLY DELETE FILES
    /*
    console.log("🗑️  Deleting orphaned files...");
    for (const file of orphanedFiles) {
      try {
        await utapi.deleteFiles(file.key);
        console.log(`✅ Deleted: ${file.name || file.key}`);
      } catch (error: any) {
        console.error(`❌ Failed to delete ${file.key}: ${error.message}`);
      }
    }
    console.log("\n✅ Cleanup complete!");
    */

    console.log("✅ Dry run complete!\n");
    console.log("💡 Next steps:");
    console.log("   1. Review the orphaned files list above");
    console.log("   2. Verify these files are truly orphaned");
    console.log("   3. Uncomment the deletion code in the script");
    console.log("   4. Run again to actually delete files\n");

  } catch (error: any) {
    console.error("❌ Error during cleanup:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Storage usage report
async function getStorageReport() {
  console.log("📊 UploadThing Storage Report\n");

  try {
    await connectToDatabase();

    // Get all videos from database
    const videos = await Video.find({}, "videoUrl title").lean();
    const videoUrls = videos
      .map((v) => v.videoUrl)
      .filter((url) => url && url.includes("utfs.io"));

    console.log(`Videos in database: ${videoUrls.length}`);

    // Get files from UploadThing (Pro plan required)
    const files = await utapi.listFiles();
    const totalSize = files.files.reduce((acc, f) => acc + f.size, 0);

    console.log(`Files in UploadThing: ${files.files.length}`);
    console.log(`Total storage used: ${(totalSize / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`Storage limit (Free): 2 GB`);
    console.log(`Storage limit (Pro): 100 GB\n`);

    if (totalSize / 1024 / 1024 / 1024 > 1.5) {
      console.log("⚠️  WARNING: Approaching storage limit!");
      console.log("   Consider upgrading to Pro or cleaning up orphaned files\n");
    }
  } catch (error: any) {
    if (error.message?.includes("Pro") || error.message?.includes("plan")) {
      console.error("❌ Storage report requires UploadThing Pro plan");
      console.error("   Upgrade at: https://uploadthing.com/pricing\n");
    } else {
      console.error("❌ Error:", error.message);
    }
  }
}

// Main execution
const command = process.argv[2];

if (command === "report") {
  getStorageReport();
} else {
  cleanupOrphanedFiles();
}
