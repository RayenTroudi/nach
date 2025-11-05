# Manual Bank Transfer Payment System

## Overview

This system replaces the automated Flouci payment gateway with a manual bank transfer verification workflow. Students upload payment proofs, admins review and approve/reject them, and successful payments result in automatic course enrollment.

## Architecture

### Database Model

**PaymentProof Schema** (`lib/models/payment-proof.model.ts`)
```typescript
{
  userId: ObjectId,           // Reference to User
  courseIds: [String],        // Array of course IDs
  amount: Number,             // Payment amount in TND
  proofUrl: String,           // File path to proof
  fileName: String,           // Original file name
  fileType: String,           // MIME type
  fileSize: Number,           // File size in bytes
  status: enum,               // "pending" | "approved" | "rejected"
  notes: String,              // Student notes (optional)
  adminNotes: String,         // Admin review notes (optional)
  reviewedBy: ObjectId,       // Admin who reviewed (optional)
  reviewedAt: Date,           // Review timestamp (optional)
  uploadedAt: Date            // Upload timestamp (auto)
}
```

**Indexes:**
- `{ userId: 1, status: 1 }` - For user's proof queries
- `{ status: 1, uploadedAt: -1 }` - For admin dashboard

### API Endpoints

#### 1. Upload Payment Proof
**POST** `/api/upload-proof`

**Authentication:** Required (Clerk)

**Content-Type:** `multipart/form-data`

**Request Body:**
```javascript
FormData {
  proof: File,              // Image (JPEG, PNG, WEBP) or PDF
  courseIds: String,        // Comma-separated course IDs
  amount: String,           // Payment amount
  notes: String (optional)  // Student notes
}
```

**Validation:**
- File types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- Max file size: 5MB
- User must be authenticated

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

**File Storage:**
- Location: `public/uploads/payment-proofs/`
- Naming: `proof_{userId}_{timestamp}.{ext}`

---

#### 2. Admin - List Payment Proofs
**GET** `/api/admin/payment-proofs`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `approved`, `rejected`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10, max: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "proofs": [
      {
        "_id": "...",
        "userId": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "picture": "..."
        },
        "courseIds": ["..."],
        "courses": [
          {
            "_id": "...",
            "title": "Course Title",
            "thumbnail": "...",
            "price": 99.99
          }
        ],
        "amount": 299.99,
        "proofUrl": "/uploads/payment-proofs/...",
        "status": "pending",
        "notes": "Transfer completed on 2024-01-15",
        "uploadedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProofs": 47,
      "hasMore": true
    }
  }
}
```

---

#### 3. Admin - Approve/Reject Payment Proof
**POST** `/api/admin/payment-proofs`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "proofId": "...",
  "status": "approved" | "rejected",
  "adminNotes": "Optional notes"  // Required for rejection
}
```

**On Approval:**
1. Updates proof status to "approved"
2. Adds courses to `user.enrolledCourses`
3. Adds user to `course.students`
4. Sends approval email to student

**On Rejection:**
1. Updates proof status to "rejected"
2. Sends rejection email with admin notes

**Response:**
```json
{
  "success": true,
  "message": "Payment proof approved successfully"
}
```

---

#### 4. Student - My Payment Proofs
**GET** `/api/my-payment-proofs`

**Authentication:** Required (Student)

**Response:**
```json
{
  "success": true,
  "data": {
    "proofs": [
      {
        "_id": "...",
        "courseIds": ["..."],
        "courses": [...],
        "amount": 299.99,
        "proofUrl": "/uploads/payment-proofs/...",
        "status": "pending",
        "notes": "My notes",
        "adminNotes": null,
        "uploadedAt": "2024-01-15T10:30:00Z",
        "reviewedAt": null
      }
    ]
  }
}
```

---

### Frontend Components

#### 1. BankTransferUpload Component
**Location:** `app/(landing-page)/course/[courseId]/_components/BankTransferUpload.tsx`

**Props:**
```typescript
{
  courseIds: string[];      // Courses to purchase
  amount: number;           // Total amount in TND
  onSuccess?: () => void;   // Callback on successful upload
}
```

**Features:**
- Displays bank account details
- File upload with drag & drop
- File validation (type, size)
- Preview for images
- Notes input
- Upload progress feedback

**Bank Details Displayed:**
- Bank Name
- Account Number
- IBAN
- BIC/SWIFT
- Beneficiary Name
- Amount to transfer

---

#### 2. Admin Payment Proofs Dashboard
**Location:** `app/(dashboard)/(routes)/admin/payment-proofs/page.tsx`

**Features:**
- Filter by status (All, Pending, Approved, Rejected)
- Pagination
- Proof list with user info, courses, amount
- View full-size proof images/PDFs
- Approve/reject actions
- Admin notes input
- Review history

**Access:** Admin only (checks `user.publicMetadata.isAdmin`)

---

#### 3. Student Payment Proofs Page
**Location:** `app/(dashboard)/(routes)/student/my-proofs/page.tsx`

**Features:**
- List all submitted proofs
- Status badges with colors
- Course thumbnails
- Student notes display
- Admin notes (if rejected)
- Status-specific messages

---

### Email Notifications

**Email Service:** Resend API (`lib/actions/email.action.ts`)

**Environment Variable:** `RESEND_API_KEY`

#### Approval Email Template
```
Subject: Payment Approved - Course Access Granted

Hi [Student Name],

Great news! Your payment has been verified and approved.

Amount: [Amount] TND
Courses: [Course Titles]

You now have access to the course(s). Start learning today!

[View My Courses Button]
```

#### Rejection Email Template
```
Subject: Payment Proof Requires Attention

Hi [Student Name],

We've reviewed your payment proof submission and unfortunately we need you to submit a corrected proof.

Reason: [Admin Notes]

Amount: [Amount] TND
Courses: [Course Titles]

Please submit a new payment proof with the correct information.

[Upload New Proof Button]
```

