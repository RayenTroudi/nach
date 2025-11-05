# Payment Proof System - UploadThing Implementation

## Overview

The payment proof upload system now uses **UploadThing** for secure, reliable file uploads instead of a custom API. This provides better reliability, automatic CDN hosting, and simpler implementation.

## How It Works

### 1. File Upload Flow

```
Student selects file → UploadThing uploads to CDN → Returns URL → 
Student submits form → API saves proof record to MongoDB → 
Admin reviews → Approves/Rejects → Student enrolled or notified
```

### 2. UploadThing Configuration

**Location:** `app/api/uploadthing/core.ts`

```typescript
paymentProof: f({ 
  image: { maxFileSize: "4MB", maxFileCount: 1 },
  pdf: { maxFileSize: "4MB", maxFileCount: 1 }
})
  .middleware(() => handleAuth())
  .onUploadComplete(() => {})
```

**Features:**
- Accepts images (JPG, PNG, WEBP) and PDFs
- Max file size: 4MB
- Requires authentication via Clerk
- Files automatically uploaded to UploadThing CDN

### 3. Frontend Component

**Location:** `app/(landing-page)/course/[courseId]/_components/BankTransferUpload.tsx`

**Key Features:**
- Uses `UploadDropzone` from UploadThing
- Drag & drop file upload
- Preview uploaded files
- Stores URL after upload
- Submits proof data to API

**Code Example:**
```typescript
<UploadDropzone
  endpoint="paymentProof"
  onClientUploadComplete={(res) => {
    if (res && res[0]) {
      setUploadedUrl(res[0].url);
      // File is now on CDN, ready to submit
    }
  }}
  onUploadError={(error: Error) => {
    // Handle errors
  }}
/>
```

### 4. Submit Proof API

**Endpoint:** `POST /api/submit-payment-proof`

**Purpose:** Saves payment proof record to database after UploadThing upload

**Request Body:**
```json
{
  "proofUrl": "https://utfs.io/f/...",
  "courseIds": ["course_id_1", "course_id_2"],
  "amount": 299.99,
  "notes": "Optional student notes"
}
```

**What It Does:**
1. Validates user authentication
2. Finds user in database
3. Extracts file type from URL
4. Creates PaymentProof document with status "pending"
5. Returns proof ID and status

**Response:**
```json
{
  "success": true,
  "data": {
    "proofId": "...",
    "status": "pending",
    "uploadedAt": "2024-01-15T10:30:00Z"
  }
}
```

## Advantages of UploadThing

### vs. Custom File Upload

| Feature | UploadThing | Custom API |
|---------|-------------|------------|
| **Storage** | CDN-hosted | Local filesystem |
| **Scalability** | Automatic | Manual setup required |
| **Security** | Built-in | Custom implementation |
| **File Access** | Global CDN | Server-dependent |
| **Setup Time** | Minutes | Hours |
| **Cost** | Free tier available | Storage/bandwidth costs |

### Key Benefits

1. **No Local Storage**: Files hosted on UploadThing's CDN
2. **Better Performance**: CDN delivers files faster globally
3. **Automatic Backups**: UploadThing handles redundancy
4. **Simpler Code**: No need to manage file system operations
5. **Security**: Built-in authentication and validation
6. **Scalability**: Handles traffic spikes automatically

## Environment Variables

Add these to your `.env.local`:

```env
# UploadThing (Required)
UPLOADTHING_SECRET=your_secret_key
UPLOADTHING_APP_ID=your_app_id

# Email Notifications (Required)
RESEND_API_KEY=your_resend_key
```

**Get UploadThing Keys:**
1. Go to [uploadthing.com](https://uploadthing.com)
2. Sign up/login
3. Create a new app
4. Copy your Secret and App ID

## Testing

### Test Upload Flow

1. **Start Dev Server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Course Page:**
   - Go to any paid course
   - Click "Buy Now"

3. **Upload Proof:**
   - Drag & drop or click to upload
   - Select an image or PDF (max 4MB)
   - Wait for upload to complete
   - See success message

4. **Submit Proof:**
   - Add notes (optional)
   - Click "Submit Payment Proof"
   - Verify success toast

5. **Verify in Database:**
   ```javascript
   // In MongoDB
   db.paymentproofs.findOne({ userId: ... })
   ```

### Test Admin Review

1. Navigate to `/admin/payment-proofs`
2. See uploaded proof in list
3. Click "View" to see full proof
4. Click "Approve" or "Reject"
5. Verify email sent to student

## Troubleshooting

### Upload Fails

**Error:** "Failed to upload file"

**Solutions:**
- Check `UPLOADTHING_SECRET` is set
- Verify `UPLOADTHING_APP_ID` is correct
- Check file size < 4MB
- Ensure file type is image or PDF
- Check UploadThing dashboard for quota

### URL Not Saved

**Error:** "No file uploaded"

**Solutions:**
- Ensure ` onClientUploadComplete` sets state
- Check `uploadedUrl` state is not null
- Verify UploadThing returned valid URL

### Authentication Error

**Error:** "Unauthorized"

**Solutions:**
- User must be logged in via Clerk
- Check Clerk session is active
- Verify `handleAuth()` in UploadThing config

## File Management

### Where Are Files Stored?

Files are stored on **UploadThing's CDN**, not on your server.

**Example URL:**
```
https://utfs.io/f/abc123-def456-ghi789.jpg
```

### How to Delete Files

Files can be deleted via UploadThing's API or dashboard:

```typescript
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();
await utapi.deleteFiles(["file-key"]);
```

### File Retention

- UploadThing free tier: Keep files indefinitely
- Paid tier: More storage and features
- No automatic deletion unless you implement it

## Migration Notes

### Changes from Custom Upload

**Removed:**
- `app/api/upload-proof/route.ts` - Custom file upload API
- `public/uploads/payment-proofs/` - Local file storage
- FormData handling in component
- File system write operations

**Added:**
- `app/api/submit-payment-proof/route.ts` - Saves proof record
- UploadThing dropzone in component
- CDN URLs instead of local paths
- Simplified upload logic

**Unchanged:**
- PaymentProof database model
- Admin review workflow
- Email notifications
- Student proof status page

## Security Considerations

### UploadThing Security

1. **Authentication Required**: Only logged-in users can upload
2. **File Type Validation**: Only images and PDFs allowed
3. **Size Limits**: Max 4MB per file
4. **Rate Limiting**: Built into UploadThing
5. **CDN Security**: HTTPS-only access

### Additional Security

- Proof URLs are publicly accessible (CDN links)
- Don't include sensitive info in filenames
- Admin must verify proof authenticity
- Consider watermarking for extra security

## Performance

### Upload Speed

- **Average**: 2-5 seconds for 2MB image
- **CDN Benefits**: Faster delivery worldwide
- **Parallel Uploads**: UploadThing handles optimization

### Bandwidth

- **Cost**: Covered by UploadThing
- **Limits**: Check UploadThing pricing
- **Monitoring**: View usage in UploadThing dashboard

## Support & Resources

- **UploadThing Docs**: [https://docs.uploadthing.com](https://docs.uploadthing.com)
- **API Reference**: [https://docs.uploadthing.com/api-reference](https://docs.uploadthing.com/api-reference)
- **GitHub Issues**: Report bugs to UploadThing
- **Admin Dashboard**: Review proofs at `/admin/payment-proofs`

---

**Last Updated:** November 2025  
**Status:** Production Ready ✅
