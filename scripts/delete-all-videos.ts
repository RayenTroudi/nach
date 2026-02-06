import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function deleteAllVideos() {
  try {
    console.log("🗑️  Deleting All Videos from MongoDB\n");

    // Connect to MongoDB
    const mongoUrl = process.env.MONGODB_URL;
    if (!mongoUrl) {
      throw new Error("MONGODB_URL environment variable is missing");
    }

    await mongoose.connect(mongoUrl);
    console.log("✅ MongoDB Connected\n");

    // Define models
    const Video = mongoose.model(
      "Video",
      new mongoose.Schema({}, { strict: false })
    );

    const Section = mongoose.model(
      "Section",
      new mongoose.Schema({}, { strict: false })
    );

    const Course = mongoose.model(
      "Course",
      new mongoose.Schema({}, { strict: false })
    );

    // Get counts before deletion
    const videoCount = await Video.countDocuments();
    const coursesWithFaqVideo = await Course.countDocuments({
      faqVideo: { $exists: true, $ne: "" },
    });

    console.log("📊 Current State:");
    console.log(`   - Videos in database: ${videoCount}`);
    console.log(`   - Courses with FAQ videos: ${coursesWithFaqVideo}\n`);

    if (videoCount === 0 && coursesWithFaqVideo === 0) {
      console.log("✅ No videos to delete. Database is already clean.\n");
      await mongoose.disconnect();
      return;
    }

    // Confirm deletion
    console.log("⚠️  WARNING: This will permanently delete:");
    console.log(`   - ${videoCount} video records from Video collection`);
    console.log(`   - ${coursesWithFaqVideo} FAQ video references from Course collection`);
    console.log(`   - All video references from Section collection\n`);

    // Delete all videos from Video collection
    if (videoCount > 0) {
      console.log("🗑️  Deleting video records...");
      const deletedVideos = await Video.deleteMany({});
      console.log(`   ✅ Deleted ${deletedVideos.deletedCount} videos\n`);
    }

    // Clear video arrays in all sections
    console.log("🗑️  Clearing section video references...");
    const updatedSections = await Section.updateMany(
      { videos: { $exists: true } },
      { $set: { videos: [] } }
    );
    console.log(`   ✅ Cleared videos from ${updatedSections.modifiedCount} sections\n`);

    // Clear FAQ videos from all courses
    if (coursesWithFaqVideo > 0) {
      console.log("🗑️  Clearing FAQ video references...");
      const updatedCourses = await Course.updateMany(
        { faqVideo: { $exists: true, $ne: "" } },
        { $set: { faqVideo: "" } }
      );
      console.log(`   ✅ Cleared FAQ videos from ${updatedCourses.modifiedCount} courses\n`);
    }

    // Verify deletion
    const remainingVideos = await Video.countDocuments();
    const remainingFaqVideos = await Course.countDocuments({
      faqVideo: { $exists: true, $ne: "" },
    });

    console.log("✅ Cleanup Complete!");
    console.log(`   - Remaining videos: ${remainingVideos}`);
    console.log(`   - Remaining FAQ videos: ${remainingFaqVideos}\n`);

    if (remainingVideos === 0 && remainingFaqVideos === 0) {
      console.log("🎉 Database is now clean and ready for fresh uploads!\n");
    }

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

deleteAllVideos();
