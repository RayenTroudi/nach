/**
 * Database Seed Script for GermanyFormation Platform
 * 
 * This script populates the database with:
 * - Germany-focused course categories
 * - Sample courses for Tunisians moving to Germany
 * - Instructor profiles
 * 
 * Run with: npm run seed
 */

// Load environment variables
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { connectToDatabase } from "@/lib/mongoose";
import Category from "@/lib/models/category.model";
import Course from "@/lib/models/course.model";
import User from "@/lib/models/user.model";
import mongoose from "mongoose";

// Germany-focused Categories
const categories = [
  {
    name: "German Language",
  },
  {
    name: "Visa & Immigration",
  },
  {
    name: "Job Search & Career",
  },
  {
    name: "Cultural Integration",
  },
  {
    name: "Housing & Living",
  },
  {
    name: "Education in Germany",
  },
  {
    name: "Document Preparation",
  },
  {
    name: "Networking & Community",
  },
  {
    name: "German Culture & Lifestyle",
  },
  {
    name: "Travel & Exploration",
  }
];

// Sample Instructor Profiles (Clerk IDs will need to be updated)
const instructors = [
  {
    clerkId: "instructor_sarah_schmidt",
    firstName: "Sarah",
    lastName: "Schmidt",
    fullName: "Sarah Schmidt",
    email: "sarah.schmidt@germanyformation.com",
    username: "sarahschmidt",
    picture: "",
  },
  {
    clerkId: "instructor_ahmed_benali",
    firstName: "Ahmed",
    lastName: "Ben Ali",
    fullName: "Ahmed Ben Ali",
    email: "ahmed.benali@germanyformation.com",
    username: "ahmedbenali",
    picture: "",
  },
  {
    clerkId: "instructor_fatma_trabelsi",
    firstName: "Fatma",
    lastName: "Trabelsi",
    fullName: "Fatma Trabelsi",
    email: "fatma.trabelsi@germanyformation.com",
    username: "fatmatrabelsi",
    picture: "",
  },
  {
    clerkId: "instructor_mohamed_karim",
    firstName: "Mohamed",
    lastName: "Karim",
    fullName: "Mohamed Karim",
    email: "mohamed.karim@germanyformation.com",
    username: "mohamedkarim",
    picture: "",
  }
];

