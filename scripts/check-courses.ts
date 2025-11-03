import dotenv from 'dotenv';
import { connectToDatabase } from '@/lib/mongoose';
import Course from '@/lib/models/course.model';
import User from '@/lib/models/user.model';
import Category from '@/lib/models/category.model';

dotenv.config({ path: '.env.local' });

async function checkCourses() {
  try {
    await connectToDatabase();
    console.log('Connected to database');
    
    // Check raw courses without population - log ALL fields
    const rawCourses = await Course.find({ isPublished: true }).limit(1).lean();
    
    console.log('\n📚 Full raw course object:');
    console.log(JSON.stringify(rawCourses[0], null, 2));
    
    // Now check with instructor populated
    const populatedCourse = await Course.findById(rawCourses[0]._id).populate('instructor').populate('category');
    
    console.log('\n\n📚 Course with populated instructor:');
    console.log('Instructor:', JSON.stringify(populatedCourse.instructor, null, 2));
    console.log('Category:', JSON.stringify(populatedCourse.category, null, 2));
    
    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkCourses();
