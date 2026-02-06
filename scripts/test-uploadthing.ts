/**
 * Test UploadThing connection
 */

import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

async function testUploadThingAPI() {
  console.log("🔍 Testing UploadThing API Connection\n");
  
  const secret = process.env.UPLOADTHING_SECRET;
  const appId = process.env.UPLOADTHING_APP_ID;
  
  console.log(`Secret present: ${!!secret}`);
  console.log(`App ID: ${appId}\n`);
  
  if (!secret || !appId) {
    console.error("❌ Missing credentials");
    return;
  }
  
  try {
    // Try direct API call to list files
    const response = await fetch(`https://api.uploadthing.com/v6/listFiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-uploadthing-api-key": secret,
        "x-uploadthing-version": "6.13.2"
      },
      body: JSON.stringify({})
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const error = await response.text();
      console.error("❌ API Error:", error);
      return;
    }
    
    const data = await response.json();
    console.log("\n✅ Success!");
    console.log(`Total files: ${data.files?.length || 0}`);
    
    if (data.files && data.files.length > 0) {
      const totalSize = data.files.reduce((acc: number, f: any) => acc + (f.size || 0), 0);
      console.log(`Total storage: ${(totalSize / 1024 / 1024 / 1024).toFixed(2)} GB`);
      
      console.log("\nFirst 5 files:");
      data.files.slice(0, 5).forEach((file: any, i: number) => {
        console.log(`  ${i + 1}. ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      });
    }
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

testUploadThingAPI();