// Germany-focused Courses
const courses = [
  {
    title: "German Language for Beginners (A1-A2)",
    description: "Start your German language journey with this comprehensive A1-A2 course designed specifically for Tunisian Arabic and French speakers. Learn essential vocabulary, grammar, and conversation skills to communicate effectively in everyday situations.",
    price: 99.99,
    level: "beginner",
    thumbnail: "/images/img1.png",
    status: "approved",
    isPublished: true,
    category: "German Language",
    instructorEmail: "sarah.schmidt@germanyformation.com",
    benefits: [
      "Master A1-A2 German grammar and vocabulary",
      "Practice with native German speakers",
      "Understand German pronunciation",
      "Prepare for Goethe-Institut A1-A2 exam",
      "Learn practical phrases for daily life"
    ],
    requirements: [
      "No prior German knowledge required",
      "Basic understanding of English or French",
      "Commitment of 10 hours per week",
      "Access to computer and internet"
    ],
    targetAudience: "Tunisians planning to move to Germany for work, study, or family reunification who need to learn German from scratch."
  },
  {
    title: "How to Apply for a German Work Visa - Complete Guide",
    description: "Comprehensive step-by-step guide to applying for and obtaining a German work visa from Tunisia. Learn about required documents, application process, interview preparation, and common pitfalls to avoid.",
    price: 59.99,
    level: "beginner",
    thumbnail: "/images/img2.png",
    status: "approved",
    isPublished: true,
    category: "Visa & Immigration",
    instructorEmail: "ahmed.benali@germanyformation.com",
    benefits: [
      "Understand different types of German work visas",
      "Complete document checklist",
      "Step-by-step application walkthrough",
      "Embassy interview preparation",
      "Common rejection reasons and how to avoid them"
    ],
    requirements: [
      "Job offer from German employer (or actively searching)",
      "Basic understanding of German visa categories",
      "Willingness to gather required documents"
    ],
    targetAudience: "Tunisian professionals who have received or are seeking a job offer in Germany and need guidance on the visa application process."
  },
  {
    title: "Cultural Adaptation and Life in Germany",
    description: "Essential insights into German culture, social norms, and daily life to help you integrate smoothly. Learn about German mentality, social etiquette, work culture, and how to build meaningful relationships.",
    price: 79.99,
    level: "beginner",
    thumbnail: "/images/img3.png",
    status: "approved",
    isPublished: true,
    category: "Cultural Integration",
    instructorEmail: "fatma.trabelsi@germanyformation.com",
    benefits: [
      "Understand German social norms and etiquette",
      "Navigate cultural differences effectively",
      "Build relationships with Germans",
      "Adapt to German workplace culture",
      "Overcome culture shock"
    ],
    requirements: [
      "Planning to move to Germany or recently arrived",
      "Open mind and willingness to adapt",
      "Basic German language skills (A1) recommended but not required"
    ],
    targetAudience: "Tunisians preparing to move to Germany or who have recently arrived and want to integrate successfully into German society."
  },
  {
    title: "Finding a Job in Germany as a Tunisian Professional",
    description: "Practical strategies for finding employment in Germany, from identifying opportunities to landing job offers. Learn job search techniques, networking strategies, salary negotiations, and how to stand out as an international candidate.",
    price: 89.99,
    level: "intermediate",
    thumbnail: "/images/img4.png",
    status: "approved",
    isPublished: true,
    category: "Job Search & Career",
    instructorEmail: "mohamed.karim@germanyformation.com",
    benefits: [
      "Master German job search platforms",
      "Write compelling German CVs and cover letters",
      "Network effectively with German professionals",
      "Prepare for German-style job interviews",
      "Negotiate salaries and benefits",
      "Understand German employment contracts"
    ],
    requirements: [
      "Professional work experience",
      "German language skills (minimum B1 recommended)",
      "Updated resume/CV",
      "LinkedIn profile"
    ],
    targetAudience: "Tunisian professionals with work experience who want to find employment in Germany and need guidance on the German job market."
  },
  {
    title: "German Language Intermediate Level (B1-B2)",
    description: "Advance your German language skills from B1 to B2 level with intensive conversation practice, advanced grammar, and professional vocabulary. Prepare for B1-B2 certification exams and real-world German communication.",
    price: 129.99,
    level: "intermediate",
    thumbnail: "/images/img5.png",
    status: "approved",
    isPublished: true,
    category: "German Language",
    instructorEmail: "sarah.schmidt@germanyformation.com",
    benefits: [
      "Master B1-B2 level German grammar",
      "Advanced conversation skills",
      "Professional and academic vocabulary",
      "Prepare for Goethe-Institut B1-B2 exams",
      "Understand German media and literature"
    ],
    requirements: [
      "Completed A2 German or equivalent",
      "Ability to hold basic conversations in German",
      "Commitment of 12 hours per week",
      "Regular practice with German speakers"
    ],
    targetAudience: "Tunisians with basic German knowledge (A2) who need to reach B1-B2 level for university admission, professional work, or integration requirements."
  },
  {
    title: "Finding Affordable Housing in German Cities",
    description: "Complete guide to finding, securing, and moving into an apartment in Germany. Learn about the German housing market, apartment hunting strategies, rental contracts, tenant rights, and settling into your new home.",
    price: 69.99,
    level: "beginner",
    thumbnail: "/images/img6.png",
    status: "approved",
    isPublished: true,
    category: "Housing & Living",
    instructorEmail: "fatma.trabelsi@germanyformation.com",
    benefits: [
      "Understand the German housing market",
      "Find apartments on German platforms",
      "Write effective apartment applications",
      "Understand German rental contracts (Mietvertrag)",
      "Know your rights as a tenant",
      "Set up utilities and internet"
    ],
    requirements: [
      "Planning to move to Germany within 6 months",
      "Basic German language skills (A1-A2)",
      "Understanding of basic housing terminology"
    ],
    targetAudience: "Tunisians preparing to move to Germany who need practical guidance on finding and securing housing in German cities."
  },
  {
    title: "Writing Perfect German Job Applications (CV & Cover Letter)",
    description: "Learn to write compelling German CVs (Lebenslauf) and cover letters (Anschreiben) that get you noticed by German employers. Understand German application standards, formatting, and how to highlight your skills effectively.",
    price: 49.99,
    level: "intermediate",
    thumbnail: "/images/img1.png",
    status: "approved",
    isPublished: true,
    category: "Document Preparation",
    instructorEmail: "mohamed.karim@germanyformation.com",
    benefits: [
      "Master German CV format and structure",
      "Write persuasive cover letters in German",
      "Translate your qualifications effectively",
      "Understand German employer expectations",
      "Get your application documents reviewed",
      "Use proper German professional language"
    ],
    requirements: [
      "German language skills (minimum B1)",
      "Professional work experience",
      "Current resume/CV in English or French",
      "Specific job targets in Germany"
    ],
    targetAudience: "Tunisian professionals actively applying for jobs in Germany who need to create professional German-language application documents."
  },
  {
    title: "Understanding German Student Visa Requirements",
    description: "Complete guide to applying for a German student visa from Tunisia. Learn about university admission requirements, visa application process, blocked account, health insurance, and all steps to study in Germany.",
    price: 79.99,
    level: "beginner",
    thumbnail: "/images/img2.png",
    status: "approved",
    isPublished: true,
    category: "Education in Germany",
    instructorEmail: "ahmed.benali@germanyformation.com",
    benefits: [
      "Understand German university admission process",
      "Complete student visa application checklist",
      "Learn about blocked account (Sperrkonto) requirements",
      "Get health insurance guidance",
      "Prepare for visa interview",
      "Understand student residence permit process"
    ],
    requirements: [
      "High school diploma or bachelor's degree",
      "Interest in studying in Germany",
      "Basic understanding of German education system",
      "Financial capability for blocked account"
    ],
    targetAudience: "Tunisian students who want to study at German universities and need comprehensive guidance on the admission and visa process."
  },
  {
    title: "German Business Etiquette and Workplace Culture",
    description: "Master German professional culture, business etiquette, and workplace expectations. Learn how to communicate effectively in German business settings, understand hierarchy, meetings, punctuality, and professional relationships.",
    price: 64.99,
    level: "intermediate",
    thumbnail: "/images/img3.png",
    status: "approved",
    isPublished: true,
    category: "Job Search & Career",
    instructorEmail: "mohamed.karim@germanyformation.com",
    benefits: [
      "Understand German workplace culture",
      "Master professional communication in German",
      "Navigate German business hierarchy",
      "Excel in German business meetings",
      "Build professional relationships",
      "Avoid common cultural faux pas"
    ],
    requirements: [
      "German language skills (B1-B2)",
      "Professional work experience",
      "Planning to work in Germany or recently started",
      "Basic understanding of business concepts"
    ],
    targetAudience: "Tunisian professionals working or planning to work in Germany who want to succeed in German business environments."
  },
  {
    title: "Navigating German Bureaucracy: Registration & Documents",
    description: "Comprehensive guide to handling German bureaucracy, from city registration (Anmeldung) to tax ID, health insurance, bank accounts, and all official documents you'll need as a resident in Germany.",
    price: 74.99,
    level: "beginner",
    thumbnail: "/images/img4.png",
    status: "approved",
    isPublished: true,
    category: "Document Preparation",
    instructorEmail: "fatma.trabelsi@germanyformation.com",
    benefits: [
      "Complete city registration (Anmeldung) process",
      "Obtain tax ID (Steueridentifikationsnummer)",
      "Register with health insurance",
      "Open German bank account",
      "Understand German bureaucratic system",
      "Handle common administrative tasks"
    ],
    requirements: [
      "Arrived in Germany or arriving within 1 month",
      "Basic German language skills (A2)",
      "Understanding of basic administrative concepts",
      "Patience and willingness to learn"
    ],
    targetAudience: "Tunisians who have recently arrived in Germany and need practical guidance on handling German bureaucracy and administrative requirements."
  }
];

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seed...");
    
    // Connect to database
    await connectToDatabase();
    console.log("✅ Connected to database");

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("🗑️  Clearing existing data...");
    await Category.deleteMany({});
    console.log("✅ Categories cleared");
    await Course.deleteMany({});
    console.log("✅ Courses cleared");

    // Seed Categories
    console.log("📚 Seeding categories...");
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create instructor users (only if they don't exist)
    console.log("👥 Checking/Creating instructor users...");
    for (const instructor of instructors) {
      const existingUser = await User.findOne({ clerkId: instructor.clerkId });
      if (!existingUser) {
        await User.create(instructor);
        console.log(`✅ Created instructor: ${instructor.fullName}`);
      } else {
        console.log(`⏭️  Instructor already exists: ${instructor.fullName}`);
      }
    }

    // Seed Courses
    console.log("🎓 Seeding courses...");
    let coursesCreated = 0;
    
    for (const courseData of courses) {
      // Find instructor by email
      const instructor = await User.findOne({ email: courseData.instructorEmail });
      if (!instructor) {
        console.log(`⚠️  Instructor not found for ${courseData.title}, skipping...`);
        continue;
      }

      // Find category by name (singular)
      const categoryDoc = await Category.findOne({ 
        name: courseData.category 
      });
      
      if (!categoryDoc) {
        console.log(`⚠️  Category not found for ${courseData.title}, skipping...`);
        continue;
      }

      console.log(`📌 Creating course with category: ${categoryDoc.name} (ID: ${categoryDoc._id})`);

      // Remove category from courseData and add it as ObjectId
      const { category: _, instructorEmail, ...courseFields } = courseData;

      // Create course with singular category
      const course = await Course.create({
        ...courseFields,
        instructor: instructor._id,
        category: categoryDoc._id,
        sections: [],
        exams: [],
        students: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log(`✅ Course created - Category in DB: ${course.category}`);

      // Update category with course
      await Category.findByIdAndUpdate(
        categoryDoc._id,
        { $push: { courses: course._id } }
      );

      // Update instructor with course
      await User.findByIdAndUpdate(
        instructor._id,
        { $push: { createdCourses: course._id } }
      );

      coursesCreated++;
      console.log(`✅ Created course: ${courseData.title}`);
    }

    console.log(`\n🎉 Seed completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Instructors: ${instructors.length}`);
    console.log(`   - Courses: ${coursesCreated}`);
    console.log(`\n✅ Your GermanyFormation platform is now populated with dummy data!`);
    console.log(`🌐 Visit http://localhost:3000 to see the courses on the homepage\n`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("👋 Database connection closed");
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log("✨ Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seed script failed:", error);
    process.exit(1);
  });
