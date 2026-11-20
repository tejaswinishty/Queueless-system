# QueueLess – Smart Queue Management & Crowd Prediction System

**QueueLess** is an intelligent full-stack queue management and crowd forecasting platform designed to eliminate physical waiting lines, optimize counter throughput, and predict rush hours.

---

## 🏗️ Architecture

```
oops pro/
├── backend/                  # Java 17 + Spring Boot 3 + Spring Data JPA + H2 Engine
│   ├── src/main/java/com/queueless/
│   │   ├── QueuelessApplication.java
│   │   ├── config/           # CORS & Seed Data Initializer
│   │   ├── controller/       # Token, Counter & Crowd Prediction REST APIs
│   │   ├── model/            # Entities: Token, Counter, QueueHistory
│   │   ├── repository/       # JPA Repositories
│   │   ├── service/          # Queue Service & Crowd Prediction Heuristic Engine
│   │   └── dto/              # API Data Transfer Objects
│   └── pom.xml
│
└── frontend/                 # Next.js (React 19 / Node.js 24) + Tailwind CSS
    ├── src/app/
    │   ├── page.tsx          # 📺 Public Live Calling Board & Kiosk Display
    │   ├── join/page.tsx     # 🎟️ Self-Service Virtual Token Generator
    │   ├── track/[id]/       # 📱 Customer Live Ticket Tracker (Position & Wait countdown)
    │   ├── operator/         # 🖥️ Staff Counter Desk Console (Call Next, Complete, Skip)
    │   └── crowd/            # 📊 AI Crowd Forecast & Rush Hour Heatmaps
    └── package.json
```

---

## 🚀 Quick Start Guide

### 1. Start the Java Backend (Spring Boot 3)
In a terminal, run:
```bash
cd backend
mvn spring-boot:run
```
* Backend runs at: **http://localhost:8080**
* H2 Database Console: **http://localhost:8080/h2-console** (JDBC URL: `jdbc:h2:mem:queuelessdb`, User: `sa`, Password: *blank*)

### 2. Start the Frontend (Next.js on Node.js)
In a second terminal, run:
```bash
cd frontend
npm run dev
```
* Frontend runs at: **http://localhost:3000**

---

## 🌟 Key Portals & Features

1. **📺 Live Kiosk Board (`/`)**:
   - Real-time display showing currently serving tickets and counter assignments.
   - Web Audio chime sound alert when a customer ticket is called.
   - Live queue status bar with active counter occupancy.

2. **🎟️ Take Token (`/join`)**:
   - Self-service virtual ticket dispenser for 4 key categories:
     - **Banking & Cash** (`BNK-`)
     - **Billing & Accounts** (`BIL-`)
     - **Customer Support** (`SUP-`)
     - **Document & ID Verification** (`DOC-`)
   - Generates ticket with instant position and estimated dynamic wait time.

3. **📱 Live Ticket Tracker (`/track/{tokenNumber}`)**:
   - Dedicated mobile view for customers.
   - Live position countdown ("Only 2 people ahead of you").
   - Audio notification and prominent counter prompt when called.

4. **🖥️ Operator Desk (`/operator`)**:
   - Counter management for 4 service counters.
   - Controls: **Call Next Customer**, **Mark Completed**, **Mark Absent / Skip**.
   - Live counter performance counter.

5. **📊 Crowd Forecast Engine (`/crowd`)**:
   - Hourly rush predictions (9:00 AM to 6:00 PM).
   - Dynamic congestion status (Low, Moderate, High, Peak).
   - Identifies the **Optimal Visiting Window** of the day to avoid peak queues.
   - Pre-seeded with 14 days of realistic multi-service arrival patterns.
