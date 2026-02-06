import { config } from "dotenv";
import { UTApi } from "uploadthing/server";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

console.log("🧪 Testing UploadThing Token\n");
console.log("Token loaded:", !!process.env.UPLOADTHING_TOKEN);
console.log("Token preview:", process.env.UPLOADTHING_TOKEN?.substring(0, 30) + "...\n");

async function testToken() {
  try {
    const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });
    console.log("✅ UTApi initialized successfully");
    
    console.log("\n📋 Attempting to list files...");
    const files = await utapi.listFiles({ limit: 5 });
    
    console.log(`\n✅ Success! Found ${files.files.length} files`);
    console.log(`   Total file count: ${files.files.length}`);
    console.log(`   Has more: ${files.hasMore}\n`);
    
    if (files.files.length > 0) {
      console.log("📁 Sample files:");
      files.files.slice(0, 3).forEach((file: any, i: number) => {
        console.log(`   ${i + 1}. ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      });
    }
    
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

testToken();
