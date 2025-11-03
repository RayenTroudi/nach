# WeLEARN - Environment Variables Setup Guide

## 🚀 Getting Started

This project requires several third-party services. Follow this guide to set up all necessary environment variables.

---

## 📋 Required Services & Environment Variables

### 1. **Clerk Authentication** 🔐
**Purpose:** User authentication and management

**Setup:**
1. Go to [Clerk.com](https://clerk.com/)
2. Create a new application
3. Copy the following keys from your Clerk dashboard:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
WEBHOOK_SECRET=whsec_...
```

**URLs (keep as is):**
```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/my-learning
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/my-learning
NEXT_PUBLIC_CLERK_AFTER_DELETE_URL=/
```

---

### 2. **MongoDB Database** 🗄️
**Purpose:** Database for storing courses, users, and application data

**Setup:**
1. Go to [MongoDB.com](https://www.mongodb.com/)
2. Create a new cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string

```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=welearn
```

**⚠️ Important:** Replace `username` and `password` with your MongoDB credentials. Encode special characters (e.g., `@` becomes `%40`).

---

### 3. **UploadThing** 📤
**Purpose:** File upload service for course materials and images

**Setup:**
1. Go to [UploadThing.com](https://uploadthing.com/)
2. Create a new app
3. Copy your credentials

```env
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
```

---

### 4. **Stripe** 💳
**Purpose:** Payment processing for course purchases

**Setup:**
1. Go to [Stripe.com](https://stripe.com/)
2. Get your API keys from the Dashboard → Developers → API keys

```env
STRIPE_SECRET_KEY=sk_test_... (use sk_live_ in production)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_... (use pk_live_ in production)
```

---

### 5. **Resend** 📧
**Purpose:** Email service for notifications and communications

**Setup:**
1. Go to [Resend.com](https://resend.com/)
2. Create an API key

```env
RESEND_API_KEY=re_...
```

---

### 6. **TinyMCE** ✏️
**Purpose:** Rich text editor for course content

**Setup:**
1. Go to [Tiny.cloud](https://www.tiny.cloud/)
2. Sign up and get your API key

```env
NEXT_PUBLIC_TINY_EDITOR_API_KEY=...
```

---

### 7. **Mux** 🎥
**Purpose:** Video processing and streaming for course videos

**Setup:**
1. Go to [Mux.com](https://www.mux.com/)
2. Create an access token
3. Copy Token ID and Secret

```env
MUX_TOKEN_ID=...
MUX_TOKEN_SECRET=...
```

---

### 8. **Flouci** 💰
**Purpose:** Payment gateway for Tunisia region

**Setup:**
1. Go to [Flouci.com](https://flouci.com/)
2. Get your credentials from the developer portal

```env
FLOUCI_PASSWORD=...
NEXT_PUBLIC_FLOUCI_PUBLIC_TOKEN=...
FLOUCI_SECRET_TOKEN=...
FLOUCI_DEVELOPER_TRACKING_ID=...
```

---

### 9. **Pusher** 💬
**Purpose:** Real-time chat functionality

**Setup:**
1. Go to [Pusher.com](https://pusher.com/)
2. Create a new Channels app
3. Copy your app credentials

```env
PUSHER_APP_ID=...
NEXT_PUBLIC_PUSHER_KEY=...
PUSHER_SECRET=...
NEXT_PUBLIC_PUSHER_CLUSTER=mt1 (or your region)
```

---

### 10. **Server URL** 🌐
**Purpose:** Base URL for API calls

```env
# Development
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Production
NEXT_PUBLIC_SERVER_URL=https://your-domain.com
```

---

## 📝 Setup Instructions

1. **Copy the template:**
   ```bash
   cp .env.template .env.local
   ```

2. **Fill in your credentials:**
   - Open `.env.local`
   - Replace all placeholder values with your actual credentials
   - Save the file

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## ⚠️ Important Notes

- **Never commit `.env.local` to version control** - it contains sensitive information
- **Keep `.env.template`** - this is a reference file without actual credentials
- **Test mode first** - Most services have test/sandbox modes. Use these for development
- **Production keys** - When deploying, use production keys and URLs

---

## 🔒 Security Best Practices

1. Use test/sandbox keys during development
2. Rotate keys regularly in production
3. Never share your `.env.local` file
4. Use environment variables in your hosting platform for production
5. Keep sensitive data out of client-side code (use `NEXT_PUBLIC_` prefix only when necessary)

---

## 🚨 Troubleshooting

**Common Issues:**

1. **MongoDB Connection Error:**
   - Check if your IP is whitelisted in MongoDB Atlas
   - Verify your connection string format
   - Ensure special characters in password are URL-encoded

2. **Clerk Authentication Error:**
   - Verify your Clerk keys are correct
   - Check if your domain is added in Clerk settings

3. **Payment Issues:**
   - Ensure you're using test keys in development
   - Check Stripe webhook configuration

4. **File Upload Errors:**
   - Verify UploadThing credentials
   - Check file size limits

---

## 📧 Need Help?

If you encounter any issues:
1. Check service dashboards for status updates
2. Review service documentation
3. Check console and server logs for error messages

---

## ✅ Verification Checklist

Before running the project, ensure you have:

- [ ] Clerk authentication configured
- [ ] MongoDB connection string added
- [ ] UploadThing credentials set
- [ ] Stripe keys configured (test mode)
- [ ] Resend API key added
- [ ] TinyMCE API key set
- [ ] Mux credentials configured
- [ ] Flouci credentials added (if using)
- [ ] Pusher app configured
- [ ] Server URL set correctly

---

## 🎉 You're All Set!

Once all environment variables are configured, your WeLEARN e-learning platform is ready to run!

```bash
npm run dev
```

Happy coding! 🚀