---

## User Workflows

### Student Workflow

1. **Browse Course** → Click "Buy Now"
2. **View Bank Details** → Transfer money to provided account
3. **Upload Proof** → Take photo/screenshot of transfer receipt
4. **Add Notes** → Optional reference number or notes
5. **Submit** → Wait for admin review (24-48 hours)
6. **Get Notified** → Receive email on approval/rejection
7. **Access Course** → Auto-enrolled on approval

### Admin Workflow

1. **Navigate to** `/admin/payment-proofs`
2. **Filter** → View pending proofs
3. **Review Each Proof:**
   - Check user info
   - Verify amount matches course price
   - View full-size proof image/PDF
   - Check student notes
4. **Decision:**
   - **Approve:** Click "Approve" → Student auto-enrolled
   - **Reject:** Add admin notes → Click "Reject" → Student notified
5. **Track History** → View approved/rejected proofs

---

## Configuration

### Environment Variables

Add to `.env.local`:

```env
# Email Service (Required for notifications)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Customize bank details (hardcoded for now)
BANK_NAME=Banque Centrale de Tunisie
BANK_ACCOUNT=12345678901234567890
BANK_IBAN=TN59 1234 5678 9012 3456 7890
BANK_BIC=BCTUTNTX
BANK_BENEFICIARY=GermanyFormation SARL
```

### File Storage

**Current:** Local filesystem (`public/uploads/payment-proofs/`)

**Production Recommendation:** 
- Use cloud storage (AWS S3, Cloudinary, UploadThing)
- Update `upload-proof` route to upload to cloud
- Update `proofUrl` to point to cloud URL

**Security:**
- `.gitignore` added to prevent committing uploaded files
- Only authenticated users can upload
- Admin-only access to review

---

## Security Considerations

### File Upload Security
1. **File Type Validation:** Only images and PDFs allowed
2. **File Size Limit:** Max 5MB
3. **Authentication Required:** Clerk auth check
4. **Unique Filenames:** Prevents overwrites
5. **No Git Tracking:** Files excluded from version control

### Admin Access
1. **Role Check:** `user.publicMetadata.isAdmin` verified
2. **Authorization:** 403 error for non-admins
3. **Audit Trail:** Tracks who reviewed and when

### Data Privacy
1. **User Isolation:** Students only see their own proofs
2. **Secure Endpoints:** All routes require authentication
3. **HTTPS:** Ensure production uses HTTPS for file uploads

---

## Migration from Flouci

### Files Removed
- `app/api/(payment)/payment_flouci/route.ts`
- `app/api/(payment)/payment_flouci/verify_payment/route.ts`
- `FLOUCI_SETUP.md`
- `FLOUCI_IMPLEMENTATION_SUMMARY.md`
- `FLOUCI_QUICK_START.md`

### Environment Variables to Remove
```env
# Remove these from .env.local
NEXT_PUBLIC_FLOUCI_PUBLIC_TOKEN
FLOUCI_SECRET_TOKEN
FLOUCI_DEVELOPER_TRACKING_ID
```

### Code Changes
- **PurchaseCourseCard.tsx:** Replaced Flouci button with bank transfer upload
- **Removed:** `handlePurchaseWithFlouci` function
- **Added:** `BankTransferUpload` component integration

---

## Testing

### Test Student Upload Flow
1. Create test user account
2. Navigate to a paid course
3. Click "Buy Now"
4. Upload a test image (use a dummy receipt)
5. Add notes: "Test upload"
6. Submit and verify success message

### Test Admin Approval Flow
1. Login as admin
2. Navigate to `/admin/payment-proofs`
3. Filter by "Pending"
4. Click "View" on test proof
5. Click "Approve"
6. Verify:
   - Email sent
   - User enrolled in course
   - Proof status updated

### Test Admin Rejection Flow
1. Click "Reject" on a pending proof
2. Add admin notes: "Invalid receipt"
3. Confirm rejection
4. Verify:
   - Email sent with notes
   - Proof status updated
   - User can see rejection reason

---

## Troubleshooting

### Upload Fails
- Check file size < 5MB
- Verify file type is image or PDF
- Ensure user is authenticated
- Check disk space on server

### Admin Can't See Proofs
- Verify admin role: `user.publicMetadata.isAdmin === true`
- Check MongoDB connection
- Verify PaymentProof model is imported correctly

### Email Not Sending
- Check `RESEND_API_KEY` is set
- Verify Resend account is active
- Check email.action.ts for errors
- Verify "from" email is verified in Resend

### Course Not Unlocking After Approval
- Check course ID matches
- Verify `user.enrolledCourses` updated
- Check `course.students` array updated
- Review API logs for errors

---

## Future Enhancements

1. **Cloud Storage Integration**
   - Migrate from local filesystem to AWS S3/Cloudinary
   - Add automatic image optimization
   - Implement automatic backup

2. **Advanced Filtering**
   - Filter by date range
   - Search by user email/name
   - Filter by course

3. **Bulk Actions**
   - Approve/reject multiple proofs at once
   - Export to CSV for accounting

4. **Analytics Dashboard**
   - Total revenue from manual transfers
   - Average review time
   - Approval/rejection rates
   - Popular courses

5. **Automated Verification**
   - OCR to read transfer details
   - Bank API integration for automatic verification
   - AI to detect fake receipts

6. **Student Experience**
   - Upload multiple proofs at once
   - Re-upload if rejected (without re-entering data)
   - Mobile-optimized upload

---

## Support

For issues or questions:
- Email: support@germanyformation.com
- Documentation: This file
- Developer: Check API logs in server console
