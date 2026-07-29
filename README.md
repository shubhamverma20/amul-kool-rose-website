# Amul Kool Rose - Animated Full-Stack Landing Page

A premium, interactive landing showcase for Amul Kool Rose, featuring silky-smooth scroll-driven canvas scrubbing animations, a real-time ingredient loader, and a SQLite-based backend database.

## 🚀 Live Demo
* **Frontend (Vercel)**: [https://amul-kool-rose-website-chi.vercel.app](https://amul-kool-rose-website-chi.vercel.app)
* **Backend API (Render)**: [https://amul-kool-rose-website.onrender.com/api/reviews](https://amul-kool-rose-website.onrender.com/api/reviews)

---

## 🌟 Key Features

1. **Silky-Smooth Scroll Scrubbing**: Implements high-performance frame preloading and rendering directly on a `<canvas>` element with linear interpolation (lerp) for latency-free scroll animations.
2. **Interactive Reviews Feed**: Users can submit reviews and select ratings (1-5 stars). Reviews are fetched and written dynamically to the database.
3. **Contact Form**: A fully responsive "Get in Touch" form connected to the database to collect inquiries.
4. **Real-time Preloader**: Dynamically tracks image-caching progress and provides a smooth ingredient-blending progress bar.
5. **Glassmorphism Design**: Clean, modern aesthetics styled with Tailwind CSS, custom SVG avatars, and smooth hover glow transitions.

---

## 🛠️ Tech Stack

* **Frontend**: Vanilla JavaScript, Tailwind CSS, HTML5 Canvas
* **Backend**: Node.js, Express.js, CORS, Dotenv
* **Database**: SQLite3 (native serverless SQL file database)

---

## 💻 Local Development Setup

To run this project on your machine, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/shubhamverma20/amul-kool-rose-website.git
cd amul-kool-rose-website
```

### 2. Start the Backend API Server
```bash
cd backend
npm install
node server.js
```
*Note: SQLite will automatically create `database.db` and seed 3 default reviews on first launch.*

### 3. Start the Frontend Web Server
Open a second terminal window:
```bash
cd frontend
npx http-server -p 5173
```
Now, open your browser and navigate to **http://localhost:5173**.

---

Developed with ♥ by [Shubham Verma](https://github.com/shubhamverma20)
