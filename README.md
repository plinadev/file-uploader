# File Uploader App 

A web application for uploading, indexing, searching, and managing PDF and Word documents.  
The app uses **AWS S3** for file storage, **SQS** for queuing, **OpenSearch (Elasticsearch)** for indexing, and **NestJS** backend with **Server-Sent Events (SSE)** for live updates.

---

## ✨ Features

### 📝 User Flow
1. User visits the website and enters a **valid email**.
2. After login, the user can:
   - Upload **one file at a time** (`.pdf` and `.word` only)
   - Files are uploaded to **AWS S3** and stored securely
3. Backend listens to **SQS queue** to parse and index files to **OpenSearch**
   - Status tracking: `Pending`, `Success`, `Error`
   - Frontend receives **live updates** via SSE per user
4. Users can:
   - **List** uploaded documents (filename & upload date)
   - **Search** documents (results show filename and highlighted text)
   - **Delete** documents (removes from DB, OpenSearch, and S3)

### ⚡ Status Indicators
- `Pending` – document uploaded, indexing in progress
- `Success` – document successfully indexed, searchable
- `Error` – indexing failed

### 🚀 Real-Time Updates
- SSE connection per user (not per document) for scalable live status updates

---

## 🛠 Tech Stack

### Frontend
- [React 19](https://react.dev/)
- [TailwindCSS v4](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- [TanStack React Query](https://tanstack.com/query/latest)
- [Axios](https://axios-http.com/)
- [React Router v7](https://reactrouter.com/)
- [React Hot Toast](https://react-hot-toast.com/)
- [React Icons](https://react-icons.github.io/react-icons/)

### Backend
- [NestJS 11](https://nestjs.com/)
- [AWS SDK](https://aws.amazon.com/sdk-for-js/) for S3, SQS
- [OpenSearch (Elasticsearch)](https://opensearch.org/)
- [Mongoose](https://mongoosejs.com/) + MongoDB
- [Mammoth](https://github.com/mwilliamson/mammoth.js) and [pdf-parse](https://www.npmjs.com/package/pdf-parse) for document parsing
- [UUID](https://www.npmjs.com/package/uuid) for unique identifiers

### Tooling
- TypeScript
- ESLint + Prettier
- Vite for frontend build

---

## ⚙️ Environment Variables

Create a `.env` file for backend:

```env
AWS_REGION=
AWS_S3_BUCKET_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SQS_QUEUE_URL=
OPENSEARCH_NODE=
MONGO_URI=
```

Frontend `.env`:

```env
VITE_API_BASE_URL=
```

---

## 📂 Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/plinadev/file-uploader.git
cd file-uploader
```

### 2️⃣ Install dependencies
Frontend:
```bash
cd frontend
npm install
```

Backend:
```bash
cd backend
npm install
```

### 3️⃣ Configure AWS & OpenSearch
- Create **S3 bucket** for file storage
- Create **SQS queue** for indexing tasks
- Create **OpenSearch domain** for search functionality
- Add credentials to `.env` files

### 4️⃣ Run locally
Frontend:
```bash
cd frontend
npm run dev
```
Backend:
```bash
cd backend
npm run start:dev
```

### 5️⃣ Usage
1. Open the app in browser
2. Enter a valid email
3. Upload a document (`.pdf` or `.word`)
4. Track upload status in real time
5. Search, list, or delete documents

---

## 📚 References
- [AWS S3](https://aws.amazon.com/s3/)
- [AWS SQS](https://aws.amazon.com/sqs/)
- [OpenSearch](https://opensearch.org/)
- [NestJS](https://nestjs.com/)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

---

## 📌 Notes
- Only **one file at a time** can be uploaded
- Frontend listens to SSE **per user** to scale for multiple documents
- Deleted documents are removed from **DB, OpenSearch, and S3**
