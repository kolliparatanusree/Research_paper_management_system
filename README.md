# Smart Research Paper Management System

A web-based application designed to help researchers efficiently manage, organize, search, and annotate research papers using a structured and user-friendly interface.

## 📌 Features

- Upload and store research papers
- Keyword-based search and advanced filtering
- Role-based access (Admin, Researcher)
- Personalized dashboard and reading status tracking
- Visual analytics on paper usage
- Secure login and session control (JWT-based)

## 🛠 Tech Stack

### Frontend
- **React.js** – UI components and routing
- **Tailwind CSS** – Styling
- **Redux Toolkit** – State management
- **Axios** – API requests

### Backend
- **Node.js + Express.js** – REST API and server logic

### Database
- **MongoDB** – Document-based storage for users, papers, tags, etc.

## 🧱 Architecture

- **Presentation Layer**: React.js frontend
- **Application Layer**: Express backend with modular routes and middleware
- **Data Layer**: MongoDB for storing documents and metadata

## 🚀 Installation

### Prerequisites
- Node.js
- MongoDB
- Docker (optional)

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### MongoDB Setup
- Start MongoDB locally or use a MongoDB Atlas cloud instance.
- Update connection string in `backend/config/db.js`

## ⚙️ API Endpoints

- `POST /api/auth/register` – Register user
- `POST /api/auth/login` – Authenticate user
- `POST /api/upload` – Upload PDF file
- `GET /api/papers` – List/search papers
- `POST /api/annotate/:id` – Annotate paper

## 📈 Future Enhancements

- Multilingual and OCR support
- Collaborative peer-review module

## 📜 License

This project is open-source and available under the MIT License.
