# <div align="center">One Browser</div>

<div align="center">
<strong>A Privacy-First, Minimalist Web Browser Built with Electron</strong>
</div>

<br />

<div align="center">

![Electron](https://img.shields.io/badge/Electron-Latest-47848F?style=for-the-badge&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18.0-61dafb?style=for-the-badge&logo=react&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

<br />

> **"Browse the web, distraction-free."**
>
> One Browser is a clean, minimalist web browser designed with privacy and simplicity at its core.
> Built with Electron and React, featuring a pure black/white aesthetic and intuitive bottom-toolbar design.

---

## 🌟 Vision

One Browser aims to be:

- **Privacy-first** — No tracking, no telemetry, just browsing
- **Minimalist** — Clean monochrome UI with zero distractions
- **Intuitive** — Bottom toolbar for comfortable one-handed use
- **Fast** — Optimized for performance with React memoization

---

## ✨ Features

- **Tabbed Browsing**  
  Drag-and-drop reorderable tabs with smooth animations.
  
- **Smart Omnibox**  
  Google autocomplete suggestions as you type.

- **Safari-Style Panels**  
  Compact popover panels for Bookmarks, History, Downloads, and AI Assistant.

- **macOS Traffic Lights**  
  Native-style window controls for close, minimize, and fullscreen.

- **Right-Click Context Menu**  
  Back, Forward, Reload, View Source, and Inspect Element.

- **Dark/Light Theme**  
  Pure black and white theme toggle for day and night browsing.

---

## 🎨 Design Philosophy

- **Monochrome Aesthetic**  
  Pure black (`#000000`) and pure white (`#FFFFFF`) only.

- **Bottom Toolbar**  
  Navigation and controls at the bottom for ergonomic access.

- **Rounded Corners**  
  Content area and tabs feature soft, modern rounded edges.

- **No Emojis, No Gradients**  
  Icons only — clean, professional, distraction-free.

---

## 📁 Project Structure

```
One-Browser/
├── main/
│   └── main.js              # Electron Main Process
├── preload/
│   └── preload.js           # Context Bridge for IPC
├── renderer/
│   ├── src/
│   │   ├── App.jsx          # Main React Application
│   │   ├── components/      # UI Components
│   │   │   ├── Titlebar.jsx     # Window Controls
│   │   │   ├── TabBar.jsx       # Tab Management
│   │   │   ├── Toolbar.jsx      # Navigation & Omnibox
│   │   │   ├── WebViewContainer.jsx  # Web Content
│   │   │   ├── NewTabPage.jsx   # New Tab Experience
│   │   │   └── Sidebar.jsx      # Panel Components
│   │   └── context/         # React Context Providers
│   │       ├── ThemeContext.jsx
│   │       └── TabContext.jsx
│   ├── index.html           # HTML Entry Point
│   └── vite.config.js       # Vite Configuration
└── package.json             # Dependencies & Scripts
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+)
- **NPM** or **Yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/zakisheriff/One-Browser.git
cd One-Browser
```

### 2. Install Dependencies

```bash
npm install
cd renderer && npm install && cd ..
```

### 3. Run the Application

```bash
npm run dev
```

This will start both the Vite dev server and Electron concurrently.

---

## 🔧 Tech Stack

### Core
- **Electron** — Cross-platform desktop app framework
- **React 18** — Modern UI library with hooks
- **Vite** — Next-generation frontend build tool

### Styling
- **Tailwind CSS** — Utility-first CSS framework
- **Lucide React** — Beautiful, consistent icons

### State Management
- **React Context** — Built-in state management
- **useCallback/useMemo** — Performance optimization

---

## 📦 Building for Production

```bash
# Build the renderer
cd renderer && npm run build && cd ..

# Package with electron-builder (coming soon)
npm run package
```

---

## 🗺️ Roadmap

- [ ] Bookmark persistence (electron-store)
- [ ] Download manager
- [ ] Extension support
- [ ] Developer tools integration
- [ ] Cross-platform packaging (macOS, Windows, Linux)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License — 100% Free and Open Source

---

<p align="center">
Made by <strong>Zaki Sheriff</strong>
</p>

<p align="center">
<em>Browse Simple. Browse Free.</em>
</p>
