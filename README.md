# 🏛️ Secure & Share Government Documents

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://html.spec.whatwg.org/)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A modern, secure web application that enables Indian citizens to digitally store, manage, and share government-issued documents with family members. Built with Firebase for maximum security and reliability.

## 🌟 Live Demo

🚀 **[Try the Live Application](https://your-firebase-project.web.app)** (Coming Soon)

## 📖 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

## ✨ Features

### 🔐 **Dual Authentication System**
- Email/Password authentication
- Phone OTP verification
- Secure user sessions

### 📄 **Smart Document Management**
- **Auto-Classification**: Automatically detects document types (Aadhaar, PAN, Passport, etc.)
- **Multi-Format Support**: PDF, Images (JPG, PNG), Word documents
- **File Validation**: Size limits and type checking
- **Secure Storage**: Encrypted cloud storage via Firebase

### 👨‍👩‍👧‍👦 **Family Sharing**
- Share documents securely using unique UIDs
- QR code generation for easy sharing
- Access control and permissions
- Audit trail for all sharing activities

### 🎨 **Modern Interface**
- Responsive design for all devices
- Glassmorphism UI effects
- Intuitive user experience
- Dark/light theme support

### 📊 **Advanced Features**
- Complete audit logging
- Document type badges
- Profile management
- Real-time sync across devices

## 📱 Screenshots

| Dashboard | Document Upload | Profile Management |
|-----------|-----------------|-------------------|
| ![Dashboard](docs/images/dashboard.png) | ![Upload](docs/images/upload.png) | ![Profile](docs/images/profile.png) |

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Grid/Flexbox
- **JavaScript (ES6+)** - Modular architecture
- **Firebase SDK v9** - Backend services

### Backend Services (Firebase)
- **Authentication** - Email/Password + Phone OTP
- **Firestore** - NoSQL document database
- **Storage** - Secure file storage
- **Hosting** - Global CDN deployment
- **Security Rules** - Database and storage protection

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Git

### One-Command Setup

```bash
# Clone and setup
git clone https://github.com/yourusername/secure-share-gov-doc.git
cd secure-share-gov-doc
npm install
npm run build  # Validates project setup
```

## 📦 Installation

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/secure-share-gov-doc.git
cd secure-share-gov-doc
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Setup
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login
```

## ⚙️ Configuration

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable the following services:
   - **Authentication** (Email/Password, Phone)
   - **Firestore Database**
   - **Storage**
   - **Hosting**

### 2. Configure Application

```bash
# Copy the Firebase configuration template
cp assets/js/firebase-config.template.js assets/js/firebase-config.js
```

Edit `assets/js/firebase-config.js` with your Firebase project credentials:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. Initialize Firebase Services

```bash
firebase init
```

Select:
- ✅ Firestore
- ✅ Storage 
- ✅ Hosting

### 4. Deploy Security Rules

```bash
firebase deploy --only firestore:rules,storage:rules
```

## 🎯 Usage

### Local Development

```bash
# Start local development server
npm start
# Opens http://localhost:5000
```

### Build & Deploy

```bash
# Validate project
npm run build

# Deploy to Firebase
npm run deploy
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start local development server |
| `npm run build` | Validate project structure |
| `npm run deploy` | Deploy to Firebase hosting |
| `npm run emulator` | Start Firebase emulator suite |

## 🔒 Security

### Built-in Security Features

- **🔐 Authentication**: Multi-factor authentication support
- **🛡️ Authorization**: Role-based access control
- **🔒 Data Encryption**: Firebase's end-to-end encryption
- **📋 Security Rules**: Comprehensive Firestore and Storage rules
- **📊 Audit Logging**: Complete action tracking
- **✅ Input Validation**: File type and size validation

### Security Best Practices

- Never commit `firebase-config.js` to version control
- Use environment variables in production
- Enable App Check for additional security
- Regular security rule audits
- Monitor authentication logs

## 📄 Document Types Supported

| Document | Description | Auto-Detection |
|----------|-------------|----------------|
| Aadhaar Card | Identity verification | ✅ |
| PAN Card | Tax identification | ✅ |
| Passport | International travel | ✅ |
| Driving License | Driving authorization | ✅ |
| Voter ID | Electoral identification | ✅ |
| Birth Certificate | Birth registration | ✅ |
| Income Certificate | Income proof | ✅ |
| Caste Certificate | Caste verification | ✅ |
| Marksheets | Educational records | ✅ |
| Others | Miscellaneous documents | ➖ |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### Development Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run validation: `npm run build`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use ES6+ features
- Follow existing code patterns
- Comment complex logic
- Maintain responsive design principles

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [Digital India Initiative](https://digitalindia.gov.in/) - Inspiration
- Open source community - Continuous support

## 📞 Support

- 📧 Email: [support@govdocshare.com](mailto:support@govdocshare.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/secure-share-gov-doc/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/secure-share-gov-doc/discussions)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/secure-share-gov-doc&type=Date)](https://star-history.com/#yourusername/secure-share-gov-doc&Date)

---

<div align="center">
  <strong>Built with ❤️ for Digital India</strong><br>
  <sub>Making government document management simple and secure</sub>
</div>

