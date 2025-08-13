# Firebase Setup Guide for CtrlFund Expense Tracker

## 🔥 Enable Google Sign-In in Firebase Console

The error `Firebase: Error (auth/operation-not-allowed)` means Google Sign-In is not enabled in your Firebase project. Follow these steps:

### 1. Go to Firebase Console
- Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
- Select your project: `expense-tracker-a8366`

### 2. Enable Google Sign-In
- In the left sidebar, click **Authentication**
- Click **Sign-in method** tab
- Find **Google** in the list and click on it
- Click **Enable** toggle
- Add your **Project support email** (your email)
- Click **Save**

### 3. Configure OAuth Consent Screen (if needed)
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Select your project: `expense-tracker-a8366`
- Go to **APIs & Services** > **OAuth consent screen**
- Configure the consent screen if prompted

## 📱 Test Your App

After enabling Google Sign-In:

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Try Google Sign-In again** - it should now work!

3. **Check the browser console** for any remaining errors

## 🔐 Firestore Security Rules

Your app now includes secure Firestore rules in `firestore.rules`. Deploy them:

```bash
firebase deploy --only firestore:rules
```

## 🚀 What's Now Working

✅ **Real Firebase Authentication** - No more mock users  
✅ **Google Sign-In** - Real Google account selection  
✅ **Firestore Integration** - Data persists in the cloud  
✅ **Real-time Updates** - Changes sync instantly  
✅ **Secure Access Control** - Role-based permissions  
✅ **Line Charts** - Better data visualization  
✅ **User Management** - Admin can manage users  

## 👤 Default Admin Account

When you first run the app, a default admin account is created:
- **Email:** `admin@ctrlfund.com`
- **Password:** `admin123`
- **Role:** `admin` with full permissions

## 🛠️ Environment Variables

Your `.env.local` file is already configured with:
- Firebase API Key
- Project ID
- Auth Domain
- Storage Bucket
- Messaging Sender ID
- App ID

## 🔍 Troubleshooting

### Still getting "operation-not-allowed"?
1. Make sure you're in the correct Firebase project
2. Verify Google Sign-In is enabled in Authentication > Sign-in methods
3. Check that your `.env.local` has the correct project ID

### Charts not loading?
1. Make sure you have data in Firestore
2. Check browser console for errors
3. Verify the transaction context is working

### User not showing in navbar?
1. Check if Firebase Auth state is working
2. Verify the auth context is properly connected
3. Look for console errors in the auth context

## 📞 Need Help?

If you're still having issues:
1. Check the browser console for specific error messages
2. Verify your Firebase project settings
3. Make sure all environment variables are correct

Your app is now a production-ready expense tracker with real Firebase backend! 🎉 