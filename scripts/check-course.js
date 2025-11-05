const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URL = 'mongodb+srv://rayen:rayen@cluster0.6b2ltxl.mongodb.net/nach?appName=Cluster0';

async function checkCourse() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URL);
    console.log('✅ Connected to MongoDB successfully\n');

    // Get the Course collection directly
    const db = mongoose.connection.db;
    const coursesCollection = db.collection('courses');

    // Count total courses
    const totalCourses = await coursesCollection.countDocuments();
    console.log(`📊 Total courses in database: ${totalCourses}\n`);

    // Find the specific course by ID
    const courseId = '690a343038b885c2f6d6da5a';
    console.log(`🔍 Looking for course with ID: ${courseId}\n`);

    const specificCourse = await coursesCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(courseId) 
    });

    if (specificCourse) {
      console.log('✅ COURSE FOUND!\n');
      console.log('📋 Course Structure:');
      console.log(JSON.stringify(specificCourse, null, 2));
    } else {
      console.log('❌ Course NOT found with that ID\n');
      
      // Get all courses to see what exists
      console.log('📋 Fetching all courses...\n');
      const allCourses = await coursesCollection.find({}).limit(10).toArray();
      
      console.log(`Found ${allCourses.length} courses (showing first 10):\n`);
      allCourses.forEach((course, index) => {
        console.log(`${index + 1}. ID: ${course._id}`);
        console.log(`   Title: ${course.title || 'No title'}`);
        console.log(`   Price: ${course.price !== undefined ? course.price : 'Not set'}`);
        console.log(`   Status: ${course.status || 'No status'}`);
        console.log(`   Instructor: ${course.instructor || 'No instructor'}`);
        console.log('');
      });
    }

    await mongoose.connection.close();
    console.log('🔒 Connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

checkCourse();
