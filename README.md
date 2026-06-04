# Phygital Dining 
### A SaaS-Ready Web-AR Restaurant Menu & AI Concierge Platform

Phygital Dining is an immersive, zero-friction full-stack restaurant software platform built to eliminate traditional paper and PDF menus. By scanning a table-top QR code, diners can view 1:1 scale interactive 3D models of dishes directly on their physical dining tables via mobile web browsers. Concurrently, an integrated AI Concierge powered by Retrieval-Augmented Generation (RAG) acts as a digital sommelier to handle dish combinations, spice variations, ingredient tracing, and allergy validations in real-time.

---

##  Architectural Framework (MVC Pattern)
This project is engineered strictly following the **Model-View-Controller (MVC)** software design pattern to guarantee separation of concerns, scalability, and modular debugging:

* **M (Model):** Mongoose schemas managing data validation constraints for food configurations, analytics logging, and conversational chat memory states inside MongoDB Atlas.
* **V (View):** A lightweight, animated, floating fluid mobile user interface powered by Tailwind CSS, Animate.css, and Google's `<model-viewer>` Web-AR engine.
* **C (Controller):** Node.js & Express routing endpoints running context-injected RAG algorithms communicating asynchronously with the Free Groq Cloud (Llama 3 Inference Engine).

---

## Technology Stack
* **Runtime Ecosystem:** Node.js (v18+ LTS)
* **Backend Framework:** Express.js
* **Database Engine:** MongoDB Atlas Cloud Layer via Mongoose ORM
* **Artificial Intelligence Engine:** Groq Cloud SDK (Model: `llama3-8b-8192`)
* **3D AR Rendering:** Google `<model-viewer>` Engine (WebXR / Scene-Viewer / Quick-Look)
* **Frontend Styles:** Tailwind CSS Framework & Animate.css