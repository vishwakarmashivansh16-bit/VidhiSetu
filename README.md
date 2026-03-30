---
title: VidhiSetu
emoji: ⚖️
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
license: mit
---

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# VidhiSetu - AI Legal Assistant & Simulator

**VidhiSetu** is an interactive, intelligent web application designed to simplify legal concepts, answer legal deductions, and simulate real-world legal scenarios. It features an integrated Hugging Face OpenEnv simulator that accurately grades legal deductions against benchmark FIR criteria.

## 🚀 Features

- **LawMitra (AI Chatbot)**: An integrated AI assistant capable of breaking down complex legal deductions and concepts in simple terms using generative AI.
- **OpenEnv Simulator**: A built-in training mode utilizing an OpenEnv compliant setup to test your legal deductions against strict evaluation criteria.
- **Common Laws Search & Topics Directory**: Full search functionality allowing users to explore categorized, easily digestible legal topics.
- **Multilingual Support (i18n)**: Access legal knowledge in multiple languages dynamically.
- **Interactive UI**: Fluid animations and highly responsive layouts built on modern web standards.
- **Containerized Execution**: A fully functional `Dockerfile` natively handling Hugging Face space deployments with the `openenv` tag.

## 💻 Tech Stack & Languages

- **Frontend**: TypeScript, React 19, Vite
- **Styling & UI**: TailwindCSS 4, Motion, Lucide React
- **Backend/Inference**: Python 3.10 (FastAPI, Uvicorn) used within the Dockerized OpenEnv environment
- **Deployment**: Docker containerization

## 🛠️ How to Run Locally

**Prerequisites:** Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory (do not commit this file) and setup your AI API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Run the Development Server:**
   Start the local dev server using Vite:
   ```bash
   npm run dev
   ```
   *The app should now be running on `http://localhost:5173` (or the port specified in your terminal).*

4. **Build for Production (Optional):**
   To create an optimized production build:
   ```bash
   npm run build
   ```
   This will output the static files into the `dist/` directory.

---
*Created as part of an OpenEnv Hackathon Submission.*
