# Mux Integration - Setup & Testing Checklist

## ⚙️ Initial Setup

### 1. Environment Variables
Add to your `.env.local` file:

```bash
# Mux Configuration (Required)
MUX_TOKEN_ID=your_mux_token_id_here
MUX_TOKEN_SECRET=your_mux_token_secret_here

# Optional: For signed/private videos
# MUX_SIGNING_KEY_ID=your_signing_key_id
# MUX_SIGNING_KEY_PRIVATE=your_signing_key_private
```

**Where to get these:**
1. Go to https://dashboard.mux.com/
2. Navigate to Settings → Access Tokens
3. Create a new token with "Mux Video" permissions
4. Copy Token ID and Token Secret

✅ **Verified:** Environment variables added to `.env.local`

---

### 2. Verify Mux Packages
Check that these packages are installed:

```json
"@mux/mux-node": "^8.4.1",
"@mux/mux-player-react": "^2.4.1"
```

If missing, run:
```bash
npm install @mux/mux-node @mux/mux-player-react
```

✅ **Verified:** Mux packages installed

---

## 🧪 Testing Workflow

### Test 1: New Video Upload

**Steps:**
1. Start your development server: `npm run dev`
2. Log in as a teacher/instructor
3. Navigate to: Teacher → Courses → Manage → [Select Course] → Sections → [Select Section]
4. Create a new video or edit an existing one
5. Click "Upload Video"
6. Select a short test video file (e.g., 30 seconds)
7. Wait for upload to complete

**Expected Result:**
- ✅ Upload completes via UploadThing
- ✅ "Processing video with Mux..." message appears
- ✅ Processing completes (1-2 minutes for short video)
- ✅ MuxPlayer displays with the video
- ✅ Video plays with adaptive quality

**If it fails:**
- Check browser console for errors
- Check server logs for Mux API errors
- Verify MUX_TOKEN_ID and MUX_TOKEN_SECRET are correct
- Check Mux dashboard for asset status

✅ **Test Passed:** New video upload works

---

### Test 2: Student Video Playback

**Steps:**
1. Log in as a student (or use a different browser/incognito)
2. Navigate to: My Learning → [Select Enrolled Course]
3. Click on a video that has been processed by Mux
4. Video should auto-play or show play button

**Expected Result:**
- ✅ MuxPlayer loads without errors
- ✅ Video starts playing immediately (no long buffering)
- ✅ Seeking works smoothly
- ✅ Quality adapts to network speed (test by throttling network in DevTools)
- ✅ Fullscreen works
- ✅ Controls (play/pause/volume) work

**If it fails:**
- Check if video has `muxData.playbackId` in database
- Verify video is published (`isPublished: true`)
- Check Mux playback policy is set to "public"
- Open Mux dashboard and verify asset is ready

✅ **Test Passed:** Student playback works

---

### Test 3: Course Preview Video

**Steps:**
1. Log out or open incognito window
2. Navigate to a course page: `/course/[courseId]`
3. Check if preview video plays

**Expected Result:**
- ✅ Preview video (if marked as free) displays with MuxPlayer
- ✅ Play overlay appears when video is paused
- ✅ Clicking play starts the video
- ✅ Video quality adapts automatically

**If it fails:**
- Verify at least one video is marked as `isFree: true`
- Check that free video has Mux data
- Review PurchaseCourseCard component for errors

✅ **Test Passed:** Course preview works

---

### Test 4: Video Deletion

**Steps:**
1. Log in as teacher
2. Navigate to a test video's management page
3. Click "Delete Video" (if available in UI)
4. Confirm deletion

**Expected Result:**
- ✅ Video deleted from MongoDB
- ✅ MuxData deleted from MongoDB
- ✅ Mux asset deleted from Mux (check dashboard)
- ✅ No errors in server logs

**To verify in Mux Dashboard:**
1. Go to https://dashboard.mux.com/video/assets
2. Search for the deleted video's asset ID
3. It should be marked as deleted or not found

✅ **Test Passed:** Video deletion works

---

## 🔄 Migration Testing (If You Have Existing Videos)

### Test 5: Migrate Legacy Videos

**Prerequisites:**
- Have at least one video with `videoUrl` but no `muxData`
- Or create a test video using the old system

**Steps:**
1. Run migration script:
   ```bash
   npm run migrate:videos
   ```

2. Watch the console output

**Expected Result:**
- ✅ Script finds legacy videos
- ✅ Creates Mux assets for each video
- ✅ Updates MongoDB with muxData references
- ✅ Shows success/failure summary
- ✅ No crashes or unhandled errors

