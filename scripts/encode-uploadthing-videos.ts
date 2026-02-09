#!/usr/bin/env tsx
/**
 * Automatic Video Encoding for UploadThing Videos
 * 
 * This script automatically downloads videos from UploadThing,
 * encodes them into multiple quality levels using FFmpeg,
 * uploads all qualities back to UploadThing, and updates the database.
 * 
 * Usage:
 *   npx tsx scripts/encode-uploadthing-videos.ts [videoId]
 * 
 * Requirements:
 *   - FFmpeg installed locally
 *   - UploadThing API key in .env
 *   - MongoDB connection string in .env
 * 
 * Process:
 *   1. Fetch video from database by ID
 *   2. Download original video from UploadThing URL
 *   3. Encode into 5 qualities (4K, 1440p, 1080p, 720p, 480p)
 *   4. Upload all encoded videos to UploadThing
 *   5. Update database with videoQualities object
 *   6. Clean up temporary files
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { connectToDatabase } from '@/lib/mongoose';
import Video from '@/lib/models/video.model';

const execAsync = promisify(exec);

// Quality configuration
const QUALITIES = [
  { name: '4K', width: 3840, height: 2160, bitrate: '40M', bufsize: '80M' },
  { name: '1440p', width: 2560, height: 1440, bitrate: '16M', bufsize: '32M' },
  { name: '1080p', width: 1920, height: 1080, bitrate: '8M', bufsize: '16M' },
  { name: '720p', width: 1280, height: 720, bitrate: '5M', bufsize: '10M' },
  { name: '480p', width: 854, height: 480, bitrate: '2.5M', bufsize: '5M' },
];

const TEMP_DIR = path.join(process.cwd(), 'temp-encoding');

/**
 * Check if FFmpeg is installed
 */
async function checkFFmpeg(): Promise<boolean> {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch {
    return false;
  }
}

/**
 * Download video from URL
 */
async function downloadVideo(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    const client = url.startsWith('https') ? https : http;
    
    console.log(`📥 Downloading video from: ${url}`);
    
    const request = client.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      const totalSize = parseInt(response.headers['content-length'] || '0', 10);
      let downloadedSize = 0;
      
      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const progress = ((downloadedSize / totalSize) * 100).toFixed(1);
        process.stdout.write(`\r📥 Downloading: ${progress}%`);
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('\n✅ Download complete');
        resolve();
      });
    });
    
    request.on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
    
    file.on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

/**
 * Encode video to specific quality
 */
async function encodeQuality(
  inputPath: string,
  outputPath: string,
  quality: typeof QUALITIES[0]
): Promise<void> {
  console.log(`\n🎬 Encoding ${quality.name}...`);
  
  const command = `ffmpeg -i "${inputPath}" \
    -vf scale=${quality.width}:${quality.height} \
    -c:v libx264 \
    -preset medium \
    -crf 23 \
    -maxrate ${quality.bitrate} \
    -bufsize ${quality.bufsize} \
    -c:a aac \
    -b:a 128k \
    -movflags +faststart \
    -y "${outputPath}"`;
  
  try {
    const { stdout, stderr } = await execAsync(command);
    console.log(`✅ ${quality.name} encoded successfully`);
  } catch (error: any) {
    console.error(`❌ Failed to encode ${quality.name}:`, error.message);
    throw error;
  }
}

/**
 * Upload file to UploadThing
 */
async function uploadToUploadThing(filePath: string, fileName: string): Promise<string> {
  console.log(`\n📤 Uploading ${fileName} to UploadThing...`);
  
  // Read file
  const fileBuffer = fs.readFileSync(filePath);
  const fileSize = fs.statSync(filePath).size;
  
  // Create FormData
  const FormData = require('form-data');
  const form = new FormData();
  form.append('files', fileBuffer, {
    filename: fileName,
    contentType: 'video/mp4',
  });
  
  return new Promise((resolve, reject) => {
    form.submit(
      {
        host: 'api.uploadthing.com',
        path: '/api/uploadFiles',
        protocol: 'https:',
        headers: {
          'x-uploadthing-api-key': process.env.UPLOADTHING_SECRET,
        },
      },
      (err: any, res: any) => {
        if (err) {
          reject(err);
          return;
        }
        
        let data = '';
        res.on('data', (chunk: any) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.data && response.data[0]?.url) {
              const url = response.data[0].url;
              console.log(`✅ Uploaded: ${url}`);
              resolve(url);
            } else {
              reject(new Error('Upload failed: No URL returned'));
            }
          } catch (e) {
            reject(new Error(`Upload failed: ${data}`));
          }
        });
      }
    );
  });
}

