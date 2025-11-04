# 🚀 Production Deployment Checklist for Nach

## 📍 Production URL
**Live Site:** https://nach-snowy.vercel.app

## ✅ Pre-Deployment Setup

### 1. Vercel Environment Variables
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Set these for **Production** environment:

#### Authentication (Clerk)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXhvdGljLWhvbmV5YmVlLTM2LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_aQxEmJaimSCmUI072CF4yj6fQBy6ZJ44N3HZ3dx8L7
WEBHOOK_SECRET=whsec_MqVmVNmJWMIT6uHEyb0tUTPx4BOckdlN
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/my-learning
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/my-learning
NEXT_PUBLIC_CLERK_AFTER_DELETE_URL=/
```

#### Database
```
MONGODB_URL=mongodb+srv://rayen:rayen@cluster0.6b2ltxl.mongodb.net/?appName=Cluster0
DATABASE_NAME=nach
```

#### File Upload
```
UPLOADTHING_TOKEN=eyJhcGlLZXkiOiJza19saXZlXzk2ZTBkMjcxZjJmYTY1NjNmNDlkNTg1MjA4MTlmNmQ5MTZkM2U2OTE1YjYxODIzOWU1MjhhOTEwNzc2OWFlNDciLCJhcHBJZCI6IjRlZTBnY28wMnciLCJyZWdpb25zIjpbInNlYTEiXX0=
```

#### Server URL
```
NEXT_PUBLIC_SERVER_URL=https://nach-snowy.vercel.app
```

#### Email Service
```
RESEND_API_KEY=re_55bezBpK_ekfYSc4fSPb4ipP72BsXQFaZ
```

#### Video Processing
```
MUX_TOKEN_ID=2db6ef1c-5b6d-42b7-9d6a-e22a883d9e4f
MUX_TOKEN_SECRET=HLvMYrE6uap8XbkJ0q8ZBev/WeY5IHi6rC4yFqgwEeO9wsLDZT8ZcCIb4aPAR+bI91vq6yvV8bf
```

#### Real-time Chat
```
PUSHER_APP_ID=2072672
NEXT_PUBLIC_PUSHER_KEY=c3b5243fa34cca0bc1cb
PUSHER_SECRET=bbec51f426d4fe67a475
NEXT_PUBLIC_PUSHER_CLUSTER=eu
```

#### Payment Gateway (Flouci)
⚠️ **IMPORTANT:** Update these with your actual Flouci credentials
```
NEXT_PUBLIC_FLOUCI_PUBLIC_TOKEN=your_actual_flouci_public_token
FLOUCI_SECRET_TOKEN=your_actual_flouci_secret_token
FLOUCI_DEVELOPER_TRACKING_ID=your_actual_tracking_id
```

### 2. Clerk Webhook Configuration
📖 See detailed guide: [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Webhooks** → **Add Endpoint**
3. Set URL: `https://nach-snowy.vercel.app/api/webhooks`
4. Subscribe to these events:
   - ✅ user.created
   - ✅ user.updated
   - ✅ user.deleted
   - ✅ session.created
   - ✅ session.ended
   - ✅ email.created
5. Copy the **Signing Secret** (starts with `whsec_`)
6. Update `WEBHOOK_SECRET` in Vercel environment variables
7. Save and test with a new user signup

### 3. Flouci Payment Setup

1. Get your Flouci credentials:
   - Public Token
   - Secret Token
   - Developer Tracking ID

2. Update in Vercel environment variables

3. Configure Flouci webhook (if required):
   - Success URL: `https://nach-snowy.vercel.app/flouci/purchase/success`
   - Fail URL: `https://nach-snowy.vercel.app/flouci/purchase/fail`

### 4. MongoDB Atlas Setup

1. Verify MongoDB connection:
   - Database: `nach`
   - Collections: users, courses, categories, etc.

2. Whitelist Vercel IPs or use `0.0.0.0/0` (allow all)

3. Test connection from Vercel deployment

## 🧪 Testing After Deployment

### Test User Authentication & Webhook
```
1. Visit: https://nach-snowy.vercel.app/sign-up
2. Create a new test user
3. Check Clerk Dashboard → Webhooks for successful delivery (200 status)
4. Verify user appears in MongoDB users collection
5. Test login at: https://nach-snowy.vercel.app/sign-in
```

### Test Flouci Payment
```
1. Add a course to cart
2. Go to checkout
3. Click "Checkout with Flouci"
4. Complete payment (use test credentials if available)
5. Verify redirect to success/fail pages
6. Check course enrollment in MongoDB
```

### Test File Upload (UploadThing)
```
1. Login as instructor
2. Create a new course
3. Upload course thumbnail
4. Upload course video
5. Verify files appear in UploadThing dashboard
```

### Test Real-time Chat (Pusher)
```
1. Login with two different users
2. Join a chat room
3. Send messages
4. Verify real-time delivery
```

## 🔍 Monitoring & Debugging

### Vercel Logs
```
Vercel Dashboard → Your Project → Deployments → Latest → Functions
```

### Check Webhook Status
```
Clerk Dashboard → Webhooks → Your Endpoint → Recent Deliveries
```

### MongoDB Monitoring
```
MongoDB Atlas → Cluster → Metrics
```

## 🔒 Security Notes

- ✅ Never commit `.env.local` to git
- ✅ Use different credentials for production vs development
- ✅ Regularly rotate API keys and secrets
- ✅ Monitor webhook logs for suspicious activity
- ✅ Keep dependencies updated

## 📱 Features Checklist

After deployment, verify:
- [ ] User signup/login works
- [ ] User created in MongoDB via webhook
- [ ] Course browsing works
- [ ] Course purchase with Flouci works
- [ ] File uploads work (thumbnails, videos)
- [ ] Real-time chat works
- [ ] Email notifications work
- [ ] Certificate generation works
- [ ] Admin dashboard accessible
- [ ] Teacher dashboard accessible
- [ ] Student dashboard accessible

## 🐛 Common Issues & Solutions

### Webhook Returns 500 Error
- Check MongoDB connection URL in Vercel
- Verify database name is correct
- Check Vercel function logs

### Payment Not Working
- Verify Flouci credentials are correct
- Check NEXT_PUBLIC_SERVER_URL is production URL
- Verify Flouci webhook URLs are set

### Files Not Uploading
- Check UPLOADTHING_TOKEN is valid
- Verify UploadThing app is active
- Check file size limits

### Chat Not Working
- Verify Pusher credentials
- Check NEXT_PUBLIC_PUSHER_KEY is set
- Verify Pusher cluster is correct

## 📞 Support Resources

- **Clerk Support:** https://clerk.com/support
- **Vercel Support:** https://vercel.com/support
- **MongoDB Atlas:** https://www.mongodb.com/support
- **UploadThing:** https://uploadthing.com/dashboard
- **Flouci:** Contact Flouci support for payment issues

## 🎯 Next Steps

1. ✅ Set up all environment variables in Vercel
2. ✅ Configure Clerk webhook with production URL
3. ✅ Update Flouci credentials
4. ✅ Test all major features
5. ✅ Monitor logs for first 24 hours
6. 🔄 Set up monitoring/alerting (optional)
7. 🔄 Create backup strategy for MongoDB
8. 🔄 Set up CI/CD pipeline (optional)

---

**Last Updated:** November 4, 2025
**Production URL:** https://nach-snowy.vercel.app
**Deployment Platform:** Vercel
**Database:** MongoDB Atlas
**Authentication:** Clerk
**Payment:** Flouci (Tunisia)