**Sample Output:**
```
🚀 Starting video migration to Mux...

📊 Found 5 videos to migrate

[1/5] Processing: Introduction to German Grammar
  Video ID: 66a1c7b5e8f9a2c3d4e5f6a7
  URL: https://utfs.io/f/abc123.mp4
  📤 Creating Mux asset...
  ✅ Mux asset created: abc123xyz
  🎬 Playback ID: xyz789
  💾 Video updated successfully

...

📊 Migration Summary:
  ✅ Successful: 5
  ❌ Failed: 0

✨ Migration complete!
```

**If migration fails:**
- Check error messages for specific issues
- Verify video URLs are valid UploadThing URLs
- Check Mux API rate limits (wait and retry)
- Review failed videos list in output

✅ **Test Passed:** Migration script works

---

## 🎯 Quality Assurance Checks

### QA 1: Network Throttling
**Test:** Change network speed to simulate slow connection

**Steps:**
1. Open Chrome DevTools → Network tab
2. Select "Slow 3G" throttling
3. Play a video

**Expected:**
- ✅ Video starts playing quickly at lower quality
- ✅ No excessive buffering
- ✅ Quality indicator shows lower resolution

✅ **QA Passed:** ABR works on slow network

---

### QA 2: Fast Network
**Test:** Play video on fast connection

**Steps:**
1. Disable throttling (Fast 3G+)
2. Play video

**Expected:**
- ✅ Video automatically switches to higher quality
- ✅ Smooth playback without interruption
- ✅ No quality downgrade

✅ **QA Passed:** ABR works on fast network

---

### QA 3: Mobile Testing
**Test:** Play video on mobile device

**Steps:**
1. Open site on mobile browser
2. Navigate to video
3. Play video

**Expected:**
- ✅ Video loads and plays
- ✅ Controls work on touch
- ✅ Fullscreen works
- ✅ Quality adapts to mobile network

✅ **QA Passed:** Mobile playback works

---

## 🔍 Database Verification

### Check Video Document Structure

**MongoDB Query:**
```javascript
db.videos.findOne({ title: "Your Test Video" })
```

**Expected Fields:**
```json
{
  "_id": "...",
  "title": "Your Test Video",
  "videoUrl": "",  // Should be empty for new videos
  "muxData": "66a1c7b5e8f9a2c3d4e5f6a7",  // ObjectId reference
  "isPublished": true,
  "isFree": false,
  ...
}
```

✅ **Verified:** Video document has muxData reference

---

### Check MuxData Document

**MongoDB Query:**
```javascript
db.muxdatas.findOne({ video: ObjectId("your_video_id") })
```

**Expected Fields:**
```json
{
  "_id": "...",
  "assetId": "abc123xyz",  // Mux asset ID
  "playbackId": "xyz789",  // Public playback ID
  "video": "...",  // Video ObjectId reference
  "createdAt": "...",
  "updatedAt": "..."
}
```

✅ **Verified:** MuxData document exists with valid IDs

---

## 🚀 Production Deployment Checklist

### Pre-Deployment
- [ ] All environment variables set in production (Vercel/Netlify/etc.)
- [ ] Mux credentials are production tokens (not test tokens)
- [ ] Test video upload on production
- [ ] Test video playback on production
- [ ] Run migration script on production database (if needed)

### Post-Deployment
- [ ] Monitor Mux dashboard for usage
- [ ] Check error logs for any Mux API errors
- [ ] Verify students can watch videos
- [ ] Confirm ABR is working (check quality switching)
- [ ] Test on multiple devices/browsers

✅ **Ready for Production**

---

## 📊 Monitoring & Maintenance

### Week 1: Monitor Closely
- Check Mux dashboard daily
- Review error logs
- Ask students for feedback on video quality
- Monitor page load times

### Ongoing:
- Monthly: Review Mux usage/costs
- Quarterly: Check for failed/stuck assets
- As needed: Re-run migration for any missed videos

---

## 🎉 Success Criteria

Your Mux integration is successful when:

✅ New videos automatically create Mux assets
✅ Students experience fast, smooth playback
✅ Quality adapts automatically to network speed
✅ No manual quality switching UI needed
✅ Video upload workflow is seamless for teachers
✅ Error rate is < 1% for video playback
✅ Page load times are fast (< 3 seconds)

---

## 📞 Need Help?

### Common Issues & Solutions

**Issue:** "Video not available or still processing"
- **Solution:** Wait 1-3 minutes for Mux to finish processing

**Issue:** "Failed to create Mux asset"
- **Solution:** Check environment variables, verify Mux token has correct permissions

**Issue:** Migration script errors
- **Solution:** Run script again (it's idempotent), check individual error messages

**Issue:** Video plays but quality doesn't adapt
- **Solution:** Verify Mux has created multiple renditions (check Mux dashboard)

### Resources
- Mux Dashboard: https://dashboard.mux.com/
- Mux Docs: https://docs.mux.com/
- Mux Status: https://status.mux.com/

---

**Date Completed:** _____________

**Tested By:** _____________

**Production Deployed:** _____________
