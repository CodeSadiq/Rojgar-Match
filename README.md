# RojgarMatch 🏛️

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://rojgar-match.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

![RojgarMatch Banner](public/banner.png)

**RojgarMatch** is a next-generation government recruitment platform designed to bridge the gap between job seekers and official government openings. By leveraging intelligent matching algorithms and a centralized national registry, RojgarMatch ensures that every candidate finds the recruitment opportunities they are truly eligible for.

## 🌐 Live Preview
Experience the platform live at: [https://rojgar-match.vercel.app/](https://rojgar-match.vercel.app/)

---

## ✨ Key Features

### 🎯 Smart Eligibility Matching
Stop scanning through thousands of PDFs. RojgarMatch automatically filters jobs based on your **exact Course and Branch**. If you're eligible, it shows up on your "For You" dashboard.

### 🏛️ National Registry Dashboard
A unified interface broadcasting verified government openings from all major sectors. Search, filter, and track applications in real-time.

### ⚡ AI-Powered Screening (Beta)
Integrated AI parsing that standardizes job requirements and generates smart screening questions to ensure a perfect match before you even apply.

### 🔔 Instant Live Alerts
Real-time notifications for:
- **Syllabus & Exam Patterns**
- **Admit Card Releases**
- **Result Announcements**
- **Admission Notices**

### 📧 Email Match Alerts
Never miss an opportunity. Get instant email notifications as soon as a government job matching your specific profile is posted.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Caching**: [Redis (Upstash)](https://upstash.com/) for high-performance data fetching
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) & [Jose (JWT)](https://github.com/panva/jose)
- **Communication**: [Nodemailer](https://nodemailer.com/) for automated email alerts

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/CodeSadiq/Rojgar-Match.git
cd Rojgar-Match
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📂 Project Structure

```text
src/
├── app/            # Next.js App Router (Pages & API)
├── components/     # Reusable UI Components
├── lib/            # Core logic, DB connection, & Utilities
├── types/          # TypeScript Interfaces
└── styles/         # Global styles & Tailwind config
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue for any bugs or feature requests.

## 📄 License

Copyright (c) 2026 Sadiq Imam

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

Built with ❤️ for better recruitment by [Sadiq Imam](https://github.com/CodeSadiq).
