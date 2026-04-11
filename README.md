# 🏛️ SmartBarangay Management System
A modern, minimalist, and real-time integrated management system designed to streamline barangay operations, ranging from resident records to document requests!

## ✨ Features
- **Real-Time Database**: Integrated with Firebase Firestore for real-time CRUD operations.
- **Modern UI Suite**: Built with Next.js App Router, Tailwind CSS, and Lucide React.
- **Dynamic Dark Mode**: Full systemic dark-mode integration featuring strict visual hierarchy.
- **Resident Records**: Live auto-completing intelligence for rapid resident registration intake.
- **Document Requests**: Interactive request pipeline tracking clearance, indigency, and business permits.
- **System Metrics**: Visual service status overview and live notification systems.

## 🚀 Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Database:** Firebase Cloud Firestore
- **Typography:** Inter Font Family
- **Icons:** Lucide React

## ⚙️ Quick Start

### 1. Configure Firebase Credentials
Create an `.env.local` file in the root directory mapping to your Firebase project:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```
*(Ensure your Firestore Database Rules are set securely once deployed, or `true` during development).*

### 2. Install Dependencies & Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 Project Credits
Designed to bring sleek, modular, premium interface design standards to localized government infrastructure systems.