/**
 * Main encoding process
 */
async function processVideo(videoId: string) {
  console.log(`\n🚀 Starting encoding process for video: ${videoId}\n`);
  
  // Check FFmpeg
  if (!await checkFFmpeg()) {
    console.error('❌ FFmpeg is not installed. Install it first:');
    console.error('  macOS: brew install ffmpeg');
    console.error('  Ubuntu: sudo apt install ffmpeg');
    console.error('  Windows: Download from https://ffmpeg.org/download.html');
    process.exit(1);
  }
  
  // Create temp directory
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
  
  try {
    // Connect to database
    console.log('📊 Connecting to database...');
    await connectToDatabase();
    
    // Fetch video
    const video = await Video.findById(videoId);
    if (!video) {
      throw new Error(`Video not found: ${videoId}`);
    }
    
    if (!video.videoUrl) {
      throw new Error('Video has no videoUrl');
    }
    
    console.log(`✅ Found video: ${video.title}`);
    console.log(`📍 URL: ${video.videoUrl}`);
    
    // Download original video
    const originalPath = path.join(TEMP_DIR, 'original.mp4');
    await downloadVideo(video.videoUrl, originalPath);
    
    // Get original video info
    const { stdout } = await execAsync(`ffmpeg -i "${originalPath}" 2>&1`);
    console.log(`\n📹 Original video info:`);
    const resolutionMatch = stdout.match(/(\d{3,4})x(\d{3,4})/);
    if (resolutionMatch) {
      const [_, width, height] = resolutionMatch;
      console.log(`   Resolution: ${width}x${height}`);
    }
    
    // Encode all qualities
    const encodedVideos: { quality: string; url: string }[] = [];
    
    for (const quality of QUALITIES) {
      const outputPath = path.join(TEMP_DIR, `${quality.name}.mp4`);
      
      try {
        // Skip if quality is higher than original
        if (resolutionMatch) {
          const originalHeight = parseInt(resolutionMatch[2]);
          if (quality.height > originalHeight) {
            console.log(`⏭️  Skipping ${quality.name} (higher than original)`);
            continue;
          }
        }
        
        // Encode
        await encodeQuality(originalPath, outputPath, quality);
        
        // Upload
        const fileName = `${video.title.replace(/[^a-zA-Z0-9]/g, '_')}_${quality.name}.mp4`;
        const url = await uploadToUploadThing(outputPath, fileName);
        
        encodedVideos.push({
          quality: quality.name,
          url,
        });
        
        // Clean up encoded file
        fs.unlinkSync(outputPath);
        
      } catch (error: any) {
        console.error(`❌ Failed to process ${quality.name}:`, error.message);
      }
    }
    
    if (encodedVideos.length === 0) {
      throw new Error('No qualities were successfully encoded');
    }
    
    // Update database
    console.log('\n💾 Updating database...');
    const videoQualities: Record<string, string> = {};
    encodedVideos.forEach(({ quality, url }) => {
      videoQualities[quality] = url;
    });
    
    await Video.findByIdAndUpdate(videoId, {
      videoQualities,
    });
    
    console.log('✅ Database updated with qualities:', Object.keys(videoQualities).join(', '));
    
    // Clean up original file
    fs.unlinkSync(originalPath);
    
    console.log('\n🎉 Encoding complete!');
    console.log('\n📊 Summary:');
    console.log(`   Video ID: ${videoId}`);
    console.log(`   Title: ${video.title}`);
    console.log(`   Qualities encoded: ${encodedVideos.length}`);
    encodedVideos.forEach(({ quality, url }) => {
      console.log(`   - ${quality}: ${url}`);
    });
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    // Clean up temp directory
    if (fs.existsSync(TEMP_DIR)) {
      const files = fs.readdirSync(TEMP_DIR);
      files.forEach(file => {
        fs.unlinkSync(path.join(TEMP_DIR, file));
      });
      fs.rmdirSync(TEMP_DIR);
    }
  }
}

// Main execution
const videoId = process.argv[2];

if (!videoId) {
  console.error('❌ Usage: npx tsx scripts/encode-uploadthing-videos.ts <videoId>');
  console.error('\nExample:');
  console.error('  npx tsx scripts/encode-uploadthing-videos.ts 69738cb60fee61c070249360');
  process.exit(1);
}

processVideo(videoId)
  .then(() => {
    console.log('\n✅ Process completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Process failed:', error);
    process.exit(1);
  });
