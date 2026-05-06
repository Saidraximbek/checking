# Quick Start Guide - 5 Minutes to Running App

## Prerequisites ✅
- Node.js installed
- Firebase account created
- Firebase project set up (Firestore + Auth enabled)

## 5-Minute Setup

### 1. Get Firebase Credentials (2 min)

1. Go to Firebase Console → Project Settings
2. Copy your config object:
```javascript
{
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

### 2. Update Firebase Config (1 min)

Edit `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

### 3. Create Admin Account (1 min)

1. Firebase Console → Authentication
2. Create user: admin@example.com / password123

### 4. Start App (1 min)

```bash
npm run dev
```

App opens at: http://localhost:5173

## Done! 🎉

### Test the App

1. **Admin:** Click "Admin Login"
   - Email: admin@example.com
   - Password: password123
   - Create a test (e.g., TEST001)

2. **User:** Go back, enter details
   - Name: Test User
   - Code: TEST001
   - Take test and see results!

## Next Steps

- Review [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed info
- Read [README.md](README.md) for full documentation
- Check src/ folder structure

---

**Questions?** See SETUP_GUIDE.md or README.md for detailed help.
