# 🌳 Teacher Appreciation Wishing Tree

A beautiful interactive platform where people can share gratitude and encouragement for teachers. Built with React and Firebase for real-time wish sharing.

![Teacher Wishing Tree Preview](./preview.png)

## ✨ Features

- 🌿 **Interactive Tree Visualization** - Click leaves to read wishes
- 🎨 **Seasonal Themes** - Colors change with seasons automatically  
- 💝 **Real-time Sharing** - All wishes sync instantly across devices
- 🛡️ **Content Moderation** - AI-powered filtering for positive messages
- ❤️ **Heart Reactions** - Anonymous appreciation for wishes
- 📱 **Mobile Responsive** - Beautiful on all screen sizes
- 🔍 **Search & Filter** - Find specific types of encouragement
- 📊 **Statistics Dashboard** - Track community engagement
- 🎯 **Wish of the Day** - Highlight special messages

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase account
- Git

### 1. Clone Repository
```bash
git clone https://github.com/your-username/teacher-wishing-tree.git
cd teacher-wishing-tree
npm install
```

### 2. Firebase Setup
1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database (start in test mode)
3. Copy your Firebase config

### 3. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your Firebase config:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
# ... rest of your config
```

### 4. Run Locally
```bash
npm start
```
Visit `http://localhost:3000`

### 5. Deploy to GitHub Pages
```bash
npm run build
npm run deploy
```

## 📁 Project Structure

```
src/
├── App.js                 # Main application component
├── components/            # Reusable UI components
├── services/
│   └── firebaseService.js # Database operations
├── utils/
│   └── contentModeration.js # Content filtering
└── config/
    └── firebase.js        # Firebase configuration
```

## 🔧 Configuration

### Firebase Security Rules
Add these rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /wishes/{document} {
      allow read: if true;
      allow write: if request.auth == null && 
                     resource == null &&
                     request.resource.data.keys().hasAll(['message', 'category', 'author', 'timestamp']);
    }
    
    match /reports/{document} {
      allow write: if request.auth == null;
      allow read: if false; // Admin only
    }
  }
}
```

### Firestore Database Structure
```
wishes/
├── {wishId}
│   ├── message: string
│   ├── category: string
│   ├── author: string
│   ├── isAnonymous: boolean
│   ├── timestamp: timestamp
│   ├── hearts: number
│   ├── x: number (position)
│   ├── y: number (position)
│   └── rotation: number

reports/
├── {reportId}
│   ├── wishId: string
│   ├── reason: string
│   ├── details: string
│   ├── timestamp: timestamp
│   └── status: string
```

## 🌍 Deployment Options

### Option 1: GitHub Pages (Recommended)
```bash
npm install gh-pages --save-dev
npm run deploy
```

### Option 2: Vercel
1. Push to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy automatically

### Option 3: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Option 4: Netlify
1. Drag and drop `build` folder
2. Or connect GitHub repository
3. Add environment variables

## 🎨 Customization

### Change Colors
Edit `src/utils/contentModeration.js` in the `getSeasonalColors()` function:

```javascript
// Spring colors
return {
  gratitude: '#FF6B9D',    // Pink for gratitude
  support: '#4ECDC4',      // Teal for support  
  inspiration: '#45B7D1',  // Blue for inspiration
  appreciation: '#98FB98'  // Light green for appreciation
};
```

### Add New Categories
1. Update categories object in `src/App.js`
2. Add corresponding colors in `getSeasonalColors()`
3. Import new icons from `lucide-react`

### Modify Content Moderation
Edit `src/utils/contentModeration.js`:
- Add/remove inappropriate words
- Adjust message length requirements
- Customize validation rules

## 🛡️ Security Features

- **Environment Variables** - API keys never committed to repo
- **Content Moderation** - Multi-layer filtering system
- **Report System** - Community moderation for inappropriate content
- **Rate Limiting** - Prevents spam (configure in Firebase)
- **Input Validation** - All data validated before storage

## 📊 Analytics & Monitoring

### Firebase Analytics (Optional)
Add to `firebase.js`:
```javascript
import { getAnalytics } from "firebase/analytics";
export const analytics = getAnalytics(app);
```

### Performance Monitoring
- Use Firebase Performance Monitoring
- Monitor Core Web Vitals
- Track user engagement metrics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push branch: `git push origin feature-name`
5. Submit pull request

## 📝 License

MIT License - feel free to use for your own teacher appreciation projects!

## 🙏 Credits

Created with ❤️ by [TeachersTogether](https://www.instagram.com/teacherstogether_sg)

Built with:
- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

## 🆘 Support

Having issues? Check our [troubleshooting guide](./TROUBLESHOOTING.md) or create an issue.

---

**Made with 🌿 for teachers everywhere**