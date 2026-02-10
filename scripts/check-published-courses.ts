import { connectToDatabase } from "@/lib/mongoose";
import Course from "@/lib/models/course.model";
import { CourseTypeEnum } from "@/lib/enums";

async function checkPublishedCourses() {
  try {
    console.log("Connecting to database...");
    await connectToDatabase();

    const totalCourses = await Course.countDocuments();
    console.log(`\nTotal courses in database: ${totalCourses}`);

    const publishedCourses = await Course.countDocuments({ isPublished: true });
    console.log(`Published courses: ${publishedCourses}`);

    const regularCourses = await Course.countDocuments({ 
      isPublished: true, 
      courseType: CourseTypeEnum.Regular 
    });
    console.log(`Published regular courses: ${regularCourses}`);

    // Show sample courses
    const sampleCourses = await Course.find({ isPublished: true, courseType: CourseTypeEnum.Regular })
      .select('title courseType isPublished')
      .limit(5);
    
    console.log("\nSample published regular courses:");
    sampleCourses.forEach((course, idx) => {
      console.log(`${idx + 1}. ${course.title} (Type: ${course.courseType}, Published: ${course.isPublished})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkPublishedCourses();
