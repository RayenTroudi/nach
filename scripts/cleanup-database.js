const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const KEEP_USER_ID = '690a32a72d65b334817a5e07';
const KEEP_CLERK_ID = 'user_351RfTo5Cc4J7PXl3IFAcwq3mzC';

async function cleanupDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB successfully!\n');

    const db = mongoose.connection.db;

    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log('Found collections:', collections.map(c => c.name).join(', '));
    console.log('\n');

    // First, let's see what's in the users collection
    const usersCollection = db.collection('users');
    const allUsers = await usersCollection.find({}).toArray();
    console.log(`Total users in database: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`  - ${user.username || 'Unknown'} (ID: ${user._id}, ClerkID: ${user.clerkId})`);
    });
    console.log('\n');

    // Collections to clean up
    const collectionNames = collections.map(c => c.name);

    for (const collectionName of collectionNames) {
      const collection = db.collection(collectionName);
      
      console.log(`\n📋 Processing collection: ${collectionName}`);
      
      try {
        // Count documents before deletion
        const countBefore = await collection.countDocuments();
        console.log(`  Documents before: ${countBefore}`);

        let deleteResult;

        // Handle different collections differently
        switch (collectionName) {
          case 'users':
            // Keep only the specified user
            deleteResult = await collection.deleteMany({
              _id: { $ne: new mongoose.Types.ObjectId(KEEP_USER_ID) },
              clerkId: { $ne: KEEP_CLERK_ID }
            });
            break;

          case 'courses':
            // Keep courses owned by the user
            deleteResult = await collection.deleteMany({
              instructor: { $ne: new mongoose.Types.ObjectId(KEEP_USER_ID) }
            });
            break;

          case 'purchases':
            // Keep purchases by the user
            deleteResult = await collection.deleteMany({
              userId: { $ne: new mongoose.Types.ObjectId(KEEP_USER_ID) }
            });
            break;

          case 'userprogresses':
            // Keep user progress for the user
            deleteResult = await collection.deleteMany({
              userId: { $ne: new mongoose.Types.ObjectId(KEEP_USER_ID) }
            });
            break;

          case 'usercoursevideocompleteds':
            // Keep completed videos for the user
            deleteResult = await collection.deleteMany({
              userId: { $ne: new mongoose.Types.ObjectId(KEEP_USER_ID) }
            });
            break;

          case 'comments':
            // Keep comments by the user
            deleteResult = await collection.deleteMany({
              user: { $ne: new mongoose.Types.ObjectId(KEEP_USER_ID) }
            });
            break;

          case 'replies':
            // Keep replies by the user
            deleteResult = await collection.deleteMany({
              owner: { $ne: new mongoose.Types.ObjectId(KEEP_USER_ID) }
            });
            break;

          case 'chatrooms':
          case 'messages':
          case 'integrations':
          case 'stripeaccounts':
            // Keep data related to the user
            deleteResult = await collection.deleteMany({
              userId: { $ne: new mongoose.Types.ObjectId(KEEP_USER_ID) }
            });
            break;

          case 'sections':
          case 'videos':
          case 'attachments':
          case 'categories':
            // Keep all course-related data (we'll clean orphaned records later)
            console.log(`  Skipping ${collectionName} (will be cleaned based on courses)`);
            continue;

          default:
            // For unknown collections, delete all except user-related
            if (await collection.findOne({ userId: { $exists: true } })) {
              deleteResult = await collection.deleteMany({
                userId: { $ne: new mongoose.Types.ObjectId(KEEP_USER_ID) }
              });
            } else if (await collection.findOne({ user: { $exists: true } })) {
              deleteResult = await collection.deleteMany({
                user: { $ne: new mongoose.Types.ObjectId(KEEP_USER_ID) }
              });
            } else {
              console.log(`  ⚠️  Skipping ${collectionName} (unknown structure)`);
              continue;
            }
        }

        const countAfter = await collection.countDocuments();
        console.log(`  Documents after: ${countAfter}`);
        console.log(`  ✅ Deleted: ${deleteResult.deletedCount} documents`);

      } catch (err) {
        console.log(`  ❌ Error processing ${collectionName}:`, err.message);
      }
    }

    // Clean up orphaned sections, videos, and attachments
    console.log('\n\n🧹 Cleaning up orphaned records...');
    
    // Get all course IDs that belong to the user
    const coursesCollection = db.collection('courses');
    const userCourses = await coursesCollection.find({
      instructor: new mongoose.Types.ObjectId(KEEP_USER_ID)
    }).toArray();
    const userCourseIds = userCourses.map(c => c._id);

    console.log(`\nUser has ${userCourseIds.length} courses`);

    // Delete sections not belonging to user's courses
    const sectionsCollection = db.collection('sections');
    const sectionsResult = await sectionsCollection.deleteMany({
      courseId: { $nin: userCourseIds }
    });
    console.log(`Deleted ${sectionsResult.deletedCount} orphaned sections`);

    // Get user's section IDs
    const userSections = await sectionsCollection.find({
      courseId: { $in: userCourseIds }
    }).toArray();
    const userSectionIds = userSections.map(s => s._id);

    // Delete videos not belonging to user's sections
    const videosCollection = db.collection('videos');
    const videosResult = await videosCollection.deleteMany({
      sectionId: { $nin: userSectionIds }
    });
    console.log(`Deleted ${videosResult.deletedCount} orphaned videos`);

    // Delete attachments not belonging to user's sections
    const attachmentsCollection = db.collection('attachments');
    const attachmentsResult = await attachmentsCollection.deleteMany({
      sectionId: { $nin: userSectionIds }
    });
    console.log(`Deleted ${attachmentsResult.deletedCount} orphaned attachments`);

    console.log('\n\n✨ Database cleanup completed successfully!');
    console.log(`\nKept data for user: ${KEEP_CLERK_ID} (ID: ${KEEP_USER_ID})`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run the cleanup
cleanupDatabase();
