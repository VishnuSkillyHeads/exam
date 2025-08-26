# Exam Portal - College Placement System

A comprehensive exam management system built with React, Firebase, and modern UI/UX practices for college placement cells.

## 🚀 Features

### For Administrators
- **Dashboard**: Real-time statistics and overview of exams, students, and performance
- **Batch Management**: 
  - Create and manage student batches with sections and branches
  - Excel import/export functionality for bulk batch operations
  - Unique identification using sections and branches
- **Exam Creation**: 
  - Create comprehensive exams with multiple-choice questions
  - Set duration, passing marks, and schedule
  - Assign exams to specific batches
- **Email Invitations**: Automatic email notifications to students when exams are created
- **Reports & Analytics**: 
  - Batch-wise and individual performance reports
  - Advanced filtering options
  - Visual charts and analytics
  - Export functionality
- **Anti-Cheating Features**: 
  - Tab switching detection and logging
  - Full-screen exam mode
  - Violation tracking

### For Students
- **Exam Interface**: 
  - Full-screen, distraction-free exam environment
  - Real-time timer and progress tracking
  - Question navigation
  - Auto-submission on time expiry
- **Performance Tracking**: View exam results and performance analytics
- **Exam Schedule**: Access upcoming and completed exams

## 🛠️ Technology Stack

- **Frontend**: React 18, Styled Components, React Router
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **UI/UX**: Modern design with responsive layout
- **Charts**: Chart.js with React Chart.js 2
- **Excel Handling**: XLSX library for import/export
- **Icons**: React Icons (Feather Icons)

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project setup

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd exam-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Get your Firebase configuration

4. **Configure Firebase**
   - Update `src/firebase/config.js` with your Firebase configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.js
│   │   └── Signup.js
│   ├── Batches/
│   │   └── BatchManagement.js
│   ├── Dashboard/
│   │   └── Dashboard.js
│   ├── Exams/
│   │   ├── ExamCreation.js
│   │   └── FullScreenExam.js
│   ├── Layout/
│   │   ├── MainLayout.js
│   │   └── Sidebar.js
│   └── Reports/
│       └── Reports.js
├── contexts/
│   └── AuthContext.js
├── firebase/
│   └── config.js
├── App.js
├── App.css
└── index.js
```

## 🔐 Authentication & Authorization

The system supports two user roles:

### Admin
- Full access to all features
- Can create/manage batches and exams
- Access to reports and analytics
- Can send email invitations

### Student
- Access to assigned exams
- View personal performance
- Take exams in full-screen mode

## 📊 Database Schema

### Collections

1. **users**
   - uid, email, name, role, createdAt

2. **batches**
   - name, section, branch, academicYear, totalStudents, description, createdAt

3. **exams**
   - title, description, duration, startTime, endTime, totalMarks, passingMarks, questions[], selectedBatches[], status, createdAt

4. **examResults**
   - examId, userId, userEmail, answers, startTime, endTime, duration, tabSwitches, submittedAt

5. **examViolations**
   - examId, userId, type, timestamp, userEmail

## 🎯 Key Features Explained

### Excel Import/Export
- Supports .xlsx and .xls formats
- Automatic mapping of column headers
- Batch validation and error handling

### Full-Screen Exam Mode
- Prevents tab switching and window manipulation
- Real-time violation detection
- Automatic logging of suspicious activities

### Email Integration
- Automatic invitations when exams are created
- Configurable email templates
- Batch email sending

### Advanced Reporting
- Multiple filter options (batch, exam, date range, status)
- Visual charts and analytics
- Export to Excel functionality
- Real-time data updates

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🔒 Security Features

- Firebase Authentication
- Role-based access control
- Protected routes
- Input validation
- XSS protection
- CSRF protection

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Configuration Error**
   - Ensure all Firebase config values are correct
   - Check if Firestore rules allow read/write operations

2. **Excel Import Issues**
   - Verify file format (.xlsx or .xls)
   - Check column headers match expected format
   - Ensure file size is within limits

3. **Authentication Issues**
   - Clear browser cache and cookies
   - Check Firebase Authentication settings
   - Verify email/password format

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

Stay updated with the latest features and bug fixes by:
- Following the repository
- Checking release notes
- Subscribing to notifications

---

**Built with ❤️ for modern education technology**
