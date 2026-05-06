# Answer Checker System

A web application for checking answers against an answer key using React (Vite) and Firebase.

## Features

✨ **User Features:**
- Enter full name and test code to start
- Answer input form (no questions shown)
- Support for A/B/C/D answers
- Auto-move to next input
- Keyboard input support
- Highlight unanswered questions
- View results with score breakdown
- Results automatically saved to Firestore

🔐 **Admin Features:**
- Login with email and password
- Create tests with answer keys
- Edit and delete tests
- View all test results
- Manage test codes and titles

## Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Backend:** Firebase (Auth + Firestore)

## Project Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

Update `src/firebase/config.js` with your Firebase credentials:

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

Get your Firebase config from [Firebase Console](https://console.firebase.google.com/)

### 3. Set Up Firebase

#### Firestore Database:

1. Go to Firebase Console → Firestore Database
2. Create a database in production mode
3. Set these security rules:

```json
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tests/{document=**} {
      allow read;
    }
    match /results/{document=**} {
      allow create;
      allow read;
    }
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

#### Authentication:

1. Go to Firebase Console → Authentication
2. Enable Email/Password authentication
3. Create an admin account for managing tests

### 4. Create Firestore Collections

Create two collections in Firestore:

#### `tests` Collection
```
- id: auto-generated
- testCode: string (e.g., "TEST001")
- title: string
- totalQuestions: number
- correctAnswers: array of strings (["A", "C", "B", "D", ...])
- createdAt: timestamp
```

#### `results` Collection
```
- id: auto-generated
- name: string
- testCode: string
- testId: reference to test
- answers: array of strings
- score: number
- totalQuestions: number
- correctAnswers: number
- wrongAnswers: number
- percentage: number
- createdAt: timestamp
```

### 5. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 6. Build for Production

```bash
npm run build
```

## How to Use

### For Users:

1. **Home Page:**
   - Enter your full name
   - Enter the test code (provided by admin)
   - Click "Start Test"

2. **Answer Form:**
   - Input answers as A, B, C, or D
   - Use keyboard: Type A/B/C/D directly
   - Press Arrow Down to move to next question
   - Press Arrow Up to go to previous question
   - Auto-moves to next input after selecting an answer

3. **Results:**
   - View your score and percentage
   - See correct vs. wrong answers count
   - Results are automatically saved

### For Admin:

1. **Login:**
   - Click "Admin Login" on home page
   - Use your admin email and password

2. **Create Test:**
   - Go to "Create Test" tab
   - Enter test code (e.g., TEST001)
   - Enter test title
   - Enter total questions
   - Enter correct answers (comma-separated: A,C,B,D,A...)
   - Click "Create Test"

3. **Manage Tests:**
   - View all tests
   - Edit existing tests
   - Delete tests

4. **View Results:**
   - Go to "Results" tab
   - See all student results
   - View scores and percentages

## Project Structure

```
src/
├── components/
│   ├── Home.jsx          # Name and test code entry
│   ├── AnswerForm.jsx    # Answer input form
│   ├── Results.jsx       # Results display and save
│   ├── AdminLogin.jsx    # Admin login
│   ├── AdminPanel.jsx    # Admin management
│   └── Navbar.jsx        # Error notifications
├── context/
│   └── AppContext.jsx    # App state management
├── firebase/
│   └── config.js         # Firebase configuration
├── App.jsx               # Main app component
├── main.jsx              # Entry point
└── index.css             # Global styles
```

## Key Features Explained

### Auto-Move to Next Input
After selecting an answer (A/B/C/D), the focus automatically moves to the next question.

### Keyboard Support
- Type A, B, C, or D directly
- Arrow Down: move to next question
- Arrow Up: move to previous question
- Backspace with empty input: move to previous question

### Unanswered Highlight
Questions with no answer are highlighted in orange to alert the user.

### Answer Validation
- All questions must be answered before submission
- Submit button is disabled if unanswered questions exist

### Score Calculation
```
Score = Number of correct answers
Percentage = (Correct answers / Total questions) × 100
```

## Security Notes

- Firebase Auth handles admin authentication
- Firestore security rules restrict data access
- Passwords are hashed by Firebase
- Results are saved with timestamps

## Troubleshooting

### "Invalid test code" error
- Check that the test code exists in Firebase
- Test codes are case-insensitive

### Firebase errors
- Check your Firebase config
- Verify Firebase credentials
- Check Firestore security rules

### Results not saving
- Check Firestore connection
- Verify security rules allow writes to `results` collection

## Environment Variables (Optional)

Create a `.env` file:
```
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
# ... other Firebase config
```

## License

MIT

## Support

For issues or feature requests, please create an issue in the repository.
